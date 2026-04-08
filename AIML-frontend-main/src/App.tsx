import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import InputScreen from './components/InputScreen';
import ThinkingScreen from './components/ThinkingScreen';
import ExplorerScreen from './components/ExplorerScreen';
import AnalysisScreen from './components/AnalysisScreen';
import RecommendationScreen from './components/RecommendationScreen';
import { Screen, DecisionData } from './types';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('input');
  const [decisionData, setDecisionData] = useState<DecisionData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [forgeKey, setForgeKey] = useState<number>(0);

  const handleForge = (data: DecisionData) => {
    setDecisionData(data);
    setSessionId(null); // Force cleanup of previous session results
    setForgeKey(prev => prev + 1); // Trigger stable re-mount of ThinkingScreen
    setCurrentScreen('thinking');
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
    setCurrentScreen('explorer');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'input':
        return <InputScreen onForge={handleForge} />;
      case 'thinking':
        return (
          <ThinkingScreen 
            key={forgeKey}
            decisionData={decisionData} 
            onComplete={handleAnalysisComplete} 
            onSessionStart={setSessionId}
          />
        );
      case 'explorer':
        return <ExplorerScreen data={analysisResult} onNextScreen={() => setCurrentScreen('analysis')} />;
      case 'analysis':
        return <AnalysisScreen data={analysisResult} onNextScreen={() => setCurrentScreen('recommendation')} />;
      case 'recommendation':
        return <RecommendationScreen data={analysisResult} />;
      case 'audit':
        return <div>Audit Screen (In Development)</div>;
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <h2 className="text-3xl font-headline font-bold text-error">Forge Interrupted</h2>
            <p className="text-on-surface-variant max-w-md">The neural engine encountered an anomaly while processing your request. Please check your backend connection.</p>
            <button onClick={() => setCurrentScreen('input')} className="px-8 py-3 bg-primary text-on-primary rounded-lg font-bold uppercase tracking-widest">Restart Engine</button>
          </div>
        );
      default:
        return <InputScreen onForge={handleForge} />;
    }
  };

  const globalForgeHandler = () => {
    if (decisionData) {
       handleForge(decisionData);
    } else {
       setCurrentScreen('input');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30 overflow-x-hidden">
      <Sidebar 
        currentScreen={currentScreen} 
        onScreenChange={setCurrentScreen} 
        onForgeRequest={globalForgeHandler}
      />
      <TopBar onForgeRequest={globalForgeHandler} />
      
      <main className="ml-72 pt-20 min-h-screen relative">
        {/* Background Ambient Elements */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        <div className="fixed bottom-0 left-72 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
        
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Utility */}
        <footer className="mt-12 flex justify-between items-center px-8 py-6 border-t border-outline-variant/10 text-outline-variant text-[10px] font-headline uppercase tracking-widest">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.5)]"></div>
            <span>Decision Evidence Cryptographically Signed & Audited</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-on-surface transition-colors">Documentation</a>
            {sessionId && <span className="text-primary">Session: {sessionId.split('-')[0]}</span>}
            <span>Hash: 0x8F2A...E92</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
