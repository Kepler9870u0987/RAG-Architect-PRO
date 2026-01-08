
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

// Reusing CSV Parser logic from SecuritySandbox
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
    
    // Pipeline Check
    const [hasPipeline, setHasPipeline] = useState(false);

    // Modes: 'GOLDEN', 'MANUAL', 'CSV'
    const [mode, setMode] = useState<'GOLDEN' | 'MANUAL' | 'CSV'>('GOLDEN');

    // Manual Input State
    const [manualInput, setManualInput] = useState({ query: '', context: '', answer: '' });

    // CSV State
    const [csvData, setCsvData] = useState<any[]>([]); // parsed objects
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Check if pipeline exists in local storage (set by PipelineDesigner)
        const savedPipeline = localStorage.getItem('active_pipeline');
        if (savedPipeline) {
            try {
                const parsed = JSON.parse(savedPipeline);
                if (parsed.nodes && parsed.nodes.length > 0) {
                    setHasPipeline(true);
                }
            } catch (e) { console.error("Error parsing pipeline", e); }
        }
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
            // Simulate RAGAS Scores
            const faithfulness = Math.random() * 0.3 + 0.7; 
            const answerRelevance = Math.random() * 0.4 + 0.6; 
            const contextPrecision = Math.random() * 0.4 + 0.6; 
            
            // Artificial logic: If context is missing/empty, precision drops
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

        }, 500); // Faster simulation
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
        const avgRecall = avgPrec * 0.9; 

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
            // Basic heuristic mapping: 1st col=query, 2nd=answer, 3rd=context
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
                        <Activity className="text-emerald-600" /> Evaluation Studio (RAGAS)
                    </h2>
                    <p className="text-slate-500">Benchmark your pipeline using LLM-as-a-Judge metrics.</p>
                </div>
            </header>

            {!hasPipeline && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3 shrink-0">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-amber-800 text-sm">No Active Pipeline Detected</h4>
                        <p className="text-amber-700 text-xs mt-1">
                            You haven't designed a pipeline in the <strong>Pipeline Designer</strong> yet. 
                            The Evaluation Studio will simulate results based on a generic architecture. 
                            Go to the Designer to configure your specific nodes for accurate cost/latency tracking during eval.
                        </p>
                    </div>
                </div>
            )}

            {/* Input Mode Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-6 shrink-0 self-start">
                <button 
                  onClick={() => setMode('GOLDEN')} 
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${mode === 'GOLDEN' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Golden Dataset
                </button>
                <button 
                  onClick={() => setMode('MANUAL')} 
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${mode === 'MANUAL' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Manual Input
                </button>
                <button 
                  onClick={() => setMode('CSV')} 
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${mode === 'CSV' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Custom CSV
                </button>
            </div>

            {/* Input Areas */}
            <div className="mb-6 shrink-0">
                {mode === 'MANUAL' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 grid grid-cols-3 gap-4 animate-in fade-in">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Query</label>
                            <input value={manualInput.query} onChange={e => setManualInput({...manualInput, query: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="e.g. What is RAG?"/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Generated Answer</label>
                            <input value={manualInput.answer} onChange={e => setManualInput({...manualInput, answer: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Bot response..."/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Retrieved Context</label>
                            <input value={manualInput.context} onChange={e => setManualInput({...manualInput, context: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Source text..."/>
                        </div>
                    </div>
                )}

                {mode === 'CSV' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 animate-in fade-in flex items-center justify-between">
                         <div>
                             <h3 className="font-bold text-slate-700 text-sm mb-1">Upload Test Dataset</h3>
                             <p className="text-xs text-slate-500">CSV Format: <code>Query, Answer, Context</code></p>
                         </div>
                         <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition">
                             <Upload className="w-4 h-4"/>
                             {csvData.length > 0 ? `${csvData.length} Rows Loaded` : 'Select CSV'}
                             <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                         </label>
                    </div>
                )}
                
                {mode === 'GOLDEN' && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 animate-in fade-in">
                        <p className="text-sm text-slate-600"><span className="font-bold">Golden Dataset Loaded:</span> {GOLDEN_DATASET.length} predefined QA pairs covering general RAG topics.</p>
                    </div>
                )}
            </div>

            {/* Main Action */}
            <div className="mb-6">
                <button 
                    onClick={startEvaluation}
                    disabled={isRunning || (mode === 'MANUAL' && !manualInput.query) || (mode === 'CSV' && csvData.length === 0)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRunning ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Play className="w-5 h-5"/>}
                    {isRunning ? `Evaluating Pipeline... ${progress}%` : 'Run Evaluation'}
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                {/* Left: Metrics Visualization */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col justify-center items-center relative">
                        <h3 className="absolute top-6 left-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Quality Radar</h3>
                        
                        {aggregate.length > 0 ? (
                             <ResponsiveContainer width="100%" height={300}>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={aggregate}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Current Run" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </RadarChart>
                             </ResponsiveContainer>
                        ) : (
                            <div className="text-slate-300 text-center">
                                <Activity className="w-16 h-16 mx-auto mb-2 opacity-20" />
                                <p>Run evaluation to see metrics</p>
                            </div>
                        )}
                        
                        {aggregate.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                    <div className="text-2xl font-bold text-emerald-700">{aggregate[0].A}%</div>
                                    <div className="text-[10px] text-emerald-600 uppercase font-bold">Faithfulness</div>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-700">{aggregate[2].A}%</div>
                                    <div className="text-[10px] text-blue-600 uppercase font-bold">Precision</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Detailed Logs */}
                <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Execution Logs</h3>
                        <span className="text-xs font-mono text-slate-400">{runs.length} Samples</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-0">
                        {runs.length === 0 && (
                             <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                                 <p>No evaluation data.</p>
                             </div>
                        )}
                        <table className="w-full text-sm text-left">
                            <tbody className="divide-y divide-slate-100">
                                {runs.map((run) => (
                                    <tr key={run.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 align-top w-16">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${run.status === 'PASS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {run.status === 'PASS' ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="font-bold text-slate-800 mb-1">{run.query}</div>
                                            <div className="text-xs text-slate-500 mb-2 font-mono bg-slate-100 p-2 rounded border border-slate-200">
                                                Bot: "{run.generatedAnswer}"
                                            </div>
                                            {run.reason && (
                                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                                                    <ShieldAlert className="w-3 h-3"/> {run.reason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top w-32">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-400">Faith</span>
                                                    <span className="font-mono font-bold text-slate-700">{(run.metrics.faithfulness * 100).toFixed(0)}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{width: `${run.metrics.faithfulness * 100}%`}}></div>
                                                </div>

                                                <div className="flex justify-between text-xs mt-2">
                                                    <span className="text-slate-400">Prec</span>
                                                    <span className="font-mono font-bold text-slate-700">{(run.metrics.contextPrecision * 100).toFixed(0)}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className={`h-full ${run.metrics.contextPrecision < 0.5 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${run.metrics.contextPrecision * 100}%`}}></div>
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
