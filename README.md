# RAG Architect Pro 2026 🚀

**RAG Architect Pro 2026** è un toolkit avanzato per la progettazione, l'audit e la consulenza su pipeline RAG (Retrieval-Augmented Generation) pronte per la produzione, basato sugli standard di ricerca 2025-2026.

## 🛠️ Requisiti Locali

Per eseguire questo applicativo sul tuo computer, assicurati di avere:

1.  **Node.js** (v18 o superiore).
2.  **Un browser moderno** (Chrome, Edge o Firefox).
3.  *(Opzionale)* **Ollama** installato localmente se desideri testare l'inferenza locale (Llama 3, Mistral, ecc.).

## 🚀 Installazione e Avvio

L'applicazione è costruita come una Single Page Application (SPA) moderna con React e Tailwind CSS.

1.  **Configurazione API Key**:
    L'applicativo utilizza l'SDK `@google/genai`. Per far funzionare il consulente esperto e le funzioni di audit, è necessario impostare la variabile d'ambiente `API_KEY` con una chiave valida di Google AI Studio (Gemini).
    ```bash
    export API_KEY="tua_chiave_qui"
    ```

2.  **Installazione**:
    Se stai usando un ambiente di sviluppo standard:
    ```bash
    npm install
    npm run dev
    ```

3.  **Utilizzo con Ollama (Local LLM)**:
    - Avvia Ollama sul tuo sistema.
    - Assicurati che l'origine CORS sia permessa se riscontri problemi di connessione.
    - Vai nella sezione **Configuration** all'interno dell'app e imposta l'URL (solitamente `http://localhost:11434`) e il modello desiderato (es. `llama3`).

## 🧠 Funzionalità Principali

- **Pipeline Designer**: Trascina e configura i nodi della tua architettura (Late Chunking, Hybrid Search, Reranker). I nodi sono disposti in modo equidistante per una chiarezza visiva ottimale.
- **Security Sandbox**: Simula attacchi di Prompt Injection e Jailbreak per testare la robustezza dei tuoi Guardrails.
- **Expert Consultant**: Una chat interattiva che utilizza Markdown per fornire guide tecniche formattate su come ottimizzare il recupero dei dati.
- **Eval Studio**: Misura metriche critiche come *Faithfulness* e *Answer Relevance* utilizzando il framework RAGAS (simulato).
- **Chunking Lab**: Confronta visivamente strategie di Naive Chunking rispetto al Late Chunking.

## 📐 Design System

L'app segue un linguaggio visivo coerente:
- **Modali**: Tutti i modali condividono lo stesso stile (vetro sfocato, angoli arrotondati `3xl`, input con focus evidenziato).
- **Pipeline**: Layout a cascata con distanziamento matematico tra i componenti per facilitare la lettura dei diagrammi di flusso.
- **Risposte AI**: Rendering Markdown completo con supporto per blocchi di codice e gerarchia testuale.

## 📝 Note Tecniche

Questo applicativo è progettato come strumento educativo e professionale. Le metriche di latenza e costo fornite nel Designer sono stime basate su benchmark standard del 2026 per modelli come Gemini 3 Flash e Cross-Encoders specializzati.

---
*Sviluppato per architetti AI che guardano al futuro della produzione RAG.*