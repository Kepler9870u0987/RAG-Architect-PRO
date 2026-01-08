
import React, { useState } from 'react';
import { Layers, Search, ArrowDownUp, GitMerge, FileText, Zap } from './Icons';

// Mock Data for "Hybrid Search" simulation
const DATASET = [
    { id: 'D1', title: 'Payment Gateway Error 503', content: 'If the API returns 503 Service Unavailable, the upstream provider is down. Retry with exponential backoff.', keywords: ['503', 'error', 'payment', 'gateway', 'retry'] },
    { id: 'D2', title: 'Configuring Retry Logic', content: 'Implementing exponential backoff is crucial for handling transient network errors.', keywords: ['retry', 'backoff', 'network', 'error'] },
    { id: 'D3', title: 'Customer Refund Policy', content: 'Refunds for 503 errors are processed automatically if the transaction failed.', keywords: ['refund', '503', 'error', 'transaction', 'policy'] },
    { id: 'D4', title: 'API Authentication', content: 'Use Bearer tokens for all gateway requests.', keywords: ['api', 'auth', 'token', 'gateway'] },
    { id: 'D5', title: 'Service Status Page', content: 'Check status.gateway.com for uptime reports.', keywords: ['status', 'uptime', 'page', 'service'] },
];

const ConceptVisualizer = () => (
    <div className="bg-slate-900 rounded-xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10"><Layers className="w-32 h-32"/></div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10"><Zap className="text-yellow-400"/> How it Works</h3>
        <div className="flex items-center justify-between text-xs md:text-sm relative z-10 gap-2">
            <div className="text-center w-1/4 opacity-80">
                <div className="mb-2 p-2 bg-blue-500/20 rounded border border-blue-500/50">Keyword Search</div>
                <div className="text-[10px] text-slate-400">BM25 (Exact Match)</div>
            </div>
            <div className="text-center font-bold text-xl text-slate-500">+</div>
            <div className="text-center w-1/4 opacity-80">
                <div className="mb-2 p-2 bg-emerald-500/20 rounded border border-emerald-500/50">Vector Search</div>
                <div className="text-[10px] text-slate-400">Embeddings (Concepts)</div>
            </div>
            <div className="text-center font-bold text-xl text-slate-500">→</div>
             <div className="text-center w-1/3">
                <div className="mb-2 p-2 bg-purple-500/30 rounded border border-purple-500 font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse">RRF Fusion</div>
                <div className="text-[10px] text-purple-300">Score = 1 / (k + rank)</div>
            </div>
        </div>
    </div>
);

