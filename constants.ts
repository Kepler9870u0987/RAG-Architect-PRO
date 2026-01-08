
import { NodeType } from './types';

export const APP_VERSION = "v2026.1";

// Condensed knowledge from the PDF for the Expert System
export const RAG_KNOWLEDGE_BASE = `
You are an expert RAG Consultant based on the document "The Complete Guide to Production-Ready RAG Systems 2025-2026".
Key Concepts:
1. Foundation: Late Chunking is superior to early chunking. It preserves full document context during embedding and segments at retrieval time. ColBERTv2 uses late interaction (token-level similarity).
2. Metadata: Extract Entities (NER) and Relations (RE) to improve disambiguation. Use Knowledge Graphs (KG) for multi-hop reasoning.
3. Hallucinations: Distinguish Factuality (unsupported by world knowledge) vs Faithfulness (contradicts retrieved context). Use Self-RAG (reflection tokens) and Confidence-Based Abstention.
4. Security: Prompt Injection is #1 risk. Use Indirect Injection via poisoned docs. Defense: Input Validation, Code-Data Separation (Sandboxing), Injection Risk calculation.
5. Advanced Retrieval: Use Hybrid Retrieval (BM25 + Dense) with Reciprocal Rank Fusion (RRF). BGE-M3 is a strong embedding model. Rerank with Cross-Encoders.
6. Adaptive RAG (2026 Frontier):
   - Retrieval Gating: Skip retrieval if model is confident (margin signal).
   - Adaptive Routing: Multi-Armed Bandit to choose between No-Retrieval, Single-Hop, or Multi-Hop.
   - KG Expansion: Expand query using Knowledge Graph traversal for complex queries.
7. Architecture Latency Budgets: BM25 (~50ms), Dense (~100ms), Rerank (~100ms), LLM (~150ms). Total target < 800ms.
8. Scaling: Use vLLM for serving. Metric targets: NDCG@10 > 0.35, Hallucination Rate < 5%.
`;

export const NODE_DESCRIPTIONS = {
  [NodeType.PROCESSING]: "Pre-computation steps like Chunking or Entity Extraction before vectorization.",
  [NodeType.ROUTING]: "Decides whether to retrieve, how many steps, or which source to use (Vector vs Graph).",
  [NodeType.RETRIEVAL]: "Fetches candidate documents from Vector DBs or Knowledge Graphs.",
  [NodeType.RERANK]: "Re-scores candidates using high-precision models (Cross-Encoder, CoT).",
  [NodeType.GENERATION]: "Synthesizes the final answer using retrieved context.",
  [NodeType.GUARDRAIL]: "Safety layers for PII detection, Jailbreak defense, and Hallucination checks."
};

// New Visual Definitions for Node I/O
export const NODE_IO_DATA = {
  [NodeType.PROCESSING]: { in: 'Text', out: 'Chunks', inIcon: 'FileText', outIcon: 'Braces' },
  [NodeType.ROUTING]: { in: 'Query', out: 'Decision', inIcon: 'FileText', outIcon: 'Zap' },
  [NodeType.RETRIEVAL]: { in: 'Vector', out: 'Docs', inIcon: 'Binary', outIcon: 'Database' },
  [NodeType.RERANK]: { in: 'Docs', out: 'Ranked', inIcon: 'Database', outIcon: 'ListTodo' },
  [NodeType.GENERATION]: { in: 'Context', out: 'Answer', inIcon: 'Braces', outIcon: 'MessageSquareText' },
  [NodeType.GUARDRAIL]: { in: 'Prompt', out: 'Safe?', inIcon: 'FileText', outIcon: 'ShieldAlert' }
};

