
import React from 'react';
import { AppView } from '../types';
import { Network, ShieldAlert, MessageSquareText, Scissors, Layers } from './Icons';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const ConceptTag = ({ label }: { label: string }) => (
  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full border border-indigo-100">
    {label}
  </span>
);

const ActionCard = ({ title, desc, icon, onClick, colorClass }: any) => (
  <button 
    onClick={onClick}
    className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full h-full flex flex-col"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`}></div>
    <div className="mb-4 p-3 bg-slate-50 rounded-lg w-fit group-hover:bg-white group-hover:shadow-sm transition-colors">
        {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </button>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-20">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome to RAG Architect Pro</h2>
        <p className="text-slate-500 text-lg">Design, audit, and optimize production-ready retrieval systems.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <ActionCard 
          title="Pipeline Architect"
          desc="Design visual RAG workflows. Estimate latency and costs."
          icon={<Network className="w-6 h-6 text-blue-600" />}
          colorClass="bg-blue-600"
          onClick={() => onNavigate(AppView.DESIGNER)}
        />
        <ActionCard 
          title="Chunking Lab"
          desc="Visualize how Late Chunking preserves context vs Naive splitting."
          icon={<Scissors className="w-6 h-6 text-pink-600" />}
          colorClass="bg-pink-600"
          onClick={() => onNavigate(AppView.CHUNKING)}
        />
        <ActionCard 
          title="Fusion & Rerank"
          desc="Simulate Hybrid Search (BM25 + Vector) and Reciprocal Rank Fusion."
          icon={<Layers className="w-6 h-6 text-purple-600" />}
          colorClass="bg-purple-600"
          onClick={() => onNavigate(AppView.RERANK)}
        />
        <ActionCard 
          title="Security Sandbox"
          desc="Test your system against Prompt Injection attacks."
          icon={<ShieldAlert className="w-6 h-6 text-red-600" />}
          colorClass="bg-red-600"
          onClick={() => onNavigate(AppView.SANDBOX)}
        />
        <ActionCard 
          title="Expert Consultant"
          desc="Chat with an AI trained on the '2026 Complete Guide'."
          icon={<MessageSquareText className="w-6 h-6 text-emerald-600" />}
          colorClass="bg-emerald-600"
          onClick={() => onNavigate(AppView.CONSULTANT)}
        />
      </div>

      <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
          Core Concepts (v2026)
        </h3>
        <div className="flex flex-wrap gap-3">
          <ConceptTag label="Late Chunking" />
          <ConceptTag label="ColBERTv2 Interaction" />
          <ConceptTag label="Self-RAG" />
          <ConceptTag label="Adaptive Routing" />
          <ConceptTag label="Retrieval Gating" />
          <ConceptTag label="Knowledge Graph Expansion" />
          <ConceptTag label="Confidence Abstention" />
          <ConceptTag label="Code-Data Separation" />
          <ConceptTag label="Indirect Prompt Injection" />
          <ConceptTag label="Reciprocal Rank Fusion" />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
