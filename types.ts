
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DESIGNER = 'DESIGNER',
  SANDBOX = 'SANDBOX',
  CHECKLIST = 'CHECKLIST',
  CONSULTANT = 'CONSULTANT',
  WIZARD = 'WIZARD',
  CHUNKING = 'CHUNKING',
  RERANK = 'RERANK',
  EVAL = 'EVAL',
  ROUTING = 'ROUTING',
  GRAPH = 'GRAPH',
  ROI = 'ROI',
  DEBUGGER = 'DEBUGGER'
}

export enum NodeType {
  PROCESSING = 'PROCESSING',
  ROUTING = 'ROUTING',
  RETRIEVAL = 'RETRIEVAL',
  RERANK = 'RERANK',
  GENERATION = 'GENERATION',
  GUARDRAIL = 'GUARDRAIL'
}

export interface PipelineNode {
  id: string;
  type: NodeType;
  label: string;
  model: string;
  active: boolean;
  baseLatency: number;
  baseCost: number;
  isDimmed?: boolean;
  isProcessing?: boolean;
  // Advanced Configurations
  hybridConfig?: { alpha: number; k1: number; b: number };
  rrfK?: number;
  ragasTargets?: { faithfulness: number; relevance: number };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AIConfig {
  provider: 'GEMINI' | 'OLLAMA';
  ollamaUrl: string;
  ollamaModel: string;
}

export interface ChecklistItem {
  id: string;
  phase: string;
  title: string;
  week: string;
  completed: boolean;
  description: string;
  steps: string[];
}

export interface EvalRun {
  id: string;
  query: string;
  retrievedContext: string[];
  generatedAnswer: string;
  metrics: {
    faithfulness: number;
    answerRelevance: number;
    contextPrecision: number;
  };
  status: 'PASS' | 'FAIL';
  reason?: string;
}

export interface BulkAuditResult {
  safe: boolean;
  analysis: string;
}
