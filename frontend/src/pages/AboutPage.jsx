import { motion } from "framer-motion";
import { FaLaptopCode, FaCommentDots, FaGlobeAfrica, FaMicrophoneAlt } from "react-icons/fa";

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.15 } },
  viewport: { once: true },
};

const cardVariants = {
  initial: { opacity: 0, y: 40, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  viewport: { once: true },
};

export default function AboutPage({ darkMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white'
          : 'bg-green-50 text-black'
      } px-4 sm:px-8 md:px-12 pt-2 pb-8 md:pb-12`}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center max-w-3xl mx-auto mb-8 md:mb-12 mt-4"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
          About <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Ethio</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-purple-500">Talk</span>
        </h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2 md:mt-3 text-base md:text-lg font-light`}>
          Bridging the Digital Divide through Amharic Voice Technology
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div variants={stagger} initial="initial" whileInView="whileInView" className="w-full max-w-5xl mx-auto space-y-6 md:space-y-8">
        <motion.section variants={cardVariants} className={`${darkMode ? 'bg-slate-800/40 border-cyan-500/20' : 'bg-white border-green-300'} backdrop-blur-sm rounded-2xl p-6 md:p-8 border shadow-lg transition-all duration-500 hover:shadow-xl`}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 flex items-center border-b pb-2 ${darkMode ? 'text-purple-400 border-gray-700' : 'text-purple-600 border-gray-300'}`}>
            <FaGlobeAfrica className={`mr-3 animate-pulse ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} /> Our Mission
          </h2>
          <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} text-base md:text-lg leading-relaxed`}>
            <strong>EthioTalk</strong> empowers non-literate and voice-first
            communities in Ethiopia to connect with digital platforms naturally.
            By translating Amharic speech into meaningful text and actions, users
            can interact with systems that were once inaccessible — from checking
            crop prices to setting reminders. The goal is to let them use their{" "}
            <strong>voice</strong>, not text.
          </p>
        </motion.section>

        <motion.section variants={cardVariants} className={`${darkMode ? 'bg-slate-800/40 border-cyan-500/20' : 'bg-white border-green-300'} backdrop-blur-sm rounded-2xl p-6 md:p-8 border shadow-lg transition-all duration-500 hover:shadow-xl`}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 flex items-center border-b pb-2 ${darkMode ? 'text-cyan-400 border-gray-700' : 'text-cyan-600 border-gray-300'}`}>
            <FaLaptopCode className={`mr-3 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} /> Technical Core
          </h2>
          <ul className={`list-disc list-inside space-y-3 md:space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-base md:text-lg pl-2 md:pl-4`}>
            <li className="hover:text-cyan-300 transition-colors">
              <span className="font-semibold text-cyan-400">AI Engine:</span>{" "}
              Uses <strong>Groq</strong> (Mixtral 8x7B) for fast English responses and <strong>Gemini 2.0 Flash</strong> for Amharic.
            </li>
            <li className="hover:text-cyan-300 transition-colors">
              <span className="font-semibold text-cyan-400">Backend:</span>{" "}
              <strong>NestJS</strong> with <strong>PostgreSQL + Prisma</strong> for data persistence.
            </li>
            <li className="hover:text-cyan-300 transition-colors">
              <span className="font-semibold text-cyan-400">Speech Recognition:</span>{" "}
              Browser-native <code className="text-cyan-300">webkitSpeechRecognition</code> API with Amharic (am-ET) and English support.
            </li>
            <li className="hover:text-cyan-300 transition-colors">
              <span className="font-semibold text-cyan-400">Frontend:</span>{" "}
              Built with <strong>React + Tailwind CSS + Framer Motion</strong> for a responsive, animated experience.
            </li>
            <li className="hover:text-cyan-300 transition-colors">
              <span className="font-semibold text-cyan-400">Text-to-Speech:</span>{" "}
              Uses browser <code className="text-cyan-300">speechSynthesis</code> API for Amharic and English voice output.
            </li>
          </ul>
        </motion.section>

        <motion.section variants={cardVariants} className={`${darkMode ? 'bg-slate-800/40 border-cyan-500/20' : 'bg-white border-green-300'} backdrop-blur-sm rounded-2xl p-6 md:p-8 border shadow-lg transition-all duration-500 hover:shadow-xl`}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 flex items-center border-b pb-2 ${darkMode ? 'text-purple-400 border-gray-700' : 'text-purple-600 border-gray-300'}`}>
            <FaMicrophoneAlt className={`mr-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} /> Key Features
          </h2>
          <ul className={`list-disc list-inside space-y-2 md:space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-base md:text-lg pl-2 md:pl-4`}>
            <li className="hover:text-cyan-300 transition-colors">Amharic speech-to-text conversation UI</li>
            <li className="hover:text-cyan-300 transition-colors">Farmers can ask for daily market prices via voice</li>
            <li className="hover:text-cyan-300 transition-colors">Students can check class schedules and announcements</li>
            <li className="hover:text-cyan-300 transition-colors">Elderly users can record reminders in Amharic voice</li>
            <li className="hover:text-cyan-300 transition-colors">Built to scale into other Ethiopian languages (Oromo, Tigrigna)</li>
          </ul>
        </motion.section>

        <motion.section variants={cardVariants} className={`${darkMode ? 'bg-slate-800/40 border-cyan-500/20' : 'bg-white border-green-300'} backdrop-blur-sm rounded-2xl p-6 md:p-8 border shadow-lg transition-all duration-500 hover:shadow-xl`}>
          <h3 className={`text-xl md:text-2xl font-bold mb-3 flex items-center ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
            <FaCommentDots className={`mr-3 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} /> Project Goal
          </h3>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-base md:text-lg italic`}>
            To create Ethiopia's first inclusive voice technology platform connecting
            rural and urban users to the digital world — one conversation at a time.
          </p>
        </motion.section>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs md:text-sm text-gray-400 mt-8 md:mt-10 italic text-center"
      >
        EthioTalk v3.0 | Powered by Groq + Gemini | Crafted for Ethiopia
      </motion.p>
    </motion.div>
  );
}
