
import React, { useState, useEffect } from 'react';
import { Layers, Search, ArrowDownUp, GitMerge, FileText, Zap, RefreshCw, Check, Binary, ChevronDown, Activity } from './Icons';

const DATASET = [
    { id: 'D1', title: 'Payment Gateway Error 503', content: 'If the API returns 503 Service Unavailable, the upstream provider is down. Retry with exponential backoff.', keywords: ['503', 'error', 'payment', 'gateway', 'retry'] },
    { id: 'D2', title: 'Configuring Retry Logic', content: 'Implementing exponential backoff is crucial for handling transient network errors.', keywords: ['retry', 'backoff', 'network', 'error'] },
    { id: 'D3', title: 'Customer Refund Policy', content: 'Refunds for 503 errors are processed automatically if the transaction failed.', keywords: ['refund', '503', 'error', 'transaction', 'policy'] },
    { id: 'D4', title: 'API Authentication', content: 'Use Bearer tokens for all gateway requests.', keywords: ['api', 'auth', 'token', 'gateway'] },
    { id: 'D5', title: 'Service Status Page', content: 'Check status.gateway.com for uptime reports.', keywords: ['status', 'uptime', 'page', 'service'] },
    { id: 'D6', title: 'Late Chunking Benefits', content: 'Preserves context by embedding full docs before splitting into chunks.', keywords: ['chunking', 'late', 'context', 'embedding'] },
];

const RANDOM_QUERIES = [
    "How to handle 503 errors?",
    "What is the policy for refunds?",
    "Explain late chunking vs naive",
    "Best way to implement retry backoff"
];

