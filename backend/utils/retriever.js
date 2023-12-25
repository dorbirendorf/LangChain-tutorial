import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()


const openAIApiKey = process.env.OPENAI_API_KEY
const sbApiKey = process.env.SUPERBASE_API_KEY
const sbUrl = process.env.SUPERBASE_URL

const client = createClient(sbUrl, sbApiKey) // create a new instance of the supabase client
const embeddings = new OpenAIEmbeddings({ openAIApiKey }) // create a new instance of the embeddings

const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'documents',
    queryName: 'match_documents'
}) // create a new instance of the vector store
export const retriever = vectorStore.asRetriever() // export a retriever from the vector store



