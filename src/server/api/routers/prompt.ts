import { z } from "zod"
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import runLlm from "~/server/ai";

export const promptRouter = createTRPCRouter({
    create: protectedProcedure.input(z.object({
        question: z.string(),
        chatId: z.string(),
        chatHistory: z.array(z.object({ question: z.string(), response: z.string() })).optional()
    })).mutation(async ({ input: { question, chatId, chatHistory }, ctx }) => {
        const currentUserId = ctx.session.user.id;
        console.log(chatHistory)
        const formattedChatHistory = chatHistory ? chatHistory?.reduce((acc, { question, response }) => acc += `${question}\n${response}\n`, "") : ""

        const { text: response } = await runLlm(question, formattedChatHistory)

        // CREATE NEW PROMPT WITH RESPONSE
        await ctx.db.prompt.create({ data: { question, response, chatId } })

        return response
    })
})