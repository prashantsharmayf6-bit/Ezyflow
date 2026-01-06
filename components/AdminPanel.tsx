
import React from 'react';
import { MOCK_TEAM } from '../constants';
import { WorkflowSetup } from '../types';

interface AdminPanelProps {
  apps: WorkflowSetup[];
  onClearDb: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ apps, onClearDb }) => {
  const totalRequests = apps.reduce((sum, app) => sum + app.requests.length, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">Global Control</h1>
          <p className="text-gray-500 text-lg font-medium mt-2">Managing {MOCK_TEAM.length} team members across {apps.length} active Ezyflow instances.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onClearDb} className="bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
            Wipe DB
          </button>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
            Add Seat
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Instance Health</h3>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{apps.length} / 10</p>
          <div className="mt-6 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-indigo-600" style={{ width: `${(apps.length / 10) * 100}%` }}></div>
          </div>
          <p className="text-[10px] text-indigo-600 font-black uppercase mt-4 tracking-widest">Enterprise Plan active</p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Data Throughput</h3>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{totalRequests}</p>
          <p className="text-[10px] text-emerald-600 font-black uppercase mt-4 tracking-widest">Processed successfully</p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Security Status</h3>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">ENCRYPTED</p>
          <p className="text-[10px] text-gray-400 font-black uppercase mt-4 tracking-widest">TLS 1.3 &bull; AES-256</p>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-gray-100 shadow-2xl overflow-hidden">
        <div className="px-12 py-10 border-b border-gray-50 bg-gray-50/20">
           <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Team Authorization Grid</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-12 py-5">User Profile</th>
                <th className="px-12 py-5">Security Role</th>
                <th className="px-12 py-5">Session</th>
                <th className="px-12 py-5 text-right">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_TEAM.map((member) => (
                <tr key={member.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-4">
                      <img src={member.avatar} className="w-14 h-14 rounded-2xl border-2 border-white shadow-xl" alt="" />
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{member.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold font-mono mt-0.5">{member.name.toLowerCase().replace(' ', '.')}@ezyflow.ai</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{member.role}</span>
                  </td>
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase">Authenticated</span>
                    </div>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <button className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
