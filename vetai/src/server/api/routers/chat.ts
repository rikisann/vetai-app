import { z } from "zod"
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env.mjs";

export const chatRouter = createTRPCRouter({
    create: protectedProcedure.input(z.object({ question: z.string() }))
        .mutation(async ({ input: { question }, ctx }) => {
            const currentUserId = ctx.session.user.id;

            const newChat = await ctx.db.chat.create({ data: { llm: env.LLM, userId: currentUserId, name: question } })
            return newChat
        }),
    fetchAll: protectedProcedure.query(async ({ ctx }) => {
        const { user } = ctx.session

        const chats = await ctx.db.chat.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })

        return chats
    }),
    fetch: protectedProcedure.input(z.object({ chatId: z.string() })).query(async ({ input: { chatId }, ctx }) => {
        const { user } = ctx.session

        const chats = await ctx.db.chat.findUnique({ where: { id: chatId, userId: user.id }, include: { prompts: true } })

        return chats
    })
})