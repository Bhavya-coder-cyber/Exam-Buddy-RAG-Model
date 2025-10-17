"use client";
import React, { useState } from "react";
import {
  Upload,
  File,
  Send,
  MessageCircle,
  FileText,
  X,
  Paperclip,
  Moon,
  Sun,
  Link2,
  Youtube,
} from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

// Type definitions
interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content?: string;
  documents?: QueryResponse[];
}

// interface UploadResponse {
//   message: string;
//   filename: string;
//   documentsCount: number;
//   collectionName: string;
// }

interface QueryResponse {
  pageContent?: string;
  metaData?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}

const NotebookLLMInterface: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);

  const handleFileUpload = async (file: File | null): Promise<void> => {
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      setIsUploading(true);

      // Add uploading message
      setMessages([
        {
          id: Date.now(),
          role: "system",
          content: `Uploading "${file.name}" and processing with AI...`,
        },
      ]);

      try {
        // Create FormData to send file
        const formData = new FormData();
        formData.append("pdf", file);

        // Send to backend
        const response = await fetch("http://localhost:8000/upload/pdf", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setMessages([
            {
              id: Date.now(),
              role: "system",
              content: `PDF "${file.name}" has been uploaded and processed successfully. You can now ask questions about its content.`,
            },
          ]);
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || "Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setMessages([
          {
            id: Date.now(),
            role: "system",
            content: `Error uploading "${file.name}": ${errorMessage}. Please try again.`,
          },
        ]);
        setUploadedFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (): void => {
    setUploadedFile(null);
    setMessages([]);
  };

  const sendMessage = async (): Promise<void> => {
    if (inputMessage.trim() && uploadedFile && !isQuerying) {
      const newMessage: Message = {
        id: Date.now(),
        role: "user",
        content: inputMessage,
      };
      setMessages((prev) => [...prev, newMessage]);
      const currentMessage = inputMessage;
      const prevMessage = messages[messages.length - 3];
      console.log("Previous message:", prevMessage);
      const prevResponse = messages[messages.length - 2];
      console.log("Previous response:", prevResponse);
      setInputMessage("");
      setIsQuerying(true);

      try {
        // Send question to backend
        const response = await fetch(
          `http://localhost:8000/chat?message=${currentMessage}&previous_message=${
            prevMessage?.content || ""
          }&previous_response=${prevResponse?.content || ""}`
        );
        const data = await response.json();

        if (response.ok) {
          const aiResponse: Message = {
            id: Date.now() + 1,
            role: "assistant",
            content: data?.message,
            documents: data?.documents,
          };
          setMessages((prev) => [...prev, aiResponse]);
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || "Query failed");
        }
      } catch (error) {
        console.error("Query error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        const errorResponse: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: `Sorry, I encountered an error while processing your question: ${errorMessage}. Please try again.`,
        };
        setMessages((prev) => [...prev, errorResponse]);
      } finally {
        setIsQuerying(false);
      }
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0] || null;
    handleFileUpload(file);
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  const clearAll = async () => {
    const response = await fetch('http://localhost:8000/deleteCollections')
    if (response.ok) {
      setUploadedFile(null);
      setMessages([]);
    } else {
      console.error("Error clearing collections");
    }
  }

  return (
    <div
      className={`flex h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Left Panel - PDF Upload */}
      <div
        className={`w-1/3 border-r flex flex-col transition-colors duration-200 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`p-6 border-b flex items-center justify-between transition-colors duration-200 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-semibold flex items-center gap-2 transition-colors duration-200 ${
                isDarkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              <FileText className="w-5 h-5" />
              Document Upload
            </h2>
            <p
              className={`text-sm mt-1 transition-colors duration-200 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Upload a PDF to start asking questions
            </p>
          </div>
          <button
            className={`group p-3 rounded-lg flex items-center gap-2 transition-colors duration-200 cursor-pointer ${
              isDarkMode
                ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            aria-label="Upload Video"
          >
            <Link href="/videoLink" className="flex items-center gap-2">
              <Youtube className="w-4 h-4" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Upload Video
              </span>
            </Link>
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDarkMode
                ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex-1 p-6">
          {!uploadedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg h-64 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                isDragOver
                  ? isDarkMode
                    ? "border-blue-400 bg-blue-900/20"
                    : "border-blue-400 bg-blue-50"
                  : isDarkMode
                  ? "border-gray-600 hover:border-gray-500 bg-gray-700/30"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload
                className={`w-12 h-12 mb-4 transition-colors duration-200 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <p
                className={`text-center mb-2 transition-colors duration-200 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Drop your PDF here or click to browse
              </p>
              <p
                className={`text-xs transition-colors duration-200 ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                PDF files only
              </p>
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileInputChange}
                disabled={isUploading}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`rounded-lg p-4 transition-colors duration-200 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <File className="w-8 h-8 text-red-500" />
                    <div>
                      <p
                        className={`font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-gray-100" : "text-gray-800"
                        }`}
                      >
                        {uploadedFile.name}
                      </p>
                      <p
                        className={`text-sm transition-colors duration-200 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {formatFileSize(uploadedFile.size)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className={`p-1 rounded transition-colors duration-200 ${
                      isDarkMode
                        ? "hover:bg-gray-600 text-gray-400"
                        : "hover:bg-gray-200 text-gray-500"
                    }`}
                    disabled={isUploading}
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div
                  className={`w-full rounded-full h-2 transition-colors duration-200 ${
                    isDarkMode ? "bg-gray-600" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isUploading ? "bg-blue-500 animate-pulse" : "bg-green-500"
                    } ${isUploading ? "w-3/4" : "w-full"}`}
                  ></div>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    isUploading ? "text-blue-500" : "text-green-500"
                  }`}
                >
                  {isUploading ? "Processing..." : "Upload complete"}
                </p>
              </div>

              {!isUploading && (
                <div
                  className={`border rounded-lg p-4 transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-blue-900/20 border-blue-700"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <h3
                    className={`font-medium mb-2 transition-colors duration-200 ${
                      isDarkMode ? "text-blue-300" : "text-blue-800"
                    }`}
                  >
                    Ready to Chat!
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-200 ${
                      isDarkMode ? "text-blue-400" : "text-blue-700"
                    }`}
                  >
                    Your PDF has been processed. Start asking questions about
                    the document in the chat panel. If you want to add more
                    PDFs, close the current one by clicking the "X" button above
                    and upload a new file.
                  </p>
                </div>
              )}
            </div>
          )}
          <button onClick={clearAll} className="mt-4 w-full cursor-pointer flex items-center justify-center gap-2 p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:cursor-not-allowed" disabled={!uploadedFile && messages.length === 0}>
            Start Fresh Chat
          </button>
        </div>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div
          className={`p-6 border-b transition-colors duration-200 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <h2
                className={`text-xl font-semibold flex items-center gap-2 transition-colors duration-200 ${
                  isDarkMode ? "text-gray-100" : "text-gray-800"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                AI Assistant
              </h2>
              <p
                className={`text-sm mt-1 transition-colors duration-200 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {uploadedFile
                  ? `Ask questions about "${uploadedFile.name}"`
                  : "Upload a PDF to start chatting"}
              </p>
            </div>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !uploadedFile && (
            <div className="text-center mt-20">
              <MessageCircle
                className={`w-16 h-16 mx-auto mb-4 transition-colors duration-200 ${
                  isDarkMode ? "text-gray-600" : "text-gray-300"
                }`}
              />
              <p
                className={`text-lg mb-2 transition-colors duration-200 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Welcome to Notebook LLM
              </p>
              <p
                className={`text-sm transition-colors duration-200 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Upload a PDF document to start asking questions about its
                content.
              </p>
            </div>
          )}

          {messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3/4 rounded-lg px-4 py-3 transition-colors duration-200 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : message.role === "system"
                    ? isDarkMode
                      ? "bg-green-900/30 text-green-300 border border-green-700"
                      : "bg-green-100 text-green-800 border border-green-200"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-100"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  {message.documents &&
                    message.documents[0]?.metaData?.loc?.pageNumber !==
                      undefined && (
                      <ReactMarkdown>
                        {`Page Number is: ${String(
                          message.documents[0].metaData?.loc?.pageNumber
                        )}`}
                      </ReactMarkdown>
                    )}
                </p>
              </div>
            </div>
          ))}

          {isQuerying && (
            <div className="flex justify-start">
              <div
                className={`max-w-3/4 rounded-lg px-4 py-3 transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-100"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          className={`border-t p-6 transition-colors duration-200 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setInputMessage(e.target.value)
                }
                onKeyPress={handleKeyPress}
                placeholder={
                  uploadedFile
                    ? "Ask a question about your document..."
                    : "Upload a PDF first to start chatting"
                }
                className={`w-full border rounded-lg px-4 py-3 pr-12 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                rows={2}
                disabled={!uploadedFile || isUploading || isQuerying}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={
                !inputMessage.trim() ||
                !uploadedFile ||
                isUploading ||
                isQuerying
              }
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isQuerying ? "Sending..." : "Send"}
            </button>
          </div>

          {uploadedFile && (
            <p
              className={`text-xs mt-2 flex items-center gap-1 transition-colors duration-200 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <File className="w-3 h-3" />
              Analyzing: {uploadedFile.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotebookLLMInterface;