const RerankLab: React.FC = () => {
    const [query, setQuery] = useState('How to handle 503 errors?');
    const [isSimulating, setIsSimulating] = useState(false);
    const [step, setStep] = useState(0); // 0: Idle, 1: Searching, 2: Fusing, 3: Reranking

    // State for results
    const [bm25Results, setBm25Results] = useState<any[]>([]);
    const [vecResults, setVecResults] = useState<any[]>([]);
    const [rrfResults, setRrfResults] = useState<any[]>([]);

    const runSimulation = () => {
        setIsSimulating(true);
        setStep(1);
        setRrfResults([]);

        const terms = query.toLowerCase().split(' ').filter(t => t.length > 2);

        setTimeout(() => {
            // Step 1: Simulate Search (Basic heuristic based on query terms)
            const scoredDocs = DATASET.map(doc => {
                 let matchCount = 0;
                 terms.forEach(term => { if (doc.keywords.some(k => k.includes(term))) matchCount++; });
                 // Fake score generation based on matches
                 const bm25Score = matchCount > 0 ? (matchCount * 0.3) + Math.random() * 0.2 : Math.random() * 0.1;
                 // Fake vector score (random but slightly biased towards same docs)
                 const vecScore = matchCount > 0 ? (matchCount * 0.25) + Math.random() * 0.3 : Math.random() * 0.2;
                 return { ...doc, scoreBM25: bm25Score, scoreVec: vecScore };
            });

            const bm25 = [...scoredDocs].sort((a, b) => b.scoreBM25 - a.scoreBM25);
            const vector = [...scoredDocs].sort((a, b) => b.scoreVec - a.scoreVec);
            
            setBm25Results(bm25);
            setVecResults(vector);
            setStep(2);

            setTimeout(() => {
                // Step 2: Compute Reciprocal Rank Fusion
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

                const merged = [...scoredDocs].map(doc => ({
                    ...doc,
                    scoreRRF: rrfMap.get(doc.id) || 0
                })).sort((a, b) => b.scoreRRF - a.scoreRRF);

                setStep(3);

                setTimeout(() => {
                    setRrfResults(merged);
                    setIsSimulating(false);
                    setStep(0);
                }, 800);

            }, 1000); // Wait for fusion animation

        }, 800); // Wait for search animation
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full overflow-hidden flex flex-col">
            <header className="mb-6 flex justify-between items-end shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <Layers className="text-purple-600" /> Fusion & Rerank Studio
                    </h2>
                    <p className="text-slate-500">Visualize Hybrid Search and Reciprocal Rank Fusion in action.</p>
                </div>
            </header>

            <ConceptVisualizer />

            {/* Controls */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 shrink-0 flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className={`absolute left-3 top-3.5 text-slate-400 w-5 h-5 ${step === 1 ? 'animate-bounce text-purple-500' : ''}`}/>
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter a search query..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-700 font-medium transition-all"
                    />
                    {step === 1 && <div className="absolute right-3 top-3 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">Processing...</div>}
                </div>
                <button 
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                    {isSimulating ? <ArrowDownUp className="w-5 h-5 animate-spin" /> : <GitMerge className="w-5 h-5" />}
                    {isSimulating ? 'Running...' : 'Run Simulation'}
                </button>
            </div>

            {/* Results Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
                
                {/* Column 1: BM25 */}
                <div className={`flex flex-col h-full bg-slate-50 rounded-2xl border transition-all duration-500 overflow-hidden ${step === 1 ? 'border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-slate-200'}`}>
                    <div className="p-4 bg-slate-100 border-b border-slate-200">
                        <h3 className="font-bold text-slate-600 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Sparse (BM25)
                        </h3>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto flex-1">
                        {bm25Results.map((doc, idx) => (
                            <div key={doc.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm opacity-80 transition-all hover:scale-[1.02]">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                        {(doc.scoreBM25 * 10).toFixed(1)}
                                    </span>
                                </div>
                                <div className="font-bold text-sm text-slate-800 leading-tight mb-1">{doc.title}</div>
                            </div>
                        ))}
                         {bm25Results.length === 0 && <div className="text-center text-slate-400 text-xs mt-10 italic">Waiting for query...</div>}
                    </div>
                </div>

                {/* Column 2: Vector */}
                <div className={`flex flex-col h-full bg-slate-50 rounded-2xl border transition-all duration-500 overflow-hidden ${step === 1 ? 'border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-slate-200'}`}>
                    <div className="p-4 bg-slate-100 border-b border-slate-200">
                        <h3 className="font-bold text-slate-600 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Dense (Vector)
                        </h3>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto flex-1">
                        {vecResults.map((doc, idx) => (
                            <div key={doc.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm opacity-80 transition-all hover:scale-[1.02]">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                                        {(doc.scoreVec).toFixed(2)}
                                    </span>
                                </div>
                                <div className="font-bold text-sm text-slate-800 leading-tight mb-1">{doc.title}</div>
                            </div>
                        ))}
                        {vecResults.length === 0 && <div className="text-center text-slate-400 text-xs mt-10 italic">Waiting for query...</div>}
                    </div>
                </div>

                {/* Column 3: RRF Fusion */}
                <div className={`flex flex-col h-full bg-purple-50 rounded-2xl border transition-all duration-500 overflow-hidden relative ${step === 2 || step === 3 ? 'border-purple-400 shadow-lg' : 'border-purple-100'}`}>
                    <div className="p-4 bg-purple-100/50 border-b border-purple-200">
                        <h3 className="font-bold text-purple-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <GitMerge className={`w-4 h-4 ${step === 2 ? 'animate-spin' : ''}`}/>
                            RRF Fusion + Rerank
                        </h3>
                    </div>
                    
                    <div className="p-4 space-y-3 overflow-y-auto flex-1 relative">
                         {step === 2 && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-50/90 z-10 backdrop-blur-sm">
                                 <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3"></div>
                                 <div className="text-xs font-bold text-purple-600 uppercase">Merging & Reranking...</div>
                             </div>
                         )}
                        
                        {rrfResults.map((doc, idx) => (
                            <div key={doc.id} className="bg-white p-3 rounded-xl border border-purple-200 shadow-md transform transition-all animate-in slide-in-from-bottom-2 fade-in duration-500" style={{animationDelay: `${idx * 100}ms`}}>
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                                            {idx + 1}
                                        </span>
                                        {idx === 0 && <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-700 px-1.5 rounded">Best Match</span>}
                                    </div>
                                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                        RRF: {doc.scoreRRF.toFixed(4)}
                                    </span>
                                </div>
                                <div className="font-bold text-sm text-slate-800 leading-tight mb-1">{doc.title}</div>
                                <div className="text-xs text-slate-500">{doc.content}</div>
                            </div>
                        ))}
                         {rrfResults.length === 0 && step === 0 && <div className="text-center text-slate-400 text-xs mt-10 italic">Run simulation to see fusion results</div>}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RerankLab;
