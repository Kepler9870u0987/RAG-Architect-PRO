
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, MessageSquareText } from './Icons';
import { ChatMessage, AIConfig } from '../types';
import { streamExpertResponse, getAIConfig } from '../services/geminiService';
import AIConfigModal from './AIConfigModal';

const RagChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I am your RAG Consultant. I have read the 'Complete Guide to Production-Ready RAG Systems 2025-2026'. Ask me about Late Chunking, Adaptive Routing, or Security!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Settings State using common Modal
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<AIConfig>(getAIConfig());

  // Listen for config changes to update label
  useEffect(() => {
    if (!showSettings) {
        setConfig(getAIConfig());
    }
  }, [showSettings]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: input,
        timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Optimistic update for bot message container
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: new Date() }]);

    await streamExpertResponse(messages, userMsg.text, (chunk) => {
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: chunk } : m));
    });

    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
              <Bot className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
              <h2 className="font-bold text-slate-800">Expert Consultant</h2>
              <p className="text-xs text-slate-500">
                Powered by {config.provider === 'GEMINI' ? 'Gemini 3 Flash' : `Ollama (${config.ollamaModel})`}
              </p>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)} className="text-sm text-slate-500 hover:text-indigo-600 hover:bg-slate-50 p-2 rounded transition">
            ⚙️ AI Settings
        </button>
      </header>

      <AIConfigModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-600'}`}>
                    {msg.role === 'user' ? <div className="text-xs font-bold text-slate-600">You</div> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-white border border-slate-200 text-slate-800 rounded-tr-none' : 'bg-indigo-600 text-white rounded-tl-none'}`}>
                   {msg.text}
                </div>
            </div>
        ))}
        {isTyping && (
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tl-none text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-200"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about margin signal gating..."
              className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition disabled:opacity-50"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default RagChat;
