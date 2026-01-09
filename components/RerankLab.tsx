
import React, { useState, useEffect } from 'react';
import { Layers, Search, ArrowDownUp, GitMerge, FileText, Zap, RefreshCw, Check, Binary } from './Icons';

// Expanded Mock Data for "Hybrid Search" simulation
const DATASET = [
    { id: 'D1', title: 'Payment Gateway Error 503', content: 'If the API returns 503 Service Unavailable, the upstream provider is down. Retry with exponential backoff.', keywords: ['503', 'error', 'payment', 'gateway', 'retry'] },
    { id: 'D2', title: 'Configuring Retry Logic', content: 'Implementing exponential backoff is crucial for handling transient network errors.', keywords: ['retry', 'backoff', 'network', 'error'] },
    { id: 'D3', title: 'Customer Refund Policy', content: 'Refunds for 503 errors are processed automatically if the transaction failed.', keywords: ['refund', '503', 'error', 'transaction', 'policy'] },
    { id: 'D4', title: 'API Authentication', content: 'Use Bearer tokens for all gateway requests.', keywords: ['api', 'auth', 'token', 'gateway'] },
    { id: 'D5', title: 'Service Status Page', content: 'Check status.gateway.com for uptime reports.', keywords: ['status', 'uptime', 'page', 'service'] },
    { id: 'D6', title: 'Late Chunking Benefits', content: 'Preserves context by embedding full docs before splitting into chunks.', keywords: ['chunking', 'late', 'context', 'embedding'] },
    { id: 'D7', title: 'Semantic Router Guide', content: 'Route queries based on intent using lightweight embedding models.', keywords: ['router', 'semantic', 'intent', 'routing'] },
    { id: 'D8', title: 'Rate Limiting Policies', content: 'Prevents abuse by limiting API calls per user per minute.', keywords: ['rate', 'limit', 'policy', 'abuse'] },
    { id: 'D9', title: 'Vector DB Indexing', content: 'HNSW vs IVF: Choosing the right indexing strategy for scalability.', keywords: ['vector', 'index', 'hnsw', 'ivf', 'db'] },
    { id: 'D10', title: 'ColBERT Multi-vector Search', content: 'Token-level late interaction for high precision retrieval.', keywords: ['colbert', 'token', 'search', 'precision'] },
    { id: 'D11', title: 'Metadata Extraction 2026', content: 'Extracting NER and RE improves multi-hop graph disambiguation.', keywords: ['ner', 're', 'metadata', 'graph'] },
    { id: 'D12', title: 'Cache-Control for RAG', content: 'Semantic caching stores query embeddings to skip LLM calls.', keywords: ['cache', 'semantic', 'embedding', 'cost'] },
];

const RANDOM_QUERIES = [
    "How to handle 503 errors?",
    "What is the policy for refunds?",
    "Explain late chunking vs naive",
    "Best way to implement retry backoff",
    "API token authentication guide",
    "Metadata extraction in graphRAG",
    "Improving vector search speed"
];

