import { GetServerSidePropsContext } from "next";
import Chat from "~/components/Chat";
import { getServerAuthSession } from "~/server/auth";
import { ssgHelper } from "~/server/api/ssgHelper";
import type { QuestionAndResponse } from "~/types/QuestionAndResponse";

export default function ChatPage({ chatId, chatHistory }: { chatId?: string, chatHistory: QuestionAndResponse[] }) {
    return (
        <Chat chatHistory={chatHistory} chatId={chatId} />
    );
};

export async function getServerSideProps(
    ctx: GetServerSidePropsContext,
) {
    const session = await getServerAuthSession(ctx);
    if (!session) return {
        redirect: {
            permanent: true,
            destination: "/"
        }
    }

    const chatId = ctx.query.chatId
    if (typeof chatId !== "string") return


    const ssg = ssgHelper(session);
    const chat = await ssg.chat.fetch.fetch({ chatId: chatId })

    if (!chat) {
        return {
            redirect: {
                permanent: true,
                destination: "/"
            }
        }
    }

    return {
        props: {
            chatId: chat?.id, chatHistory: chat?.prompts.map(({ question, response }) => ({ question, response }))
        }
    }
}