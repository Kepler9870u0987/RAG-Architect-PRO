
import React, { useEffect, useState } from 'react';
import { getAIConfig, saveAIConfig } from '../services/geminiService';
import { AIConfig } from '../types';
import { Bot, Zap, Settings, X, Server, Cloud, Check, ShieldAlert } from './Icons';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIConfigModal: React.FC<AIConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<AIConfig>(getAIConfig());
  const [saving, setSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) {
      setConfig(getAIConfig());
      setTestStatus('idle');
    }
  }, [isOpen]);

  const handleSave = () => {
    setSaving(true);
    saveAIConfig(config);
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 500);
  };

  const handleTestConnection = async () => {
      setTestStatus('testing');
      try {
          // Simple fetch to root or version endpoint if available, but for Ollama simply fetching root checks if server is up
          const res = await fetch(config.ollamaUrl); 
          if (res.ok) {
              setTestStatus('success');
          } else {
              setTestStatus('error');
          }
      } catch (e) {
          setTestStatus('error');
      }
      // Reset status after a few seconds
      setTimeout(() => setTestStatus('idle'), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              AI Model Configuration
            </h2>
            <p className="text-sm text-slate-500 mt-1">Select your inference provider for the RAG pipeline.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-white">
          {/* Provider Selection Cards */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setConfig({ ...config, provider: 'GEMINI' })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${
                config.provider === 'GEMINI'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`p-3 rounded-full transition-colors ${config.provider === 'GEMINI' ? 'bg-white shadow-sm ring-1 ring-indigo-100' : 'bg-slate-100'}`}>
                <Cloud className={`w-6 h-6 ${config.provider === 'GEMINI' ? 'text-indigo-600' : 'text-slate-400'}`} />
              </div>
              <div className="text-center">
                <div className="font-bold text-sm">Google Gemini</div>
                <div className="text-xs opacity-80">Cloud Inference</div>
              </div>
            </button>

            <button
              onClick={() => setConfig({ ...config, provider: 'OLLAMA' })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${
                config.provider === 'OLLAMA'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`p-3 rounded-full transition-colors ${config.provider === 'OLLAMA' ? 'bg-white shadow-sm ring-1 ring-indigo-100' : 'bg-slate-100'}`}>
                <Server className={`w-6 h-6 ${config.provider === 'OLLAMA' ? 'text-indigo-600' : 'text-slate-400'}`} />
              </div>
              <div className="text-center">
                <div className="font-bold text-sm">Ollama</div>
                <div className="text-xs opacity-80">Local Inference</div>
              </div>
            </button>
          </div>

          {/* Dynamic Configuration Fields */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            {config.provider === 'GEMINI' ? (
              <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-sm shrink-0">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Gemini 3 Flash Preview</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Connected via environment API Key. This model is optimized for low latency and high-throughput RAG tasks. 
                    <span className="block mt-2 font-medium text-emerald-600 flex items-center gap-1">
                       ● Ready for production use
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                 <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Ollama API URL</label>
                    <div className="relative">
                        <div className="absolute left-3 top-2.5 p-0.5 bg-slate-100 rounded">
                            <Server className="w-4 h-4 text-slate-500" />
                        </div>
                        <input 
                            type="text" 
                            value={config.ollamaUrl} 
                            onChange={(e) => setConfig({...config, ollamaUrl: e.target.value})}
                            className="w-full pl-10 pr-24 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm group-hover:border-slate-400"
                            placeholder="http://localhost:11434"
                        />
                        <button 
                            onClick={handleTestConnection}
                            disabled={testStatus === 'testing'}
                            className={`absolute right-1 top-1 py-1.5 px-3 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                                testStatus === 'success' ? 'bg-emerald-100 text-emerald-700' :
                                testStatus === 'error' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {testStatus === 'testing' ? 'Testing...' : 
                             testStatus === 'success' ? <><Check className="w-3 h-3" /> OK</> :
                             testStatus === 'error' ? <><ShieldAlert className="w-3 h-3" /> Fail</> :
                             'Test'}
                        </button>
                    </div>
                </div>
                <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Model Name</label>
                    <div className="relative">
                        <div className="absolute left-3 top-2.5 p-0.5 bg-slate-100 rounded">
                             <Bot className="w-4 h-4 text-slate-500" />
                        </div>
                        <input 
                            type="text" 
                            value={config.ollamaModel} 
                            onChange={(e) => setConfig({...config, ollamaModel: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm group-hover:border-slate-400"
                            placeholder="llama3, mistral, phi3..."
                        />
                    </div>
                </div>
                <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 flex gap-3 items-start">
                    <span className="text-lg select-none">⚠️</span>
                    <p className="leading-snug">
                        <strong>CORS Configuration Required:</strong> Ensure your local Ollama instance is running with 
                        <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 mx-1 text-amber-800 font-mono">OLLAMA_ORIGINS="*"</code> 
                        to allow browser requests from this app.
                    </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
                <>
                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                 Saving...
                </>
            ) : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConfigModal;
