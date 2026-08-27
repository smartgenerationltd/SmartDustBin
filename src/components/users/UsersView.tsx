import React, { useState } from 'react';
import { useSmartBin } from '../../context/SmartBinContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole } from '../../types';
import {
  Users,
  ShieldCheck,
  Plus,
  Mail,
  Phone,
  CheckCircle,
  Key,
  Sliders,
  Check,
  X,
  UserPlus,
  Building,
  MapPin,
  Trash2,
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users } = useSmartBin();
  const { userProfile, role: currentRole, loginWithDemoRole, signUp, hasRole } = useAuth();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Password123!SG');
  const [newRole, setNewRole] = useState<UserRole>('OPERATOR');
  const [newOrg, setNewOrg] = useState('City of Kigali Waste Command');
  const [newPhone, setNewPhone] = useState('+250 788 ');
  const [newZone, setNewZone] = useState('Gasabo Sector');

  const permissionsMatrix = [
    { module: 'Dashboard & Live Telemetry', admin: true, op: true, col: true, ad: true, view: true },
    { module: 'Station Diagnostics & Self-Test', admin: true, op: true, col: false, ad: false, view: false },
    { module: 'Collector Dispatch & Schedule', admin: true, op: true, col: false, ad: false, view: false },
    { module: 'Mark Clearance & Reset Sensors', admin: true, op: true, col: true, ad: false, view: false },
    { module: 'Upper LED Campaign Management', admin: true, op: false, col: false, ad: true, view: false },
    { module: 'AI Operations & Vision Sorter', admin: true, op: true, col: true, ad: true, view: true },
    { module: 'ESP32 Ingestion & Firebase Schemas', admin: true, op: true, col: false, ad: false, view: false },
    { module: 'Manage Users & Role Provisioning', admin: true, op: false, col: false, ad: false, view: false },
  ];

  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'ALL') return true;
    return u.role === roleFilter;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    await signUp({
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole,
      organization: newOrg,
      phone: newPhone,
      assignedZone: newZone,
    });

    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
  };

  return (
    <div id="users-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Role-Based Access Control (RBAC) &amp; Users
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono text-xs font-bold border border-slate-700">
              Active Role: {currentRole}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage administrative operators, route collectors, digital advertisers, and municipal auditors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Role Switcher Simulation */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <span className="text-[11px] text-slate-400 px-2 font-mono hidden md:inline">Switch Role:</span>
            {(['ADMIN', 'OPERATOR', 'COLLECTOR', 'ADVERTISER', 'VIEWER'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => loginWithDemoRole(r)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] transition-colors cursor-pointer ${
                  currentRole === r
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {hasRole(['ADMIN']) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['ALL', 'ADMIN', 'OPERATOR', 'COLLECTOR', 'ADVERTISER', 'VIEWER'].map((f) => (
          <button
            key={f}
            onClick={() => setRoleFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
              roleFilter === f
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const isMe = u.id === userProfile?.id || u.email === userProfile?.email;

          return (
            <div
              key={u.id}
              className={`bg-slate-900 border ${
                isMe ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : 'border-slate-800'
              } rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'}
                      alt={u.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-white">{u.name}</h3>
                        {isMe && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-block mt-0.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : u.role === 'OPERATOR'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            : u.role === 'COLLECTOR'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : u.role === 'ADVERTISER'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mt-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  {u.organization && (
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{u.organization}</span>
                    </div>
                  )}
                  {u.phone && (
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{u.phone}</span>
                    </div>
                  )}
                  {(u.assignedZone || u.assignedDistrict) && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{u.assignedZone || u.assignedDistrict}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  {u.status === 'ACTIVE' ? '● Active' : '○ Inactive'}
                </span>
                <button
                  onClick={() => loginWithDemoRole(u.role)}
                  className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Test As Role</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Granular Role Permission Boundaries (RBAC Matrix)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict RBAC enforcement aligning with municipal data privacy, collector assignment isolation, and ad portal boundaries.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">System Capability</th>
                <th className="px-4 py-3 text-center">ADMIN</th>
                <th className="px-4 py-3 text-center">OPERATOR</th>
                <th className="px-4 py-3 text-center">COLLECTOR</th>
                <th className="px-4 py-3 text-center">ADVERTISER</th>
                <th className="px-4 py-3 text-center">VIEWER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-center">
              {permissionsMatrix.map((p, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-left font-sans font-semibold text-white">
                    {p.module}
                  </td>
                  <td className="px-4 py-3">
                    {p.admin ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="px-4 py-3">
                    {p.op ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="px-4 py-3">
                    {p.col ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="px-4 py-3">
                    {p.ad ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="px-4 py-3">
                    {p.view ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0F17] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                Register New Enterprise User
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Diane Uwase"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Work Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="d.uwase@kigalicity.gov.rw"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="OPERATOR">OPERATOR</option>
                    <option value="COLLECTOR">COLLECTOR</option>
                    <option value="ADVERTISER">ADVERTISER</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Organization</label>
                <input
                  type="text"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Assigned Zone / Route</label>
                <input
                  type="text"
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  placeholder="e.g. Nyarugenge Central Route"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 cursor-pointer"
                >
                  Save to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
