
import React, { useState, useMemo } from 'react';
import { WorkflowSetup, LiveRequest } from '../types';
// Import Icons from constants to fix "Cannot find name 'Icons'" error
import { Icons } from '../constants';

interface NotificationCenterProps {
  apps: WorkflowSetup[];
  currentUserId: string;
  onSelectRequest: (appId: string, requestId: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ apps, currentUserId, onSelectRequest }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find all requests where the currentModuleId's assignee is the currentUserId
  const pendingNotifications = useMemo(() => {
    const list: { app: WorkflowSetup; request: LiveRequest }[] = [];
    apps.forEach(app => {
      app.requests.forEach(req => {
        if (req.status === 'pending') {
          const currentModule = app.modules.find(m => m.id === req.currentModuleId);
          if (currentModule?.config?.assigneeId === currentUserId) {
            list.push({ app, request: req });
          }
        }
      });
    });
    return list;
  }, [apps, currentUserId]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-white border border-gray-100 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 relative z-50 ${isOpen ? 'ring-4 ring-indigo-500/20' : ''}`}
      >
        <span className="text-2xl">🔔</span>
        {pendingNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
            {pendingNotifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-indigo-950/20 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="absolute bottom-20 right-0 w-[400px] bg-white rounded-[3rem] shadow-[0_32px_80px_rgba(0,0,0,0.2)] border border-gray-100 z-50 animate-in slide-in-from-bottom-8 duration-300 overflow-hidden">
            <div className="p-10 border-b bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Action Inbox</h3>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">Pending items for you</p>
            </div>
            
            <div className="max-h-[50vh] overflow-y-auto p-6 custom-scrollbar space-y-4">
              {pendingNotifications.length === 0 ? (
                <div className="py-20 text-center text-gray-400 space-y-4">
                   <div className="text-5xl opacity-20">🍃</div>
                   <p className="font-black uppercase tracking-widest text-xs">All caught up!</p>
                </div>
              ) : (
                pendingNotifications.map(({ app, request }) => (
                  <button 
                    key={request.id} 
                    onClick={() => {
                      onSelectRequest(app.id, request.id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-6 bg-white border border-gray-100 rounded-3xl hover:border-indigo-600 hover:shadow-xl transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-full uppercase tracking-widest">{app.name}</span>
                       <span className="text-[10px] text-gray-400 font-black uppercase font-mono">{request.id}</span>
                    </div>
                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Action Required at {app.modules.find(m => m.id === request.currentModuleId)?.label}</p>
                    <div className="mt-4 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       <span>Submitted {request.createdAt}</span>
                       <Icons.ChevronRight />
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t text-center">
               <button onClick={() => setIsOpen(false)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600">Close Panel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
