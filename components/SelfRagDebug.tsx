
import React, { useState } from 'react';
import { Bot, Search, Check, X, RefreshCw, Layers } from './Icons';

const SelfRagDebug: React.FC = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState(0);

    const runDebug = () => {
        setIsProcessing(true);
        setStep(0);
        
        let timer = 0;
        const intervals = [1000, 1500, 1200, 1000];
        
        intervals.forEach((time, idx) => {
            timer += time;
            setTimeout(() => {
                setStep(idx + 1);
                if (idx === intervals.length - 1) setIsProcessing(false);
            }, timer);
        });
    };

    return (
        <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
            <header className="mb-6 shrink-0">
                <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Bot className="text-indigo-600" /> Self-RAG Reflection Studio
                </h2>
                <p className="text-slate-500">Analizza come l'AI valuta criticamente la rilevanza e il supporto della propria risposta.</p>
            </header>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 flex gap-4 items-center shadow-sm">
                <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 italic">
                    "Spiegami come funziona il Semantic Caching..."
                </div>
                <button 
                    onClick={runDebug}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
                    Avvia Debug
                </button>
            </div>

            <div className="space-y-6">
                {/* Step 1: Retrieval Evaluation */}
                <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${step >= 1 ? 'border-indigo-500 bg-white' : 'border-slate-100 opacity-20'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">1</span>
                            <h3 className="font-bold text-slate-800">Analisi Rilevanza Recupero</h3>
                        </div>
                        {step >= 1 && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-200">[Is-Relevant]</span>}
                    </div>
                    {step >= 1 && (
                        <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono">
                            Il modello valuta che i 3 frammenti recuperati contengono informazioni utili sul Caching semantico.
                        </div>
                    )}
                </div>

                {/* Step 2: Hallucination Check */}
                <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${step >= 2 ? 'border-amber-500 bg-white' : 'border-slate-100 opacity-20'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">2</span>
                            <h3 className="font-bold text-slate-800">Supporto Fact-Checking</h3>
                        </div>
                        {step >= 2 && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200">[Is-Supported]</span>}
                    </div>
                    {step >= 2 && (
                        <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono">
                            Verifica in corso: Ogni affermazione nella bozza è presente nel contesto recuperato. Nessuna allucinazione rilevata.
                        </div>
                    )}
                </div>

                {/* Step 3: Utility Scoring */}
                <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${step >= 3 ? 'border-emerald-500 bg-white shadow-xl scale-[1.02]' : 'border-slate-100 opacity-20'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">3</span>
                            <h3 className="font-bold text-slate-800">Generazione Finale con Reflection Tokens</h3>
                        </div>
                        {step >= 3 && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">[Final-Output]</span>}
                    </div>
                    {step >= 3 && (
                        <div className="text-sm text-slate-600 bg-slate-900 text-indigo-300 p-6 rounded-xl border border-slate-800 leading-relaxed">
                            <span className="text-slate-500 mr-2">[Is-Relevant]</span> 
                            Il Semantic Caching utilizza embedding per archiviare risposte a query simili... 
                            <span className="text-slate-500 mx-2">[Is-Supported]</span> 
                            Questo riduce drasticamente i costi operativi e la latenza.
                            <span className="text-emerald-500 ml-2 font-bold">[Useful: 5/5]</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelfRagDebug;
