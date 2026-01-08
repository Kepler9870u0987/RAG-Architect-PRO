
import React, { useState } from 'react';
import { MagicWand, Network, Zap, ShieldAlert, ChevronDown, Check, FileText } from './Icons';

interface RecommendationResult {
  title: string;
  description: string;
  architecture: string[];
}

const RESULTS: Record<string, RecommendationResult> = {
  NAIVE: {
    title: "Naive RAG (Efficiency First)",
    description: "Best for simple text queries on small datasets where latency and cost are priority.",
    architecture: ["BM25 Only", "Gemini 3 Flash", "Simple Chunking"]
  },
  HYBRID: {
    title: "Hybrid RAG + Rerank",
    description: "The standard for production text. Combines keyword and semantic search with a reranker.",
    architecture: ["Hybrid Retrieval (BM25+Vector)", "Cross-Encoder (Jina/BGE)", "Gemini 3 Flash"]
  },
  AGENTIC: {
    title: "Agentic RAG (Reasoning Heavy)",
    description: "For complex, multi-hop queries requiring reasoning steps or tool use.",
    architecture: ["Hybrid Retrieval", "Cross-Encoder", "Gemini 3 Pro", "Self-RAG Critic"]
  },
  MULTIMODAL: {
    title: "Multimodal RAG",
    description: "Optimized for processing mixed content including Images, PDFs with Charts, and Text.",
    architecture: ["ColPali (Vision Encoder)", "Vector Store (Images)", "Gemini 3 Pro Vision"]
  },
  GRAPHRAG: {
    title: "GraphRAG (Structured)",
    description: "Best for connecting entities across documents or understanding codebases/structured data.",
    architecture: ["Knowledge Graph (Neo4j)", "Vector Search", "Graph Traversal", "Gemini 3 Pro"]
  }
};

const QUESTIONS = [
  {
    id: 1,
    text: "What is the primary format of your data?",
    answers: [
      { label: "Clean Text / Markdown", type: "NAIVE" },
      { label: "PDFs, Office Docs (Text Heavy)", type: "HYBRID" },
      { label: "Scanned Docs, Charts, Images", type: "MULTIMODAL" },
      { label: "Codebases, CSVs, Relational Data", type: "GRAPHRAG" }
    ]
  },
  {
    id: 2,
    text: "How complex are the user queries?",
    answers: [
      { label: "Keyword lookup (Factoid)", type: "NAIVE" },
      { label: "Semantic search (Concepts)", type: "HYBRID" },
      { label: "Multi-hop / Comparative reasoning", type: "AGENTIC" },
      { label: "Visual questions ('What is in this chart?')", type: "MULTIMODAL" }
    ]
  },
  {
    id: 3,
    text: "How much data are you processing?",
    answers: [
      { label: "< 1,000 Documents", type: "NAIVE" },
      { label: "1k - 1M Documents", type: "HYBRID" },
      { label: "> 1M Documents (Enterprise)", type: "AGENTIC" }
    ]
  },
  {
    id: 4,
    text: "What is your latency budget?",
    answers: [
      { label: "Ultra Low (< 200ms)", type: "NAIVE" },
      { label: "Standard (< 800ms)", type: "HYBRID" },
      { label: "No Limit (Reasoning/Accuracy First)", type: "AGENTIC" }
    ]
  },
  {
    id: 5,
    text: "Does the domain require strict entity relationships?",
    answers: [
      { label: "No, general information", type: "NAIVE" },
      { label: "Somewhat, standard context", type: "HYBRID" },
      { label: "Yes (e.g. Fraud detection, Legal, Code)", type: "GRAPHRAG" }
    ]
  }
];

const RecommendationWizard = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ NAIVE: 0, HYBRID: 0, AGENTIC: 0, MULTIMODAL: 0, GRAPHRAG: 0 });
  const [finalResult, setFinalResult] = useState<RecommendationResult | null>(null);

  const handleAnswer = (type: string) => {
    // Weighted scoring
    const newScores = { ...scores, [type]: (scores[type] || 0) + 1 };
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
      <div className="p-8 max-w-2xl mx-auto animate-in zoom-in-95 duration-300 h-full flex items-center">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden w-full">
          <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-10 -translate-y-10"></div>
                 <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-10 translate-y-10"></div>
            </div>
            <MagicWand className="w-16 h-16 text-white mx-auto mb-4 relative z-10" />
            <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Recommended Architecture</h2>
            <div className="text-indigo-100 font-medium tracking-wider uppercase text-sm relative z-10">
              Based on your requirements
            </div>
          </div>
          
          <div className="p-8 text-center">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">{finalResult.title}</h3>
            <p className="text-slate-600 mb-8 text-lg leading-relaxed max-w-lg mx-auto">{finalResult.description}</p>
            
            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200 text-left max-w-md mx-auto">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Suggested Stack</h4>
              <div className="flex flex-col gap-2">
                {finalResult.architecture.map((tech, i) => (
                  <div key={i} className="px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm font-medium text-slate-700 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                         <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    {tech}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={onComplete}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-transform active:scale-95 w-full max-w-md"
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
            className="bg-indigo-600 h-full transition-all duration-500 ease-out" 
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
            className="w-full p-5 text-left bg-white border-2 border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:-translate-y-0.5 rounded-xl transition-all group duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-500"/>
                   </div>
                   <span className="font-bold text-lg text-slate-700 group-hover:text-indigo-700">{ans.label}</span>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 -rotate-90 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendationWizard;
