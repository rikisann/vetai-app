import { unknown, z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env.mjs";
import runLlm from "~/server/ai";
import { ChainValues } from "langchain/dist/schema";

interface SourceDocuments {
  pageContent: string,
  metadata: { page: number, source: string }
}

interface AIResponse {
  responseText: string,
  sourceDocuments: SourceDocuments[]
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
        const formmatedChatHistory = chatHistory?.reduce((acc, { question, response }) => acc += `Human:${question}\nAI:${response}`, "")

        const response = await runLlm(question, formmatedChatHistory)

        const responseText = response.text as string

        const sourceDocs = response.sourceDocuments as SourceDocuments[]

        // CREATE NEW PROMPT WITH RESPONSE
        await ctx.db.prompt.create({
          data: {
            question,
            response: responseText ?? "",
            chatId,
            indexName: env.PINECONE_INDEX_NAME,
            sourceDocuments: {
              createMany: {
                data: sourceDocs.map((doc: { pageContent: string, metadata: { page: number, source: string } }) => ({ content: doc.pageContent, ...doc.metadata }))
              }
            }
          },
        });

        return responseText;
      } catch (e) {
        console.log(e)
        return null
      }
    }),
});

// const response = await fetch(
//   env.NODE_ENV === "development" ? "http://127.0.0.1:5000/prompt" : "https://flask-hello-world-murex-delta.vercel.app/prompt",
//   {
//     method: "POST",
//     body: JSON.stringify({
//       question: question,
//       chat_history:
//         !chatHistory || chatHistory?.length < 1 ? "" : chatHistory,
//     }),
//     headers: {
//       "x-api-key": env.AI_BACKEND_API_KEY,
//       "Content-Type": "application/json",
//     },
//   },
// );