import {ChatOpenAI} from 'langchain/chat_models/openai';
import {PromptTemplate} from 'langchain/prompts';
import {StringOutputParser} from 'langchain/schema/output_parser';
import {RunnablePassthrough, RunnableSequence} from "langchain/schema/runnable";
import {retriever} from './utils/retriever.js';
import {combineDocuments} from './utils/combineDocuments.js';
import {formatHistory} from './utils/formatHistory.js';
import dotenv from 'dotenv';

dotenv.config();

class QuestionProcessor {
    constructor() {
        this.llm = new ChatOpenAI();

        const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
conversation history: {history}
question: {question} 
standalone question:`;
        this.standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate);
        this.standaloneQuestionChain = this.standaloneQuestionPrompt
            .pipe(this.llm)
            .pipe(new StringOutputParser());

        const answerTemplate =
            `You are a helpful and enthusiastic support bot who can answer a given Question about an hotel based on the context provided and the Conversation History.
            Try to find the answer in the Conversation History.
            If the answer is not given in the Conversation History, find the answer in the Context.
            If you really don't know the answer,try to look again in the history under Human or say "I'm sorry, I don't know the answer to that."
            Don't try to make up an answer. Always speak as if you were chatting to a customer.
            Conversation History: {history} 
            Context: {context}
            Question: {question}
            answer: `;
        this.answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

        this.answerChain = this.answerPrompt
            .pipe(this.llm)
            .pipe(new StringOutputParser());

        this.retrieverChain = RunnableSequence.from([
            prevResult => prevResult.standalone_question,
            retriever,
            combineDocuments
        ]);


        this.chain = RunnableSequence.from([
            {
                standalone_question: this.standaloneQuestionChain,
                original_input: new RunnablePassthrough()
            },
            {
                context: this.retrieverChain,
                question: ({original_input}) => original_input.question,
                history: ({original_input}) => original_input.history
            },
            this.answerChain
        ]);
    }

    async processQuestion(question, rawHistory) {
        try {
            const history = formatHistory(rawHistory);
            const response = await this.chain.invoke({question, history});
            return response;
        } catch (e) {
            console.log(e);
            return e;
        }
    }
}

export default QuestionProcessor;
