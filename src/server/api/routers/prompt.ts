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
          "https://vetai.onrender.com/prompt",
          {
            method: "POST",

            body: JSON.stringify({
              question: question,
              ...((chatHistory && chatHistory?.length >= 1) && { "chat_history": chatHistory }), // conditionally include the chat_history argument
            }),
            headers: {
              "x-api-key": env.AI_BACKEND_API_KEY,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json() as AIResponse

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

