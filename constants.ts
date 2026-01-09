
import { NodeType } from './types';

export const APP_VERSION = "v2026.1";

// Condensed knowledge from the PDF for the Expert System - Enhanced with technical specs
export const RAG_KNOWLEDGE_BASE = `
Sei l'Expert Consultant di RAG Architect Pro, basato sulla documentazione "The Complete Guide to Production-Ready RAG Systems 2025-2026".
Le tue linee guida ineluttabili sono:

1. ARCHITETTURA RETRIEVAL:
   - Late Chunking: Implementare SEMPRE dopo il passaggio nel Transformer. Consente ai token di avere un contesto globale prima del pooling.
   - Hybrid Search: Usare BM25 (parametri consigliati k1=1.2, b=0.75) + Dense Embeddings (BGE-M3).
   - RRF (Reciprocal Rank Fusion): Usare una costante k=60 per la fusione dei ranking senza normalizzazione dei punteggi.

2. QUALITÀ E VALUTAZIONE:
   - Metriche RAGAS: Focus su Faithfulness (fedeltà al contesto) e Answer Relevance.
   - Allucinazioni: Distinguere tra "Intrinseche" (conoscenza errata del modello) ed "Estrinseche" (mancato supporto nel contesto).
   - Soglie target: NDCG@10 > 0.35, Tasso di Allucinazione < 5%.

3. FRONTIERE 2026:
   - Adaptive Routing: Implementare gateway basati su intent (es. Semantic Router).
   - Self-RAG: Utilizzo di reflection tokens [Retrieval], [No-Retrieval], [Is-Supported], [Is-Relevant] per la critica automatica.
   - GraphRAG: Fondamentale per query multi-hop (relazioni tra documenti distanti).

4. PERFORMANCE E COSTI:
   - Budget Latenza: BM25 (<50ms), Rerank (<150ms), LLM (<200ms). Totale target < 800ms.
   - Ottimizzazione: Usare Semantic Caching per ridurre i costi del 70% su query ripetitive.

Rispondi in modo tecnico, conciso e cita sempre le metriche o i principi menzionati sopra quando possibile.`;

export const NODE_DESCRIPTIONS = {
  [NodeType.PROCESSING]: "Pre-computation steps like Chunking or Entity Extraction before vectorization.",
  [NodeType.ROUTING]: "Decides whether to retrieve, how many steps, or which source to use (Vector vs Graph).",
  [NodeType.RETRIEVAL]: "Fetches candidate documents from Vector DBs or Knowledge Graphs.",
  [NodeType.RERANK]: "Re-scores candidates using high-precision models (Cross-Encoder, CoT).",
  [NodeType.GENERATION]: "Synthesizes the final answer using retrieved context.",
  [NodeType.GUARDRAIL]: "Safety layers for PII detection, Jailbreak defense, and Hallucination checks."
};

export const NODE_IO_DATA = {
  [NodeType.PROCESSING]: { in: 'Text', out: 'Chunks', inIcon: 'FileText', outIcon: 'Braces' },
  [NodeType.ROUTING]: { in: 'Query', out: 'Decision', inIcon: 'FileText', outIcon: 'Zap' },
  [NodeType.RETRIEVAL]: { in: 'Vector', out: 'Docs', inIcon: 'Binary', outIcon: 'Database' },
  [NodeType.RERANK]: { in: 'Docs', out: 'Ranked', inIcon: 'Database', outIcon: 'ListTodo' },
  [NodeType.GENERATION]: { in: 'Context', out: 'Answer', inIcon: 'Braces', outIcon: 'MessageSquareText' },
  [NodeType.GUARDRAIL]: { in: 'Prompt', out: 'Safe?', inIcon: 'FileText', outIcon: 'ShieldAlert' }
};

export const DEFAULT_NODES = [
  { id: 'n0', type: NodeType.GUARDRAIL, label: 'PII Detection', model: 'Presidio', active: true, baseLatency: 30, baseCost: 0.02 },
  { id: 'n7', type: NodeType.ROUTING, label: 'Adaptive Router', model: 'Semantic Router (BERT)', active: true, baseLatency: 15, baseCost: 0.01 },
  { id: 'n1', type: NodeType.PROCESSING, label: 'Late Chunking', model: 'Jina-Late-Chunking', active: true, baseLatency: 45, baseCost: 0.05 },
  { id: 'n2', type: NodeType.RETRIEVAL, label: 'Hybrid Retrieval', model: 'BM25 + BGE-M3', active: true, baseLatency: 120, baseCost: 0.20 },
  { id: 'n3', type: NodeType.RETRIEVAL, label: 'Knowledge Graph', model: 'Neo4j + GraphRAG', active: false, baseLatency: 250, baseCost: 0.40 },
  { id: 'n4', type: NodeType.RERANK, label: 'Custom Reranker', model: 'CoT-Reranker', active: true, baseLatency: 180, baseCost: 0.60 },
  { id: 'n5', type: NodeType.GENERATION, label: 'Synthesis Core', model: 'Gemini 3 Flash', active: true, baseLatency: 200, baseCost: 0.15 },
  { id: 'n6', type: NodeType.GUARDRAIL, label: 'Hallucination Check', model: 'Self-RAG Critic', active: true, baseLatency: 50, baseCost: 0.05 }
];

