
import React, { useState } from 'react';
import { MagicWand, Network, Zap, ShieldAlert, ChevronDown, Check } from './Icons';

interface RecommendationResult {
  title: string;
  description: string;
  architecture: string[];
}

const RESULTS: Record<string, RecommendationResult> = {
  NAIVE: {
    title: "Naive RAG (Efficiency First)",
    description: "Best for simple queries on small datasets where latency and cost are priority.",
    architecture: ["BM25 Only", "Gemini 3 Flash"]
  },
  HYBRID: {
    title: "Hybrid RAG + Rerank",
    description: "The standard for production. Combines keyword and semantic search with a reranker for high accuracy.",
    architecture: ["Hybrid Retrieval", "Cross-Encoder (Jina)", "Gemini 3 Flash"]
  },
  AGENTIC: {
    title: "Agentic RAG (Reasoning Heavy)",
    description: "For complex, multi-hop queries requiring reasoning. Uses expensive models and multiple retrieval steps.",
    architecture: ["Hybrid Retrieval", "Cross-Encoder", "Gemini 3 Pro", "Self-RAG Critic"]
  }
};

const QUESTIONS = [
  {
    id: 1,
    text: "How much data are you processing?",
    answers: [
      { label: "< 1,000 Documents", type: "NAIVE" },
      { label: "1k - 1M Documents", type: "HYBRID" },
      { label: "> 1M Documents (Enterprise)", type: "AGENTIC" }
    ]
  },
  {
    id: 2,
    text: "What is your latency budget?",
    answers: [
      { label: "Ultra Low (< 200ms)", type: "NAIVE" },
      { label: "Standard (< 800ms)", type: "HYBRID" },
      { label: "No Limit (Reasoning Heavy)", type: "AGENTIC" }
    ]
  },
  {
    id: 3,
    text: "How complex are the user queries?",
    answers: [
      { label: "Keyword lookup (Factoid)", type: "NAIVE" },
      { label: "Semantic search (Concepts)", type: "HYBRID" },
      { label: "Multi-hop / Comparative", type: "AGENTIC" }
    ]
  },
  {
    id: 4,
    text: "What type of documents do you have?",
    answers: [
      { label: "Clean Text / Markdown", type: "NAIVE" },
      { label: "PDFs, Office Docs & Long-Context", type: "HYBRID" },
      { label: "Scanned Images / Tabular Data (CSV) / Codebases", type: "AGENTIC" }
    ]
  }
];

const RecommendationWizard = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ NAIVE: 0, HYBRID: 0, AGENTIC: 0 });
  const [finalResult, setFinalResult] = useState<RecommendationResult | null>(null);

  const handleAnswer = (type: string) => {
    const newScores = { ...scores, [type]: scores[type] + 1 };
    setScores(newScores);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate winner
      const winner = Object.keys(newScores).reduce((a, b) => newScores[a] > newScores[b] ? a : b);
      setFinalResult(RESULTS[winner]);
    }
  };

  if (finalResult) {
    return (
      <div className="p-8 max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 p-8 text-center">
            <MagicWand className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Recommended Architecture</h2>
            <div className="text-indigo-100 font-medium tracking-wider uppercase text-sm">
              Based on your requirements
            </div>
          </div>
          
          <div className="p-8 text-center">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">{finalResult.title}</h3>
            <p className="text-slate-600 mb-8 text-lg">{finalResult.description}</p>
            
            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Suggested Components</h4>
              <div className="flex flex-wrap justify-center gap-3">
                {finalResult.architecture.map((tech, i) => (
                  <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm font-medium text-slate-700 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> {tech}
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={onComplete}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-transform active:scale-95"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = QUESTIONS[step];

  return (
    <div className="p-8 max-w-xl mx-auto h-full flex flex-col justify-center">
      <div className="mb-8 text-center">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step {step + 1} of {QUESTIONS.length}</span>
        <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-500" 
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center leading-tight">
        {currentQ.text}
      </h2>

      <div className="space-y-4">
        {currentQ.answers.map((ans, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(ans.type)}
            className="w-full p-6 text-left bg-white border-2 border-slate-200 hover:border-indigo-500 hover:shadow-md rounded-xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-slate-700 group-hover:text-indigo-700">{ans.label}</span>
              <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 -rotate-90" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendationWizard;
