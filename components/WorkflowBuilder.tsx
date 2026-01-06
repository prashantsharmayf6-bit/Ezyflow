
import React, { useState, useMemo, useRef } from 'react';
import { WorkflowModule, WorkflowSetup, FormField, ViewType } from '../types';
import { Icons, MOCK_TEAM } from '../constants';

const MODULE_TYPES: Omit<WorkflowModule, 'id'>[] = [
  { type: 'start', label: 'App Entry', description: 'Web app starting point' },
  { type: 'user_task', label: 'Data Form', description: 'Collect user inputs' },
  { type: 'approval', label: 'Review Screen', description: 'Manager review & sign-off' },
  { type: 'notification', label: 'System Alert', description: 'Automatic email or alert' },
  { type: 'integration', label: 'API Bridge', description: 'External service connection' },
  { type: 'end', label: 'Success Page', description: 'Final completion screen' },
];

const getIconForType = (type: string) => {
  switch (type) {
    case 'start': return '🚀';
    case 'user_task': return '🧩';
    case 'approval': return '⚖️';
    case 'notification': return '🔔';
    case 'integration': return '🔌';
    case 'end': return '🏁';
    default: return '⚙️';
  }
};

interface WorkflowBuilderProps {
  onSave: (app: WorkflowSetup) => void;
  existingApps: WorkflowSetup[];
  setView: (view: ViewType) => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onSave, existingApps, setView }) => {
  const [viewMode, setViewMode] = useState<'landing' | 'builder' | 'setup'>('landing');
  const [currentApp, setCurrentApp] = useState<WorkflowSetup | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<'owners' | 'managers' | 'members' | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const startNewApp = () => {
    setCurrentApp({
      id: `app-${Date.now()}`,
      name: '',
      department: 'HR',
      isPublished: false,
      requests: [],
      modules: [],
      access: { owners: [], managers: [], members: [] }
    });
    setViewMode('setup');
  };

  const editApp = (app: WorkflowSetup) => {
    setCurrentApp(app);
    setViewMode('builder');
  };

  const handleCreateApp = () => {
    if (!currentApp || !currentApp.name) return;
    onSave(currentApp);
    setViewMode('builder');
  };

  const publishLive = () => {
    if (!currentApp) return;
    const published = { ...currentApp, isPublished: true };
    setCurrentApp(published);
    onSave(published);
    setIsSuccessModalOpen(true);
  };

  const addModule = (item: Omit<WorkflowModule, 'id'>) => {
    if (!currentApp) return;
    const newModule: WorkflowModule = {
      ...item,
      id: `mod-${Date.now()}`,
      config: {
        instruction: 'Complete this step.',
        actionLabel: 'Submit',
        formFields: item.type === 'start' ? [{ id: '1', label: 'Request Title', type: 'text', required: true }] : [],
        approvalOptions: item.type === 'approval' ? ['approve', 'reject', 'send_back'] : [],
        notificationType: 'in_app',
        assigneeId: MOCK_TEAM[0].id // Default to first team member
      }
    };
    const updated = { ...currentApp, modules: [...currentApp.modules, newModule] };
    setCurrentApp(updated);
    onSave(updated);
  };

  const deleteModule = (id: string) => {
    if (!currentApp) return;
    const updated = { ...currentApp, modules: currentApp.modules.filter(m => m.id !== id) };
    setCurrentApp(updated);
    onSave(updated);
    if (editingModuleId === id) setEditingModuleId(null);
  };

  const updateModule = (modId: string, updates: Partial<WorkflowModule>) => {
    if (!currentApp) return;
    const updated = {
      ...currentApp,
      modules: currentApp.modules.map(m => m.id === modId ? { ...m, ...updates } : m)
    };
    setCurrentApp(updated);
    onSave(updated);
  };

  const toggleUserSelection = (role: 'owners' | 'managers' | 'members', userId: string) => {
    if (!currentApp) return;
    const current = currentApp.access[role];
    const exists = current.includes(userId);
    const updatedAccess = {
      ...currentApp.access,
      [role]: exists ? current.filter(id => id !== userId) : [...current, userId]
    };
    setCurrentApp({ ...currentApp, access: updatedAccess });
  };

  const editingModule = useMemo(() => currentApp?.modules.find(m => m.id === editingModuleId), [currentApp, editingModuleId]);

  if (viewMode === 'landing') {
    return (
      <div className="p-12 animate-in fade-in duration-500 h-full flex flex-col">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Workflow Studio</h1>
          <p className="text-gray-500 text-lg font-medium mt-2">Empower your team with custom-built low-code automation tools.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1 min-h-0">
          <button onClick={startNewApp} className="group relative bg-indigo-600 p-12 rounded-[3.5rem] text-left text-white shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all overflow-hidden flex flex-col justify-end">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl mb-8 backdrop-blur-sm border border-white/10 shadow-inner">✨</div>
              <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter">Create New App</h3>
              <p className="text-indigo-100 text-xl font-medium max-w-sm">Launch a fresh workflow with our intuitive drag-and-drop studio.</p>
            </div>
          </button>

          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col">
            <h3 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Icons.Edit /></span>
              Edit Created Apps
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-4 custom-scrollbar">
              {existingApps.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-40 py-20">
                  <div className="text-7xl mb-6">📁</div>
                  <p className="font-black uppercase tracking-[0.3em] text-xs">Repository is empty</p>
                </div>
              ) : (
                existingApps.map(app => (
                  <button key={app.id} onClick={() => editApp(app)} className="w-full flex items-center justify-between p-6 bg-gray-50/50 rounded-[2.5rem] border-2 border-transparent hover:border-indigo-600 hover:bg-white transition-all group shadow-sm hover:shadow-xl">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">🚀</div>
                      <div className="text-left">
                        <p className="font-black text-gray-900 uppercase tracking-tight text-lg leading-tight">{app.name}</p>
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-1">{app.department} &bull; {app.modules.length} Nodes</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                      <Icons.ChevronRight />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'setup' && currentApp) {
    return (
      <div className="w-full py-12 px-6 h-screen flex items-center justify-center bg-gray-50 overflow-y-auto">
        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden w-full max-w-4xl animate-in zoom-in-95">
          <div className="bg-indigo-600 px-12 py-16 text-white text-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] [background-size:24px_24px]"></div>
            <h1 className="text-5xl font-black tracking-tighter uppercase relative z-10">Application Blueprint</h1>
            <p className="text-indigo-100 mt-4 text-xl font-medium relative z-10">Define the foundational identity of your automated tool.</p>
          </div>
          <div className="p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Application Name</label>
                <input type="text" value={currentApp.name} onChange={(e) => setCurrentApp({...currentApp, name: e.target.value})} placeholder="e.g., Expense Tracker Pro" className="w-full bg-white border-2 border-gray-100 rounded-3xl px-6 py-5 outline-none font-bold text-black text-lg focus:border-indigo-600 transition-all shadow-sm" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Department Scope</label>
                <select value={currentApp.department} onChange={(e) => setCurrentApp({...currentApp, department: e.target.value})} className="w-full bg-white border-2 border-gray-100 rounded-3xl px-6 py-5 outline-none font-bold text-black text-lg appearance-none cursor-pointer focus:border-indigo-600 shadow-sm" >
                  {['HR', 'Engineering', 'Marketing', 'Finance', 'Operations'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-6">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Permission Hierarchy</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['owners', 'managers', 'members'] as const).map(role => (
                  <div key={role} className="bg-gray-50/50 rounded-[2.5rem] p-8 border-2 border-dashed border-gray-100 flex flex-col group relative hover:border-indigo-300 hover:bg-white transition-all">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-gray-900 capitalize tracking-tight text-lg">{role}</h3>
                      <button onClick={() => setActivePicker(role)} className="w-10 h-10 bg-white rounded-full text-indigo-600 shadow-md border border-gray-50 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center">
                        <Icons.Plus />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2.5 min-h-[48px]">
                      {currentApp.access[role].map(uid => (
                        <img key={uid} src={MOCK_TEAM.find(u => u.id === uid)?.avatar} className="w-11 h-11 rounded-2xl border-2 border-white shadow-lg transform hover:scale-110 transition-transform cursor-pointer" title={MOCK_TEAM.find(u => u.id === uid)?.name} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-6">
              <button onClick={() => setViewMode('landing')} className="flex-1 py-6 border-2 border-gray-100 rounded-[2.5rem] text-xl font-black text-gray-400 hover:bg-gray-50 transition-all">Go Back</button>
              <button onClick={handleCreateApp} disabled={!currentApp.name} className="flex-[2] bg-indigo-600 text-white py-6 rounded-[2.5rem] text-xl font-black shadow-2xl hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Initialize Studio
              </button>
            </div>
          </div>
        </div>
        {activePicker && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-6">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95">
               <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Assign {activePicker}</h3>
                  <button onClick={() => setActivePicker(null)} className="w-10 h-10 rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors flex items-center justify-center"><Icons.Trash /></button>
               </div>
               <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                  {MOCK_TEAM.map(u => {
                    const isSelected = currentApp.access[activePicker].includes(u.id);
                    return (
                      <div key={u.id} onClick={() => toggleUserSelection(activePicker, u.id)} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all ${isSelected ? 'bg-indigo-50 border-indigo-600 shadow-md' : 'bg-white border-gray-50 hover:border-indigo-200'}`} >
                        <img src={u.avatar} className="w-12 h-12 rounded-xl border-2 border-white shadow-sm" />
                        <div className="text-left overflow-hidden">
                          <p className="font-black text-gray-900 text-sm truncate">{u.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{u.role}</p>
                        </div>
                      </div>
                    );
                  })}
               </div>
               <div className="p-8 bg-gray-50/50 flex justify-end">
                  <button onClick={() => setActivePicker(null)} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all">Confirm Selection</button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === 'builder' && currentApp) {
    return (
      <div className="h-screen flex flex-col animate-in fade-in duration-500 overflow-hidden bg-white w-full">
        <header className="flex justify-between items-center px-8 py-5 border-b shrink-0 bg-white shadow-sm z-20">
          <div className="flex items-center gap-6">
            <button onClick={() => setViewMode('landing')} className="w-10 h-10 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" /></svg>
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">{currentApp.name}</h1>
              <p className="text-[9px] text-indigo-600 font-black uppercase tracking-[0.4em] mt-1.5">{currentApp.department} APP STUDIO</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsPreviewMode(true)} className="px-6 py-3 bg-white border-2 border-gray-100 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center gap-2">
              <Icons.Play /> Preview
            </button>
            <button onClick={publishLive} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
              Publish Live
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden w-full">
          <aside className="w-[280px] bg-white border-r p-8 flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Node Inventory</h3>
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {MODULE_TYPES.map((item, idx) => (
                <button key={idx} onClick={() => addModule(item)} className="w-full text-left p-5 rounded-[2rem] bg-gray-50/50 border-2 border-transparent hover:bg-white hover:border-indigo-600 hover:shadow-2xl transition-all group flex flex-col gap-1">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {getIconForType(item.type)}
                    </div>
                    <div>
                      <span className="text-xs font-black text-gray-900 block truncate leading-tight">{item.label}</span>
                      <span className="text-[8px] text-indigo-600 font-black uppercase block tracking-widest mt-0.5">{item.type}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:40px_40px]">
            <div ref={canvasRef} className="absolute inset-0 p-16 flex items-center overflow-x-auto overflow-y-hidden custom-scrollbar">
              {currentApp.modules.length === 0 ? (
                <div className="w-full text-center space-y-6 opacity-30 py-40">
                  <div className="w-24 h-24 border-4 border-dashed border-gray-300 rounded-[3rem] mx-auto flex items-center justify-center text-gray-300">
                    <Icons.Plus />
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Place modules here to architect your flow</p>
                </div>
              ) : (
                <div className="flex items-center gap-0 pr-80 min-w-max">
                  {currentApp.modules.map((m, idx) => (
                    <div key={m.id} className="flex items-center shrink-0">
                      <div className="w-[300px] p-8 rounded-[3rem] border-[3px] border-indigo-600 transition-all bg-white relative z-10 shadow-[0_20px_50px_rgba(79,70,229,0.12)] flex flex-col items-center text-center group">
                         <div className="absolute -top-3 -left-3 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">STEP {idx + 1}</div>
                         <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-4xl mb-6 shadow-inner ring-4 ring-indigo-50/50 group-hover:scale-110 transition-transform">
                           {getIconForType(m.type)}
                         </div>
                         <h4 className="text-lg font-black text-gray-900 mb-1 uppercase tracking-tighter leading-tight">{m.label}</h4>
                         <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mb-8">{m.type}</p>
                         <div className="w-full flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-y-0 translate-y-2">
                           <button onClick={() => setEditingModuleId(m.id)} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] shadow-xl hover:bg-indigo-700 transition-all">
                             SETUP NODE
                           </button>
                           <button onClick={() => deleteModule(m.id)} className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-md">
                             <Icons.Trash />
                           </button>
                         </div>
                      </div>
                      {idx < currentApp.modules.length - 1 && (
                        <div className="w-20 h-1 bg-gradient-to-r from-indigo-600 to-indigo-50 relative shrink-0">
                           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-r-[3px] border-t-[3px] border-indigo-200 rotate-45 -mr-1 shadow-sm"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {editingModule && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-6">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
              <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Node Logic Config</h2>
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1.5">{editingModule.type} settings</p>
                </div>
                <button onClick={() => setEditingModuleId(null)} className="w-12 h-12 rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-500 flex items-center justify-center transition-all">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" /></svg>
                </button>
              </div>
              <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                
                {/* Node-wide Settings: Assignment */}
                {editingModule.type !== 'start' && editingModule.type !== 'end' && (
                   <div className="space-y-4 pb-6 border-b-2 border-gray-50">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div> Target Assignee
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {MOCK_TEAM.map(u => (
                        <button 
                          key={u.id}
                          onClick={() => updateModule(editingModule.id, { config: { ...editingModule.config, assigneeId: u.id } })}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${editingModule.config?.assigneeId === u.id ? 'bg-indigo-50 border-indigo-600 shadow-md' : 'bg-white border-gray-50 hover:border-indigo-100'}`}
                        >
                          <img src={u.avatar} className="w-10 h-10 rounded-xl" />
                          <div className="text-left overflow-hidden">
                            <p className="font-black text-gray-900 text-[10px] truncate uppercase">{u.name}</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{u.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {editingModule.type === 'start' && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div> Entry Form Designer
                    </h4>
                    {editingModule.config?.formFields?.map((field, fIdx) => (
                      <div key={field.id} className="p-6 bg-white rounded-3xl border-2 border-gray-100 space-y-5 relative shadow-xl group">
                        <div className="flex gap-6">
                          <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Field Display Label</label>
                            <input type="text" value={field.label} onChange={(e) => {
                                const newFields = [...(editingModule.config?.formFields || [])];
                                newFields[fIdx].label = e.target.value;
                                updateModule(editingModule.id, { config: { ...editingModule.config, formFields: newFields } });
                              }} className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold text-black focus:border-indigo-600 outline-none transition-all" placeholder="e.g., Full Name" />
                          </div>
                          <div className="w-48 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Input Type</label>
                            <select value={field.type} onChange={(e) => {
                                const newFields = [...(editingModule.config?.formFields || [])];
                                newFields[fIdx].type = e.target.value as any;
                                updateModule(editingModule.id, { config: { ...editingModule.config, formFields: newFields } });
                              }} className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold text-black outline-none cursor-pointer focus:border-indigo-600" >
                              <option value="text">Text Input</option>
                              <option value="email">Email Address</option>
                              <option value="tel">Phone Number</option>
                              <option value="number">Numeric Input</option>
                              <option value="date">Date Picker</option>
                              <option value="select">Dropdown Menu</option>
                            </select>
                          </div>
                        </div>
                        {field.type === 'select' && (
                          <div className="space-y-2 pt-4 border-t-2 border-dashed border-gray-50">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selectable Options (Comma separated)</label>
                             <input type="text" value={field.options?.join(', ') || ''} onChange={(e) => {
                                const opts = e.target.value.split(',').map(s => s.trim());
                                const newFields = [...(editingModule.config?.formFields || [])];
                                newFields[fIdx].options = opts;
                                updateModule(editingModule.id, { config: { ...editingModule.config, formFields: newFields } });
                              }} placeholder="Red, Green, Blue..." className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold text-black outline-none focus:border-indigo-600" />
                          </div>
                        )}
                        <button onClick={() => {
                          const newFields = (editingModule.config?.formFields || []).filter((_, idx) => idx !== fIdx);
                          updateModule(editingModule.id, { config: { ...editingModule.config, formFields: newFields } });
                        }} className="absolute -top-4 -right-4 bg-white text-rose-500 rounded-2xl p-3 shadow-2xl border-2 border-rose-50 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white">
                          <Icons.Trash />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => {
                      const newField: FormField = { id: Date.now().toString(), label: '', type: 'text', required: true };
                      const newFields = [...(editingModule.config?.formFields || []), newField];
                      updateModule(editingModule.id, { config: { ...editingModule.config, formFields: newFields } });
                    }} className="w-full py-6 border-4 border-dotted border-gray-100 rounded-3xl text-sm font-black text-indigo-400 uppercase tracking-widest hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">+ Add Form Logic</button>
                  </div>
                )}

                {editingModule.type === 'notification' && (
                  <div className="space-y-8">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">System Dispatch Channel</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <button onClick={() => updateModule(editingModule.id, { config: { ...editingModule.config, notificationType: 'in_app' } })} className={`p-10 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-6 shadow-sm hover:shadow-2xl ${editingModule.config?.notificationType === 'in_app' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50/50 border-gray-100 text-gray-400'}`} >
                        <div className={`text-6xl transition-transform ${editingModule.config?.notificationType === 'in_app' ? 'scale-110' : ''}`}>🔔</div>
                        <div className="text-center">
                          <p className="font-black text-lg uppercase tracking-tight">In-App Alert</p>
                          <p className={`text-[10px] uppercase tracking-widest mt-1 ${editingModule.config?.notificationType === 'in_app' ? 'text-indigo-100' : 'text-gray-400'}`}>Internal Feed</p>
                        </div>
                      </button>
                      <button onClick={() => updateModule(editingModule.id, { config: { ...editingModule.config, notificationType: 'push' } })} className={`p-10 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-6 shadow-sm hover:shadow-2xl ${editingModule.config?.notificationType === 'push' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50/50 border-gray-100 text-gray-400'}`} >
                        <div className={`text-6xl transition-transform ${editingModule.config?.notificationType === 'push' ? 'scale-110' : ''}`}>📱</div>
                        <div className="text-center">
                          <p className="font-black text-lg uppercase tracking-tight">Push Message</p>
                          <p className={`text-[10px] uppercase tracking-widest mt-1 ${editingModule.config?.notificationType === 'push' ? 'text-indigo-100' : 'text-gray-400'}`}>External Device</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {editingModule.type === 'approval' && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Branching Path Logic</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {['Approve Transaction', 'Reject / Void', 'Send Back to User'].map(opt => (
                        <div key={opt} className="flex items-center justify-between p-6 bg-white rounded-3xl border-2 border-gray-100 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                            <span className="text-sm font-black uppercase tracking-tight text-gray-700">{opt}</span>
                          </div>
                          <div className="w-14 h-7 bg-emerald-500 rounded-full relative shadow-inner">
                             <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editingModule.type === 'end' && (
                  <div className="text-center py-16 space-y-6 bg-gray-50 rounded-[3rem] shadow-inner">
                    <div className="text-7xl animate-bounce">🏁</div>
                    <div className="px-12">
                      <h4 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Success Terminal</h4>
                      <p className="text-gray-500 mt-4 leading-relaxed font-medium">This node signals a successful completion. Data is committed to the main ledger and the workflow state is updated to FINISHED.</p>
                    </div>
                  </div>
                )}

                <button onClick={() => setEditingModuleId(null)} className="w-full bg-gray-900 text-white py-6 rounded-[2rem] text-lg font-black shadow-2xl hover:bg-black transition-all transform hover:-translate-y-1">
                  Commit Node Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-gray-900/60 backdrop-blur-xl p-6">
            <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-50 duration-300">
               <div className="p-16 text-center space-y-8">
                  <div className="w-32 h-32 bg-emerald-50 rounded-[3rem] mx-auto flex items-center justify-center text-7xl shadow-inner border-2 border-emerald-100/50">🎉</div>
                  <div>
                    <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none">Application Live!</h3>
                    <p className="text-gray-500 mt-4 text-lg font-medium leading-relaxed">Your workflow engine is now active. Team members can start submitting requests immediately.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button onClick={() => setView('applications')} className="w-full bg-indigo-600 text-white py-6 rounded-3xl text-xl font-black shadow-2xl hover:bg-indigo-700 transition-all" >
                      Go to Portal
                    </button>
                    <button onClick={() => setIsSuccessModalOpen(false)} className="w-full py-5 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-900 transition-colors" >
                      Close and Stay Here
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {isPreviewMode && currentApp && (
          <div className="fixed inset-0 z-[700] bg-white flex flex-col animate-in fade-in duration-300">
            <header className="px-10 py-6 border-b flex justify-between items-center bg-indigo-900 text-white">
              <div className="flex items-center gap-4">
                <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full uppercase">Live Preview Mode</span>
                <h2 className="text-xl font-black uppercase tracking-tight">{currentApp.name}</h2>
              </div>
              <button onClick={() => setIsPreviewMode(false)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-all">
                Exit Preview
              </button>
            </header>
            <div className="flex-1 bg-gray-50 overflow-y-auto p-12">
              <div className="max-w-3xl mx-auto space-y-12">
                <div className="bg-white rounded-[3rem] shadow-xl p-12 border border-gray-100">
                  <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-8">End-User Experience Simulation</h3>
                  <div className="space-y-8">
                    {currentApp.modules.map((m, i) => (
                      <div key={m.id} className="p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">{getIconForType(m.type)}</div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase">Step {i+1}: {m.type}</p>
                            <h4 className="font-black text-gray-900 uppercase tracking-tight">{m.label}</h4>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{m.config?.instruction || 'No special instructions configured for this node.'}</p>
                      </div>
                    ))}
                    {currentApp.modules.length === 0 && (
                      <div className="py-20 text-center text-gray-400 uppercase font-black tracking-widest opacity-40">No modules added to flow blueprint</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default WorkflowBuilder;
