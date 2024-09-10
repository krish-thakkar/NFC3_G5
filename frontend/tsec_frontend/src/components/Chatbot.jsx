import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegWindowClose, FaSpinner, FaPaperPlane, FaTimes, FaChevronUp } from 'react-icons/fa';
import axios from 'axios';

const languages = {
  en: {
    name: "English",
    title: "Kisan Mitra: Your Farming Companion",
    subtitle: "Ask me anything about farming!",
    chatPlaceholder: "Type your farming question here...",
    sendButton: "Send",
    loadingMessage: "Thinking...",
    welcomeMessage: "Welcome! How can I assist you with your farming needs today?",
    selectLanguage: "Select Language",
    minimizedTitle: "Chat with Kisan Mitra",
  },
  hi: {
    name: "हिंदी",
    title: "किसान मित्र: आपका कृषि साथी",
    subtitle: "खेती के बारे में कुछ भी पूछें!",
    chatPlaceholder: "अपना कृषि प्रश्न यहाँ टाइप करें...",
    sendButton: "भेजें",
    loadingMessage: "सोच रहा हूँ...",
    welcomeMessage: "स्वागत है! आज मैं आपकी कृषि आवश्यकताओं में कैसे सहायता कर सकता हूँ?",
    selectLanguage: "भाषा चुनें",
    minimizedTitle: "किसान मित्र से चैट करें",
  },
};

const Chatbot = ({ isOpen, onClose, theme, userAvatar }) => {
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generativeAI, setGenerativeAI] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [latestData, setLatestData] = useState(null);
  const messagesEndRef = useRef(null);

  const t = languages[language] || languages.en;

  useEffect(() => {
    const api_key;
    const genAI = new GoogleGenerativeAI(api_key);
    setGenerativeAI(genAI);
    setMessages([{ role: 'assistant', content: t.welcomeMessage }]);
    fetchLatestData();
  }, [t.welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchLatestData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/latest-data');
      setLatestData(response.data);
    } catch (error) {
      console.error('Error fetching latest data:', error);
    }
  };

  const getResponse = async (prompt) => {
    if (!generativeAI) return 'AI model not initialized. Please try again.';
    try {
      const model = generativeAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating content:', error);
      return 'Failed to generate content. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    const context = messages.slice(-10).map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const dataContext = latestData ? JSON.stringify(latestData) : 'No data available';
    
    const prompt = `
      You are Kisan Mitra, an AI assistant specialized in helping farmers. Provide helpful and concise answers to farming-related questions. If a question is not related to farming, politely steer the conversation back to agricultural topics. Respond in ${languages[language].name}.

      Context:
      ${context}

      User: ${userMessage}

      Latest agricultural data:
      ${dataContext}

      Assistant: Provide a helpful response based on the context, the user's question, and the latest agricultural data. If there's not enough context or data, ask for clarification.
    `;

    const response = await getResponse(prompt);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            height: isMinimized ? 'auto' : '600px',
            width: isMinimized ? '300px' : '450px',
          }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-4 right-4 max-w-full bg-white rounded-xl shadow-2xl overflow-hidden z-50 border-2 border-${theme.primary}-400 flex flex-col`}
        >
          {isMinimized ? (
            <div 
              className={`bg-gradient-to-r from-${theme.primary}-600 to-${theme.primary}-800 p-4 flex justify-between items-center cursor-pointer`}
              onClick={toggleMinimize}
            >
              <h2 className="text-xl font-bold text-white">{t.minimizedTitle}</h2>
              <FaChevronUp className="text-white" />
            </div>
          ) : (
            <>
              <div className={`bg-gradient-to-r from-${theme.primary}-600 to-${theme.primary}-800 p-6 flex justify-between items-center`}>
                <div>
                  <h2 className="text-3xl font-bold text-green-600">{t.title}</h2>
                  <p className={`text-${theme.primary}-100 mt-1`}>{t.subtitle}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={toggleMinimize} 
                    className={`text-white hover:text-${theme.primary}-200 transition-colors duration-200 bg-${theme.primary}-700 hover:bg-${theme.primary}-600 rounded-full p-2`}
                    title="Minimize chat"
                  >
                    <FaRegWindowClose size={24} />
                    <span className="sr-only">Minimize chat</span>
                  </button>
                  <button
                    onClick={onClose}
                    className={`text-white hover:text-${theme.primary}-200 transition-colors duration-200 bg-${theme.primary}-700 hover:bg-${theme.primary}-600 rounded-full p-2`}
                    title="Close chat"
                  >
                    <FaTimes size={24} />
                    <span className="sr-only">Close chat</span>
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-6 bg-gray-50">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`p-4 rounded-2xl max-w-[80%] ${
                        message.role === 'user'
                          ? `bg-${theme.primary}-100 text-${theme.primary}-900`
                          : `bg-white text-gray-800 shadow-md`
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className={`p-4 rounded-2xl bg-white text-gray-800 shadow-md flex items-center`}>
                      <FaSpinner className={`animate-spin mr-2 text-${theme.primary}-600`} />
                      {t.loadingMessage}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="p-4 bg-white border-t-2 border-gray-200">
                <div className="flex items-center space-x-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`rounded-lg border-gray-300 shadow-sm focus:border-${theme.primary}-500 focus:ring-${theme.primary}-500 text-sm`}
                  >
                    {Object.entries(languages).map(([code, lang]) => (
                      <option key={code} value={code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.chatPlaceholder}
                    className={`flex-grow rounded-l-lg border-2 border-${theme.primary}-300 p-3 focus:outline-none focus:ring-2 focus:ring-${theme.primary}-600 focus:border-transparent`}
                  />
                  <button
                    type="submit"
                    className={`bg-${theme.primary}-600 text-green-500 p-3 rounded-lg hover:bg-${theme.primary}-700 focus:outline-none focus:ring-2 focus:ring-${theme.primary}-600 transition-colors duration-200`}
                    disabled={loading}
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaPaperPlane />
                    )}
                    <span className="sr-only">{t.sendButton}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Chatbot;
