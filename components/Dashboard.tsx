
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { COLORS } from '../constants';
import { WorkflowSetup, LiveRequest } from '../types';

interface DashboardProps {
  apps: WorkflowSetup[];
}

const Dashboard: React.FC<DashboardProps> = ({ apps }) => {
  // Aggregate all requests from all apps
  const allRequests = useMemo(() => {
    return apps.reduce((acc, app) => [...acc, ...app.requests], [] as LiveRequest[]);
  }, [apps]);

  const stats = useMemo(() => {
    const total = allRequests.length;
    const completed = allRequests.filter(r => r.status === 'completed').length;
    const pending = allRequests.filter(r => r.status === 'pending').length;
    const rejected = allRequests.filter(r => r.status === 'rejected').length;
    
    return {
      total,
      completed,
      pending,
      rejected,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [allRequests]);

  const taskDistribution = useMemo(() => [
    { name: 'Pending', value: stats.pending, color: COLORS.warning },
    { name: 'Completed', value: stats.completed, color: COLORS.secondary },
    { name: 'Rejected', value: stats.rejected, color: COLORS.danger },
  ], [stats]);

  const workloadData = useMemo(() => {
    return apps.map(app => ({
      name: app.name,
      tasks: app.requests.length
    }));
  }, [apps]);

  if (apps.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center p-12 animate-in fade-in zoom-in-95">
        <div className="w-48 h-48 bg-indigo-50 rounded-[3rem] flex items-center justify-center text-8xl mb-10 shadow-inner">🏗️</div>
        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Your Workspace is Empty</h2>
        <p className="text-gray-500 mt-4 text-xl font-medium max-w-md">Ezyflow is ready for your first automation. Create a workflow to start seeing data here.</p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('change-view', { detail: 'workflow' }))}
          className="mt-10 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all"
        >
          Build First Workflow
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Organization Intelligence</h1>
        <p className="text-gray-500 text-lg font-medium">Consolidated real-time metrics for {apps.length} active Ezyflow applications.</p>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Ingested', value: stats.total, sub: 'All Submissions', color: 'text-indigo-600' },
          { label: 'Completion Rate', value: `${stats.rate}%`, sub: 'Efficiency', color: 'text-emerald-600' },
          { label: 'Pending Logic', value: stats.pending, sub: 'In Pipeline', color: 'text-amber-600' },
          { label: 'Active Apps', value: apps.length, sub: 'Platform Reach', color: 'text-gray-900' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <div className="mt-4 flex items-baseline justify-between">
              <p className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
              <span className="text-[10px] font-black text-gray-300 uppercase">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDistribution.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-6">
             {taskDistribution.map((s, i) => (
               <div key={i} className="flex items-center gap-2.5">
                 <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: s.color }}></div>
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.name} ({s.value})</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">Workload by Application</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} fontVariant="all-small-caps" />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc', radius: 12 }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="tasks" fill={COLORS.primary} radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl overflow-hidden">
        <div className="px-12 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">System-Wide Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-12 py-5">Request ID</th>
                <th className="px-12 py-5">Source App</th>
                <th className="px-12 py-5">LifeCycle Status</th>
                <th className="px-12 py-5 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allRequests.slice(0, 8).map((req) => (
                <tr key={req.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-12 py-6">
                    <p className="text-sm font-black text-indigo-600 font-mono">{req.id}</p>
                  </td>
                  <td className="px-12 py-6">
                    <span className="text-xs font-bold text-gray-900 uppercase">{apps.find(a => a.id === req.appId)?.name || 'Unknown'}</span>
                  </td>
                  <td className="px-12 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-12 py-6 text-xs text-gray-400 font-bold text-right">
                    {req.createdAt}
                  </td>
                </tr>
              ))}
              {allRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-gray-300 font-black uppercase tracking-widest italic text-xs">No ledger entries detected</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
