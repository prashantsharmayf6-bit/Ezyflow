
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MOCK_TASKS, MOCK_TEAM, COLORS } from '../constants';
import { TaskStatus } from '../types';

const Dashboard: React.FC = () => {
  const taskStats = useMemo(() => {
    const counts = {
      todo: MOCK_TASKS.filter(t => t.status === 'todo').length,
      'in-progress': MOCK_TASKS.filter(t => t.status === 'in-progress').length,
      review: MOCK_TASKS.filter(t => t.status === 'review').length,
      done: MOCK_TASKS.filter(t => t.status === 'done').length,
    };
    return [
      { name: 'To Do', value: counts.todo, color: COLORS.neutral },
      { name: 'In Progress', value: counts['in-progress'], color: COLORS.primary },
      { name: 'Review', value: counts.review, color: COLORS.warning },
      { name: 'Completed', value: counts.done, color: COLORS.secondary },
    ];
  }, []);

  const teamData = useMemo(() => {
    return MOCK_TEAM.map(m => ({
      name: m.name,
      tasks: m.activeTasks
    }));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Organization Overview</h1>
        <p className="text-gray-500">Monitoring real-time workflow performance across all squads.</p>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: MOCK_TASKS.length, change: '+12%', color: 'text-indigo-600' },
          { label: 'Completion Rate', value: '64%', change: '+5%', color: 'text-emerald-600' },
          { label: 'Avg. Cycle Time', value: '4.2d', change: '-10%', color: 'text-amber-600' },
          { label: 'Active Sprints', value: '3', change: '0', color: 'text-gray-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
             {taskStats.map((s, i) => (
               <div key={i} className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                 <span className="text-xs text-gray-600">{s.name} ({s.value})</span>
               </div>
             ))}
          </div>
        </div>

        {/* Team Productivity Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Tasks by Member</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="tasks" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Recent Tasks</h3>
          <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium">Assignee</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium text-right">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_TASKS.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <img src={`https://ui-avatars.com/api/?name=${task.assignee}&background=random`} className="w-6 h-6 rounded-full" alt="" />
                      <span className="text-sm text-gray-600">{task.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'done' ? 'bg-green-100 text-green-700' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'review' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    {task.priority}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">
                    {task.dueDate}
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

export default Dashboard;
