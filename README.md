# Exam Buddy – RAG Model 🤖📚  

Exam Buddy is an **AI-powered exam preparation assistant** built using **Retrieval-Augmented Generation (RAG)**. It helps students **summarize notes, generate questions, and interact with their study materials** — whether they’re PDFs or YouTube lecture links.  

***

## 🌟 Features  
- Upload and process **PDF notes** or **YouTube videos**  
- Generate **summaries** using LLMs with contextual retrieval  
- Ask **custom questions** related to uploaded materials    
- Uses **vector embeddings** for semantic search and retrieval  

***

## ⚙️ Tech Stack  
| Component | Technology |
|------------|-------------|
| Frontend | Next.js / React.js |
| Backend | Node.js / Express |
| Programming Language | TypeScript |
| Database | MongoDB |
| Vector Store | QdrantDB / ChromaDB (depending on configuration) |
| AI Models | OpenAI / Gemini (Text Embedding + Chat Models) |

***

## 🧠 What is RAG?  
**RAG (Retrieval Augmented Generation)** is an AI technique where:  
1. Documents are split into smaller, searchable sections (**chunking**)  
2. These chunks are embedded into vectors and stored in a database (**indexing**)  
3. When a user asks a question, the model retrieves the most relevant chunks and uses them as **context for generation**

This allows the LLM to deliver **accurate, source-grounded answers** without hallucination.

***

## 🚀 How It Works  

1. **Upload Content**  
   Users upload a PDF or provide a YouTube video link.  

2. **Chunking & Embedding**  
   The content is divided into smaller segments and converted into vector embeddings.  

3. **Retrieval**  
   When a user asks a question, relevant chunks are retrieved from the vector database.  

4. **Response Generation**  
   The LLM generates a contextual response based on the retrieved data.  

***

## 🧩 Project Structure  
```
Exam-Buddy-RAG-Model/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── api/
│   └── styles/
├── public/
├── package.json
├── tsconfig.json
└── README.md
```

***

## 🎯 Example Use Case  
Upload your semester notes or a YouTube tutorial link and ask:  
> “Summarize Chapter 3: Compiler Design”  
> “Generate 5 MCQs from this video.”  

Exam Buddy retrieves relevant data, summarizes the content, and helps you prepare interactively.  

***

## 🧰 Future Enhancements  
- Integration with Google Drive / Notion for note imports  
- Support for more file formats (DOCX, PPTX, CSV)  
- Multi-user support with personalized study sessions  
- Real-time group quiz mode
- Storing the context of the whole chat 

***

## 🤝 Contributing  
Contributions and feedback are welcome!  
If you'd like to contribute:  
1. Fork the repository  
2. Create a new branch (`feature/new-module`)  
3. Commit your changes  
4. Submit a pull request  

***

## 📜 License  
This project is licensed under the **MIT License** — feel free to use and modify.  

***

## 🔗 Links  
- **Project Post:** [Introduction to RAG](https://bjcodes.hashnode.dev/introduction-to-rag)  
- **GitHub Repo:** [Exam Buddy RAG Model](https://github.com/Bhavya-coder-cyber/Exam-Buddy-RAG-Model)  

***

Would you like me to adapt this README to include **AI architecture diagrams** (flow of chunking, retrieval, and generation) in Markdown format as well? It would make your repo stand out more visually.

[1](https://github.com/Bhavya-coder-cyber/Exam-Buddy-RAG-Model)
