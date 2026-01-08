
import React, { useState } from 'react';
import { ListTodo, ChevronDown, ChevronUp } from './Icons';
import { ChecklistItem } from '../types';
import { INITIAL_CHECKLIST } from '../constants';

const Checklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <ListTodo className="text-indigo-600" /> Production Readiness Checklist
        </h2>
        <p className="text-slate-500">Track your progress from prototype to production based on the 2026 Roadmap.</p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div className="flex justify-between items-end mb-4">
            <div>
                <span className="text-5xl font-bold text-indigo-600">{progress}%</span>
                <span className="text-slate-500 ml-2">Production Ready</span>
            </div>
            <div className="text-sm text-slate-400">
                {completedCount} / {items.length} Tasks
            </div>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Group by Phase */}
        {Array.from(new Set(items.map(i => i.phase))).map(phase => (
            <div key={phase} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-700 text-sm uppercase tracking-wide flex justify-between items-center">
                    {phase}
                    <div className="text-xs font-normal text-slate-400 normal-case">
                        {items.filter(i => i.phase === phase && i.completed).length}/{items.filter(i => i.phase === phase).length} done
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {items.filter(i => i.phase === phase).map(item => (
                        <div key={item.id} className={`group transition-colors ${expandedItems.has(item.id) ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}>
                            <div className="p-4 px-6 flex items-start gap-4">
                                <div className="pt-1">
                                    <input 
                                    type="checkbox" 
                                    checked={item.completed}
                                    onChange={() => toggleItem(item.id)}
                                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(item.id)}>
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-medium text-base transition-all ${item.completed ? 'text-slate-400 line-through decoration-2 decoration-slate-300' : 'text-slate-800'}`}>
                                            {item.title}
                                        </h4>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded">
                                                {item.week}
                                            </span>
                                            {expandedItems.has(item.id) ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                                </div>
                            </div>
                            
                            {/* Detailed Steps Expansion */}
                            {expandedItems.has(item.id) && item.steps && (
                                <div className="px-6 pb-6 pt-0 ml-9 border-l-2 border-indigo-100 mb-2">
                                    <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-600 space-y-2">
                                        <h5 className="font-bold text-indigo-900 text-xs uppercase mb-2">Implementation Steps:</h5>
                                        <ul className="space-y-2">
                                            {item.steps.map((step, idx) => (
                                                <li key={idx} className="flex gap-2 items-start">
                                                    <span className="text-indigo-400 font-bold">•</span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Checklist;
