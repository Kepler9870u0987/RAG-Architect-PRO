
import React, { useState } from 'react';
import { Activity, Zap, Layers, Server } from './Icons';

const CostROI: React.FC = () => {
    const [queriesPerMonth, setQueriesPerMonth] = useState(10000);
    const [isOptimized, setIsOptimized] = useState(true);

    const standardCost = (queriesPerMonth * 0.05).toFixed(2);
    const optimizedCost = (queriesPerMonth * 0.015).toFixed(2);
    const savings = (parseFloat(standardCost) - parseFloat(optimizedCost)).toFixed(2);

    return (
        <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
            <header className="mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Activity className="text-emerald-600" /> Cost & ROI Analysis
                </h2>
                <p className="text-slate-500">Calcola l'efficienza economica derivante dall'uso di Adaptive Routing e Semantic Cache.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Volume Query Mensile</label>
                    <input 
                        type="range" min="1000" max="100000" step="1000" 
                        value={queriesPerMonth} 
                        onChange={(e) => setQueriesPerMonth(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-4"
                    />
                    <div className="text-4xl font-black text-slate-900">{queriesPerMonth.toLocaleString()} <span className="text-lg font-normal text-slate-400">/ mese</span></div>
                </div>

                <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
                    <div>
                        <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">Risparmio Stimato</div>
                        <div className="text-5xl font-black">${savings}</div>
                        <div className="text-sm text-indigo-100 mt-2">Riduzione costi del 70% grazie all'ottimizzazione 2026.</div>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-200 text-xs mt-4">
                        {/* Fixed: Use Activity instead of TrendingUp as TrendingUp is not exported from Icons.tsx */}
                        <Activity className="w-4 h-4"/> ROI Positivo in 1.4 mesi
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Confronto Strategie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl opacity-60">
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Server className="w-4 h-4"/> RAG Standard (Naive)</h4>
                        <p className="text-xs text-slate-500 mb-4">Ogni query esegue retrieval e generazione su modello Pro.</p>
                        <div className="text-xl font-bold text-slate-700">${standardCost} / mese</div>
                    </div>
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4"><Zap className="text-emerald-500 w-12 h-12 opacity-10"/></div>
                        <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2"><Zap className="w-4 h-4"/> RAG Adaptive (Pro 2026)</h4>
                        <p className="text-xs text-emerald-600 mb-4">Routing intelligente, modelli Flash e Semantic Cache.</p>
                        <div className="text-xl font-bold text-emerald-700">${optimizedCost} / mese</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostROI;