
import React, { useState } from 'react';
import { Layers, Search, ArrowDownUp, GitMerge, FileText } from './Icons';

// Mock Data for "Hybrid Search" simulation
const DATASET = [
    { id: 'D1', title: 'Payment Gateway Error 503', content: 'If the API returns 503 Service Unavailable, the upstream provider is down. Retry with exponential backoff.', scoreBM25: 0.9, scoreVec: 0.8 },
    { id: 'D2', title: 'Configuring Retry Logic', content: 'Implementing exponential backoff is crucial for handling transient network errors.', scoreBM25: 0.2, scoreVec: 0.85 },
    { id: 'D3', title: 'Customer Refund Policy', content: 'Refunds for 503 errors are processed automatically if the transaction failed.', scoreBM25: 0.8, scoreVec: 0.4 },
    { id: 'D4', title: 'API Authentication', content: 'Use Bearer tokens for all gateway requests.', scoreBM25: 0.1, scoreVec: 0.1 },
    { id: 'D5', title: 'Service Status Page', content: 'Check status.gateway.com for uptime reports.', scoreBM25: 0.3, scoreVec: 0.5 },
];

const RerankLab: React.FC = () => {
    const [query, setQuery] = useState('How to handle 503 errors?');
    const [isSimulating, setIsSimulating] = useState(false);

    // Initial state sorted randomly to simulate raw index
    const [bm25Results, setBm25Results] = useState(DATASET.sort(() => Math.random() - 0.5));
    const [vecResults, setVecResults] = useState(DATASET.sort(() => Math.random() - 0.5));
    const [rrfResults, setRrfResults] = useState<any[]>([]);

    const runSimulation = () => {
        setIsSimulating(true);
        setRrfResults([]);

        setTimeout(() => {
            // Step 1: Simulate Retrievals
            const bm25 = [...DATASET].sort((a, b) => b.scoreBM25 - a.scoreBM25);
            const vector = [...DATASET].sort((a, b) => b.scoreVec - a.scoreVec);
            
            setBm25Results(bm25);
            setVecResults(vector);

            // Step 2: Compute Reciprocal Rank Fusion
            // Score = 1 / (k + rank)
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

            const merged = [...DATASET].map(doc => ({
                ...doc,
                scoreRRF: rrfMap.get(doc.id) || 0
            })).sort((a, b) => b.scoreRRF - a.scoreRRF);

            setTimeout(() => {
                setRrfResults(merged);
                setIsSimulating(false);
            }, 800);

        }, 600);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full overflow-hidden flex flex-col">
            <header className="mb-8 flex justify-between items-end shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <Layers className="text-purple-600" /> Fusion & Rerank Studio
                    </h2>
                    <p className="text-slate-500">Visualize Hybrid Search and Cross-Encoder Reranking in action.</p>
                </div>
            </header>

            {/* Controls */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 shrink-0 flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5"/>
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-700 font-medium"
                    />
                </div>
                <button 
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center gap-2"
                >
                    {isSimulating ? <ArrowDownUp className="w-5 h-5 animate-spin" /> : <GitMerge className="w-5 h-5" />}
                    Run Fusion
                </button>
            </div>

            {/* Results Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
                
                {/* Column 1: BM25 */}
                <div className="flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-100 border-b border-slate-200">
                        <h3 className="font-bold text-slate-600 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Sparse (BM25)
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Keyword matching. Good for exact terms.</p>
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
                                <div className="text-xs text-slate-500 line-clamp-2">{doc.content}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: Vector */}
                <div className="flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-100 border-b border-slate-200">
                        <h3 className="font-bold text-slate-600 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Dense (Vector)
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Semantic meaning. Good for concepts.</p>
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
                                <div className="text-xs text-slate-500 line-clamp-2">{doc.content}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 3: RRF Fusion */}
                <div className="flex flex-col h-full bg-purple-50 rounded-2xl border border-purple-100 overflow-hidden relative">
                    <div className="p-4 bg-purple-100/50 border-b border-purple-200">
                        <h3 className="font-bold text-purple-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <GitMerge className="w-4 h-4"/>
                            RRF Fusion + Rerank
                        </h3>
                        <p className="text-xs text-purple-700/60 mt-1">Reciprocal Rank Fusion. Best of both worlds.</p>
                    </div>
                    
                    <div className="p-4 space-y-3 overflow-y-auto flex-1 relative">
                        {rrfResults.length === 0 && !isSimulating && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-300">
                                <Layers className="w-16 h-16 mb-2 opacity-50"/>
                                <p className="text-sm font-medium">Run fusion to merge lists</p>
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
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RerankLab;
