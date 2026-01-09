
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  Handle, 
  Position,
  NodeProps,
  Edge,
  BaseEdge,
  EdgeProps,
  getBezierPath,
  Connection,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Node
} from 'reactflow';
import { PipelineNode, NodeType } from '../types';
import { Zap, Code, PlayCircle, X, Settings, Check, Plus, Trash, Save, Search, Undo, Redo, FileText, Binary, Database, Braces, ListTodo, MessageSquareText, ShieldAlert } from './Icons';
import { DEFAULT_NODES, NODE_IO_DATA } from '../constants';

const generatePython = (nodes: any[]) => {
  const activeNodes = nodes.filter(n => n.active);
  let imports = `import os\nfrom typing import List\nimport google.generativeai as genai\n\n# Configure API\ngenai.configure(api_key=os.environ["API_KEY"])\n\n`;
  let setup = `# --- RAG Pipeline Configuration (Generated) ---\n\nclass RAGPipeline:\n    def __init__(self):\n        self.steps = []\n        print("Initializing Pipeline...")\n`;
  
  activeNodes.forEach(node => {
    setup += `        \n        # Step: ${node.label}\n        # Type: ${node.type}\n        # Model: ${node.model}\n        self.steps.append({\n            "name": "${node.label}",\n            "model": "${node.model}",\n            "latency_budget": ${node.baseLatency}\n        })\n`;
  });

  setup += `\n    def run(self, query: str):\n        print(f"Processing Query: {query}")\n        context = None\n        \n        for step in self.steps:\n            print(f"  --> Running {step['name']} using {step['model']}...")\n            \n        return "Pipeline Execution Complete"\n\nif __name__ == "__main__":\n    rag = RAGPipeline()\n    rag.run("How do I implement Late Chunking?")`;
  
  return imports + setup;
};

const SimulationEdge = ({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data
}: EdgeProps) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const isActive = data?.activeEdgeId === id;
  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{...style, strokeWidth: isActive ? 3 : 2, stroke: isActive ? '#6366f1' : '#cbd5e1', transition: 'stroke 0.3s'}} />
      {isActive && (
        <circle r="6" fill="#6366f1">
          <animateMotion dur="0.8s" repeatCount="1" path={edgePath} fill="freeze" calcMode="linear" />
        </circle>
      )}
    </>
  );
};

