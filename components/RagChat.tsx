
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, MessageSquareText, Zap, ShieldCheck } from './Icons';
import { ChatMessage, AIConfig } from '../types';
import { streamExpertResponse, getAIConfig } from '../services/geminiService';
import AIConfigModal from './AIConfigModal';

const SUGGESTED_TOPICS = [
  "Parametri BM25 consigliati",
  "Vantaggi Late Chunking",
  "Logica RRF (k=60)",
  "Metrica Faithfulness",
  "Adaptive Routing vs Static"
];

declare var marked: any;

const RagChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "### Benvenuto nell'Expert Console v2026.1\n\nHo analizzato le linee guida per sistemi **RAG Production-Ready**. Posso aiutarti con:\n\n- **Ottimizzazione Retrieval**: Late Chunking e parametri BM25.\n- **Strategie di Ranking**: RRF e Cross-Encoders.\n- **Quality Assurance**: Metriche RAGAS e prevenzione allucinazioni.\n- **Security**: Prompt Injection e PII Scrubbing.\n\nCosa stiamo progettando oggi?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<AIConfig>(getAIConfig());

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

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: textToSend,
        timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: new Date() }]);

    await streamExpertResponse(messages, userMsg.text, (chunk) => {
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: chunk } : m));
    });

    setIsTyping(false);
  };

  // Funzione helper per il rendering sicuro del markdown
  const renderMarkdown = (content: string) => {
    try {
      return { __html: marked.parse(content) };
    } catch (e) {
      return { __html: content };
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-100">
              <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-800">Expert RAG Consultant</h2>
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded border border-emerald-200 uppercase">Guidelines v2026.1</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Engine: {config.provider === 'GEMINI' ? 'Gemini 3 Flash' : `Ollama (${config.ollamaModel})`}
              </p>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)} className="text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all border border-slate-200">
            ⚙️ Configuration
        </button>
      </header>

      <AIConfigModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-white border border-slate-200 text-slate-600' : 'bg-indigo-600 text-white'}`}>
                    {msg.role === 'user' ? <div className="text-xs font-black">TU</div> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl text-sm shadow-xl border transition-all ${
                    msg.role === 'user' 
                    ? 'bg-white border-slate-100 text-slate-800 rounded-tr-none' 
                    : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none prose-ai'
                }`}>
                   {msg.role === 'model' ? (
                     <div dangerouslySetInnerHTML={renderMarkdown(msg.text)} />
                   ) : (
                     <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                   )}
                   
                   {msg.role === 'model' && msg.text && (
                     <div className="mt-6 pt-4 border-t border-white/5 text-[10px] flex items-center justify-between opacity-50 font-mono">
                       <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-400"/> PRODUCTION VERIFIED</span>
                       <span>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                   )}
                </div>
            </div>
        ))}
        {isTyping && (
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl rounded-tl-none text-sm flex items-center gap-3 shadow-xl border border-slate-800">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Elaborazione...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest py-1 flex items-center gap-1 w-full text-center justify-center mb-1">
              <Zap className="w-2.5 h-2.5 text-amber-500"/> QUICK ACTIONS
            </span>
            {SUGGESTED_TOPICS.map((topic, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(topic)}
                className="text-[10px] font-bold px-4 py-1.5 bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-200 rounded-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {topic}
              </button>
            ))}
          </div>
          <div className="flex gap-3 items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Chiedi sull'Adaptive Routing o sui budget di latenza..."
                className="flex-1 bg-transparent border-0 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                  <Send className="w-5 h-5" />
              </button>
          </div>
          <p className="text-[9px] text-center text-slate-400 mt-3 font-medium uppercase tracking-tight">
            Consultant can make mistakes. Verify critical architectural decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RagChat;
