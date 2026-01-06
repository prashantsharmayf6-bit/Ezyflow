
import React, { useState, useMemo } from 'react';
import { WorkflowSetup, LiveRequest, WorkflowModule } from '../types';
import { Icons, MOCK_TEAM } from '../constants';

interface PublishedAppsProps {
  apps: WorkflowSetup[];
  onUpdateApp: (app: WorkflowSetup) => void;
  currentUserId: string;
}

const PublishedApps: React.FC<PublishedAppsProps> = ({ apps, onUpdateApp, currentUserId }) => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<LiveRequest | null>(null);

  const selectedApp = apps.find(a => a.id === selectedAppId);

  const createRequest = (formData: Record<string, any>) => {
    if (!selectedApp || selectedApp.modules.length === 0) return;
    
    const startModule = selectedApp.modules.find(m => m.type === 'start') || selectedApp.modules[0];
    const nextModule = selectedApp.modules[selectedApp.modules.indexOf(startModule) + 1] || startModule;

    const nextId = selectedApp.requests.length + 1;
    const paddedId = nextId.toString().padStart(2, '0');
    const newRequest: LiveRequest = {
      id: `REQ-${paddedId}`,
      appId: selectedApp.id,
      data: formData,
      status: 'pending',
      currentModuleId: nextModule.id,
      createdAt: new Date().toLocaleDateString(),
      history: [{ moduleId: startModule.id, action: 'SUBMITTED', timestamp: new Date().toISOString(), actorId: currentUserId }]
    };

    const updated = {
      ...selectedApp,
      requests: [newRequest, ...selectedApp.requests]
    };
    onUpdateApp(updated);
    setIsNewRequestModalOpen(false);
  };

  const processRequest = (request: LiveRequest, action: string) => {
    if (!selectedApp) return;
    
    const currentIndex = selectedApp.modules.findIndex(m => m.id === request.currentModuleId);
    const isLast = currentIndex === selectedApp.modules.length - 1;
    const nextModule = isLast ? selectedApp.modules[currentIndex] : selectedApp.modules[currentIndex + 1];
    
    const updatedRequest: LiveRequest = {
      ...request,
      status: isLast ? 'completed' : (action === 'REJECTED' ? 'rejected' : 'pending'),
      currentModuleId: nextModule.id,
      history: [...request.history, { moduleId: request.currentModuleId, action, timestamp: new Date().toISOString(), actorId: currentUserId }]
    };

    const updatedApp = {
      ...selectedApp,
      requests: selectedApp.requests.map(r => r.id === request.id ? updatedRequest : r)
    };
    onUpdateApp(updatedApp);
    setViewingRequest(null);
  };

  const getModuleById = (app: WorkflowSetup, id: string) => app.modules.find(m => m.id === id);

  if (!selectedAppId) {
    return (
      <div className="p-12 animate-in fade-in duration-500 h-full flex flex-col">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Deployed Portals</h1>
          <p className="text-gray-500 text-lg font-medium mt-2">The central hub for all live internal applications built within Ezyflow.</p>
        </header>

        {apps.length === 0 ? (
          <div className="flex-1 bg-white rounded-[4rem] p-24 border-4 border-dashed border-gray-100 text-center flex flex-col items-center justify-center shadow-inner">
            <div className="text-8xl mb-8 opacity-20 grayscale">🛰️</div>
            <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Satellite Feed Offline</h3>
            <p className="text-gray-400 mt-4 font-medium text-lg max-w-sm">No applications have been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {apps.map(app => (
              <button key={app.id} onClick={() => setSelectedAppId(app.id)} className="bg-white p-10 rounded-[3rem] border-2 border-gray-50 shadow-2xl hover:shadow-indigo-100 hover:border-indigo-600 transition-all text-left flex flex-col group relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50/50 rounded-full group-hover:scale-150 transition-transform"></div>
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl mb-8 group-hover:rotate-12 transition-transform shadow-inner relative z-10">🚀</div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-tight relative z-10">{app.name}</h3>
                <p className="text-[11px] text-indigo-600 font-black uppercase tracking-[0.25em] mt-3 relative z-10">{app.department} INFRASTRUCTURE</p>
                <div className="mt-12 pt-8 border-t flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900">{app.requests.length}</span> Submissions
                  </div>
                  <span className="flex items-center gap-2 text-emerald-600">
                    Live <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col animate-in fade-in duration-300 overflow-hidden">
      <header className="bg-white border-b px-10 py-5 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-8">
          <button onClick={() => setSelectedAppId(null)} className="w-12 h-12 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all">
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">{selectedApp.name}</h1>
            <p className="text-[10px] text-indigo-600 font-black tracking-[0.4em] uppercase mt-1.5">LIVE PORTAL ACCESS &bull; {selectedApp.department}</p>
          </div>
        </div>
        <button onClick={() => setIsNewRequestModalOpen(true)} className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
          New Submission
        </button>
      </header>

      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl overflow-hidden">
             <div className="px-12 py-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Transactional Activity</h2>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/30 border-b border-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-12 py-6">Unique ID</th>
                      <th className="px-12 py-6">Current Stage</th>
                      <th className="px-12 py-6">Assigned To</th>
                      <th className="px-12 py-6">Status</th>
                      <th className="px-12 py-6 text-right">Operation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedApp.requests.map((req) => {
                      const currentModule = getModuleById(selectedApp, req.currentModuleId);
                      const assignee = MOCK_TEAM.find(u => u.id === currentModule?.config?.assigneeId);
                      
                      return (
                        <tr key={req.id} className="hover:bg-indigo-50/20 transition-colors group">
                          <td className="px-12 py-8 font-black text-indigo-600 font-mono text-lg">{req.id}</td>
                          <td className="px-12 py-8">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">{currentModule?.label}</span>
                              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{currentModule?.type}</span>
                            </div>
                          </td>
                          <td className="px-12 py-8">
                            {assignee ? (
                              <div className="flex items-center gap-3">
                                <img src={assignee.avatar} className="w-9 h-9 rounded-xl border-2 border-white shadow-sm" />
                                <span className="text-xs font-black text-gray-700 uppercase">{assignee.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-300 italic">Auto-resolved</span>
                            )}
                          </td>
                          <td className="px-12 py-8">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                              req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              req.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-12 py-8 text-right">
                            <button onClick={() => setViewingRequest(req)} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">View Request</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      </main>

      {/* New Request Modal */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-gray-900/70 backdrop-blur-xl p-6">
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createRequest(Object.fromEntries(formData.entries()));
            }}>
              <div className="px-12 py-10 border-b border-gray-100 bg-indigo-50/30">
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Portal Submission</h2>
                <p className="text-[11px] font-black text-indigo-600 uppercase mt-2 tracking-widest">Entering Data for: {selectedApp.name}</p>
              </div>
              <div className="p-12 space-y-8">
                {selectedApp.modules.find(m => m.type === 'start')?.config?.formFields?.map(field => (
                  <div key={field.id} className="space-y-2.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">{field.label}</label>
                    <input name={field.label} type={field.type} required={field.required} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-5 outline-none font-bold text-black text-base focus:border-indigo-600 transition-all shadow-sm" placeholder={`Provide ${field.label.toLowerCase()}...`} />
                  </div>
                ))}
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsNewRequestModalOpen(false)} className="flex-1 py-5 rounded-3xl font-black text-gray-400 uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Cancel</button>
                  <button type="submit" className="flex-[2] bg-indigo-600 text-white py-6 rounded-3xl text-xl font-black shadow-2xl hover:bg-indigo-700 transition-all">Submit Entry</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Interaction View Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-indigo-950/80 backdrop-blur-md p-6">
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95">
              <div className="px-12 py-8 border-b flex justify-between items-center bg-gray-50">
                 <div className="flex items-center gap-6">
                    <span className="text-3xl font-black text-indigo-600">{viewingRequest.id}</span>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div>
                       <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{selectedApp.name}</h2>
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Workflow lifecycle control</p>
                    </div>
                 </div>
                 <button onClick={() => setViewingRequest(null)} className="w-12 h-12 rounded-full hover:bg-rose-50 text-gray-300 hover:text-rose-500 transition-all flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" /></svg>
                 </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                 {/* Timeline Side */}
                 <div className="w-[300px] border-r bg-gray-50/50 p-10 overflow-y-auto custom-scrollbar">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Process Stage Tracker</h4>
                    <div className="space-y-10 relative">
                       <div className="absolute left-4 top-4 bottom-4 w-1 bg-gray-100 rounded-full"></div>
                       {selectedApp.modules.map((m, idx) => {
                          const isPast = viewingRequest.history.some(h => h.moduleId === m.id);
                          const isCurrent = viewingRequest.currentModuleId === m.id;
                          return (
                            <div key={m.id} className="relative pl-12">
                               <div className={`absolute left-0 top-1 w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all ${
                                 isPast ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 
                                 isCurrent ? 'bg-white border-indigo-600 text-indigo-600 shadow-xl scale-110' : 
                                 'bg-white border-gray-100 text-gray-300'
                               }`}>
                                  <span className="text-xs font-black">{idx + 1}</span>
                               </div>
                               <p className={`text-xs font-black uppercase tracking-tight ${isCurrent ? 'text-indigo-600' : 'text-gray-900'}`}>{m.label}</p>
                               <p className="text-[8px] text-gray-400 font-black uppercase mt-1">{m.type}</p>
                            </div>
                          );
                       })}
                    </div>
                 </div>

                 {/* Interaction Side */}
                 <div className="flex-1 p-12 overflow-y-auto">
                    <div className="space-y-10">
                       <section>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Initial Data Payload</h4>
                          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                             {Object.entries(viewingRequest.data).map(([key, val]) => (
                               <div key={key}>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{key}</p>
                                  <p className="font-bold text-gray-900">{val as string}</p>
                               </div>
                             ))}
                          </div>
                       </section>

                       {/* CURRENT ACTION */}
                       {viewingRequest.status === 'pending' && (
                          <section className="animate-in slide-in-from-bottom-4 duration-500">
                             {getModuleById(selectedApp, viewingRequest.currentModuleId)?.config?.assigneeId === currentUserId ? (
                                <div className="bg-indigo-50/50 rounded-[3rem] p-10 border-2 border-indigo-100 space-y-8">
                                   <div>
                                      <h3 className="text-2xl font-black text-indigo-600 uppercase tracking-tighter">Your Action Required</h3>
                                      <p className="text-gray-500 font-medium mt-1">Please provide the necessary inputs to move this request to the next stage.</p>
                                   </div>
                                   
                                   {getModuleById(selectedApp, viewingRequest.currentModuleId)?.type === 'approval' ? (
                                      <div className="flex gap-4">
                                         <button onClick={() => processRequest(viewingRequest, 'APPROVED')} className="flex-1 bg-emerald-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl hover:bg-emerald-700 transition-all">Approve Request</button>
                                         <button onClick={() => processRequest(viewingRequest, 'REJECTED')} className="flex-1 bg-rose-500 text-white py-5 rounded-3xl font-black text-lg shadow-xl hover:bg-rose-600 transition-all">Reject / Void</button>
                                      </div>
                                   ) : (
                                      <div className="space-y-6">
                                         <div className="bg-white rounded-[2rem] p-6 border border-indigo-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Instructions</p>
                                            <p className="text-gray-700 font-medium">{getModuleById(selectedApp, viewingRequest.currentModuleId)?.config?.instruction || 'Process this task.'}</p>
                                         </div>
                                         <button onClick={() => processRequest(viewingRequest, 'COMPLETED')} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all">Mark as Completed</button>
                                      </div>
                                   )}
                                </div>
                             ) : (
                                <div className="bg-amber-50/50 rounded-[3rem] p-10 border-2 border-amber-100 text-center flex flex-col items-center">
                                   <div className="text-5xl mb-4">⌛</div>
                                   <h3 className="text-xl font-black text-amber-700 uppercase tracking-tighter">Waiting for Assignee</h3>
                                   <p className="text-amber-600 font-medium mt-1 max-w-xs">This request is currently with <strong>{MOCK_TEAM.find(u => u.id === getModuleById(selectedApp, viewingRequest.currentModuleId)?.config?.assigneeId)?.name}</strong> for processing.</p>
                                </div>
                             )}
                          </section>
                       )}

                       {viewingRequest.status === 'completed' && (
                          <div className="bg-emerald-50 rounded-[3rem] p-12 text-center flex flex-col items-center">
                             <div className="text-6xl mb-4">✨</div>
                             <h3 className="text-2xl font-black text-emerald-700 uppercase">Workflow Completed</h3>
                             <p className="text-emerald-600 font-medium mt-2">All stages of this lifecycle have been successfully executed and recorded.</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PublishedApps;