export const DEFAULT_NODES = [
  {
    id: 'n0',
    type: NodeType.GUARDRAIL,
    label: 'PII Detection',
    model: 'Presidio',
    active: true,
    baseLatency: 30,
    baseCost: 0.02
  },
  {
    id: 'n7',
    type: NodeType.ROUTING,
    label: 'Adaptive Router',
    model: 'Semantic Router (BERT)',
    active: true,
    baseLatency: 15,
    baseCost: 0.01
  },
  {
    id: 'n1',
    type: NodeType.PROCESSING,
    label: 'Late Chunking',
    model: 'Jina-Late-Chunking',
    active: true,
    baseLatency: 45,
    baseCost: 0.05
  },
  {
    id: 'n2',
    type: NodeType.RETRIEVAL,
    label: 'Hybrid Retrieval',
    model: 'BM25 + BGE-M3',
    active: true,
    baseLatency: 120,
    baseCost: 0.20
  },
  {
    id: 'n3',
    type: NodeType.RETRIEVAL,
    label: 'Knowledge Graph',
    model: 'Neo4j + GraphRAG',
    active: false,
    baseLatency: 250,
    baseCost: 0.40
  },
  {
    id: 'n4',
    type: NodeType.RERANK,
    label: 'Custom Reranker',
    model: 'CoT-Reranker',
    active: true,
    baseLatency: 180,
    baseCost: 0.60
  },
  {
    id: 'n5',
    type: NodeType.GENERATION,
    label: 'Synthesis Core',
    model: 'Gemini 3 Flash',
    active: true,
    baseLatency: 200,
    baseCost: 0.15
  },
  {
    id: 'n6',
    type: NodeType.GUARDRAIL,
    label: 'Hallucination Check',
    model: 'Self-RAG Critic',
    active: true,
    baseLatency: 50,
    baseCost: 0.05
  }
];

