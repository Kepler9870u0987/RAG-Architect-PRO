
import React, { useState } from 'react';
import { Zap, Bot, Database, Network, Search, ArrowRight, ShieldCheck, RefreshCw, MessageSquareText } from './Icons';

const SUGGESTED_QUERIES = [
    { text: "Ciao, come ti chiami?", type: "NO_RETRIEVAL", label: "Colloquiale" },
    { text: "Quali sono le ultime notizie sul RAG nel 2025?", type: "VECTOR_SEARCH", label: "Ricerca Fatti" },
    { text: "Perché il Late Chunking è meglio del Naive splitting?", type: "GRAPH_RAG", label: "Ragionamento" }
];

const RoutingLab: React.FC = () => {
    const [query, setQuery] = useState("");
    const [isRouting, setIsRouting] = useState(false);
    const [decision, setDecision] = useState<{path: string, confidence: number, reason: string} | null>(null);

    const simulateRouting = (overrideQuery?: string) => {
        const targetQuery = overrideQuery || query;
        if (!targetQuery) return;
        
        setQuery(targetQuery);
        setIsRouting(true);
        setDecision(null);

        setTimeout(() => {
            let res;
            const q = targetQuery.toLowerCase();
            if (q.includes("ciao") || q.includes("chi sei") || q.includes("nome")) {
                res = { path: "NO_RETRIEVAL", confidence: 0.98, reason: "Query colloquiale o identità dell'assistente rilevata." };
            } else if (q.includes("notizie") || q.includes("mondiali") || q.includes("fatti") || q.includes("202")) {
                res = { path: "VECTOR_SEARCH", confidence: 0.88, reason: "La richiesta richiede dati fattuali specifici estratti dal Vector Store." };
            } else if (q.includes("perché") || q.includes("relazione") || q.includes("confronto")) {
                res = { path: "GRAPH_RAG", confidence: 0.75, reason: "Richiesta di analisi multi-hop sulle relazioni tra concetti complessi." };
            } else {
                res = { path: "VECTOR_SEARCH", confidence: 0.60, reason: "Query generica, instradamento verso Vector Store come fallback." };
            }
            setDecision(res);
            setIsRouting(false);
        }, 1000);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full overflow-hidden flex flex-col">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Zap className="text-amber-500" /> Adaptive Routing Lab
                </h2>
                <p className="text-slate-500">Visualizza come il sistema decide tra No-Retrieval, Vector Search o Knowledge Graphs.</p>
            </header>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <div className="flex gap-4 items-center mb-4">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                        placeholder="Inserisci una query o usa un suggerimento sotto..."
                    />
                    <button 
                        onClick={() => simulateRouting()}
                        disabled={isRouting || !query}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isRouting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Network className="w-5 h-5" />}
                        Analizza
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase mr-2 flex items-center gap-1">
                        <MessageSquareText className="w-3 h-3"/> Esempi:
                    </span>
                    {SUGGESTED_QUERIES.map((q, idx) => (
                        <button 
                            key={idx}
                            onClick={() => simulateRouting(q.text)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full text-xs font-medium border border-slate-200 transition-colors"
                        >
                            {q.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${decision?.path === 'NO_RETRIEVAL' ? 'border-amber-500 bg-amber-50 shadow-xl scale-105 z-10' : 'border-slate-100 opacity-40'}`}>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                        <Bot className="text-amber-600 w-6 h-6"/>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">No Retrieval</h3>
                    <p className="text-xs text-slate-500">L'LLM risponde direttamente usando la sua conoscenza interna. Latenza: ~150ms.</p>
                </div>

                <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${decision?.path === 'VECTOR_SEARCH' ? 'border-blue-500 bg-blue-50 shadow-xl scale-105 z-10' : 'border-slate-100 opacity-40'}`}>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                        <Database className="text-blue-600 w-6 h-6"/>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Vector Search</h3>
                    <p className="text-xs text-slate-500">Ricerca semantica densa per estrazione di fatti. Latenza: ~400ms.</p>
                </div>

                <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${decision?.path === 'GRAPH_RAG' ? 'border-purple-500 bg-purple-50 shadow-xl scale-105 z-10' : 'border-slate-100 opacity-40'}`}>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                        <Network className="text-purple-600 w-6 h-6"/>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">GraphRAG</h3>
                    <p className="text-xs text-slate-500">Navigazione delle relazioni tra entità (Multi-hop). Latenza: ~800ms.</p>
                </div>
            </div>

            {decision && (
                <div className="mt-8 bg-slate-900 text-white p-8 rounded-3xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="text-center md:text-left">
                            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Motivazione Decisionale</div>
                            <h4 className="text-xl font-bold mb-2">Routing: {decision.path.replace('_', ' ')}</h4>
                            <p className="text-slate-400 text-sm max-w-xl">{decision.reason}</p>
                        </div>
                        <div className="ml-auto text-center">
                            <div className="text-4xl font-black text-amber-500">{(decision.confidence * 100).toFixed(0)}%</div>
                            <div className="text-[10px] uppercase font-bold text-slate-500">Confidence Score</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoutingLab;
