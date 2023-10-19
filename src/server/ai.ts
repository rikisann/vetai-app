import { env } from "~/env.mjs";
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ChatOpenAI } from "langchain/chat_models/openai"
import { ConversationalRetrievalQAChain } from "langchain/chains"

const client = new PineconeClient();
await client.init({
    apiKey: env.PINECONE_API_KEY,
    environment: env.PINECONE_ENVIRONMENT_REGION,
});
const pineconeIndex = client.Index(env.PINECONE_INDEX_NAME);

const TEMPLATE = `
You are an expert veterinary equipped with all the knowledge about animals.
Answer the provided question to the best of your abilities with true and factual information. 
Use three sentences maximum (unless stated otherwise in the question) and keep the answer as concise as possible.

Context:{context}

Chat history: {chat_history}
Question: {question}
Helpful Answer:`

const runLlm = async (question: string, chatHistory = "") => {
    const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings(),
        { pineconeIndex }
    );
    console.log(chatHistory)
    const model = new ChatOpenAI({ temperature: 0 })

    const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever())

    const res = await chain.call({ question, chat_history: chatHistory })

    return res
}

export default runLlm