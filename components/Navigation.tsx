
import React from 'react';
import { AppView } from '../types';
import { 
  LayoutDashboard, Network, ShieldAlert, ListTodo, MessageSquareText, 
  Bot, Settings, MagicWand, Scissors, Layers, Activity, Zap, 
  GitMerge, Binary, Search 
} from './Icons';
import { APP_VERSION } from '../constants';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenSettings: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, onOpenSettings }) => {
  const navItems = [
    { view: AppView.DASHBOARD, label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { view: AppView.WIZARD, label: 'RAG Wizard', icon: <MagicWand className="w-4 h-4" /> },
    { view: AppView.DESIGNER, label: 'Pipeline Designer', icon: <Network className="w-4 h-4" /> },
    { view: AppView.CHUNKING, label: 'Chunking Lab', icon: <Scissors className="w-4 h-4" /> },
    { view: AppView.ROUTING, label: 'Adaptive Routing', icon: <Zap className="w-4 h-4" /> },
    { view: AppView.GRAPH, label: 'Graph Explorer', icon: <GitMerge className="w-4 h-4" /> },
    { view: AppView.RERANK, label: 'Fusion & Rerank', icon: <Layers className="w-4 h-4" /> },
    { view: AppView.EVAL, label: 'Eval Studio', icon: <Activity className="w-4 h-4" /> },
    { view: AppView.ROI, label: 'Cost ROI', icon: <Activity className="w-4 h-4" /> },
    { view: AppView.DEBUGGER, label: 'Self-RAG Debug', icon: <Bot className="w-4 h-4" /> },
    { view: AppView.SANDBOX, label: 'Security Sandbox', icon: <ShieldAlert className="w-4 h-4" /> },
    { view: AppView.CHECKLIST, label: 'Checklist', icon: <ListTodo className="w-4 h-4" /> },
    { view: AppView.CONSULTANT, label: 'Ask Expert', icon: <MessageSquareText className="w-4 h-4" /> },
  ];

  return (
    <div className="w-60 bg-slate-900 text-slate-300 flex flex-col h-full shadow-xl shrink-0">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3 text-white">
          <Bot className="w-6 h-6 text-indigo-400" />
          <h1 className="font-bold text-sm leading-tight">RAG Architect<br /><span className="text-indigo-400 font-light text-xs">Pro 2026</span></h1>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              currentView === item.view
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium text-[13px]">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-800">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-slate-400 group"
        >
           <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
           <span className="font-medium text-[13px]">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Navigation;
