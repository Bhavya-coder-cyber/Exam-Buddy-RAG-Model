import { Worker } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import 'dotenv/config';

const worker = new Worker(
    'file-upload-queue',
    async (job) => {
        console.log(`Processing job ${job.id} of type ${job.name}`);
        const data = JSON.parse(job.data);
        // data has filename, source, path and we require the path to chunk the file
        const loader = new PDFLoader(data.path);
        const docs = await loader.load();

        // Chunking the document into smaller pieces by using RecursiveCharacterTextSplitter. Although it can be worked on small PDFs in efficient time.
        // const textSplitter = new RecursiveCharacterTextSplitter({
        //     chunkSize: 1000,
        //     chunkOverlap: 200,
        // });

        // const texts = await textSplitter.splitDocuments(docs);

        // console.log(texts);
        const embeddings = new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY,
            model: "text-embedding-3-large"
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: "http://localhost:6333",
            collectionName: "college-syllabus",
        });

        //Replace it with texts while using textSplitter
        await vectorStore.addDocuments(docs);
        console.log(`Job ${job.id} completed`);
    },
    {
        concurrency: 100, connection: { host: 'localhost', port: 6379 }
    }
)

const ytWorker = new Worker(
    'yt-video-link-queue',
    async (job) => {
        console.log(`Processing job ${job.id} of type ${job.name}`);
        const data = job.data;
        // console.log(data);
        const loader = YoutubeLoader.createFromUrl(data, {
            language: "en",
            addVideoInfo: true,
        });
        const docs = await loader.load();
        console.log(docs);
        const embeddings = new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY,
            model: "text-embedding-3-large"
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: "http://localhost:6333",
            collectionName: "college-syllabus",
        });
        await vectorStore.addDocuments(docs);
        console.log(`Job ${job.id} completed`);
    },
    {
        concurrency: 100, connection: { host: 'localhost', port: 6379 }
    }
)
const githubWorker = new Worker(
    'github-repo-queue',
    async (job) => {
        console.log(`Processing job ${job.id} of type ${job.name}`);
        const data = job.data;
        // console.log(data);
            const loader = new GithubRepoLoader(
                data,
                {
                    branch: "main",
                    recursive: false,
                    unknown: "warn",
                    maxConcurrency: 5, // Defaults to 2
                }
            );
        const docs = await loader.load();
        console.log(docs);
        const embeddings = new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY,
            model: "text-embedding-3-large"
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: "http://localhost:6333",
            collectionName: "college-syllabus",
        });
        await vectorStore.addDocuments(docs);
        console.log(`Job ${job.id} completed`);
    },
    {
        concurrency: 100, connection: { host: 'localhost', port: 6379 }
    }
)