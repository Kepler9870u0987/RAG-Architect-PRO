
import React, { useState, useEffect } from 'react';
import { Scissors, FileText, Braces, Zap, Settings, RefreshCw, Activity, Check } from './Icons';

type ChunkMethod = 'FIXED' | 'SEMANTIC' | 'LATE';

const SAMPLE_TEXT = `Late Chunking is a novel technique that redefines how we process documents for Retrieval-Augmented Generation (RAG). Traditional ("Naive") chunking splits text into arbitrary blocks before embedding, often cutting sentences in half and losing semantic context.

In contrast, Late Chunking processes the entire document through the Transformer model first, generating context-aware token embeddings for every single word. Only after this "global understanding" step do we slice the embeddings into chunks.

This means a chunk containing "it" knows that "it" refers to "Late Chunking" mentioned tre sentences earlier. This interaction mechanism significantly improves retrieval quality for complex queries.`;

const ChunkingLab: React.FC = () => {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [method, setMethod] = useState<ChunkMethod>('LATE');
  const [chunkSize, setChunkSize] = useState(150); 
  const [overlap, setOverlap] = useState(20);
  const [chunks, setChunks] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({ count: 0, avgSize: 0, contextScore: 0 });

  useEffect(() => {
    let result: string[] = [];
    if (method === 'FIXED') {
      for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
        result.push(text.slice(i, i + chunkSize));
      }
    } else if (method === 'SEMANTIC') {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let currentChunk = '';
      sentences.forEach(sent => {
        if ((currentChunk.length + sent.length) > chunkSize) {
          result.push(currentChunk);
          currentChunk = sent;
        } else {
          currentChunk += sent;
        }
      });
      if (currentChunk) result.push(currentChunk);
    } else if (method === 'LATE') {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      result = sentences.map(s => s.trim());
    }
    setChunks(result);
    setMetrics({
        count: result.length,
        avgSize: Math.round(result.reduce((a, b) => a + b.length, 0) / (result.length || 1)),
        contextScore: method === 'LATE' ? 98 : method === 'SEMANTIC' ? 85 : 45
    });
  }, [text, method, chunkSize, overlap]);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-hidden flex flex-col gap-6">
      <header className="flex justify-between items-end shrink-0">
        <div>
           <h2 className="text-3xl font-black text-slate-900 mb-1 flex items-center gap-3 italic">
               <Scissors className="text-pink-600 w-8 h-8" /> Data Ingestion <span className="text-pink-600">Lab</span>
           </h2>
           <p className="text-slate-500 font-medium">Visualizza la superiorità del Late Chunking nella conservazione del contesto globale.</p>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
          <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Lab Configuration
                  </h3>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-tighter">Chunking Algorithm</label>
                          <div className="grid grid-cols-1 gap-2">
                              {[
                                { id: 'FIXED', label: 'Naive (Fixed Size)', desc: 'Taglio rigido a caratteri. Perde contesto.' },
                                { id: 'SEMANTIC', label: 'Sentence)', desc: 'Basato su punteggiatura. Meglio, ma locale.' },
                                { id: 'LATE', label: 'Late (Transformer)', desc: 'Embedding globale poi pooling. Ottimale.' }
                              ].map((m) => (
                                  <button
                                    key={m.id}
                                    onClick={() => setMethod(m.id as ChunkMethod)}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all group ${
                                        method === m.id 
                                        ? 'border-pink-500 bg-pink-50/50' 
                                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                    }`}
                                  >
                                      <div className={`text-xs font-black mb-1 ${method === m.id ? 'text-pink-700' : 'text-slate-700'}`}>{m.label}</div>
                                      <div className="text-[10px] text-slate-500 font-medium">{m.desc}</div>
                                  </button>
                              ))}
                          </div>
                      </div>

                      {method === 'FIXED' && (
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Window Size: {chunkSize}c</label>
                              <input 
                                type="range" min="50" max="500" step="10" 
                                value={chunkSize} onChange={(e) => setChunkSize(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600 mb-6"
                              />
                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Overlap: {overlap}c</label>
                              <input 
                                type="range" min="0" max="100" step="5" 
                                value={overlap} onChange={(e) => setOverlap(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                              />
                          </div>
                      )}
                  </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2rem] text-white shrink-0 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 p-6 opacity-10"><Activity className="w-20 h-20"/></div>
                  <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest mb-4">Perché Late Chunking?</h3>
                  <div className="space-y-4">
                      <div className="flex gap-3">
                          <div className="w-5 h-5 rounded bg-pink-500 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-white"/></div>
                          <p className="text-[10px] text-slate-300 font-medium leading-relaxed">I token hanno già "parlato" con il resto del documento nel Transformer.</p>
                      </div>
                      <div className="flex gap-3">
                          <div className="w-5 h-5 rounded bg-pink-500 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-white"/></div>
                          <p className="text-[10px] text-slate-300 font-medium leading-relaxed">Risoluzione automatica delle anafore (es. "lui", "questo").</p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-0">
               <div className="grid grid-cols-3 gap-6 shrink-0">
                   {[
                       { label: 'Total Chunks', val: metrics.count, icon: <Braces />, color: 'blue' },
                       { label: 'Avg Char Count', val: metrics.avgSize, icon: <FileText />, color: 'indigo' },
                       { label: 'Context Fidelity', val: `${metrics.contextScore}%`, icon: <Zap />, color: 'amber' }
                   ].map((m, i) => (
                       <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                           <div className={`p-4 bg-${m.color}-50 rounded-2xl text-${m.color}-600 shadow-inner`}>
                               {/* FIX: Cast to any to avoid className property missing error on unknown attributes */}
                               {React.cloneElement(m.icon as any, { className: 'w-6 h-6' })}
                           </div>
                           <div>
                               <div className="text-2xl font-black text-slate-900 tracking-tight">{m.val}</div>
                               <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{m.label}</div>
                           </div>
                       </div>
                   ))}
               </div>

               <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 flex-1 overflow-y-auto shadow-2xl relative custom-scrollbar">
                   <div className="sticky top-0 bg-white/90 backdrop-blur-md py-4 mb-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] z-20 border-b border-slate-100 flex justify-between items-center">
                       <span>Embedding Vector Output Preview</span>
                       <span className="text-pink-600 font-black italic">Method: {method}</span>
                   </div>
                   
                   <div className="space-y-6">
                       {chunks.map((chunk, idx) => (
                           <div key={idx} className="group relative">
                               <div 
                                 className={`p-6 rounded-[2rem] border-2 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-default
                                   ${method === 'LATE' 
                                     ? 'bg-gradient-to-br from-white to-pink-50/20 border-pink-100' 
                                     : 'bg-white border-slate-100 hover:border-slate-200'
                                   }
                                 `}
                               >
                                   <div className="flex justify-between items-center mb-4">
                                       <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest
                                                ${method === 'LATE' ? 'bg-pink-600 text-white shadow-lg shadow-pink-100' : 'bg-slate-100 text-slate-500'}
                                            `}>
                                                Chunk #{idx + 1}
                                            </span>
                                            {method === 'LATE' && <span className="text-[8px] font-black text-pink-400 uppercase animate-pulse">Context Aware</span>}
                                       </div>
                                       <span className="text-[10px] font-mono font-bold text-slate-300">
                                           {chunk.length} CHARS
                                       </span>
                                   </div>
                                   <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                                       {chunk}
                                   </p>
                                   
                                   {method === 'LATE' && (
                                       <div className="mt-6 pt-6 border-t border-pink-100/50 flex flex-wrap gap-2">
                                            {['Pooling', 'Transformer-Out', 'Global-Ref'].map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-pink-50 text-pink-600 text-[8px] font-black rounded border border-pink-100 uppercase">{tag}</span>
                                            ))}
                                       </div>
                                   )}
                               </div>
                               {idx < chunks.length - 1 && (
                                   <div className="flex justify-center my-2">
                                       <div className={`h-8 w-1 rounded-full ${method === 'LATE' ? 'bg-pink-100' : 'bg-slate-100'}`}></div>
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};

export default ChunkingLab;