const RerankLab: React.FC = () => {
    const [query, setQuery] = useState(RANDOM_QUERIES[0]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [step, setStep] = useState(0); 
    const [bm25Results, setBm25Results] = useState<any[]>([]);
    const [vecResults, setVecResults] = useState<any[]>([]);
    const [rrfResults, setRrfResults] = useState<any[]>([]);
    const [showExplanation, setShowExplanation] = useState(true);

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

            const bm25 = [...scoredDocs].sort((a, b) => b.scoreBM25 - a.scoreBM25).slice(0, 5);
            const vector = [...scoredDocs].sort((a, b) => b.scoreVec - a.scoreVec).slice(0, 5);
            
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
            }, 1500);
        }, 1000);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full overflow-hidden flex flex-col gap-6">
            <header className="shrink-0 flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-1 flex items-center gap-3">
                        <Layers className="text-indigo-600 w-8 h-8" /> 
                        RRF Fusion Strategy <span className="text-indigo-600">2026</span>
                    </h2>
                    <p className="text-slate-500 font-medium">Reciprocal Rank Fusion: unire Sparse e Dense search senza bias di scala.</p>
                </div>
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                   <Activity className="w-4 h-4 text-indigo-500" /> {showExplanation ? "Nascondi Teoria" : "Mostra Teoria"}
                </button>
            </header>

            {showExplanation && (
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <GitMerge className="w-32 h-32 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="space-y-3">
                            <h4 className="text-amber-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Il Problema della Scala
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                BM25 produce punteggi illimitati (>20), mentre i Vector Embeddings producono cosine similarity (0-1). Non si possono sommare direttamente.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4" /> La Soluzione RRF
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                RRF converte i punteggi in **Posizioni (Rank)**. Se un documento è 1° in BM25 e 1° in Vector, vince sempre, a prescindere dal valore del punteggio.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-emerald-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <Check className="w-4 h-4" /> Formula Standard (k=60)
                            </h4>
                            <div className="bg-black/30 p-3 rounded-xl font-mono text-[11px] border border-white/10">
                                Score = Σ (1 / (k + Rank_i))
                            </div>
                            <p className="text-[10px] text-slate-400 italic">La costante k mitiga l'impatto di documenti con rank basso.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 shrink-0 flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5"/>
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all"
                        placeholder="Inserisci una query tecnica..."
                    />
                </div>
                <button 
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 text-xs uppercase tracking-widest"
                >
                    {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />}
                    Compute RRF
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 min-h-0 overflow-hidden">
                <div className={`flex flex-col bg-white rounded-3xl border-2 transition-all duration-700 overflow-hidden shadow-sm ${step >= 1 ? 'border-blue-500' : 'border-slate-100 opacity-40'}`}>
                    <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                        <span className="font-black text-[10px] text-blue-700 uppercase tracking-widest flex items-center gap-2">
                           <FileText className="w-4 h-4"/> Signal A: Sparse (BM25)
                        </span>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar bg-slate-50/50">
                        {bm25Results.map((doc, i) => (
                            <div key={doc.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-left-4" style={{animationDelay: `${i*100}ms`}}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">Rank #{i+1}</span>
                                    <span className="text-[10px] font-mono font-bold text-slate-400">Punti: {(doc.scoreBM25 * 10).toFixed(2)}</span>
                                </div>
                                <div className="text-xs font-black text-slate-800 leading-snug">{doc.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`flex flex-col bg-white rounded-3xl border-2 transition-all duration-700 overflow-hidden shadow-sm ${step >= 1 ? 'border-emerald-500' : 'border-slate-100 opacity-40'}`}>
                    <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
                        <span className="font-black text-[10px] text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                           <Binary className="w-4 h-4"/> Signal B: Dense (Vector)
                        </span>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar bg-slate-50/50">
                        {vecResults.map((doc, i) => (
                            <div key={doc.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4" style={{animationDelay: `${i*100}ms`}}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Rank #{i+1}</span>
                                    <span className="text-[10px] font-mono font-bold text-slate-400">Sim: {doc.scoreVec.toFixed(3)}</span>
                                </div>
                                <div className="text-xs font-black text-slate-800 leading-snug">{doc.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`flex flex-col bg-slate-900 rounded-3xl border-2 transition-all duration-1000 overflow-hidden shadow-2xl ${step === 3 ? 'border-indigo-500' : 'border-slate-800 opacity-40'}`}>
                    <div className="p-4 bg-indigo-950/50 border-b border-indigo-900 flex justify-between items-center">
                        <span className="font-black text-[10px] text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                           <GitMerge className="w-4 h-4"/> Final Fused Ranking (RRF)
                        </span>
                    </div>
                    <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar relative bg-slate-900/50">
                        {step === 2 && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm">
                                <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4"/>
                                <span className="text-xs text-indigo-400 font-black uppercase tracking-widest">Applying RRF Algorithm...</span>
                            </div>
                        )}
                        {rrfResults.map((doc, i) => (
                            <div 
                                key={doc.id} 
                                className={`p-5 rounded-2xl border transition-all duration-500 ${i === 0 ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800/50 border-slate-700'}`}
                                style={{animationDelay: `${i*150}ms`}}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                            {i + 1}
                                        </div>
                                        {i === 0 && <span className="text-[9px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black animate-pulse">OPTIMAL PICK</span>}
                                    </div>
                                    <span className="text-xs font-mono font-black text-indigo-400">{doc.scoreRRF.toFixed(4)}</span>
                                </div>
                                <div className={`text-sm font-black mb-4 leading-tight ${i === 0 ? 'text-white' : 'text-slate-300'}`}>{doc.title}</div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span>Calculation breakdown</span>
                                        <span className="text-indigo-500">K = 60</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-black/30 p-2 rounded-lg border border-white/5 text-center">
                                            <div className="text-[8px] text-slate-500 uppercase mb-1">Sparse Rank</div>
                                            <div className="text-[10px] font-mono text-blue-400">{doc.rankBM25 > 0 ? `1 / (60+${doc.rankBM25})` : '0'}</div>
                                        </div>
                                        <div className="bg-black/30 p-2 rounded-lg border border-white/5 text-center">
                                            <div className="text-[8px] text-slate-500 uppercase mb-1">Dense Rank</div>
                                            <div className="text-[10px] font-mono text-emerald-400">{doc.rankVec > 0 ? `1 / (60+${doc.rankVec})` : '0'}</div>
                                        </div>
                                    </div>
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