const CustomPipelineNode = ({ data, id, selected }: NodeProps) => {
  const getTypeColor = (type: NodeType) => {
      switch(type) {
          case NodeType.GUARDRAIL: return 'rose';
          case NodeType.ROUTING: return 'orange';
          case NodeType.PROCESSING: return 'amber';
          case NodeType.RETRIEVAL: return 'blue';
          case NodeType.RERANK: return 'purple';
          case NodeType.GENERATION: return 'emerald';
          default: return 'slate';
      }
  };
  const color = getTypeColor(data.type);
  const isDimmed = data.isDimmed;
  const isProcessing = data.isProcessing;
  
  return (
    <div 
        onClick={(e) => { e.stopPropagation(); data.onClick(id); }}
        className={`relative group w-72 transition-all duration-300 transform 
      ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}
      ${selected ? 'scale-105 z-50' : ''}
    `}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400 border-2 border-white shadow-sm" />
      {isProcessing && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce z-50 whitespace-nowrap uppercase tracking-widest">
            Processing... ({data.baseLatency}ms)
        </div>
      )}
      <div className={`p-4 rounded-2xl border-2 relative z-10 transition-all duration-300 bg-white
        ${data.active 
            ? `border-${color}-500 shadow-xl shadow-${color}-100` 
            : 'border-slate-200 shadow-sm opacity-60 grayscale-[0.5]'
        }
        ${selected ? `ring-4 ring-indigo-500/10` : ''}
      `}>
        <div className={`absolute -top-3 left-4 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest text-white shadow-md z-20
            ${data.type === NodeType.GUARDRAIL ? 'bg-rose-500' : 
              data.type === NodeType.ROUTING ? 'bg-orange-500' :
              data.type === NodeType.PROCESSING ? 'bg-amber-500' :
              data.type === NodeType.RETRIEVAL ? 'bg-blue-500' :
              data.type === NodeType.RERANK ? 'bg-purple-500' : 'bg-emerald-500'}
        `}>
            {data.type}
        </div>
        <div className="flex justify-between items-start mb-3 mt-4 relative z-10">
          <h4 className={`font-black text-sm tracking-tight ${data.active ? 'text-slate-900' : 'text-slate-400'} pr-2`}>{data.label}</h4>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
             <input type="checkbox" checked={data.active} onChange={(e) => data.onToggle(id)} className="peer sr-only" id={`toggle-${id}`} />
             <label htmlFor={`toggle-${id}`} className={`block w-10 h-6 rounded-full cursor-pointer transition-colors shadow-inner ${data.active ? `bg-${color}-500` : 'bg-slate-200'}`}>
                 <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-md ${data.active ? 'translate-x-4' : ''}`}></span>
             </label>
          </div>
        </div>
        <div className="mb-3 relative z-10">
          <select 
            disabled={!data.active}
            value={data.model}
            onChange={(e) => { e.stopPropagation(); data.onModelChange(id, e.target.value); }}
            className={`w-full text-xs font-bold p-2.5 border rounded-xl cursor-pointer focus:outline-none transition-all
                ${data.active ? 'bg-slate-50 border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-400'}
            `}
          >
            <option>Gemini 3 Pro</option>
            <option>Gemini 3 Flash</option>
            <option>Semantic Router (BERT)</option>
            <option>BM25 Only</option>
            <option>ColBERTv2</option>
            <option>Jina-Reranker-v2</option>
            <option>CoT-Reranker</option>
            <option>Presidio</option>
            <option>Self-RAG Critic</option>
          </select>
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-black bg-slate-50 p-2.5 rounded-xl relative z-10 border border-slate-100 uppercase tracking-tighter">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500"/> {Math.round(data.baseLatency)}ms</span>
            <span className="text-slate-400">${data.baseCost.toFixed(2)}/1M</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-400 border-2 border-white shadow-sm" />
    </div>
  );
};

const nodeTypes = { pipelineNode: CustomPipelineNode };
const edgeTypes = { simulation: SimulationEdge };

const initialFlowEdges: Edge[] = [
    { id: 'e0-7', source: 'n0', target: 'n7', type: 'simulation' },
    { id: 'e7-1', source: 'n7', target: 'n1', type: 'simulation' },
    { id: 'e1-2', source: 'n1', target: 'n2', type: 'simulation' },
    { id: 'e2-3', source: 'n2', target: 'n3', type: 'simulation' },
    { id: 'e3-4', source: 'n3', target: 'n4', type: 'simulation' },
    { id: 'e4-5', source: 'n4', target: 'n5', type: 'simulation' },
    { id: 'e5-6', source: 'n5', target: 'n6', type: 'simulation' },
];

const PipelineDesignerContent: React.FC = () => {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const isSimulatingRef = useRef(false);
  const [simStep, setSimStep] = useState<{nodeId: string | null, edgeId: string | null}>({ nodeId: null, edgeId: null });
  const [simulatedTime, setSimulatedTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [newNodeConfig, setNewNodeConfig] = useState<Partial<PipelineNode>>({ label: 'New Node', type: NodeType.PROCESSING, model: 'Gemini 3 Flash', baseLatency: 50, baseCost: 0.1 });
  const [history, setHistory] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlowEdges);

  const stateRef = useRef({ nodes, edges, historyIndex });
  useEffect(() => { stateRef.current = { nodes, edges, historyIndex }; }, [nodes, edges, historyIndex]);

  const takeSnapshot = useCallback(() => {
    const { nodes: currentNodes, edges: currentEdges, historyIndex: currentIndex } = stateRef.current;
    setHistory(prev => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push({ nodes: currentNodes, edges: currentEdges });
        return newHistory.length > 20 ? newHistory.slice(1) : newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, []);

  useEffect(() => {
    const currentData = JSON.parse(localStorage.getItem('rag_nodes_A') || JSON.stringify(DEFAULT_NODES));
    const flowNodes = currentData.map((n: any, idx: number) => ({
        id: n.id,
        type: 'pipelineNode',
        // EQUIDISTANT LAYOUT: Nodes are perfectly aligned vertically with a fixed step
        position: { x: 300, y: idx * 180 + 40 },
        data: { ...n }
    }));
    setNodes(flowNodes);
  }, []);

  const onToggle = useCallback((id: string) => {
    setNodes(nds => nds.map(node => node.id === id ? { ...node, data: { ...node.data, active: !node.data.active } } : node));
    takeSnapshot();
  }, [setNodes, takeSnapshot]);

  const onModelChange = useCallback((id: string, model: string) => {
    setNodes(nds => nds.map(node => node.id === id ? { ...node, data: { ...node.data, model } } : node));
    takeSnapshot();
  }, [setNodes, takeSnapshot]);

  const onNodeClick = useCallback((id: string) => { setSelectedNodeId(id); setIsInspectorOpen(true); }, []);

  useEffect(() => {
      setNodes(nds => nds.map(node => ({
          ...node,
          data: { ...node.data, onToggle, onModelChange, onClick: onNodeClick, isProcessing: node.id === simStep.nodeId, isDimmed: searchQuery ? !node.data.label.toLowerCase().includes(searchQuery.toLowerCase()) : false }
      })));
  }, [onToggle, onModelChange, onNodeClick, simStep, searchQuery, setNodes]);

  const runSimulation = async () => {
      if (isSimulatingRef.current) return;
      setIsSimulating(true); isSimulatingRef.current = true; setSimulatedTime(0);
      const adjacency: Record<string, string[]> = {};
      edges.forEach(e => { if (!adjacency[e.source]) adjacency[e.source] = []; adjacency[e.source].push(e.target); });
      let currentNodeId: string | undefined = nodes[0]?.id;
      while (currentNodeId && isSimulatingRef.current) {
          setSimStep({ nodeId: currentNodeId, edgeId: null });
          const currentNode = nodes.find(n => n.id === currentNodeId);
          if (!currentNode) break;
          const latency = currentNode.data.active ? currentNode.data.baseLatency : 0;
          for(let i=0; i<5; i++) { if(!isSimulatingRef.current) break; await new Promise(r => setTimeout(r, 100)); setSimulatedTime(prev => prev + (latency / 5)); }
          const nextNodeId = adjacency[currentNodeId]?.[0];
          if (nextNodeId) { setSimStep({ nodeId: null, edgeId: edges.find(e => e.source === currentNodeId && e.target === nextNodeId)?.id || null }); await new Promise(r => setTimeout(r, 600)); }
          currentNodeId = nextNodeId;
      }
      setIsSimulating(false); isSimulatingRef.current = false; setSimStep({ nodeId: null, edgeId: null });
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNodeId)?.data;

  return (
      <div className="flex h-full bg-slate-50">
        <div className="flex-1 flex flex-col p-6 overflow-hidden relative">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-6 flex flex-wrap justify-between items-center z-10 gap-4">
             <div className="flex items-center gap-4">
                 <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    {['FAST', 'BALANCED', 'PRECISION'].map((p) => (
                        <button key={p} onClick={() => setActivePreset(p)} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activePreset === p ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700 uppercase'}`}>{p}</button>
                    ))}
                 </div>
                 <div className="flex gap-2 border-l pl-4 border-slate-200 items-center">
                     <button onClick={() => setIsAddModalOpen(true)} className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-all shadow-sm active:scale-95"><Plus className="w-5 h-5" /></button>
                     <button onClick={() => setNodes(nds => nds.filter(n => !n.selected))} className="p-2.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 rounded-xl transition-all shadow-sm active:scale-95"><Trash className="w-5 h-5" /></button>
                     <button onClick={() => { if(historyIndex > 0) { const s = history[historyIndex-1]; setNodes(s.nodes); setEdges(s.edges); setHistoryIndex(historyIndex-1); }}} className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 shadow-sm"><Undo className="w-4 h-4" /></button>
                 </div>
             </div>
             <div className="flex items-center gap-4">
                 <div className="bg-slate-900 px-5 py-2.5 rounded-2xl border border-slate-800 shadow-xl"><span className="text-xs font-black text-amber-400 font-mono tracking-tighter uppercase">{Math.round(simulatedTime)} ms</span></div>
                 <button onClick={() => { if(isSimulating) { isSimulatingRef.current=false; setIsSimulating(false); } else runSimulation(); }} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 border transition-all active:scale-95 ${isSimulating ? 'bg-rose-600 text-white border-rose-700 shadow-lg shadow-rose-100' : 'bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-100 hover:bg-indigo-700'}`}><PlayCircle className="w-4 h-4" /> {isSimulating ? 'Stop' : 'Simulate'}</button>
             </div>
          </div>
  
          <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 relative overflow-hidden shadow-2xl">
              <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={(p) => { setEdges(eds => addEdge({...p, type:'simulation'}, eds)); takeSnapshot(); }} fitView>
                  <Background color="#f1f5f9" gap={30} size={1.5} />
                  <Controls className="!bg-white !border-slate-200 !shadow-2xl !rounded-2xl overflow-hidden !m-4" />
              </ReactFlow>
          </div>
        </div>

        {/* MODAL: ADD NODE */}
        {isAddModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                    <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 leading-none">Add Pipeline Node</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Design an execution step</p>
                        </div>
                        <button onClick={() => setIsAddModalOpen(false)} className="p-2.5 bg-white hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Label Name</label>
                            <input className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold placeholder:font-medium" value={newNodeConfig.label} onChange={e => setNewNodeConfig({...newNodeConfig, label: e.target.value})} placeholder="e.g. Meta-Reranker" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Execution Role</label>
                            <select className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" value={newNodeConfig.type} onChange={e => setNewNodeConfig({...newNodeConfig, type: e.target.value as NodeType})}>
                                {Object.values(NodeType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Latency (ms)</label>
                                <input type="number" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" value={newNodeConfig.baseLatency} onChange={e => setNewNodeConfig({...newNodeConfig, baseLatency: parseInt(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cost / 1M</label>
                                <input type="number" step="0.01" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" value={newNodeConfig.baseCost} onChange={e => setNewNodeConfig({...newNodeConfig, baseCost: parseFloat(e.target.value)})} />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                        <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest">Cancel</button>
                        <button onClick={() => { const id = `n${Date.now()}`; setNodes(nds => [...nds, { id, type: 'pipelineNode', position: { x: 300, y: nds.length * 180 + 40 }, data: { ...newNodeConfig, id, active: true, onToggle, onModelChange, onClick: onNodeClick } }]); setIsAddModalOpen(false); takeSnapshot(); }} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all active:scale-95">Create Node</button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL: CODE EXPORT */}
        {showCodeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 flex flex-col max-h-[85vh]">
                  <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
                      <div>
                          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                              <Code className="w-6 h-6 text-indigo-600"/> Pipeline Code Export
                          </h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Ready-to-deploy Python Implementation</p>
                      </div>
                      <button onClick={() => setShowCodeModal(false)} className="p-2.5 bg-white hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="p-0 bg-slate-950 overflow-auto flex-1">
                     <pre className="p-8 text-xs font-mono text-indigo-300 leading-relaxed selection:bg-indigo-500/30">
                         {generatePython(nodes.map(n => n.data))}
                     </pre>
                  </div>
                  <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                      <button onClick={() => navigator.clipboard.writeText(generatePython(nodes.map(n => n.data)))} className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest">Copy to Clipboard</button>
                      <button onClick={() => setShowCodeModal(false)} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95 text-xs uppercase tracking-widest">Close Export</button>
                  </div>
              </div>
          </div>
        )}

        {/* MODAL: INSPECTOR */}
        {isInspectorOpen && selectedNodeId && selectedNodeData && (
             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                    <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-100">
                                {selectedNodeData.label.charAt(0)}
                             </div>
                             <div>
                                 <h3 className="font-black text-slate-900 text-lg leading-tight">{selectedNodeData.label}</h3>
                                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">{selectedNodeId}</p>
                             </div>
                        </div>
                        <button onClick={() => setIsInspectorOpen(false)} className="p-2.5 bg-white hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Functional Logic Path</h4>
                             <div className="flex items-center justify-between px-2">
                                  <div className="text-center group"><div className="w-11 h-11 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-2 mx-auto shadow-sm group-hover:scale-110 transition-transform"><FileText className="w-5 h-5 text-slate-400"/></div><div className="text-[9px] font-black text-slate-500 uppercase">Input</div></div>
                                  <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-4 mt-[-18px]"></div>
                                  <div className="text-center group"><div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center mb-2 mx-auto shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform text-white"><Zap className="w-5 h-5"/></div><div className="text-[9px] font-black text-indigo-700 uppercase italic">Execution</div></div>
                                  <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-4 mt-[-18px]"></div>
                                  <div className="text-center group"><div className="w-11 h-11 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-2 mx-auto shadow-sm group-hover:scale-110 transition-transform"><Database className="w-5 h-5 text-slate-400"/></div><div className="text-[9px] font-black text-slate-500 uppercase">Output</div></div>
                             </div>
                        </div>
                        <div className="space-y-6">
                             <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Model</label>
                                 <select value={selectedNodeData.model} onChange={(e) => selectedNodeData.onModelChange(selectedNodeId, e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold">
                                    <option>Gemini 3 Pro</option>
                                    <option>Gemini 3 Flash</option>
                                    <option>Semantic Router (BERT)</option>
                                    <option>BM25 Only</option>
                                 </select>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Latency (ms)</label>
                                     <input type="number" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-black outline-none cursor-not-allowed" value={selectedNodeData.baseLatency} readOnly />
                                 </div>
                                 <div className="space-y-2">
                                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cost / 1M</label>
                                     <input type="number" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-black outline-none cursor-not-allowed" value={selectedNodeData.baseCost} readOnly />
                                 </div>
                             </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button onClick={() => setIsInspectorOpen(false)} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">Inspect Done</button>
                    </div>
                </div>
             </div>
        )}
      </div>
  );
};

const PipelineDesigner = () => (
    <ReactFlowProvider>
        <PipelineDesignerContent />
    </ReactFlowProvider>
);

export default PipelineDesigner;
