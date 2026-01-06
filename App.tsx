
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WorkflowBuilder from './components/WorkflowBuilder';
import AdminPanel from './components/AdminPanel';
import PublishedApps from './components/PublishedApps';
import TutorialBot from './components/TutorialBot';
import NotificationCenter from './components/NotificationCenter';
import { ViewType, WorkflowSetup } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [allApps, setAllApps] = useState<WorkflowSetup[]>([]);
  // Mock current user as John Doe (ID: "1" for Alex Rivera in our constants, let's assume current is Alex)
  const currentUserId = "1"; 

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
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'workflow':
        return (
          <WorkflowBuilder 
            onSave={handleSaveApp} 
            existingApps={allApps}
            setView={setCurrentView}
          />
        );
      case 'administration':
        return <AdminPanel />;
      case 'applications':
        return (
          <PublishedApps 
            apps={allApps.filter(a => a.isPublished)} 
            onUpdateApp={handleSaveApp}
            currentUserId={currentUserId}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  const isWorkflow = currentView === 'workflow';
  const isApplications = currentView === 'applications';
  const isFullScreenView = isWorkflow || isApplications;

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className={`flex-1 ml-64 ${isFullScreenView ? '' : 'p-8'}`}>
        <div className={isFullScreenView ? 'h-screen' : 'max-w-6xl mx-auto'}>
          {renderView()}
        </div>
      </main>

      <div className="fixed bottom-8 right-24 flex items-center gap-4 z-40">
        <NotificationCenter apps={allApps} currentUserId={currentUserId} onSelectRequest={(appId) => {
          setCurrentView('applications');
          // In a real app we'd also trigger opening the specific request
        }} />
        <TutorialBot currentView={currentView} setView={setCurrentView} />
      </div>

      <button className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        <div className="absolute right-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Quick Task
        </div>
      </button>
    </div>
  );
};

export default App;
