
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
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { PipelineNode, NodeType } from '../types';
import { Zap, Code, PlayCircle, X, Settings, Check, Plus, Trash, Save, Search, Undo, Redo, FileText, Binary, Database, Braces, ListTodo, MessageSquareText, ShieldAlert } from './Icons';
import { DEFAULT_NODES, NODE_DESCRIPTIONS, NODE_IO_DATA } from '../constants';

// --- Helper: Python Code Generator ---
const generatePython = (nodes: any[]) => {
  const activeNodes = nodes.filter(n => n.active);
  let imports = `import os\nfrom typing import List\nimport google.generativeai as genai\n\n# Configure API\ngenai.configure(api_key=os.environ["API_KEY"])\n\n`;
  let setup = `# --- RAG Pipeline Configuration (Generated) ---\n\nclass RAGPipeline:\n    def __init__(self):\n        self.steps = []\n        print("Initializing Pipeline...")\n`;
  
  activeNodes.forEach(node => {
    setup += `        \n        # Step: ${node.label}\n        # Type: ${node.type}\n        # Model: ${node.model}\n        self.steps.append({\n            "name": "${node.label}",\n            "model": "${node.model}",\n            "latency_budget": ${node.baseLatency}\n        })\n`;
  });

  setup += `\n    def run(self, query: str):\n        print(f"Processing Query: {query}")\n        context = None\n        \n        for step in self.steps:\n            print(f"  --> Running {step['name']} using {step['model']}...")\n            # Simulate processing latency\n            # time.sleep(step['latency_budget'] / 1000)\n            \n        return "Pipeline Execution Complete"\n\nif __name__ == "__main__":\n    rag = RAGPipeline()\n    rag.run("How do I implement Late Chunking?")`;
  
  return imports + setup;
};

// --- Custom Edge with Path Following Simulation ---
const SimulationEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

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