const RerankLab: React.FC = () => {
    const [query, setQuery] = useState(RANDOM_QUERIES[0]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [step, setStep] = useState(0); // 0: Idle, 1: Searching, 2: Fusing, 3: Completed

    const [bm25Results, setBm25Results] = useState<any[]>([]);
    const [vecResults, setVecResults] = useState<any[]>([]);
    const [rrfResults, setRrfResults] = useState<any[]>([]);

    const shuffleQuery = () => {
        const next = RANDOM_QUERIES[Math.floor(Math.random() * RANDOM_QUERIES.length)];
        setQuery(next);
    };

    const runSimulation = () => {
        if (isSimulating) return;
        setIsSimulating(true);
        setStep(1);
        setRrfResults([]);

        const terms = query.toLowerCase().split(' ').filter(t => t.length > 2);

        setTimeout(() => {
            const scoredDocs = DATASET.map(doc => {
                 let matchCount = 0;
                 terms.forEach(term => { if (doc.keywords.some(k => k.includes(term))) matchCount++; });
                 const bm25Score = matchCount > 0 ? (matchCount * 0.4) + Math.random() * 0.1 : Math.random() * 0.05;
                 const vecScore = matchCount > 0 ? (matchCount * 0.35) + Math.random() * 0.2 : Math.random() * 0.15;
                 return { ...doc, scoreBM25: bm25Score, scoreVec: vecScore };
            });

            const bm25 = [...scoredDocs].sort((a, b) => b.scoreBM25 - a.scoreBM25).slice(0, 6);
            const vector = [...scoredDocs].sort((a, b) => b.scoreVec - a.scoreVec).slice(0, 6);
            
            setBm25Results(bm25);
            setVecResults(vector);
            setStep(2);

            setTimeout(() => {
                const k = 60;
                const rrfMap = new Map();

                bm25.forEach((doc, rank) => {
                    const score = 1 / (k + rank + 1);
                    rrfMap.set(doc.id, (rrfMap.get(doc.id) || 0) + score);
                });

                vector.forEach((doc, rank) => {
                    const score = 1 / (k + rank + 1);
                    rrfMap.set(doc.id, (rrfMap.get(doc.id) || 0) + score);
                });

                const merged = DATASET.filter(d => rrfMap.has(d.id)).map(doc => ({
                    ...doc,
                    scoreRRF: rrfMap.get(doc.id) || 0,
                    rankBM25: bm25.findIndex(b => b.id === doc.id) + 1,
                    rankVec: vector.findIndex(v => v.id === doc.id) + 1
                })).sort((a, b) => b.scoreRRF - a.scoreRRF);

                setRrfResults(merged);
                setStep(3);
                setIsSimulating(false);
            }, 1800);
        }, 1200);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full overflow-hidden flex flex-col">
            <header className="mb-6 shrink-0">
                <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Layers className="text-purple-600" /> Fusion & Rerank Studio
                </h2>
                <p className="text-slate-500">Hybrid Search + Reciprocal Rank Fusion (RRF) Visualizer.</p>
            </header>

            {/* How it Works: Dynamic Scoring Explanation */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white mb-6 relative overflow-hidden shadow-xl border border-slate-800">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <GitMerge className="w-24 h-24 text-indigo-500 animate-pulse"/>
                </div>
                
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="text-amber-400 w-4 h-4"/> RRF Logic Flow: 1 / (k + rank)
                </h3>

                <div className="flex items-center gap-8 relative z-10">
                    <div className="flex-1">
                        <div className="text-sm text-slate-400 leading-relaxed max-w-lg">
                            RRF unisce i risultati di diverse strategie di ricerca senza normalizzare i punteggi grezzi. 
                            Premiamo i documenti che appaiono costantemente nelle prime posizioni di entrambi i "segnali".
                        </div>
                    </div>
                    {step === 3 && rrfResults[0] && (
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 animate-in zoom-in-95">
                            <div className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Winner Calculation (D1)</div>
                            <div className="flex items-center gap-3 font-mono text-sm">
                                <span>1 / (60 + {rrfResults[0].rankBM25 > 0 ? rrfResults[0].rankBM25 : '∞'})</span>
                                <span className="text-slate-500">+</span>
                                <span>1 / (60 + {rrfResults[0].rankVec > 0 ? rrfResults[0].rankVec : '∞'})</span>
                                <span className="text-slate-500">=</span>
                                <span className="text-amber-400 font-bold">{rrfResults[0].scoreRRF.toFixed(4)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 shrink-0 flex gap-3 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5"/>
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type or shuffle a query..."
                        className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 font-medium transition-all"
                    />
                    <button 
                        onClick={shuffleQuery}
                        className="absolute right-2 top-1.5 p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"
                        title="Random Query"
                    >
                        <RefreshCw className="w-4 h-4"/>
                    </button>
                </div>
                <button 
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                    {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />}
                    Simulate RRF
                </button>
            </div>

            {/* Results Animation Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0 overflow-hidden">
                {/* Sparse Column */}
                <div className={`flex flex-col bg-slate-50 rounded-2xl border transition-all duration-700 overflow-hidden ${step >= 1 ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200 opacity-40'}`}>
                    <div className="p-3 bg-slate-100/80 border-b border-slate-200 font-bold text-slate-600 text-[10px] uppercase tracking-wider flex justify-between items-center">
                        <span className="flex items-center gap-2"><FileText className="w-3 h-3"/> Sparse (BM25)</span>
                        {step === 1 && <RefreshCw className="w-3 h-3 animate-spin"/>}
                    </div>
                    <div className="p-3 space-y-2 overflow-y-auto custom-scrollbar">
                        {bm25Results.map((doc, i) => (
                            <div key={doc.id} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm animate-in slide-in-from-left-4" style={{animationDelay: `${i*50}ms`}}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-bold text-blue-600">RANK #{i+1}</span>
                                    <span className="text-[8px] font-mono text-slate-400">BM25: {(doc.scoreBM25 * 10).toFixed(2)}</span>
                                </div>
                                <div className="text-[11px] font-bold text-slate-800 truncate">{doc.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dense Column */}
                <div className={`flex flex-col bg-slate-50 rounded-2xl border transition-all duration-700 overflow-hidden ${step >= 1 ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-200 opacity-40'}`}>
                    <div className="p-3 bg-slate-100/80 border-b border-slate-200 font-bold text-slate-600 text-[10px] uppercase tracking-wider flex justify-between items-center">
                        <span className="flex items-center gap-2"><Binary className="w-3 h-3"/> Dense (Vector)</span>
                        {step === 1 && <RefreshCw className="w-3 h-3 animate-spin"/>}
                    </div>
                    <div className="p-3 space-y-2 overflow-y-auto custom-scrollbar">
                        {vecResults.map((doc, i) => (
                            <div key={doc.id} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm animate-in slide-in-from-right-4" style={{animationDelay: `${i*50}ms`}}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-bold text-emerald-600">RANK #{i+1}</span>
                                    <span className="text-[8px] font-mono text-slate-400">SIM: {doc.scoreVec.toFixed(3)}</span>
                                </div>
                                <div className="text-[11px] font-bold text-slate-800 truncate">{doc.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Unified Column (Output) */}
                <div className={`flex flex-col bg-slate-900 rounded-2xl border transition-all duration-1000 overflow-hidden ${step === 3 ? 'border-purple-500 shadow-2xl' : 'border-slate-800 opacity-40'}`}>
                    <div className="p-3 bg-slate-800 border-b border-slate-700 font-bold text-purple-400 text-[10px] uppercase tracking-wider flex justify-between items-center">
                        <span className="flex items-center gap-2"><GitMerge className="w-3 h-3"/> RRF Output</span>
                        {step === 2 && <RefreshCw className="w-3 h-3 animate-spin text-purple-500"/>}
                    </div>
                    <div className="p-3 space-y-2 overflow-y-auto custom-scrollbar relative">
                        {step === 2 && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mb-2"/>
                                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Fusing Signals...</span>
                            </div>
                        )}
                        {rrfResults.map((doc, i) => (
                            <div 
                                key={doc.id} 
                                className={`p-3 rounded-xl border transition-all duration-500 ${i === 0 ? 'bg-purple-600/10 border-purple-500 shadow-lg shadow-purple-500/5' : 'bg-slate-800 border-slate-700'}`}
                                style={{animationDelay: `${i*100}ms`}}
                            >
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                            {i + 1}
                                        </div>
                                        {i === 0 && <span className="text-[8px] bg-amber-500 text-slate-900 px-1 rounded font-bold animate-pulse">WINNER</span>}
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-purple-400">{doc.scoreRRF.toFixed(4)}</span>
                                </div>
                                <div className={`text-xs font-bold truncate mb-2 ${i === 0 ? 'text-white' : 'text-slate-300'}`}>{doc.title}</div>
                                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 transition-all duration-1000"
                                        style={{ width: `${(doc.scoreRRF / rrfResults[0].scoreRRF) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RerankLab;
