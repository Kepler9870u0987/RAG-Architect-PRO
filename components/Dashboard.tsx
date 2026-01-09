
import React from 'react';
import { AppView } from '../types';
import { Network, ShieldAlert, MessageSquareText, Scissors, Layers, Activity, GitMerge, Zap, Bot } from './Icons';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const ConceptTag = ({ label }: { label: string }) => (
  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-full border border-indigo-100 tracking-wider">
    {label}
  </span>
);

const ActionCard = ({ title, desc, icon, onClick, colorClass }: any) => (
  <button 
    onClick={onClick}
    className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full h-full flex flex-col"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`}></div>
    <div className="mb-4 p-3 bg-slate-50 rounded-xl w-fit group-hover:bg-white group-hover:shadow-sm transition-colors">
        {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
  </button>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-20">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-2">RAG Architect Pro <span className="text-indigo-600">2026</span></h2>
        <p className="text-slate-500 text-lg font-medium">L'ecosistema completo per la progettazione e il Red Teaming di sistemi RAG enterprise.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <ActionCard 
          title="Adaptive Routing"
          desc="Testa il gateway decisionale tra No-Retrieval, Vector e Graph."
          icon={<Zap className="w-6 h-6 text-amber-600" />}
          colorClass="bg-amber-600"
          onClick={() => onNavigate(AppView.ROUTING)}
        />
        <ActionCard 
          title="Graph Explorer"
          desc="Naviga tra entità e relazioni per query multi-hop."
          icon={<GitMerge className="w-6 h-6 text-indigo-600" />}
          colorClass="bg-indigo-600"
          onClick={() => onNavigate(AppView.GRAPH)}
        />
        <ActionCard 
          title="Self-RAG Debug"
          desc="Analizza i reflection tokens e il controllo delle allucinazioni."
          icon={<Bot className="w-6 h-6 text-purple-600" />}
          colorClass="bg-purple-600"
          onClick={() => onNavigate(AppView.DEBUGGER)}
        />
        <ActionCard 
          title="Cost ROI"
          desc="Analisi economica e risparmio operativo della pipeline."
          icon={<Activity className="w-6 h-6 text-emerald-600" />}
          colorClass="bg-emerald-600"
          onClick={() => onNavigate(AppView.ROI)}
        />
        <ActionCard 
          title="Security Sandbox"
          desc="Stress-test contro Prompt Injection e Jailbreak."
          icon={<ShieldAlert className="w-6 h-6 text-red-600" />}
          colorClass="bg-red-600"
          onClick={() => onNavigate(AppView.SANDBOX)}
        />
        <ActionCard 
          title="Expert Consultant"
          desc="Chatta con l'esperto sulle linee guida 2026."
          icon={<MessageSquareText className="w-6 h-6 text-blue-600" />}
          colorClass="bg-blue-600"
          onClick={() => onNavigate(AppView.CONSULTANT)}
        />
      </div>

      <section className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-20 blur-3xl -mr-32 -mt-32"></div>
        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 relative z-10">
          <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
          Core Principles 2026
        </h3>
        <div className="flex flex-wrap gap-3 relative z-10">
          <ConceptTag label="Late Chunking" />
          <ConceptTag label="Adaptive Routing" />
          <ConceptTag label="Self-Reflection" />
          <ConceptTag label="GraphRAG" />
          <ConceptTag label="Confidence Signals" />
          <ConceptTag label="Semantic Caching" />
          <ConceptTag label="Red Teaming" />
          <ConceptTag label="Hybrid Retrieval" />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
