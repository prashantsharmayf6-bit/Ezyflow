
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WorkflowBuilder from './components/WorkflowBuilder';
import AdminPanel from './components/AdminPanel';
import PublishedApps from './components/PublishedApps';
import TutorialBot from './components/TutorialBot';
import NotificationCenter from './components/NotificationCenter';
import { ViewType, WorkflowSetup } from './types';

const DB_KEY = 'ezyflow_database_v1';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [allApps, setAllApps] = useState<WorkflowSetup[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Mock current user as John Doe
  const currentUserId = "1"; 

  // Database Initialization (Load from LocalStorage)
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(DB_KEY);
      if (savedData) {
        setAllApps(JSON.parse(savedData));
      } else {
        setAllApps([]);
      }
    } catch (e) {
      console.warn("Ezyflow: Failed to load persistent data, starting fresh.", e);
      setAllApps([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Database Sync (Save to LocalStorage)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(allApps));
      } catch (e) {
        console.error("Ezyflow: Failed to save data to local storage.", e);
      }
    }
  }, [allApps, isLoaded]);

  const handleSaveApp = (app: WorkflowSetup) => {
    setAllApps(prev => {
      const exists = prev.find(a => a.id === app.id);
      if (exists) {
        return prev.map(a => a.id === app.id ? app : a);
      }
      return [...prev, app];
    });
  };

  const renderView = () => {
    if (!isLoaded) return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black uppercase text-indigo-600 tracking-widest text-[10px]">Accessing Ezyflow Securely...</p>
      </div>
    );

    switch (currentView) {
      case 'dashboard':
        return <Dashboard apps={allApps} />;
      case 'workflow':
        return (
          <WorkflowBuilder 
            onSave={handleSaveApp} 
            existingApps={allApps}
            setView={setCurrentView}
          />
        );
      case 'administration':
        return <AdminPanel apps={allApps} onClearDb={() => {
          if(confirm("DANGER: This will permanently delete all workflows and data. Proceed?")) {
            setAllApps([]);
            localStorage.removeItem(DB_KEY);
          }
        }} />;
      case 'applications':
        return (
          <PublishedApps 
            apps={allApps.filter(a => a.isPublished)} 
            onUpdateApp={handleSaveApp}
            currentUserId={currentUserId}
          />
        );
      default:
        return <Dashboard apps={allApps} />;
    }
  };

  const isWorkflow = currentView === 'workflow';
  const isApplications = currentView === 'applications';
  const isFullScreenView = isWorkflow || isApplications;

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className={`flex-1 ml-64 transition-all duration-300 ${isFullScreenView ? 'h-screen' : 'p-8 min-h-screen'}`}>
        <div className={isFullScreenView ? 'h-full' : 'max-w-7xl mx-auto'}>
          {renderView()}
        </div>
      </main>

      <div className="fixed bottom-8 right-24 flex items-center gap-4 z-40">
        <NotificationCenter apps={allApps} currentUserId={currentUserId} onSelectRequest={(appId) => {
          setCurrentView('applications');
        }} />
        <TutorialBot currentView={currentView} setView={setCurrentView} />
      </div>

      <button 
        onClick={() => setCurrentView('workflow')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group hover:ring-4 hover:ring-indigo-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        <div className="absolute right-16 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
          Create Workflow
        </div>
      </button>
    </div>
  );
};

export default App;
