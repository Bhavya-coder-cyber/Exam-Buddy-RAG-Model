import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import 'dotenv/config';
import { OpenAI } from "openai";
import { QdrantClient } from '@qdrant/qdrant-js';

const client = new OpenAI()

const queue = new Queue("file-upload-queue", {
  connection: { host: 'localhost', port: 6379 }
})
const ytQueue = new Queue("yt-video-link-queue", {
  connection: { host: 'localhost', port: 6379 }
})
const githubQueue = new Queue("github-repo-queue", {
  connection: { host: 'localhost', port: 6379 }
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.text());

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  await queue.add("file-ready", JSON.stringify({
    filename: req.file.filename,
    source: req.file.destination,
    path: req.file.path
  }))
  return res.json({ message: "File uploaded successfully" });
})

app.post('/upload/ytlink', async (req, res) => {
  const { link } = await req.body;
  console.log(link);
  await ytQueue.add("yt-link-ready", link)
  return res.json({ message: "YouTube link received successfully" });
})

app.post('/upload/githubrepo', async (req, res) => {
  const { link } = await req.body;
  console.log(link);
  await githubQueue.add("github-repo-ready", link)
  return res.json({ message: "GitHub repo received successfully" });
})

app.get('/deleteCollections', async (req, res) => {
  const client = new QdrantClient({ host: 'localhost', port: 6333 });
  const collectionName = "college-syllabus";

  try {
    const result = await client.deleteCollection(collectionName);
    console.log(`Collection "${collectionName}" deleted. Result:`, result);

    // Qdrant's delete is idempotent, so it won't throw an error if the
    // collection doesn't exist. You can still check the result.
    if (result.status === 'ok') {
      return res.json({ message: `Collection "${collectionName}" deleted successfully.` });
    } else {
      return res.status(200).json({ message: `Collection "${collectionName}" was not found or has already been deleted.` });
    }
  } catch (error) {
    // Handle potential connection errors or other issues
    console.error(`Error deleting collection "${collectionName}":`, error);
    return res.status(500).json({ message: `Failed to delete collection "${collectionName}".`, error: error.message });
  }
});

app.get('/chat', async (req, res) => {
  const userQuery = req.query.message
  const prevMessage = req.query.previous_message || "";
  const prevResponse = req.query.previous_response || "";
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-large"
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: "http://localhost:6333",
    collectionName: "college-syllabus",
  })

  const ret = vectorStore.asRetriever({
    k: 3,
  })
  const result = await ret.invoke(userQuery)
  const SYSTEM_PROMPT = `You are a helpful AI assistant naming youself "Exam Buddy". Your job is to help the students in their studies. You answer the user query based on the available context from PDF File or from a YouTube video. If the user wants to know more from a particular question, you give them a simple answer explaining the point or even add more information to it. Context:
  ${JSON.stringify(result)}

  If you don't know the answer, just say that you don't know. Make sure the answer should be in context of the PDF or the video the user has provided. Keep the answer as concise as possible. Respond in a friendly manner like a college buddy would. The user can ask questions regarding to this topic which is not discussed in the PDF or video, you give them a simple answer explaining the point or even add more information to it. Try to use emojis if possible. Use Bullet points or numbers if the answer is in a list. Avoid using extra spaces and line breaks, use it when it's necessary. Mention the page number where the answer is picked. If asked about the developer behind this app, mention the name Bhavya Jain, an ambitious college student which explores various fields of tech. His social media handles are:

  Socials:
  1. X Profile: https://x.com/BhavyaJainCoder
  2. LinkedIn Profile: www.linkedin.com/in/bhavya-jain-831b51291
  3. Github Link: https://github.com/Bhavya-coder-cyber
  `
  const chatResult = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prevMessage },
      { role: "assistant", content: prevResponse },
      { role: "user", content: userQuery }
    ]
  })

  return res.json({ message: chatResult.choices[0].message.content, docs: result });
})

app.listen(8000, () => console.log("Server running on port 8000"));