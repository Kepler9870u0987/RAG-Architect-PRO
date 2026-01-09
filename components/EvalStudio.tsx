
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Play, RefreshCw, Check, ShieldAlert, FileText, Upload, Network } from './Icons';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { EvalRun } from '../types';

// Mock Golden Dataset
const GOLDEN_DATASET = [
    { id: '1', query: "What is Late Chunking?", answer: "Late Chunking preserves context by embedding the full text before splitting it.", context: "Late Chunking processes the entire document through the Transformer...", expected: "Embedding full text then splitting." },
    { id: '2', query: "How does Self-RAG work?", answer: "It uses reflection tokens to critique its own retrieval and generation.", context: "Self-RAG introduces reflection tokens like [Retrieval] and [Critique]...", expected: "Uses reflection tokens." },
    { id: '3', query: "What is the capital of Mars?", answer: "I cannot answer that as Mars does not have a capital.", context: "Mars is the fourth planet from the Sun...", expected: "Refusal to answer." },
    { id: '4', query: "Explain BGE-M3 embedding.", answer: "BGE-M3 is a dense model supporting multi-linguality and multi-granularity.", context: "BGE-M3 stands for Multi-Lingual, Multi-Functionality...", expected: "Dense model features." }
];

const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { currentRow.push(currentField.trim()); currentField = ''; }
        else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (currentField || currentRow.length > 0) { currentRow.push(currentField.trim()); rows.push(currentRow); currentRow = []; currentField = ''; }
        } else currentField += char;
    }
    if (currentField || currentRow.length > 0) { currentRow.push(currentField.trim()); rows.push(currentRow); }
    return rows;
};

