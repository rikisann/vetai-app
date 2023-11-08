import Input from "~/components/UI/Input";
import { VscSend } from "react-icons/vsc";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import type { QuestionAndResponse } from "~/types/QuestionAndResponse";
import Message from "./Message";
import LoadingSpinner from "./UI/LoadingSpinner";

interface Props {
  chatHistory?: QuestionAndResponse[];
  chatId?: string;
}

let idCounter = 0;

// SUBMIT ON ENTER

export default function Chat(props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const utils = api.useContext();
  const chatId = useRef<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [chatHistory, setChatHistory] = useState<QuestionAndResponse[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const createChatTrpc = api.chat.create.useMutation({
    onSuccess: async (newChat) => {
      await utils.chat.fetchAll.invalidate();
      chatId.current = newChat.id;
    },
  });
  const createPromptTrpc = api.prompt.create.useMutation({
    onSuccess: (response: string | null) => response,
  });

  const createChat = async (question: string) => {
    await createChatTrpc.mutateAsync({ question });
  };

  useEffect(() => {
    if (props.chatHistory && props.chatHistory.length > 0 && props.chatId) {
      setChatHistory(props.chatHistory);
      chatId.current = props.chatId;
    } else {
      setChatHistory([]);
      chatId.current = null;
    }
  }, [props.chatHistory, props.chatId]);

  const formSubmitHandler = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const value = inputValue;
    setInputValue("");

    if (!chatId.current) await createChat(value);

    const response: string | null = await createPromptTrpc.mutateAsync({
      question: value,
      chatId: chatId.current!,
      chatHistory,
    });

    if (!response) return;

    setChatHistory(
      (oldState) => oldState?.concat({ question: value, response }),
    );

    setIsLoading(false);
  };

  const messagesComponent = (
    <ul className="mt-16 md:mt-3 flex flex-col">
      {chatHistory.map(({ question, response }) => {
        idCounter++;

        return (
          <li key={idCounter + 1}>
            <Message user={true}>{question}</Message>
            <Message user={false}>{response}</Message>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="relative flex h-full flex-col items-center text-center">
      {chatHistory.length === 0 && !isLoading && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="text-3xl text-gray-400">New chat</p>
        </div>
      )}
      {isLoading && <LoadingSpinner />}
      {chatHistory.length !== 0 && (
        <div className="w-10/12 md:w-7/12 pb-[20vh]">{messagesComponent}</div>
      )}
      <form
        ref={formRef}
        onSubmit={(e) => void formSubmitHandler(e)}
        className="fixed bottom-10 flex w-11/12 md:w-6/12 items-center gap-2 rounded-md bg-black"
      >
        <Input
          required
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full"
          placeholder="Send a message"
          formRef={formRef}
          disabled={isLoading}
        />
        <button
          disabled={isLoading}
          type="submit"
          className="px-3 pr-7 text-xl transition-colors duration-200 hover:cursor-pointer hover:text-gray-500 md:text-2xl"
        >
          <VscSend />
        </button>
      </form>
    </div>
  );
}
