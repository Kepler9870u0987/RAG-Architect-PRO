
import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, Network, ShieldAlert, ListTodo, MessageSquareText, Bot, Settings, MagicWand, Scissors, Layers, Activity } from './Icons';
import { APP_VERSION } from '../constants';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenSettings: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, onOpenSettings }) => {
  const navItems = [
    { view: AppView.DASHBOARD, label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { view: AppView.WIZARD, label: 'RAG Wizard', icon: <MagicWand className="w-5 h-5" /> },
    { view: AppView.DESIGNER, label: 'Pipeline Designer', icon: <Network className="w-5 h-5" /> },
    { view: AppView.CHUNKING, label: 'Chunking Lab', icon: <Scissors className="w-5 h-5" /> },
    { view: AppView.RERANK, label: 'Fusion & Rerank', icon: <Layers className="w-5 h-5" /> },
    { view: AppView.EVAL, label: 'Eval Studio', icon: <Activity className="w-5 h-5" /> },
    { view: AppView.SANDBOX, label: 'Security Sandbox', icon: <ShieldAlert className="w-5 h-5" /> },
    { view: AppView.CHECKLIST, label: 'Prod Checklist', icon: <ListTodo className="w-5 h-5" /> },
    { view: AppView.CONSULTANT, label: 'Ask Expert', icon: <MessageSquareText className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 text-white mb-1">
          <Bot className="w-8 h-8 text-indigo-400" />
          <h1 className="font-bold text-lg leading-tight">RAG Architect<br /><span className="text-indigo-400 font-light">Pro 2026</span></h1>
        </div>
        <div className="text-xs text-slate-500 mt-2 font-mono">Build: {APP_VERSION}</div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === item.view
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-slate-400 mb-2 group"
        >
           <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
           <span className="font-medium">AI Configuration</span>
        </button>

        <div className="bg-slate-800/50 rounded p-3 text-xs text-slate-400">
          <p className="font-bold text-slate-300 mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Online
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