export const INITIAL_CHECKLIST = [
  { 
    id: 'c1', phase: 'Phase 1: Retrieval Foundation', title: 'Implement Hybrid Search (BM25 + Dense)', week: 'Week 1', completed: true, description: 'Combine keyword search with semantic search for robust recall.',
    steps: [
      "Select a vector database supporting hybrid search (e.g., Weaviate, Qdrant, or Pinecone).",
      "Configure BM25 parameters (k1=1.2, b=0.75) for optimal keyword matching.",
      "Implement dense embedding generation using BGE-M3 or OpenAI text-embedding-3-small.",
      "Combine results using Reciprocal Rank Fusion (RRF) with a constant of 60 for unbiased merging."
    ]
  },
  { 
    id: 'c2', phase: 'Phase 1: Retrieval Foundation', title: 'Setup Late Chunking Pipeline', week: 'Week 1', completed: false, description: 'Ensure context is preserved during embedding generation.',
    steps: [
      "Process full documents through the embedding model to generate token-level embeddings before splitting.",
      "Apply chunking boundaries *after* the embedding step to allow cross-token context flow.",
      "Store the 'Parent Document ID' with each chunk for efficient source attribution.",
      "Validate chunk cohesion by manually inspecting random samples for 'orphaned' pronouns like 'it' or 'they'."
    ]
  },
  { 
    id: 'c3', phase: 'Phase 1: Retrieval Foundation', title: 'Configure Reranker (Cross-Encoder)', week: 'Week 2', completed: false, description: 'Select a model like BGE-Reranker or ColBERTv2 for top-k refinement.',
    steps: [
      "Deploy a high-precision Cross-Encoder model on a GPU-enabled endpoint (e.g., SageMaker or Lambda Labs).",
      "Retrieve top-50 candidates from the Hybrid Search layer as input for the reranker.",
      "Pass (Query, Document) pairs to the model to compute an absolute relevance score.",
      "Select the top-5 or top-10 documents based on the re-calculated scores.",
      "Measure P99 latency; ensure reranking step stays under 150ms total overhead."
    ]
  },
  { 
    id: 'c4', phase: 'Phase 2: Evaluation (RAGAS)', title: 'Create Golden Dataset (50+ QA pairs)', week: 'Week 2', completed: false, description: 'Ground truth data for automated testing.',
    steps: [
      "Collect 50-100 real user queries from logs and manually verify the ground truth 'correct' answers.",
      "Map each query to the exact source document chunks required to synthesize the answer.",
      "Include 'Adversarial' examples where the system should refuse to answer (e.g., PII requests).",
      "Export as a standardized JSONL format for ingestion into RAGAS or Arize Phoenix."
    ]
  },
  { 
    id: 'c5', phase: 'Phase 2: Evaluation (RAGAS)', title: 'Implement Context Precision Metric', week: 'Week 3', completed: false, description: 'Measure if the retrieved chunks actually contain the answer.',
    steps: [
      "Integrate the RAGAS library into your CI/CD pipeline (e.g., GitHub Actions or GitLab CI).",
      "Configure the 'Context Precision' metric using an LLM-as-a-Judge (e.g., GPT-4o or Gemini 3 Pro).",
      "Run the evaluation against the Golden Dataset and track improvements over different chunking strategies.",
      "Set a 'Quality Gate' threshold (e.g., score > 0.85) to prevent deployment of degraded models."
    ]
  },
  { 
    id: 'c6', phase: 'Phase 2: Evaluation (RAGAS)', title: 'Implement Faithfulness Metric', week: 'Week 3', completed: false, description: 'Ensure the answer is derived ONLY from context.',
    steps: [
      "Setup the 'Faithfulness' metric in RAGAS to detect hallucinations.",
      "Instruct the judge LLM to decompose the answer into claims and verify each claim against context.",
      "Analyze failure cases: differentiate between 'No Support' and 'Direct Contradiction'.",
      "Iterate on the system prompt to enforce strict 'Adherence to Provided Context Only'."
    ]
  }
];
