
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DESIGNER = 'DESIGNER',
  SANDBOX = 'SANDBOX',
  CHECKLIST = 'CHECKLIST',
  CONSULTANT = 'CONSULTANT',
  WIZARD = 'WIZARD',
  CHUNKING = 'CHUNKING',
  RERANK = 'RERANK'
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
  baseLatency: number; // in ms
  baseCost: number; // per 1M queries
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface SimulationMetrics {
  totalLatency: number;
  totalCost: number; // per 1M
  bottleneck: string;
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
}

export interface ChecklistItem {
  id: string;
  phase: string;
  title: string;
  week: string;
  completed: boolean;
  description?: string;
  steps?: string[];
}

export interface BulkAuditResult {
  id: string;
  prompt: string;
  safe: boolean;
  analysis: string;
}

export interface ScenarioState {
  id: 'A' | 'B';
  label: string;
  nodes: PipelineNode[];
  edges: any[];
  qps: number;
}

// --- AI CONFIG TYPES ---
export type AIProvider = 'GEMINI' | 'OLLAMA';

export interface AIConfig {
  provider: AIProvider;
  ollamaUrl: string; // e.g., http://localhost:11434
  ollamaModel: string; // e.g., llama3
}

// --- WIZARD TYPES ---
export interface WizardAnswer {
  id: string;
  label: string;
  score: Record<string, number>; // e.g., { simple: 1, complex: 0 }
}

export interface WizardQuestion {
  id: number;
  question: string;
  answers: WizardAnswer[];
}
