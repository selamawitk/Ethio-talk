import React from "react";
import { FaLaptopCode, FaCommentDots, FaGlobeAfrica, FaMicrophoneAlt, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    // Base container with background gradient and initial fade-in for the entire page
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white px-6 sm:px-12 py-12 animate-fade-in">
      
      {/* Back Button - First element to appear */}
      <div className="w-full flex justify-start mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800/70 hover:bg-slate-700/90 backdrop-blur-sm rounded-xl text-cyan-400 font-semibold transition-all duration-300 shadow-lg border border-cyan-500/30 hover:shadow-cyan-500/40"
        >
          <FaHome className="w-5 h-5" /> Home
        </button>
      </div>

      {/* Header Section - Appears after the button */}
      <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          About <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Ethio</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-purple-500">Talk</span>
        </h1>
        <p className="text-gray-300 mt-3 text-lg font-light">
          Bridging the Digital Divide through Amharic Voice Technology 🎙️
        </p>
      </div>

      {/* Main Content Card Container */}
      <div className="w-full max-w-5xl mx-auto space-y-8"> 
        
        {/* Mission Card - Cascading entrance 1 */}
        <section className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-3xl font-bold text-purple-400 mb-4 flex items-center border-b border-gray-700 pb-2">
            <FaGlobeAfrica className="mr-3 text-purple-400 animate-pulse-slow" /> Our Mission
          </h2>
          <p className="text-gray-200 text-lg leading-relaxed">
            <strong>EthioTalk</strong> empowers non-literate and voice-first
            communities in Ethiopia to connect with digital platforms naturally.
            By translating Amharic speech into meaningful text and actions, users
            can interact with systems that were once inaccessible — from checking
            crop prices to setting reminders. The goal is to let them use their{" "}
            <strong>voice</strong>, not text.
          </p>
        </section>

        {/* Technical Core Card - Cascading entrance 2 */}
        <section className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 shadow-[0_0_20px_rgba(45,212,191,0.1)] hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-3xl font-bold text-cyan-400 mb-4 flex items-center border-b border-gray-700 pb-2">
            <FaLaptopCode className="mr-3 text-cyan-400 animate-spin-slow" /> Technical Core
          </h2>
          <ul className="list-disc list-inside space-y-4 text-gray-300 text-lg pl-4">
            <li className="hover:text-cyan-300 transition-colors">
              <span className="font-semibold text-cyan-400">Speech Engine:</span> 
              Uses a simulated <strong>Fine-tuned Whisper Model</strong> (Python/ML backend) for accurate Amharic voice recognition.
            </li>
            <li className="hover:text-cyan-300 transition-colors">
              <span className="font-semibold text-cyan-400">Intent Detector:</span> 
              Smart logic maps phrases like “ዋጋ ምን ነው?” to actions like checking market prices.
            </li>
            <li className="hover:text-cyan-300 transition-colors">
              <span className="font-semibold text-cyan-400">Frontend:</span> 
              Built with <strong>React + Tailwind CSS</strong> for a responsive, dark-themed experience.
            </li>
            <li className="hover:text-cyan-300 transition-colors">
              <span className="font-semibold text-cyan-400">Voice Integration:</span> 
              Leverages browser’s <code>webkitSpeechRecognition</code> API to record, transcribe, and respond in real time.
            </li>
          </ul>
        </section>

        {/* Features Card - Cascading entrance 3 */}
        <section className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
          <h2 className="text-3xl font-bold text-purple-400 mb-4 flex items-center border-b border-gray-700 pb-2">
            <FaMicrophoneAlt className="mr-3 text-purple-400" /> Key Features
          </h2>
          <ul className="list-disc list-inside space-y-3 text-gray-300 text-lg pl-4">
            <li className="hover:text-cyan-300 transition-colors">🎤 Amharic speech-to-text conversation UI</li>
            <li className="hover:text-cyan-300 transition-colors">🌾 Farmers can ask for daily market prices via voice</li>
            <li className="hover:text-cyan-300 transition-colors">🎓 Students can check class schedules and announcements</li>
            <li className="hover:text-cyan-300 transition-colors">💬 Elderly users can record reminders in Amharic voice</li>
            <li className="hover:text-cyan-300 transition-colors">🌐 Built to scale into other Ethiopian languages (Oromo, Tigrigna)</li>
          </ul>
        </section>

        {/* Goal Card - Final cascading entrance */}
        <section className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 shadow-[0_0_20px_rgba(45,212,191,0.1)] hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
          <h3 className="text-2xl font-bold text-cyan-400 mb-3 flex items-center">
            <FaCommentDots className="mr-3 text-cyan-400" /> Project Goal
          </h3>
          <p className="text-gray-300 text-lg italic">
            To create Ethiopia’s first inclusive voice technology platform connecting
            rural and urban users to the digital world — one conversation at a time.
          </p>
        </section>
      </div>

      {/* Footer - Last element to fade in */}
      <p className="text-sm text-gray-400 mt-10 italic text-center animate-fade-in" style={{ animationDelay: '1.3s' }}>
        EthioTalk v2.0 | Crafted with 💙 for Ethiopia
      </p>
    </div>
  );
};

export default AboutPage;