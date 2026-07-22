import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Lock, 
  Unlock,
  Key, 
  UserPlus, 
  Activity, 
  CheckCircle2, 
  ShieldAlert,
  Clock,
  Fingerprint,
  Sparkles,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { TeamMember } from '../types';
import { registerPasskey, authenticatePasskey, PasskeyCredential } from '../lib/webauthn';

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
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null);

  const [registeredPasskeys, setRegisteredPasskeys] = useState<PasskeyCredential[]>([
    {
      id: 'passkey-alex-macbook',
      rawId: '0a8f93e211b4',
      type: 'public-key',
      userEmail: activeMember.email,
      registeredAt: '2026-07-21 14:30',
      authenticatorName: 'MacBook Pro TouchID Sensor',
      biometricType: 'TouchID',
    },
    {
      id: 'passkey-alex-pixel',
      rawId: '7f2e10a984c1',
      type: 'public-key',
      userEmail: activeMember.email,
      registeredAt: '2026-07-18 09:15',
      authenticatorName: 'Android Biometric Fingerprint / FaceID',
      biometricType: 'Fingerprint' as any,
    },
  ]);

  const activityLogs = [
    { id: 'log-1', user: 'Alex Mercer', action: 'Approved $7,800 purchase for Base Set 1st Ed Charizard', time: '14 mins ago' },
    { id: 'log-2', user: 'Samantha Lee', action: 'Created new price drop alert for Umbreon VMAX PSA 10', time: '1 hour ago' },
    { id: 'log-3', user: 'Devon Wright', action: 'Exported CSV Inventory Tax Report for Q2 2026', time: '3 hours ago' },
  ];

  const handleRegisterNewPasskey = async () => {
    setIsRegistering(true);
    setAuthStatusMessage('Scan FaceID or Fingerprint on device...');

    const res = await registerPasskey(activeMember.name, activeMember.email);

    if (res.success && res.credential) {
      setRegisteredPasskeys(prev => [res.credential!, ...prev]);
      setAuthStatusMessage('✅ WebAuthn Passkey Registered Successfully!');
    } else {
      setAuthStatusMessage(`❌ Registration failed: ${res.error || 'User cancelled'}`);
    }

    setIsRegistering(false);
    setTimeout(() => setAuthStatusMessage(null), 4000);
  };

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    setAuthStatusMessage('Verifying Biometric Credential via WebAuthn API...');

    const res = await authenticatePasskey();

    if (res.success) {
      setIsLocked(false);
      setAuthStatusMessage('✅ Biometric Sign-In Verified! Vault Unlocked.');
    } else {
      setAuthStatusMessage('❌ Biometric verification failed.');
    }

    setIsAuthenticating(false);
    setTimeout(() => setAuthStatusMessage(null), 3000);
  };

  if (isLocked) {
    return (
      <div className="min-h-[450px] bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-2xl relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
          <Fingerprint className="w-10 h-10 animate-pulse" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Team Vault Protected by Biometric Passkey
          </h2>
          <p className="text-xs text-slate-400 max-w-md mt-1">
            WebAuthn &amp; Credential Management API active. Authenticate with Face ID, Touch ID, or Android Biometrics to access sensitive portfolio data.
          </p>
        </div>

        {authStatusMessage && (
          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-xs text-amber-300 font-mono">
            {authStatusMessage}
          </div>
        )}

        <button
          onClick={handleAuthenticate}
          disabled={isAuthenticating}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 hover:opacity-90 text-slate-950 font-extrabold text-xs shadow-xl flex items-center space-x-2 transition-all transform hover:scale-105"
        >
          {isAuthenticating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Fingerprint className="w-4 h-4" />
          )}
          <span>{isAuthenticating ? 'Scanning Biometrics...' : 'Sign In with TouchID / FaceID'}</span>
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
              <span>Multi-User Syndicate &amp; Access Permissions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Team Vault &amp; Audit Security Logs
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Collaborate with traders and analysts with role-based permissions, purchase approval workflows, and WebAuthn Biometric Passkeys.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRegisterNewPasskey}
              disabled={isRegistering}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>{isRegistering ? 'Scanning...' : 'Register Passkey'}</span>
            </button>

            <button
              onClick={() => setIsLocked(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Lock Vault with Biometrics"
            >
              <Lock className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {authStatusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-emerald-800 text-xs text-emerald-400 font-medium">
            {authStatusMessage}
          </div>
        )}
      </div>

      {/* WebAuthn Credentials Management Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
            Active WebAuthn Biometric Credentials
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {registeredPasskeys.length} Registered Passkey Hardware Devices
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {registeredPasskeys.map((pk) => (
            <div key={pk.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{pk.authenticatorName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">ID: {pk.rawId} • {pk.registeredAt}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </div>
          ))}
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
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
                  }}
                  className="w-12 h-12 rounded-full border border-slate-700 object-cover"
                />
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
          Audit Security &amp; Workflow Activity Log
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
