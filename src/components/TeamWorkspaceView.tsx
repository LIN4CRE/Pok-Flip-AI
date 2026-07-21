import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Lock, 
  Key, 
  UserPlus, 
  Activity, 
  CheckCircle2, 
  ShieldAlert,
  Clock
} from 'lucide-react';
import { TeamMember } from '../types';

interface TeamWorkspaceViewProps {
  teamMembers: TeamMember[];
  activeMember: TeamMember;
  onSwitchMember: (member: TeamMember) => void;
}

export const TeamWorkspaceView: React.FC<TeamWorkspaceViewProps> = ({
  teamMembers,
  activeMember,
  onSwitchMember,
}) => {
  const [isPasskeyEnabled, setIsPasskeyEnabled] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const activityLogs = [
    { id: 'log-1', user: 'Alex Mercer', action: 'Approved $7,800 purchase for Base Set 1st Ed Charizard', time: '14 mins ago' },
    { id: 'log-2', user: 'Samantha Lee', action: 'Created new price drop alert for Umbreon VMAX PSA 10', time: '1 hour ago' },
    { id: 'log-3', user: 'Devon Wright', action: 'Exported CSV Inventory Tax Report for Q2 2026', time: '3 hours ago' },
  ];

  if (isLocked) {
    return (
      <div className="min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Team Vault Protected by Biometric Passkey</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Simulated WebAuthn / Passkey encryption active. Scan fingerprint or Face ID to unlock team workspace.
        </p>
        <button
          onClick={() => setIsLocked(false)}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg"
        >
          Authenticate Passkey / Biometrics
        </button>
      </div>
    );
  }

  return (
    <div id="team-workspace-container" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Multi-User Syndicate & Access Permissions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Team Vault & Audit Security Logs
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Collaborate with traders and analysts with role-based permissions, purchase approval workflows, and Passkey security.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPasskeyEnabled(!isPasskeyEnabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border ${
                isPasskeyEnabled
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Passkey: {isPasskeyEnabled ? 'Active' : 'Off'}</span>
            </button>

            <button
              onClick={() => setIsLocked(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Lock Vault"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {teamMembers.map((member) => {
          const isActive = member.id === activeMember.id;
          return (
            <div
              key={member.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all ${
                isActive ? 'border-amber-500/80 bg-slate-900/90' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-full border border-slate-700 object-cover" />
                <div>
                  <div className="font-bold text-white text-sm">{member.name}</div>
                  <div className="text-xs text-amber-400 font-medium">{member.role}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{member.email}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Deals Reviewed: <strong className="text-white">{member.dealsReviewedCount}</strong></span>
                {!isActive && (
                  <button
                    onClick={() => onSwitchMember(member)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                  >
                    Switch Workspace
                  </button>
                )}
                {isActive && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Current Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center">
          <Activity className="w-4 h-4 mr-2 text-indigo-400" />
          Audit Security & Workflow Activity Log
        </h3>
        <div className="space-y-2 text-xs">
          {activityLogs.map((log) => (
            <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-400">{log.user}: </span>
                <span className="text-slate-300">{log.action}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
