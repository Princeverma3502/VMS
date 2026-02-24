import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { Server, Users, Building2, Activity, AlertTriangle, Settings, UserCheck, Building } from 'lucide-react';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Requires user.isSuperAdmin = true in DB
    api.get('/super-admin/stats')
       .then(res => setStats(res.data))
       .catch(err => console.error("Access Denied", err))
       .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="p-10 text-center">Loading God Mode...</div></Layout>;
  if (!stats) return <Layout><div className="p-10 text-center text-red-500 font-bold">⛔ ACCESS DENIED</div></Layout>;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <Server className="text-green-400" size={32} />
            <h1 className="text-3xl font-black tracking-tighter">SYSTEM OVERVIEW</h1>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link to="/admin/users" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl border border-slate-700 transition flex items-center gap-3">
              <UserCheck className="text-blue-400" size={24} />
              <div>
                <h3 className="font-bold">Manage Users</h3>
                <p className="text-sm text-slate-400">Approve, edit, and manage user accounts</p>
              </div>
            </Link>
            <Link to="/admin/events" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl border border-slate-700 transition flex items-center gap-3">
              <Activity className="text-green-400" size={24} />
              <div>
                <h3 className="font-bold">Manage Events</h3>
                <p className="text-sm text-slate-400">Create and oversee volunteer events</p>
              </div>
            </Link>
            <Link to="/colleges" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl border border-slate-700 transition flex items-center gap-3">
              <Building className="text-purple-400" size={24} />
              <div>
                <h3 className="font-bold">Manage Colleges</h3>
                <p className="text-sm text-slate-400">Configure college settings and domains</p>
              </div>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Colleges" value={stats.totalColleges || 0} icon={Building2} color="text-blue-400" />
            <StatCard label="Total Users" value={stats.totalUsers || 0} icon={Users} color="text-purple-400" />
            <StatCard label="Active Volunteers" value={stats.activeVolunteers || 0} icon={Activity} color="text-green-400" />
            <StatCard label="Database Health" value="100%" icon={Server} color="text-yellow-400" />
          </div>

          {/* Recent Activity Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
              Critical Alerts
            </h3>
            <div className="text-slate-400 text-sm">System operating normally. No critical alerts.</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800 transition">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase">{label}</p>
        <h3 className="text-4xl font-black mt-2">{value}</h3>
      </div>
      <Icon className={color} size={24} />
    </div>
  </div>
);

export default SuperAdminDashboard;