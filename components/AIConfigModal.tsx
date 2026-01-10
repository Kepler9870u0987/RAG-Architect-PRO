
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
          const res = await fetch(config.ollamaUrl); 
          if (res.ok) setTestStatus('success');
          else setTestStatus('error');
      } catch (e) {
          setTestStatus('error');
      }
      setTimeout(() => setTestStatus('idle'), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-600" />
              AI Configuration
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Provider & Inference Settings</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'GEMINI', icon: <Cloud />, label: 'Google Gemini', sub: 'Cloud' },
              { id: 'OLLAMA', icon: <Server />, label: 'Ollama', sub: 'Local' }
            ].map((prov) => (
              <button
                key={prov.id}
                onClick={() => setConfig({ ...config, provider: prov.id as any })}
                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-300 ${
                  config.provider === prov.id
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-lg shadow-indigo-100'
                    : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`p-3 rounded-xl transition-all ${config.provider === prov.id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                  {/* FIX: Cast to any to avoid className property missing error on unknown attributes */}
                  {React.cloneElement(prov.icon as any, { className: 'w-6 h-6' })}
                </div>
                <div className="text-center">
                  <div className="font-black text-sm">{prov.label}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">{prov.sub}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {config.provider === 'GEMINI' ? (
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-3 bg-white rounded-xl border border-indigo-200 shadow-sm shrink-0">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-black text-indigo-900 text-sm italic">Gemini 3 Flash Pro</h3>
                  <p className="text-xs text-indigo-700/70 mt-1 leading-relaxed font-medium">
                    Ottimizzato per il 2026. Utilizza l'API Key configurata per l'inferenza cloud a bassa latenza.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Endpoint URL</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={config.ollamaUrl} 
                            onChange={(e) => setConfig({...config, ollamaUrl: e.target.value})}
                            className="w-full pl-4 pr-24 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                            placeholder="http://localhost:11434"
                        />
                        <button 
                            onClick={handleTestConnection}
                            disabled={testStatus === 'testing'}
                            className={`absolute right-1.5 top-1.5 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                                testStatus === 'success' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                                testStatus === 'error' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' :
                                'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {testStatus === 'testing' ? 'Wait...' : testStatus === 'success' ? 'OK' : testStatus === 'error' ? 'FAIL' : 'TEST'}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Model ID</label>
                    <input 
                        type="text" 
                        value={config.ollamaModel} 
                        onChange={(e) => setConfig({...config, ollamaModel: e.target.value})}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                        placeholder="llama3"
                    />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors text-xs uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {saving ? 'Syncing...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConfigModal;
