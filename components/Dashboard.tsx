
import React from 'react';
import { AppView } from '../types';
import { Network, ShieldAlert, MessageSquareText, Scissors, Layers, Activity, GitMerge, Zap, Bot, Search, FileText } from './Icons';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const ConceptTag = ({ label }: { label: string }) => (
  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-full border border-indigo-100 tracking-widest">
    {label}
  </span>
);

const ActionCard = ({ title, desc, icon, onClick, colorClass, tech }: any) => (
  <button 
    onClick={onClick}
    className="group relative overflow-hidden bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-left w-full h-full flex flex-col"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 ${colorClass} opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700`}></div>
    <div className="mb-6 p-4 bg-slate-50 rounded-2xl w-fit group-hover:bg-white group-hover:shadow-xl group-hover:scale-110 transition-all duration-500">
        {icon}
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">{desc}</p>
    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tech}</span>
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-xl">
            <Zap className="w-4 h-4 fill-white" />
        </div>
    </div>
  </button>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="p-10 max-w-7xl mx-auto h-full overflow-y-auto pb-32">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
             <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
             <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Enterprise RAG Stack</span>
        </div>
        <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight italic">
            Architect <span className="text-indigo-600">Pro</span> 2026
        </h2>
        <p className="text-slate-500 text-xl font-medium max-w-2xl leading-relaxed">
            Strumenti di progettazione e Red Teaming per la nuova generazione di sistemi RAG basati su <span className="text-slate-900 font-bold underline decoration-indigo-500 decoration-2">Inference Cloud</span> e <span className="text-slate-900 font-bold underline decoration-indigo-500 decoration-2">Local LLM</span>.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <ActionCard 
          title="Pipeline Designer"
          desc="Crea il flusso di dati dalla guardrail iniziale alla generazione finale con calcolo automatico di latenza."
          icon={<Network className="w-7 h-7 text-indigo-600" />}
          colorClass="bg-indigo-600"
          tech="React Flow / SVG"
          onClick={() => onNavigate(AppView.DESIGNER)}
        />
        <ActionCard 
          title="RRF Fusion Studio"
          desc="Sperimenta la fusione dei ranking tra ricerca semantica e testuale (Hybrid Search) con calcoli RRF dettagliati."
          icon={<Layers className="w-7 h-7 text-purple-600" />}
          colorClass="bg-purple-600"
          tech="BM25 + RRF Algorithm"
          onClick={() => onNavigate(AppView.RERANK)}
        />
        <ActionCard 
          title="Chunking Lab"
          desc="Confronta Naive vs Late Chunking per vedere come preservare il contesto semantico attraverso i Transformer."
          icon={<Scissors className="w-7 h-7 text-pink-600" />}
          colorClass="bg-pink-600"
          tech="Transformer Pooling"
          onClick={() => onNavigate(AppView.CHUNKING)}
        />
        <ActionCard 
          title="Adaptive Routing"
          desc="Testa gateway decisionali che instradano le query verso Vector Store, Graph DB o risposte immediate."
          icon={<Zap className="w-7 h-7 text-amber-600" />}
          colorClass="bg-amber-600"
          tech="Semantic Router / BERT"
          onClick={() => onNavigate(AppView.ROUTING)}
        />
        <ActionCard 
          title="Security Sandbox"
          desc="Stress-test della pipeline contro attacchi di Prompt Injection, Jailbreak e recupero di dati sensibili (PII)."
          icon={<ShieldAlert className="w-7 h-7 text-rose-600" />}
          colorClass="bg-rose-600"
          tech="Red Teaming Audit"
          onClick={() => onNavigate(AppView.SANDBOX)}
        />
        <ActionCard 
          title="Eval Studio"
          desc="Analisi automatizzata della qualità (Faithfulness, Relevance) basata sul framework RAGAS simulato."
          icon={<Activity className="w-7 h-7 text-emerald-600" />}
          colorClass="bg-emerald-600"
          tech="RAGAS Framework"
          onClick={() => onNavigate(AppView.EVAL)}
        />
      </div>

      <section className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 opacity-20 blur-[100px] -mr-48 -mt-48 animate-pulse"></div>
        <h3 className="text-2xl font-black mb-10 flex items-center gap-4 relative z-10 italic">
          <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
          2026 Core Pillars
        </h3>
        <div className="flex flex-wrap gap-4 relative z-10">
          {[
            "Late Chunking", "Adaptive Routing", "Self-Reflection", 
            "GraphRAG", "Confidence Signals", "Semantic Caching", 
            "Red Teaming", "Hybrid Retrieval", "Cross-Encoder Rerank"
          ].map((tag) => <ConceptTag key={tag} label={tag} />)}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
