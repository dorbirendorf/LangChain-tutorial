import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter'
import fs from 'fs'
import {createClient} from '@supabase/supabase-js'
import {SupabaseVectorStore} from 'langchain/vectorstores/supabase'
import {OpenAIEmbeddings} from 'langchain/embeddings/openai'
import dotenv from 'dotenv'


dotenv.config()
try {
    const resultBuffer = await fs.readFileSync('C:\\Users\\dorbi\\Desktop\\ai-langchain\\backend\\knowladge\\hotel-info.txt') // read the file
    const text = resultBuffer.toString('utf-8')

    const splitter = new RecursiveCharacterTextSplitter({ // create a new instance of the splitter
        chunkSize: 500,
        chunkOverlap: 50,
    })

    const splitedDocuments = await splitter.createDocuments([text]) // split the text into documents

    const superbaseUrl = process.env.SUPERBASE_URL
    const superBaseKey = process.env.SUPERBASE_API_KEY

    const client = createClient(superbaseUrl, superBaseKey);

    await SupabaseVectorStore.fromDocuments(
        splitedDocuments,
        new OpenAIEmbeddings(),
        {
            client,
            tableName: 'documents',
        }
    )
    console.log('load data done')

} catch (err) {
    console.error(err);
}