// --- Custom Node Component ---
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

  const getIcon = (iconName: string) => {
      switch(iconName) {
          case 'FileText': return <FileText className="w-3 h-3"/>;
          case 'Binary': return <Binary className="w-3 h-3"/>;
          case 'Database': return <Database className="w-3 h-3"/>;
          case 'Braces': return <Braces className="w-3 h-3"/>;
          case 'ListTodo': return <ListTodo className="w-3 h-3"/>;
          case 'MessageSquareText': return <MessageSquareText className="w-3 h-3"/>;
          case 'ShieldAlert': return <ShieldAlert className="w-3 h-3"/>;
          case 'Zap': return <Zap className="w-3 h-3"/>;
          default: return <FileText className="w-3 h-3"/>;
      }
  };

  const ioData = NODE_IO_DATA[data.type as NodeType] || { in: 'In', out: 'Out', inIcon: 'FileText', outIcon: 'FileText' };

  return (
    <div 
        onClick={(e) => { e.stopPropagation(); data.onClick(id); }}
        className={`relative group w-72 transition-all duration-300 transform 
      ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}
      ${selected ? 'scale-105 z-50' : ''}
    `}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400" />
      
      {/* Processing Indicator */}
      {isProcessing && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce z-50 whitespace-nowrap">
            Processing... ({data.baseLatency}ms)
        </div>
      )}

      {/* Node Card */}
      <div className={`p-4 rounded-xl border-2 relative z-10 transition-all duration-300 bg-white
        ${data.active 
            ? `border-${color}-500 shadow-[0_0_15px_rgba(var(--${color}-rgb),0.3)]` 
            : 'border-slate-300 shadow-sm'
        }
        ${selected ? `ring-2 ring-offset-2 ring-${color}-500` : ''}
      `}>
        {/* Active Glow overlay */}
        {data.active && <div className={`absolute inset-0 bg-${color}-500/5 pointer-events-none rounded-xl`}></div>}

        {/* Type Badge */}
        <div className={`absolute -top-3 left-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm z-20
            ${data.type === NodeType.GUARDRAIL ? 'bg-rose-500' : 
              data.type === NodeType.ROUTING ? 'bg-orange-500' :
              data.type === NodeType.PROCESSING ? 'bg-amber-500' :
              data.type === NodeType.RETRIEVAL ? 'bg-blue-500' :
              data.type === NodeType.RERANK ? 'bg-purple-500' : 'bg-emerald-500'}
        `}>
            {data.type}
        </div>

        <div className="flex justify-between items-start mb-3 mt-3 relative z-10">
          <h4 className={`font-bold text-sm ${data.active ? 'text-slate-900' : 'text-slate-500'} pr-2`}>{data.label}</h4>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
             <input 
                type="checkbox" 
                checked={data.active} 
                onChange={(e) => data.onToggle(id)}
                className="peer sr-only" 
                id={`toggle-${id}`}
             />
             <label 
                htmlFor={`toggle-${id}`}
                className={`block w-9 h-5 rounded-full cursor-pointer transition-colors shadow-inner ${data.active ? `bg-${color}-500` : 'bg-slate-300'}`}
             >
                 <span className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${data.active ? 'translate-x-4' : ''}`}></span>
             </label>
          </div>
        </div>
        
        <div className="mb-3 relative z-10">
          <select 
            disabled={!data.active}
            value={data.model}
            onChange={(e) => { e.stopPropagation(); data.onModelChange(id, e.target.value); }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className={`w-full text-xs p-2 border rounded cursor-pointer focus:outline-none transition-shadow
                ${data.active ? 'bg-white/80 border-slate-300 focus:ring-2' : 'bg-slate-100 border-slate-200'}
            `}
          >
            <option>{data.model}</option>
            <option disabled>──────────</option>
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

        <div className="flex items-center justify-between bg-slate-50 rounded border border-slate-100 p-1 mb-2 relative z-10">
             <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium px-1">
                 {getIcon(ioData.inIcon)} {ioData.in}
             </div>
             <div className="text-slate-300 text-[10px]">→</div>
             <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium px-1">
                 {getIcon(ioData.outIcon)} {ioData.out}
             </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 font-mono bg-white/50 p-1.5 rounded relative z-10 border border-slate-200/50">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500"/> {Math.round(data.baseLatency)}ms</span>
            <span>${data.baseCost.toFixed(2)}/1M</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-400" />
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
  const reactFlowInstance = useReactFlow();

  // State
  const [activeScenarioId, setActiveScenarioId] = useState<'A' | 'B'>('A');
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const isSimulatingRef = useRef(false);
  const [simStep, setSimStep] = useState<{nodeId: string | null, edgeId: string | null}>({ nodeId: null, edgeId: null });
  const [simulatedTime, setSimulatedTime] = useState(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [newNodeConfig, setNewNodeConfig] = useState<Partial<PipelineNode>>({
      label: 'New Node',
      type: NodeType.PROCESSING,
      model: 'Default Model',
      baseLatency: 50,
      baseCost: 0.1
  });

  // History State
  const [history, setHistory] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Data Loading
  const loadInitialNodes = (key: string) => {
      const saved = localStorage.getItem(key);
      if (saved) {
          try { return JSON.parse(saved); } catch(e) { return JSON.parse(JSON.stringify(DEFAULT_NODES)); }
      }
      return JSON.parse(JSON.stringify(DEFAULT_NODES));
  };

  const [scenarioA_Nodes, setScenarioA_Nodes] = useState<PipelineNode[]>(() => loadInitialNodes('rag_nodes_A'));
  
  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlowEdges);

  // --- PERSISTENCE FOR EVAL STUDIO ---
  useEffect(() => {
     if (nodes.length > 0) {
        // Save the active pipeline structure for other components to see
        localStorage.setItem('active_pipeline', JSON.stringify({
            nodes: nodes.map(n => n.data),
            updatedAt: Date.now()
        }));
     }
  }, [nodes]);


  // --- HISTORY MANAGEMENT: STABILIZED ---
  // Use refs to access current state inside callbacks without adding dependencies that cause loops
  const stateRef = useRef({ nodes, edges, historyIndex });
  useEffect(() => {
      stateRef.current = { nodes, edges, historyIndex };
  }, [nodes, edges, historyIndex]);

  const takeSnapshot = useCallback(() => {
    // Access state via ref to break dependency loop with onToggle -> useEffect -> setNodes -> nodes change
    const { nodes: currentNodes, edges: currentEdges, historyIndex: currentIndex } = stateRef.current;
    const currentSnapshot = { nodes: currentNodes, edges: currentEdges };
    
    setHistory(prev => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(currentSnapshot);
        if (newHistory.length > 20) newHistory.shift(); 
        return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, []);

  const undo = () => {
      if (historyIndex > 0) {
          const prevSnapshot = history[historyIndex - 1];
          setNodes(prevSnapshot.nodes);
          setEdges(prevSnapshot.edges);
          setHistoryIndex(historyIndex - 1);
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          const nextSnapshot = history[historyIndex + 1];
          setNodes(nextSnapshot.nodes);
          setEdges(nextSnapshot.edges);
          setHistoryIndex(historyIndex + 1);
      }
  };

  // Record initial state
  useEffect(() => {
      if (history.length === 0 && nodes.length > 0) {
          setHistory([{ nodes, edges }]);
          setHistoryIndex(0);
      }
  }, [nodes, edges, history.length]);

  // Sync Logic
  useEffect(() => {
    if (nodes.length === 0) {
        const currentData = scenarioA_Nodes;
        const flowNodes = currentData.map((n, idx) => ({
            id: n.id,
            type: 'pipelineNode',
            position: { x: 250 + (idx % 2 === 0 ? 0 : 40), y: idx * 160 + 20 },
            data: { ...n }
        }));
        setNodes(flowNodes);
    }
  }, []);

  // Handlers - Now stable due to takeSnapshot being stable
  const onToggle = useCallback((id: string) => {
    setNodes((nds) => {
        return nds.map((node) => {
            if (node.id === id) {
                 return { ...node, data: { ...node.data, active: !node.data.active } };
            }
            return node;
        });
    });
    setActivePreset(null);
    takeSnapshot();
  }, [setNodes, takeSnapshot]);

  const onModelChange = useCallback((id: string, model: string) => {
    setNodes((nds) => {
        return nds.map((node) => {
            if (node.id === id) {
                const isPro = model.includes('Pro') || model.includes('ColBERT') || model.includes('CoT');
                return { ...node, data: { ...node.data, model, baseLatency: isPro ? 300 : 80, baseCost: isPro ? 1.5 : 0.2 } };
            }
            return node;
        });
    });
    setActivePreset(null);
    takeSnapshot();
  }, [setNodes, takeSnapshot]);

  const onNodeClick = useCallback((id: string) => {
    setSelectedNodeId(id);
    setIsInspectorOpen(true);
  }, []);

  // Update Data Bindings (This useEffect was the source of the loop, now fixed because deps are stable)
  useEffect(() => {
      setNodes((nds) => nds.map((node) => ({
          ...node,
          data: {
              ...node.data,
              onToggle,
              onModelChange,
              onClick: onNodeClick,
              isProcessing: node.id === simStep.nodeId,
              isDimmed: searchQuery ? !node.data.label.toLowerCase().includes(searchQuery.toLowerCase()) : false
          }
      })));
  }, [onToggle, onModelChange, onNodeClick, simStep, searchQuery, setNodes]);

  useEffect(() => {
      setEdges((eds) => eds.map((edge) => ({
          ...edge,
          type: 'simulation',
          data: { activeEdgeId: simStep.edgeId }
      })));
  }, [simStep, setEdges]);


  // --- SIMULATION LOGIC ---
  const runSimulation = async () => {
      if (isSimulatingRef.current) return;
      
      setIsSimulating(true);
      isSimulatingRef.current = true;
      setSimulatedTime(0);
      setSimStep({ nodeId: null, edgeId: null });

      const adjacency: Record<string, string[]> = {};
      edges.forEach(e => {
          if (!adjacency[e.source]) adjacency[e.source] = [];
          adjacency[e.source].push(e.target);
      });

      const incomingCounts: Record<string, number> = {};
      nodes.forEach(n => incomingCounts[n.id] = 0);
      edges.forEach(e => { if (incomingCounts[e.target] !== undefined) incomingCounts[e.target]++ });
      
      let startNodeId = nodes.find(n => incomingCounts[n.id] === 0)?.id || nodes[0]?.id;
      let currentNodeId: string | undefined = startNodeId;

      while (currentNodeId && isSimulatingRef.current) {
          setSimStep({ nodeId: currentNodeId, edgeId: null });
          const currentNode = nodes.find(n => n.id === currentNodeId);
          if (!currentNode) break;

          const latency = currentNode.data.active ? currentNode.data.baseLatency : 0;
          const steps = 10;
          for(let i=0; i<steps; i++) {
              if(!isSimulatingRef.current) break;
              await new Promise(r => setTimeout(r, 50)); 
              setSimulatedTime(prev => prev + (latency / steps));
          }

          const targets = adjacency[currentNodeId];
          if (!targets || targets.length === 0) break;

          const nextNodeId = targets[0];
          const edge = edges.find(e => e.source === currentNodeId && e.target === nextNodeId);

          if (edge) {
              setSimStep({ nodeId: null, edgeId: edge.id });
              await new Promise(r => setTimeout(r, 800));
          }

          currentNodeId = nextNodeId;
      }
      
      setIsSimulating(false);
      isSimulatingRef.current = false;
      setSimStep({ nodeId: null, edgeId: null });
  };
  
  const handleToggleSimulation = () => {
      if (isSimulating) {
          isSimulatingRef.current = false;
          setIsSimulating(false);
      } else {
          runSimulation();
      }
  };


  // --- GRAPH EDITING ---
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, type: 'simulation', animated: true }, eds));
    takeSnapshot();
  }, [setEdges, takeSnapshot]);

  const handleAddNode = () => {
      const newNodeId = `n${Date.now()}`;
      const newNode = {
          id: newNodeId,
          type: 'pipelineNode',
          position: { x: 400, y: 300 }, 
          data: { 
              ...newNodeConfig,
              id: newNodeId,
              active: true,
              onToggle,
              onModelChange,
              onClick: onNodeClick
          }
      };
      setNodes((nds) => [...nds, newNode]);
      setIsAddModalOpen(false);
      takeSnapshot();
  };

  const handleDeleteNode = () => {
      const selectedNodes = nodes.filter(n => n.selected);
      setNodes((nds) => nds.filter(n => !n.selected));
      setEdges((eds) => eds.filter(e => !selectedNodes.some(n => n.id === e.source || n.id === e.target) && !e.selected));
      takeSnapshot();
  };

  const applyPreset = (type: 'FAST' | 'BALANCED' | 'PRECISION') => {
      setActivePreset(type);
      setNodes((nds) => nds.map(n => {
          let updates = {};
          if (type === 'FAST') {
              const active = ['n2', 'n5'].includes(n.id); 
              updates = { active, model: n.data.type === NodeType.GENERATION ? 'Gemini 3 Flash' : n.data.model, baseLatency: active ? 50 : n.data.baseLatency };
          }
          else if (type === 'BALANCED') {
             updates = { active: true, model: n.data.model, baseLatency: n.data.baseLatency }; 
          }
          else if (type === 'PRECISION') {
             updates = { active: true, model: 'Gemini 3 Pro', baseLatency: 300 };
          }
          return { ...n, data: { ...n.data, ...updates } };
      }));
      takeSnapshot();
  };

  const activeNodes = nodes.filter(n => n.data.active);
  const totalLatency = activeNodes.reduce((acc, n) => acc + (n.data.baseLatency || 0), 0);
  const totalCost = activeNodes.reduce((acc, n) => acc + (n.data.baseCost || 0), 0);

  const selectedNodeData = nodes.find(n => n.id === selectedNodeId)?.data;

  return (
      <div className="flex h-full bg-slate-50">
        <div className="flex-1 flex flex-col p-6 overflow-hidden relative">
          {/* Top Controls */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap justify-between items-center z-10 gap-4">
             <div className="flex items-center gap-4">
                 <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['FAST', 'BALANCED', 'PRECISION'].map((p) => (
                        <button 
                            key={p}
                            onClick={() => applyPreset(p as any)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activePreset === p ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {p}
                        </button>
                    ))}
                 </div>
                 
                 <div className="flex gap-2 border-l pl-4 border-slate-200 items-center">
                     <button onClick={() => setIsAddModalOpen(true)} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Add Node">
                         <Plus className="w-5 h-5" />
                     </button>
                     <button onClick={handleDeleteNode} className="p-2 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded" title="Delete Selected">
                         <Trash className="w-5 h-5" />
                     </button>
                     <div className="w-px h-6 bg-slate-200 mx-1"></div>
                     <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30">
                         <Undo className="w-4 h-4" />
                     </button>
                     <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30">
                         <Redo className="w-4 h-4" />
                     </button>
                     
                     <button onClick={() => setShowCodeModal(true)} className="ml-2 p-2 hover:bg-indigo-50 text-indigo-600 rounded flex items-center gap-1" title="Export Code">
                         <Code className="w-5 h-5" />
                     </button>

                     <div className="relative group ml-2">
                         <Search className="w-4 h-4 absolute left-2 top-2 text-slate-400" />
                         <input 
                            type="text" 
                            placeholder="Find..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 w-24 focus:w-40 transition-all outline-none"
                         />
                     </div>
                 </div>
             </div>
             
             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                     <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider w-16 text-right">
                         {Math.round(simulatedTime)} ms
                     </span>
                 </div>

                 <button 
                    onClick={handleToggleSimulation}
                    className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 border transition-all active:scale-95 ${
                        isSimulating 
                        ? 'bg-red-50 text-red-600 border-red-200 shadow-inner' 
                        : 'bg-indigo-600 text-white border-indigo-600 shadow-md hover:bg-indigo-700'
                    }`}
                 >
                     <PlayCircle className={`w-4 h-4 ${isSimulating ? 'animate-pulse' : ''}`} /> 
                     {isSimulating ? 'Stop' : 'Run Sim'}
                 </button>
             </div>
          </div>
  
          {/* Canvas */}
          <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 relative overflow-hidden shadow-inner">
              <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  attributionPosition="bottom-right"
                  onPaneClick={() => setSelectedNodeId(null)}
              >
                  <Background color="#cbd5e1" gap={20} size={1} />
                  <Controls />
              </ReactFlow>
          </div>
        </div>
  
        {/* Analytics Sidebar */}
        <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col gap-8 shadow-xl z-20 overflow-y-auto">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Estimated Performance</div>
                <div className="text-3xl font-bold text-slate-800">{Math.round(totalLatency)}ms</div>
                <div className="text-xs text-slate-600 mt-1">${totalCost.toFixed(2)} per 1M queries</div>
            </div>

            <div className="flex-1">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Latency Breakdown</h3>
                 <div className="space-y-3">
                     {activeNodes.map(n => (
                         <div key={n.id} className="flex justify-between items-center text-xs">
                             <span className="text-slate-600 truncate max-w-[120px]">{n.data.label}</span>
                             <div className="flex items-center gap-2">
                                 <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (n.data.baseLatency/300)*100)}%` }}></div>
                                 </div>
                                 <span className="font-mono text-slate-500 w-8 text-right">{Math.round(n.data.baseLatency)}</span>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
            
            <button onClick={() => setShowCodeModal(true)} className="w-full py-2 bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-700">
                <Code className="w-4 h-4"/> View Python Code
            </button>
        </div>

        {/* Add Node Modal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-96 animate-in zoom-in-95 border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Add Custom Node</h3>
                        <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Label</label>
                            <input 
                              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                              value={newNodeConfig.label} 
                              onChange={e => setNewNodeConfig({...newNodeConfig, label: e.target.value})}
                              placeholder="e.g. My Custom Reranker"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Type</label>
                            <div className="relative">
                                <select 
                                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white" 
                                  value={newNodeConfig.type} 
                                  onChange={e => setNewNodeConfig({...newNodeConfig, type: e.target.value as NodeType})}
                                >
                                    {Object.values(NodeType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Latency (ms)</label>
                                <input 
                                  type="number" 
                                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                  value={newNodeConfig.baseLatency} 
                                  onChange={e => setNewNodeConfig({...newNodeConfig, baseLatency: parseInt(e.target.value)})} 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cost ($)</label>
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                  value={newNodeConfig.baseCost} 
                                  onChange={e => setNewNodeConfig({...newNodeConfig, baseCost: parseFloat(e.target.value)})} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition">Cancel</button>
                        <button onClick={handleAddNode} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition transform active:scale-95">Add Node</button>
                    </div>
                </div>
            </div>
        )}

        {/* Code Export Modal */}
        {showCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 border border-slate-200 flex flex-col max-h-[80vh]">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Code className="w-5 h-5 text-indigo-600"/> Pipeline Code Export
                      </h3>
                      <button onClick={() => setShowCodeModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  <div className="p-0 bg-slate-900 overflow-auto flex-1">
                     <pre className="p-6 text-xs font-mono text-emerald-300 leading-relaxed selection:bg-indigo-500/30">
                         {generatePython(nodes.map(n => n.data))}
                     </pre>
                  </div>
                  <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
                      <button onClick={() => {navigator.clipboard.writeText(generatePython(nodes.map(n => n.data)));}} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 text-sm transition">Copy to Clipboard</button>
                      <button onClick={() => setShowCodeModal(false)} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-sm transition shadow-lg shadow-indigo-100">Close</button>
                  </div>
              </div>
          </div>
        )}

        {/* Node Inspector Modal */}
        {isInspectorOpen && selectedNodeId && selectedNodeData && (
             <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-[450px] animate-in zoom-in-95 overflow-hidden border border-slate-200">
                    <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {selectedNodeData.label.charAt(0)}
                             </div>
                             <div>
                                 <h3 className="font-bold text-slate-800">{selectedNodeData.label}</h3>
                                 <p className="text-xs text-slate-500 font-mono bg-white px-1 rounded border border-slate-200 inline-block mt-0.5">{selectedNodeId}</p>
                             </div>
                        </div>
                        <button onClick={() => setIsInspectorOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Data Flow Viz */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Data Flow Specification</h4>
                             <div className="flex items-center justify-between px-4">
                                  <div className="text-center group">
                                      <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center mb-2 mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                          <FileText className="w-5 h-5 text-slate-400"/>
                                      </div>
                                      <div className="text-xs font-bold text-slate-600">Input</div>
                                  </div>
                                  <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-4 relative top-[-12px]"></div>
                                  <div className="text-center group">
                                      <div className="w-10 h-10 bg-indigo-50 rounded-full border border-indigo-100 flex items-center justify-center mb-2 mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                          <Zap className="w-5 h-5 text-indigo-600"/>
                                      </div>
                                      <div className="text-xs font-bold text-indigo-700">Transform</div>
                                  </div>
                                  <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-4 relative top-[-12px]"></div>
                                  <div className="text-center group">
                                      <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center mb-2 mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                          <Database className="w-5 h-5 text-slate-400"/>
                                      </div>
                                      <div className="text-xs font-bold text-slate-600">Output</div>
                                  </div>
                             </div>
                        </div>

                        {/* Edit Params */}
                        <div className="space-y-4">
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Model Configuration</label>
                                 <select 
                                    value={selectedNodeData.model} 
                                    onChange={(e) => selectedNodeData.onModelChange(selectedNodeId, e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                 >
                                    <option>Gemini 3 Pro</option>
                                    <option>Gemini 3 Flash</option>
                                    <option>Semantic Router (BERT)</option>
                                    <option>BM25 Only</option>
                                 </select>
                             </div>
                             <div className="flex gap-4">
                                 <div className="flex-1">
                                     <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Latency (ms)</label>
                                     <input type="number" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={selectedNodeData.baseLatency} readOnly />
                                 </div>
                                 <div className="flex-1">
                                     <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Cost / 1M</label>
                                     <input type="number" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={selectedNodeData.baseCost} readOnly />
                                 </div>
                             </div>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button onClick={() => setIsInspectorOpen(false)} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition">Done</button>
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
