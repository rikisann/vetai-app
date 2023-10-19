import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env.mjs";

export const promptRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        question: z.string(),
        chatId: z.string(),
        chatHistory: z
          .array(z.object({ question: z.string(), response: z.string() }))
          .optional(),
      }),
    )
    .mutation(async ({ input: { question, chatId, chatHistory }, ctx }) => {
      const response = await fetch(
        "https://flask-hello-world-murex-delta.vercel.app/prompt",
        {
          method: "POST",
          body: JSON.stringify({
            question: question,
            chat_history:
              !chatHistory || chatHistory?.length < 1 ? "" : chatHistory,
          }),
          headers: {
            "x-api-key": env.AI_BACKEND_API_KEY,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();

      if (!response.ok) throw new Error(`AI Backend failed! ${data}`);

      console.log(data.response);

      // CREATE NEW PROMPT WITH RESPONSE
      await ctx.db.prompt.create({
        data: {
          question,
          response: data.response ?? "",
          chatId,
          indexName: env.PINECONE_INDEX_NAME,
        },
      });

      return data.response;
    }),
});
