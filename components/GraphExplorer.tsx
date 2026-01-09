
import React, { useState } from 'react';
import { GitMerge, Database, Search, Plus } from './Icons';

const ENTITIES = [
    { id: '1', label: 'Late Chunking', type: 'Technology', color: 'bg-indigo-500' },
    { id: '2', label: 'Context Preservation', type: 'Benefit', color: 'bg-emerald-500' },
    { id: '3', label: 'Transformer Model', type: 'Prerequisite', color: 'bg-blue-500' },
    { id: '4', label: 'Vector Store', type: 'Storage', color: 'bg-amber-500' },
    { id: '5', label: 'Hybrid Retrieval', type: 'Strategy', color: 'bg-purple-500' }
];

const RELATIONS = [
    { from: '1', to: '2', label: 'Ensures' },
    { from: '1', to: '3', label: 'Uses' },
    { from: '1', to: '4', label: 'Stored in' },
    { from: '5', to: '4', label: 'Queries' }
];

const GraphExplorer: React.FC = () => {
    const [selectedEntity, setSelectedEntity] = useState<any>(ENTITIES[0]);

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
            <header className="mb-6 shrink-0">
                <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <GitMerge className="text-indigo-600" /> Knowledge Graph Explorer
                </h2>
                <p className="text-slate-500">Visualizza le relazioni semantiche tra entità estratte dai documenti.</p>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                {/* Sidebar Entità */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 overflow-y-auto shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Entità Estratte</h3>
                    {ENTITIES.map(entity => (
                        <button 
                            key={entity.id}
                            onClick={() => setSelectedEntity(entity)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                                selectedEntity?.id === entity.id 
                                ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                                : 'border-slate-100 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${entity.color}`}></div>
                                <span className="text-xs font-bold text-slate-500 uppercase">{entity.type}</span>
                            </div>
                            <div className="font-bold text-slate-800 text-sm">{entity.label}</div>
                        </button>
                    ))}
                </div>

                {/* Area Visualizzazione Grafo (Simulata) */}
                <div className="lg:col-span-3 bg-slate-950 rounded-2xl relative overflow-hidden flex items-center justify-center p-8 border border-slate-800">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Nodo Centrale */}
                        <div className="relative z-10 p-6 bg-indigo-600 text-white rounded-2xl shadow-[0_0_50px_rgba(79,70,229,0.4)] text-center animate-in zoom-in-50 duration-500">
                            <h4 className="text-xl font-black mb-1">{selectedEntity.label}</h4>
                            <span className="text-[10px] uppercase font-bold text-indigo-200">{selectedEntity.type}</span>
                        </div>

                        {/* Relazioni Simulate come nodi satellite */}
                        {RELATIONS.filter(r => r.from === selectedEntity.id || r.to === selectedEntity.id).map((rel, idx) => {
                            const otherId = rel.from === selectedEntity.id ? rel.to : rel.from;
                            const other = ENTITIES.find(e => e.id === otherId);
                            const angle = (idx * 120) * (Math.PI / 180);
                            const radius = 180;
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;

                            return (
                                <React.Fragment key={idx}>
                                    {/* Linea di collegamento */}
                                    <div 
                                        className="absolute h-0.5 bg-gradient-to-r from-indigo-500 to-slate-700 origin-left"
                                        style={{ 
                                            width: `${radius}px`, 
                                            transform: `rotate(${idx * 120}deg)`,
                                            top: '50%',
                                            left: '50%'
                                        }}
                                    >
                                        <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 bg-slate-800 text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700">
                                            {rel.label}
                                        </div>
                                    </div>
                                    {/* Nodo Satellite */}
                                    <div 
                                        className="absolute p-4 bg-slate-900 border border-slate-700 rounded-xl text-white shadow-xl animate-in fade-in slide-in-from-center duration-700"
                                        style={{ 
                                            transform: `translate(${x}px, ${y}px)`
                                        }}
                                    >
                                        <div className="font-bold text-xs">{other?.label}</div>
                                        <div className="text-[9px] text-slate-500">{other?.type}</div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Legenda Infografica */}
                    <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-800 flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Technology</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Benefit</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraphExplorer;