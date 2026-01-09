
import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PipelineDesigner from './components/PipelineDesigner';
import SecuritySandbox from './components/SecuritySandbox';
import Checklist from './components/Checklist';
import RagChat from './components/RagChat';
import AIConfigModal from './components/AIConfigModal';
import RecommendationWizard from './components/RecommendationWizard';
import ChunkingLab from './components/ChunkingLab';
import RerankLab from './components/RerankLab';
import EvalStudio from './components/EvalStudio';
import RoutingLab from './components/RoutingLab';
import GraphExplorer from './components/GraphExplorer';
import CostROI from './components/CostROI';
import SelfRagDebug from './components/SelfRagDebug';
import { AppView } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onNavigate={setCurrentView} />;
      case AppView.DESIGNER:
        return <PipelineDesigner />;
      case AppView.CHUNKING:
        return <ChunkingLab />;
      case AppView.RERANK:
        return <RerankLab />;
      case AppView.EVAL:
        return <EvalStudio />;
      case AppView.SANDBOX:
        return <SecuritySandbox />;
      case AppView.ROUTING:
        return <RoutingLab />;
      case AppView.GRAPH:
        return <GraphExplorer />;
      case AppView.ROI:
        return <CostROI />;
      case AppView.DEBUGGER:
        return <SelfRagDebug />;
      case AppView.CHECKLIST:
        return <Checklist />;
      case AppView.CONSULTANT:
        return <RagChat />;
      case AppView.WIZARD:
        return <RecommendationWizard onComplete={() => setCurrentView(AppView.DASHBOARD)} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Navigation 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <main className="flex-1 h-full overflow-hidden relative">
        {renderView()}
      </main>

      <AIConfigModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