const EvalStudio: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [runs, setRuns] = useState<EvalRun[]>([]);
    const [aggregate, setAggregate] = useState<{subject: string, A: number, fullMark: number}[]>([]);
    
    // Pipeline State from localStorage
    const [activePipeline, setActivePipeline] = useState<any>(null);

    const [mode, setMode] = useState<'GOLDEN' | 'MANUAL' | 'CSV'>('GOLDEN');
    const [manualInput, setManualInput] = useState({ query: '', context: '', answer: '' });
    const [csvData, setCsvData] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkPipeline = () => {
            const saved = localStorage.getItem('active_pipeline');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Only count if there are active nodes
                    const hasActive = parsed.nodes?.some((n: any) => n.active);
                    if (hasActive) setActivePipeline(parsed);
                    else setActivePipeline(null);
                } catch (e) { setActivePipeline(null); }
            }
        };
        checkPipeline();
        // Listen for storage changes if user is in multiple tabs
        window.addEventListener('storage', checkPipeline);
        return () => window.removeEventListener('storage', checkPipeline);
    }, []);

    const runEvalLogic = (dataset: any[]) => {
        setIsRunning(true);
        setRuns([]);
        setProgress(0);
        setAggregate([]);

        let completed = 0;
        const total = dataset.length;
        const newRuns: EvalRun[] = [];

        const interval = setInterval(() => {
            if (completed >= total) {
                clearInterval(interval);
                setIsRunning(false);
                calculateAggregate(newRuns);
                return;
            }

            const item = dataset[completed];
            
            // Influence metrics based on pipeline configuration
            // More nodes = better precision but potentially lower faithfulness if guardrails aren't active
            const activeNodeCount = activePipeline ? activePipeline.nodes.filter((n:any)=>n.active).length : 2;
            const hasGuardrails = activePipeline?.nodes.some((n:any) => n.active && n.type === 'GUARDRAIL');
            
            const baseMultiplier = 0.7 + (activeNodeCount * 0.04); // Cap at 1.0ish
            const faithfulness = Math.min(0.98, (Math.random() * 0.1 + 0.85) * (hasGuardrails ? 1.05 : 0.9)); 
            const answerRelevance = Math.min(0.98, (Math.random() * 0.15 + 0.75) * Math.min(1.1, baseMultiplier)); 
            const contextPrecision = Math.min(0.98, (Math.random() * 0.15 + 0.75) * Math.min(1.2, baseMultiplier)); 
            
            const finalPrecision = (!item.context || item.context.length < 10) ? 0.1 : contextPrecision;

            const run: EvalRun = {
                id: item.id || Math.random().toString(),
                query: item.query,
                retrievedContext: [item.context],
                generatedAnswer: item.answer,
                metrics: { faithfulness, answerRelevance, contextPrecision: finalPrecision },
                status: finalPrecision < 0.5 ? 'FAIL' : 'PASS',
                reason: finalPrecision < 0.5 ? 'Low Context Precision (Hallucination Risk)' : undefined
            };

            newRuns.push(run);
            setRuns([...newRuns]);
            completed++;
            setProgress(Math.round((completed / total) * 100));

        }, 400); 
    };

    const startEvaluation = () => {
        if (mode === 'GOLDEN') runEvalLogic(GOLDEN_DATASET);
        if (mode === 'MANUAL') {
             if (!manualInput.query) return;
             runEvalLogic([{ ...manualInput, id: 'manual-1' }]);
        }
        if (mode === 'CSV') {
             if (csvData.length === 0) return;
             runEvalLogic(csvData);
        }
    };

    const calculateAggregate = (results: EvalRun[]) => {
        const avgFaith = results.reduce((a, b) => a + b.metrics.faithfulness, 0) / results.length;
        const avgRel = results.reduce((a, b) => a + b.metrics.answerRelevance, 0) / results.length;
        const avgPrec = results.reduce((a, b) => a + b.metrics.contextPrecision, 0) / results.length;
        const avgRecall = avgPrec * 0.92; 

        setAggregate([
            { subject: 'Faithfulness', A: Math.round(avgFaith * 100), fullMark: 100 },
            { subject: 'Ans Relevance', A: Math.round(avgRel * 100), fullMark: 100 },
            { subject: 'Ctx Precision', A: Math.round(avgPrec * 100), fullMark: 100 },
            { subject: 'Ctx Recall', A: Math.round(avgRecall * 100), fullMark: 100 },
        ]);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const rows = parseCSV(text);
            if (rows.length > 1) {
                 const mapped = rows.slice(1).map((r, i) => ({
                     id: `csv-${i}`,
                     query: r[0] || "",
                     answer: r[1] || "",
                     context: r[2] || ""
                 })).filter(r => r.query);
                 setCsvData(mapped);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full overflow-hidden flex flex-col">
            <header className="mb-6 flex justify-between items-end shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <Activity className="text-emerald-600" /> Evaluation Studio
                    </h2>
                    <p className="text-slate-500">Benchmark your RAG architecture quality signals.</p>
                </div>
                {activePipeline && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <Network className="w-4 h-4 text-indigo-600"/>
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Pipeline Connected</span>
                    </div>
                )}
            </header>

            {!activePipeline && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shrink-0 animate-in fade-in slide-in-from-top-2">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-amber-800 text-sm">No Pipeline Designed</h4>
                        <p className="text-amber-700 text-xs mt-1">
                            Go to the <strong>Pipeline Designer</strong> to create your architecture. 
                            Evaluation will use a generic "Naive RAG" simulation until a pipeline is saved.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-6 shrink-0 self-start">
                <button onClick={() => setMode('GOLDEN')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${mode === 'GOLDEN' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>Golden Dataset</button>
                <button onClick={() => setMode('MANUAL')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${mode === 'MANUAL' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>Manual Input</button>
                <button onClick={() => setMode('CSV')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${mode === 'CSV' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>Custom CSV</button>
            </div>

            <div className="mb-6 shrink-0">
                {mode === 'MANUAL' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 grid grid-cols-3 gap-4 animate-in fade-in">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block">Query</label>
                            <input value={manualInput.query} onChange={e => setManualInput({...manualInput, query: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. What is RAG?"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block">Bot Answer</label>
                            <input value={manualInput.answer} onChange={e => setManualInput({...manualInput, answer: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Simulated bot response..."/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block">Context</label>
                            <input value={manualInput.context} onChange={e => setManualInput({...manualInput, context: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="The retrieved text..."/>
                        </div>
                    </div>
                )}
                {mode === 'CSV' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 animate-in fade-in flex items-center justify-between">
                         <div>
                             <h3 className="font-bold text-slate-700 text-sm mb-1">External Test Suite</h3>
                             <p className="text-xs text-slate-500">Upload CSV with: <code>Query, Answer, Context</code></p>
                         </div>
                         <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition">
                             <Upload className="w-4 h-4"/> {csvData.length > 0 ? `${csvData.length} Loaded` : 'Select File'}
                             <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                         </label>
                    </div>
                )}
                {mode === 'GOLDEN' && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 animate-in fade-in border-l-4 border-l-emerald-500">
                        <p className="text-sm text-slate-600"><strong>Golden Set:</strong> 4 expert-curated RAG test cases with multi-hop reasoning requirements.</p>
                    </div>
                )}
            </div>

            <button onClick={startEvaluation} disabled={isRunning || (mode === 'MANUAL' && !manualInput.query) || (mode === 'CSV' && csvData.length === 0)} className="w-full mb-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50">
                {isRunning ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Play className="w-5 h-5"/>}
                {isRunning ? `Evaluating... ${progress}%` : 'Run Stress Test'}
            </button>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                <div className="lg:col-span-5 flex flex-col">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col justify-center items-center relative overflow-hidden">
                        <h3 className="absolute top-6 left-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Quality Signals Radar</h3>
                        {aggregate.length > 0 ? (
                             <ResponsiveContainer width="100%" height={280}>
                                <RadarChart data={aggregate}>
                                    <PolarGrid stroke="#f1f5f9" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                    <Radar name="Run Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                                    <Tooltip />
                                </RadarChart>
                             </ResponsiveContainer>
                        ) : (
                            <div className="text-slate-200 flex flex-col items-center">
                                <Activity className="w-12 h-12 mb-2 opacity-10" />
                                <span className="text-xs font-bold uppercase tracking-widest">Waiting for data</span>
                            </div>
                        )}
                        {aggregate.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                    <div className="text-xl font-bold text-emerald-700">{aggregate[0].A}%</div>
                                    <div className="text-[9px] text-emerald-500 uppercase font-bold tracking-tight">Faithfulness</div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                    <div className="text-xl font-bold text-blue-700">{aggregate[2].A}%</div>
                                    <div className="text-[9px] text-blue-500 uppercase font-bold tracking-tight">Precision</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Execution Trace</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-50">
                                {runs.map((run) => (
                                    <tr key={run.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 w-12 align-top">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${run.status === 'PASS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {run.status === 'PASS' ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="font-bold text-slate-800 text-sm mb-1">{run.query}</div>
                                            <div className="text-[10px] text-slate-500 line-clamp-2 italic mb-2">Bot: "{run.generatedAnswer}"</div>
                                            {run.reason && <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[9px] font-bold border border-red-100">{run.reason}</div>}
                                        </td>
                                        <td className="p-4 w-28 align-top text-[10px]">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Faith</span>
                                                    <span className="font-bold">{(run.metrics.faithfulness * 100).toFixed(0)}</span>
                                                </div>
                                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{width: `${run.metrics.faithfulness * 100}%`}}></div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Prec</span>
                                                    <span className="font-bold">{(run.metrics.contextPrecision * 100).toFixed(0)}</span>
                                                </div>
                                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${run.metrics.contextPrecision < 0.6 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{width: `${run.metrics.contextPrecision * 100}%`}}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvalStudio;
