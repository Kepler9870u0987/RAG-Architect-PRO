
import React, { useState, useEffect } from 'react';
import { Scissors, FileText, Braces, Zap, Settings, RefreshCw } from './Icons';

type ChunkMethod = 'FIXED' | 'SEMANTIC' | 'LATE';

const SAMPLE_TEXT = `Late Chunking is a novel technique that redefines how we process documents for Retrieval-Augmented Generation (RAG). Traditional ("Naive") chunking splits text into arbitrary blocks before embedding, often cutting sentences in half and losing semantic context.

In contrast, Late Chunking processes the entire document through the Transformer model first, generating context-aware token embeddings for every single word. Only after this "global understanding" step do we slice the embeddings into chunks.

This means a chunk containing "it" knows that "it" refers to "Late Chunking" mentioned three sentences earlier. This interaction mechanism significantly improves retrieval quality for complex queries.`;

const ChunkingLab: React.FC = () => {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [method, setMethod] = useState<ChunkMethod>('LATE');
  const [chunkSize, setChunkSize] = useState(150); // chars for fixed, or heuristic for others
  const [overlap, setOverlap] = useState(20);
  const [chunks, setChunks] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({ count: 0, avgSize: 0, contextScore: 0 });

  // Simulation Logic
  useEffect(() => {
    let result: string[] = [];
    
    if (method === 'FIXED') {
      for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
        result.push(text.slice(i, i + chunkSize));
      }
    } 
    else if (method === 'SEMANTIC') {
      // Split by sentences roughly
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let currentChunk = '';
      sentences.forEach(sent => {
        if ((currentChunk.length + sent.length) > chunkSize) {
          result.push(currentChunk);
          currentChunk = sent; // No overlap logic for simplicity in this demo
        } else {
          currentChunk += sent;
        }
      });
      if (currentChunk) result.push(currentChunk);
    } 
    else if (method === 'LATE') {
      // Simulation: Late chunking preserves context boundaries perfectly
      // We simulate this by creating perfect semantic blocks that feel "intelligent"
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      result = sentences.map(s => s.trim()); // In reality, these are embedding slices
    }

    setChunks(result);
    setMetrics({
        count: result.length,
        avgSize: Math.round(result.reduce((a, b) => a + b.length, 0) / (result.length || 1)),
        contextScore: method === 'LATE' ? 98 : method === 'SEMANTIC' ? 85 : 45
    });
  }, [text, method, chunkSize, overlap]);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-hidden flex flex-col">
      <header className="mb-6 flex justify-between items-end shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
               <Scissors className="text-pink-600" /> Data Ingestion & Chunking Lab
           </h2>
           <p className="text-slate-500">Visualize how "Late Chunking" preserves context compared to naive strategies.</p>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* Settings & Input */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-2">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Configuration
                  </h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">Strategy</label>
                          <div className="grid grid-cols-3 gap-2">
                              {['FIXED', 'SEMANTIC', 'LATE'].map((m) => (
                                  <button
                                    key={m}
                                    onClick={() => setMethod(m as ChunkMethod)}
                                    className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                                        method === m 
                                        ? 'bg-pink-600 text-white shadow-md' 
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                  >
                                      {m === 'LATE' ? 'Late (AI)' : m.charAt(0) + m.slice(1).toLowerCase()}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {method === 'FIXED' && (
                          <div className="animate-in fade-in slide-in-from-top-2">
                              <label className="block text-xs font-bold text-slate-700 mb-2">
                                  Window Size ({chunkSize} chars)
                              </label>
                              <input 
                                type="range" min="50" max="500" step="10" 
                                value={chunkSize} onChange={(e) => setChunkSize(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                              />
                              <div className="mt-4">
                                  <label className="block text-xs font-bold text-slate-700 mb-2">
                                      Overlap ({overlap} chars)
                                  </label>
                                  <input 
                                    type="range" min="0" max="100" step="5" 
                                    value={overlap} onChange={(e) => setOverlap(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                                  />
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Source Document
                       </h3>
                       <button onClick={() => setText(SAMPLE_TEXT)} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                           <RefreshCw className="w-3 h-3"/> Reset
                       </button>
                  </div>
                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm leading-relaxed resize-none font-mono text-slate-700"
                    placeholder="Paste your document text here..."
                  />
              </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-0">
               {/* Metrics Bar */}
               <div className="grid grid-cols-3 gap-4 shrink-0">
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                       <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><Braces className="w-5 h-5"/></div>
                       <div>
                           <div className="text-2xl font-bold text-slate-800">{metrics.count}</div>
                           <div className="text-xs text-slate-500 uppercase font-bold">Total Chunks</div>
                       </div>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                       <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><FileText className="w-5 h-5"/></div>
                       <div>
                           <div className="text-2xl font-bold text-slate-800">{metrics.avgSize}</div>
                           <div className="text-xs text-slate-500 uppercase font-bold">Avg Size (Chars)</div>
                       </div>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                       <div className={`p-3 rounded-lg ${metrics.contextScore > 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                           <Zap className="w-5 h-5"/>
                       </div>
                       <div>
                           <div className="text-2xl font-bold text-slate-800">{metrics.contextScore}%</div>
                           <div className="text-xs text-slate-500 uppercase font-bold">Context Quality</div>
                       </div>
                   </div>
               </div>

               {/* Chunks Display */}
               <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6 flex-1 overflow-y-auto shadow-inner relative">
                   <h3 className="sticky top-0 bg-slate-100/95 backdrop-blur py-2 mb-4 text-sm font-bold text-slate-500 uppercase tracking-wider z-10 border-b border-slate-200">
                       Vector Space Preview
                   </h3>
                   
                   <div className="space-y-4">
                       {chunks.map((chunk, idx) => (
                           <div key={idx} className="group relative">
                               <div 
                                 className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-default
                                   ${method === 'LATE' 
                                     ? 'bg-gradient-to-r from-white to-pink-50/30 border-pink-200' 
                                     : 'bg-white border-slate-200'
                                   }
                                 `}
                               >
                                   <div className="flex justify-between items-start mb-2">
                                       <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider
                                           ${method === 'LATE' ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-500'}
                                       `}>
                                           Chunk #{idx + 1}
                                       </span>
                                       <span className="text-[10px] font-mono text-slate-400">
                                           {chunk.length} chars
                                       </span>
                                   </div>
                                   <p className="text-sm text-slate-700 leading-relaxed font-mono">
                                       {method === 'LATE' && <span className="text-pink-500 font-bold opacity-50 select-none mr-2">[EMBEDDING_VECTOR]</span>}
                                       {chunk}
                                   </p>
                                   
                                   {/* Context Simulation Overlay for Late Chunking */}
                                   {method === 'LATE' && (
                                       <div className="absolute -right-2 -top-2 w-4 h-4 bg-pink-500 rounded-full animate-ping opacity-0 group-hover:opacity-20"></div>
                                   )}
                               </div>
                               {/* Connector Line */}
                               {idx < chunks.length - 1 && (
                                   <div className={`h-4 w-0.5 mx-auto ${method === 'LATE' ? 'bg-pink-200' : 'bg-slate-300'}`}></div>
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
