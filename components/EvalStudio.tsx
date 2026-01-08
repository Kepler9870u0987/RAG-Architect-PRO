
import React, { useState, useEffect } from 'react';
import { Activity, Play, RefreshCw, Check, ShieldAlert } from './Icons';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { EvalRun } from '../types';

// Mock Golden Dataset
const GOLDEN_DATASET = [
    { id: '1', query: "What is Late Chunking?", answer: "Late Chunking preserves context by embedding the full text before splitting it.", context: "Late Chunking processes the entire document through the Transformer...", expected: "Embedding full text then splitting." },
    { id: '2', query: "How does Self-RAG work?", answer: "It uses reflection tokens to critique its own retrieval and generation.", context: "Self-RAG introduces reflection tokens like [Retrieval] and [Critique]...", expected: "Uses reflection tokens." },
    { id: '3', query: "What is the capital of Mars?", answer: "I cannot answer that as Mars does not have a capital.", context: "Mars is the fourth planet from the Sun...", expected: "Refusal to answer." },
    { id: '4', query: "Explain BGE-M3 embedding.", answer: "BGE-M3 is a dense model supporting multi-linguality and multi-granularity.", context: "BGE-M3 stands for Multi-Lingual, Multi-Functionality...", expected: "Dense model features." }
];

const EvalStudio: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [runs, setRuns] = useState<EvalRun[]>([]);
    const [aggregate, setAggregate] = useState<{subject: string, A: number, fullMark: number}[]>([]);

    const startEvaluation = () => {
        setIsRunning(true);
        setRuns([]);
        setProgress(0);
        setAggregate([]);

        let completed = 0;
        const total = GOLDEN_DATASET.length;
        const newRuns: EvalRun[] = [];

        const interval = setInterval(() => {
            if (completed >= total) {
                clearInterval(interval);
                setIsRunning(false);
                calculateAggregate(newRuns);
                return;
            }

            const item = GOLDEN_DATASET[completed];
            // Simulate RAGAS Scores with some randomness
            const faithfulness = Math.random() * 0.3 + 0.7; // High
            const answerRelevance = Math.random() * 0.4 + 0.6; 
            const contextPrecision = completed === 2 ? 0.2 : Math.random() * 0.2 + 0.8; // Fail one on purpose

            const run: EvalRun = {
                id: item.id,
                query: item.query,
                retrievedContext: [item.context],
                generatedAnswer: item.answer,
                metrics: { faithfulness, answerRelevance, contextPrecision },
                status: contextPrecision < 0.5 ? 'FAIL' : 'PASS',
                reason: contextPrecision < 0.5 ? 'Low Context Precision (Hallucination Risk)' : undefined
            };

            newRuns.push(run);
            setRuns([...newRuns]);
            completed++;
            setProgress(Math.round((completed / total) * 100));

        }, 800);
    };

    const calculateAggregate = (results: EvalRun[]) => {
        const avgFaith = results.reduce((a, b) => a + b.metrics.faithfulness, 0) / results.length;
        const avgRel = results.reduce((a, b) => a + b.metrics.answerRelevance, 0) / results.length;
        const avgPrec = results.reduce((a, b) => a + b.metrics.contextPrecision, 0) / results.length;
        
        // Context Recall is simulated as average of precision for demo
        const avgRecall = avgPrec * 0.9; 

        setAggregate([
            { subject: 'Faithfulness', A: Math.round(avgFaith * 100), fullMark: 100 },
            { subject: 'Ans Relevance', A: Math.round(avgRel * 100), fullMark: 100 },
            { subject: 'Ctx Precision', A: Math.round(avgPrec * 100), fullMark: 100 },
            { subject: 'Ctx Recall', A: Math.round(avgRecall * 100), fullMark: 100 },
        ]);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full overflow-hidden flex flex-col">
            <header className="mb-8 flex justify-between items-end shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <Activity className="text-emerald-600" /> Evaluation Studio (RAGAS)
                    </h2>
                    <p className="text-slate-500">Benchmark your pipeline using LLM-as-a-Judge metrics.</p>
                </div>
                <button 
                    onClick={startEvaluation}
                    disabled={isRunning}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                    {isRunning ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Play className="w-5 h-5"/>}
                    {isRunning ? `Evaluating... ${progress}%` : 'Run Golden Dataset'}
                </button>
            </header>

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
                        <span className="text-xs font-mono text-slate-400">{runs.length} / {GOLDEN_DATASET.length} Samples</span>
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
