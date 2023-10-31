import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env.mjs";

interface SourceDocuments {
  content: string,
  page: number,
  source: string
}

interface AIResponse {
  response: string,
  source_documents: SourceDocuments[]
}

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
      try {
        const response = await fetch(
          env.NODE_ENV === "development" ? "http://127.0.0.1:5000/prompt" : "https://flask-hello-world-murex-delta.vercel.app/prompt",
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

        const data = (await response.json()) as AIResponse;
        if (!response.ok || !data.response) throw new Error(`AI Backend failed! ${data.response}`);

        // CREATE NEW PROMPT WITH RESPONSE
        await ctx.db.prompt.create({
          data: {
            question,
            response: data.response ?? "",
            chatId,
            indexName: env.PINECONE_INDEX_NAME,
            sourceDocuments: {
              createMany: {
                data: data.source_documents
              }
            }
          },
        });

        return data.response;
      } catch (e) {
        console.log(e)
        return null
      }
    }),
});
