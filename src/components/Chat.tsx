import Input from "~/components/Input";
import { VscSend } from "react-icons/vsc"
import { FormEvent, useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import type { QuestionAndResponse } from "~/types/QuestionAndResponse";
import Message from "./Message";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
    chatHistory?: QuestionAndResponse[]
    chatId?: string
}

let idCounter = 0

// INTEGRATE MEMORY AND APPLY NICE FONT AND SUBMIT ON ENTER - REMEMBER TO SWITCH TO TESTING BRANCH

export default function Chat(props: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const utils = api.useContext();
    const chatId = useRef<string | null>(null)
    const [inputValue, setInputValue] = useState("")
    const [chatHistory, setChatHistory] = useState<QuestionAndResponse[]>([])

    const createChatTrpc = api.chat.create.useMutation({
        onSuccess: (newChat) => {
            utils.chat.fetchAll.invalidate()
            chatId.current = newChat.id
        }
    })
    const createPromptTrpc = api.prompt.create.useMutation({ onSuccess: (response) => response })

    const createChat = async (question: string) => {
        await createChatTrpc.mutateAsync({ question })
    }

    useEffect(() => {
        if ((props.chatHistory && props.chatHistory.length > 0) && props.chatId) {
            setChatHistory(props.chatHistory)
            chatId.current = props.chatId
        } else {
            setChatHistory([])
            chatId.current = null
        }
    }, [props.chatHistory, props.chatId])

    const formSubmitHandler = async (event: FormEvent) => {
        event.preventDefault()
        setIsLoading(true)

        const value = inputValue
        setInputValue("")

        if (!chatId.current) await createChat(value)
        console.log(chatHistory)
        const response = await createPromptTrpc.mutateAsync({ question: value, chatId: chatId.current!, chatHistory })

        setChatHistory((oldState) => oldState?.concat({ question: value, response }))

        setIsLoading(false)
    }

    const messagesComponent =
        <ul className="flex flex-col mt-3">{
            chatHistory.map(({ question, response }) => {
                idCounter++

                return <li key={idCounter + 1}>
                    <Message user={true}>{question}</Message>
                    <Message user={false}>{response}</Message>
                </li>
            }
            )}
        </ul >

    return (
        <div className="h-full relative text-center flex-col flex items-center">
            {(chatHistory.length === 0 && !isLoading) && <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
                <p className="text-gray-400 text-3xl">New chat</p>
            </div>}
            {isLoading && <LoadingSpinner />}
            {chatHistory.length !== 0 && <div className="pb-[20vh] w-7/12">{messagesComponent}</div>}
            <form onSubmit={formSubmitHandler} className="items-center fixed bottom-10 bg-black rounded-md gap-2 w-6/12 flex">
                <Input required value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full" placeholder="Send a message" />
                <button type="submit" className="text-xl md:text-2xl px-3 pr-7 hover:cursor-pointer transition-colors duration-200 hover:text-gray-500">
                    <VscSend />
                </button>
            </form>
        </div>
    );
};