export const INITIAL_CHECKLIST = [
  // Phase 1: Foundation & Retrieval
  { 
    id: 'c1', phase: 'Phase 1: Retrieval Foundation', title: 'Implement Hybrid Search (BM25 + Dense)', week: 'Week 1', completed: true, description: 'Combine keyword search with semantic search for robust recall.',
    steps: [
      "Select a vector database supporting hybrid search (e.g., Weaviate, Qdrant, or Pinecone).",
      "Configure BM25 parameters (k1=1.2, b=0.75) for keyword matching.",
      "Implement dense embedding generation using BGE-M3 or OpenAI text-embedding-3-small.",
      "Combine results using Reciprocal Rank Fusion (RRF) with a constant of 60."
    ]
  },
  { 
    id: 'c2', phase: 'Phase 1: Retrieval Foundation', title: 'Setup Late Chunking Pipeline', week: 'Week 1', completed: false, description: 'Ensure context is preserved during embedding generation.',
    steps: [
      "Process full documents through the embedding model to generate token-level embeddings.",
      "Apply chunking heuristics *after* the embedding step to preserve semantic boundaries.",
      "Store the 'Parent Document ID' with each chunk for context retrieval.",
      "Validate chunk cohesion by manually inspecting random samples."
    ]
  },
  { 
    id: 'c3', phase: 'Phase 1: Retrieval Foundation', title: 'Configure Reranker (Cross-Encoder)', week: 'Week 2', completed: false, description: 'Select a model like BGE-Reranker or ColBERTv2 for top-k refinement.',
    steps: [
      "Deploy a Cross-Encoder model (e.g., bge-reranker-v2-m3) on a GPU-enabled endpoint.",
      "Retrieve top-50 candidates from the Hybrid Search layer.",
      "Pass (Query, Document) pairs to the Reranker.",
      "Select the top-5 or top-10 documents based on the new relevance scores.",
      "Monitor latency impact; ensure reranking stays under 150ms."
    ]
  },
  
  // Phase 2: Evaluation Framework (Critical)
  { 
    id: 'c4', phase: 'Phase 2: Evaluation (RAGAS)', title: 'Create Golden Dataset (50+ QA pairs)', week: 'Week 2', completed: false, description: 'Ground truth data for automated testing.',
    steps: [
      "Collect 50 real user queries and manually verify the 'correct' answers.",
      "Map each query to the specific source documents that contain the answer.",
      "Include negative examples where the system should refuse to answer.",
      "Format dataset as JSONL for RAGAS ingestion."
    ]
  },
  { 
    id: 'c5', phase: 'Phase 2: Evaluation (RAGAS)', title: 'Implement Context Precision Metric', week: 'Week 3', completed: false, description: 'Measure if the retrieved chunks actually contain the answer.',
    steps: [
      "Integrate RAGAS library into your CI/CD pipeline.",
      "Configure the 'Context Precision' metric to evaluate retrieval quality.",
      "Run the evaluation against the Golden Dataset.",
      "Target a score of > 0.85 before moving to production."
    ]
  },
  { 
    id: 'c6', phase: 'Phase 2: Evaluation (RAGAS)', title: 'Implement Faithfulness Metric', week: 'Week 3', completed: false, description: 'Ensure the answer is derived ONLY from context.',
    steps: [
      "Configure the 'Faithfulness' metric in RAGAS.",
      "This uses an LLM-as-a-Judge to verify claims against retrieved chunks.",
      "Analyze failures to detect hallucinations.",
      "Tune the system prompt to enforce strict adherence to context."
    ]
  },
  
  // Phase 3: Advanced Reasoning
  { 
    id: 'c7', phase: 'Phase 3: Adaptive RAG', title: 'Implement Margin Signal Gating', week: 'Week 4', completed: false, description: 'Skip retrieval if LLM confidence is high (save latency).',
    steps: [
      "Query the LLM in 'zero-shot' mode first.",
      "Analyze the log-probabilities (logprobs) of the generated tokens.",
      "If the confidence margin exceeds the threshold, return the answer immediately.",
      "If confidence is low, trigger the full retrieval pipeline."
    ]
  },
  { 
    id: 'c8', phase: 'Phase 3: Adaptive RAG', title: 'Setup Knowledge Graph Extraction', week: 'Month 2', completed: false, description: 'For multi-hop queries requiring entity relationship traversal.',
    steps: [
      "Use an LLM to extract (Entity, Relation, Entity) triplets during ingestion.",
      "Store triplets in a Graph Database (e.g., Neo4j).",
      "Implement a graph traversal algorithm for complex user queries.",
      "Combine graph context with vector search results."
    ]
  },
  
  // Phase 4: Security & Guardrails
  { 
    id: 'c9', phase: 'Phase 4: Security Hardening', title: 'Implement PII Redaction Layer', week: 'Month 2', completed: false, description: 'Scrub sensitive data before embedding.',
    steps: [
      "Use Microsoft Presidio or a local NER model to detect PII (names, emails, etc.).",
      "Redact or hash PII in the documents before vectorization.",
      "Implement an output filter to catch any PII leakage in generated answers.",
      "Audit logs to ensure no raw PII is stored."
    ]
  },
  { 
    id: 'c10', phase: 'Phase 4: Security Hardening', title: 'Deploy Prompt Injection Shield', week: 'Month 2', completed: false, description: 'Use heuristics or a classification model to detect attacks.',
    steps: [
      "Deploy a lightweight BERT classifier trained on injection attacks.",
      "Run user queries through the classifier before RAG processing.",
      "Block queries containing known jailbreak patterns (e.g., 'DAN mode').",
      "Log all blocked attempts for security review."
    ]
  },
  { 
    id: 'c11', phase: 'Phase 4: Security Hardening', title: 'Run Adversarial Audit (Red Teaming)', week: 'Month 3', completed: false, description: 'Test system against jailbreaks.',
    steps: [
      "Use the Security Sandbox to simulate mass injection attacks.",
      "Test 'Indirect Prompt Injection' by poisoning a dummy document.",
      "Verify that the system does not execute instructions found in retrieved docs.",
      "Generate a security report and patch vulnerabilities."
    ]
  },
  
  // Phase 5: Production Deployment
  { 
    id: 'c12', phase: 'Phase 5: Deployment', title: 'Setup vLLM / TGI Serving', week: 'Month 3', completed: false, description: 'Optimize throughput for concurrent users.',
    steps: [
      "Containerize the LLM using vLLM for high-throughput serving.",
      "Enable PagedAttention to maximize memory efficiency.",
      "Configure continuous batching parameters.",
      "Deploy to a GPU cluster (e.g., NVIDIA A10G or H100)."
    ]
  },
  { 
    id: 'c13', phase: 'Phase 5: Deployment', title: 'Configure Caching Layer (Redis)', week: 'Month 3', completed: false, description: 'Cache frequent semantic queries to reduce costs.',
    steps: [
      "Implement semantic caching using Redis or GPTCache.",
      "Store (Query Embedding, Response) pairs.",
      "Check the cache before hitting the LLM/Retriever (similarity > 0.95).",
      "Set TTL (Time To Live) policies to refresh stale answers."
    ]
  },
  { 
    id: 'c14', phase: 'Phase 5: Deployment', title: 'Establish Monitoring (Prometheus/Grafana)', week: 'Month 3', completed: false, description: 'Track latency P99, error rates, and token usage.',
    steps: [
      "Instrument code to emit metrics (latency, token count, errors).",
      "Set up a Prometheus server to scrape metrics.",
      "Build a Grafana dashboard to visualize P99 latency and error rates.",
      "Configure alerts for high error rates or latency spikes."
    ]
  },
];
