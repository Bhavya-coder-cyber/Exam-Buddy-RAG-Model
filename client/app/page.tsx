"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, FileText, Youtube, MessageCircle } from "lucide-react";

const HomePage: React.FC = () => {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 transition-colors duration-500 overflow-hidden">
      {/* Decorative gradient circles */}
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#6c47ff] to-[#9c88ff] opacity-30 animate-pulse blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-[#9c88ff] to-[#6c47ff] opacity-20 animate-pulse delay-2000 blur-3xl pointer-events-none"></div>

      {/* Main Title with icon */}
      <div className="flex items-center gap-5 mb-12 relative z-10">
        <div className="bg-gradient-to-r from-[#6c47ff] to-[#9c88ff] p-4 rounded-xl shadow-lg animate-pulse">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-[#6c47ff] to-[#9c88ff] bg-clip-text text-transparent select-none">
          Exam Buddy
        </h1>
      </div>

      {/* Subtitle */}
      <p className="max-w-xl text-center text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-16 z-10">
        Your AI Study Buddy 💡 — upload PDFs or submit YouTube video links, then dive into interactive, personalized learning assistants anytime, anywhere.
      </p>

      {/* Feature cards */}
      <section className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 z-10">
        {/* PDF Upload */}
        <Link
          href="/pdfchat"
          className="group flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-transparent hover:border-[#6c47ff] transition border-opacity-0 hover:scale-[1.05] cursor-pointer select-none"
        >
          <FileText className="w-12 h-12 text-[#6c47ff] mb-5 transition-transform group-hover:scale-110" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Upload PDF</h2>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Quickly upload your course PDFs to prepare tailored study sessions.
          </p>
        </Link>

        {/* YouTube Video Submission */}
        <Link
          href="/videoLink"
          className="group flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-transparent hover:border-[#6c47ff] transition border-opacity-0 hover:scale-[1.05] cursor-pointer select-none"
        >
          <Youtube className="w-12 h-12 text-[#6c47ff] mb-5 transition-transform group-hover:scale-110" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Submit YouTube Video</h2>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Submit video links and extract knowledge on-demand with AI.
          </p>
        </Link>
      </section>

      {/* Call to Action */}
      <div className="mt-20 z-10 text-center">
        <Link
          href="/pdfchat"
          className="inline-block bg-gradient-to-r from-[#6c47ff] to-[#9c88ff] text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:from-[#5840d8] hover:to-[#7a5cff] transition-transform hover:scale-[1.05]"
        >
          Get Started Now
        </Link>
      </div>
    </main>
  );
};

export default HomePage;
