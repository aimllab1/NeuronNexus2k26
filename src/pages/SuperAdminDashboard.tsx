import { useEffect, useState } from 'react';
import { ShieldCheck, Activity, Users, CreditCard, Bell, ShieldAlert, LogOut, Search, Trash2, Edit2, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE } from '../utils/api';
import { audioService } from '../utils/audio';

const participantCountOf = (reg: any) => {
  const direct = Number(reg?.participantCount);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const teamCount = Array.isArray(reg?.teamMembers)
    ? reg.teamMembers.filter((m: any) => String(m || '').trim()).length
    : 0;
  return 1 + teamCount;
};

const paymentPerHeadOf = (reg: any) => {
  const direct = Number(reg?.paymentPerHead);
  return Number.isFinite(direct) && direct > 0 ? direct : 100;
};

const paymentAmountOf = (reg: any) => {
  const direct = Number(reg?.paymentAmount);
  if (Number.isFinite(direct) && direct >= 0) return direct;
  return participantCountOf(reg) * paymentPerHeadOf(reg);
};

const isOpenAlert = (alert: any) => String(alert?.status || 'OPEN').toUpperCase() === 'OPEN';
const selectedEventsOf = (reg: any) => {
  const selected = Array.isArray(reg?.selectedEvents)
    ? reg.selectedEvents
        .map((selection: any) => ({
          category: String(selection?.category || '').trim(),
          event: String(selection?.event || '').trim(),
        }))
        .filter((selection: any) => selection.event)
    : [];
  if (selected.length > 0) return selected;

  const fallbackEvent = String(reg?.event || '').trim();
  if (!fallbackEvent) return [];
  return [{ category: String(reg?.category || '').trim(), event: fallbackEvent }];
};
const eventSummaryOf = (reg: any) =>
  selectedEventsOf(reg)
    .map((selection: any) => selection.event)
    .join(', ');
const primaryCategoryOf = (reg: any) => selectedEventsOf(reg)[0]?.category || String(reg?.category || '').trim();

const SuperAdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(true);
  const [isTogglingRegistration, setIsTogglingRegistration] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [overlayAlert, setOverlayAlert] = useState<any | null>(null);
  const [resolvingAlertId, setResolvingAlertId] = useState<string>('');
  const [clearingHistory, setClearingHistory] = useState(false);
  
  // Edit Modal State
  const [editingReg, setEditingReg] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: '',
    password: '',
    teamMembers: ['', '', '']
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [generatedPass, setGeneratedPass] = useState('');
  const [showManualPass, setShowManualPass] = useState(false);

  const navigate = useNavigate();
  const toArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

  const fetchData = async () => {
    try {
      const [regsRes, alertsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/registrations`),
        fetch(`${API_BASE}/api/admin/alerts`),
        fetch(`${API_BASE}/api/admin/settings/registration-status`)
      ]);
      const [regs, alts, settings] = await Promise.all([
        regsRes.json(), 
        alertsRes.json(), 
        settingsRes.json()
      ]);
      
      const safeRegs = toArray<any>(regs);
      const safeAlerts = toArray<any>(alts);
      setRegistrations(safeRegs);
      setAlerts(safeAlerts);
      if (settings.success) setIsRegistrationEnabled(settings.enabled);

      const latestOpen = safeAlerts.find((a) => isOpenAlert(a)) || null;
      setOverlayAlert(latestOpen);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const toggleRegistration = async () => {
    setIsTogglingRegistration(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/toggle-registration`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsRegistrationEnabled(data.enabled);
        audioService.playClick();
      }
    } catch (err) {
      alert('Failed to toggle registration.');
    } finally {
      setIsTogglingRegistration(false);
    }
  };

  const handleEditClick = (reg: any) => {
    const members = Array.isArray(reg.teamMembers) ? [...reg.teamMembers] : [];
    while (members.length < 3) members.push('');
    
    setEditingReg(reg);
    setEditFormData({
      fullName: reg.fullName || '',
      email: reg.email || '',
      phone: reg.phone || '',
      college: reg.college || '',
      department: reg.department || '',
      year: reg.year || '',
      password: '', // Keep password empty initially
      teamMembers: members.slice(0, 3)
    });
  };

  const handleUpdateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;

    setIsUpdating(true);
    try {
      const payload: any = { 
        ...editFormData,
        teamMembers: editFormData.teamMembers.map(m => m.trim()).filter(Boolean)
      };
      // Only include password if it's not empty
      if (!payload.password) delete payload.password;

      const response = await fetch(`${API_BASE}/api/admin/update-registration/${editingReg._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setEditingReg(null);
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Update failed.');
      }
    } catch (err) {
      alert('Network error during update.');
    } finally {
      setIsUpdating(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    if (!alertId) return;
    try {
      setResolvingAlertId(alertId);
      const response = await fetch(`${API_BASE}/api/admin/alerts/${alertId}/resolve`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        alert(errData?.message || 'Failed to clear emergency alert.');
        return;
      }
      await fetchData();
    } catch (err) {
      alert('Failed to clear emergency alert.');
    } finally {
      setResolvingAlertId('');
    }
  };

  const clearAlertHistory = async () => {
    const shouldClear = window.confirm('Clear all emergency alert history? This cannot be undone.');
    if (!shouldClear) return;
    try {
      setClearingHistory(true);
      const response = await fetch(`${API_BASE}/api/admin/alerts/history`, { method: 'DELETE' });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        alert(errData?.message || 'Failed to clear alert history.');
        return;
      }
      await fetchData();
    } catch (err) {
      alert('Failed to clear alert history.');
    } finally {
      setClearingHistory(false);
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!window.confirm("ARE YOU SURE? This will permanently delete the participant's data.")) return;
    try {
      const response = await fetch(`${API_BASE}/api/admin/delete-registration/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) fetchData();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  useEffect(() => {
    if (overlayAlert) {
      audioService.startAlarm();
    } else {
      audioService.stopAlarm();
    }
    return () => audioService.stopAlarm();
  }, [overlayAlert]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: registrations.length,
    participants: registrations.reduce((sum, r) => sum + participantCountOf(r), 0),
    paid: registrations.filter((r) => r.isPaid).length,
    paidAmount: registrations.filter((r) => r.isPaid).reduce((sum, r) => sum + paymentAmountOf(r), 0),
    attendance: registrations.filter((r) => r.attendance).length,
    openAlerts: alerts.filter((a) => isOpenAlert(a)).length,
  };

  const filtered = registrations.filter(r => 
    String(r?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(r?.ticketId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const latestAlerts = alerts.slice(0, 8);

  return (
    <div className="flex flex-col md:flex-row h-screen text-white overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-space-900/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center z-[50] mt-16">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-tech-cyan" size={20} />
          <span className="text-lg font-black tracking-tighter uppercase font-mono">APEC <span className="text-tech-cyan">HUB</span></span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white">
          <Activity size={24} />
        </button>
      </div>
      {overlayAlert && (
        <div className="fixed inset-0 z-[120] bg-red-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-3xl rounded-3xl border-2 border-red-300/80 bg-red-900/40 shadow-[0_0_80px_rgba(239,68,68,0.55)] p-8 md:p-10 animate-pulse">
            <div className="text-center mb-8">
              <div className="text-[11px] tracking-[0.35em] font-black uppercase text-red-200">Emergency Signal</div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-red-100 mt-3">Immediate Action Required</h2>
            </div>
            <div className="bg-black/25 border border-red-200/30 rounded-2xl p-5 space-y-3">
              <div className="text-sm uppercase tracking-widest text-red-100 font-black">
                Event: {overlayAlert?.event || 'Unknown Event'}
              </div>
              <div className="text-xs uppercase tracking-wider text-red-200/90">
                Triggered By: {overlayAlert?.triggeredBy || 'Coordinator'}
              </div>
              <div className="text-xs uppercase tracking-wider text-red-200/90">
                Time: {overlayAlert?.date ? new Date(overlayAlert.date).toLocaleString() : '-'}
              </div>
              <p className="text-white text-base md:text-lg font-bold leading-relaxed">
                {overlayAlert?.message || 'Emergency reported by coordinator.'}
              </p>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => resolveAlert(String(overlayAlert?._id || ''))}
                disabled={resolvingAlertId === String(overlayAlert?._id || '')}
                className="px-8 py-4 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest shadow-[0_0_25px_rgba(239,68,68,0.45)] transition-all"
              >
                {resolvingAlertId === String(overlayAlert?._id || '') ? 'Clearing...' : 'Mark Safe / Clear Alert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HUD Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 border-r border-white/10 flex flex-col p-6 bg-space-900/95 backdrop-blur-xl shrink-0 z-[60] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="p-2 border border-tech-cyan/50 rounded-lg bg-tech-cyan/10 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <ShieldCheck className="text-tech-cyan" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase font-mono">APEC <span className="text-tech-cyan">HUB</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-grow space-y-2">
          <AdminNavLink icon={<Activity size={18}/>} label="Dashboard" to="/admin-control-pannel-5" active />
          <AdminNavLink icon={<CreditCard size={18}/>} label="Payments" to="/admin-control-pannel-1" />
          <AdminNavLink icon={<Users size={18}/>} label="Attendance" to="/admin-control-pannel-2" />
          <AdminNavLink icon={<ShieldAlert size={18}/>} label="Coordinators" to="/coordinator-panel-3" />
        </nav>

        <button onClick={() => { localStorage.removeItem('super_admin_session'); localStorage.removeItem('admin_session'); localStorage.removeItem('admin_user'); navigate('/login'); }} className="mt-auto flex items-center gap-2 text-slate-500 hover:text-white transition-all text-sm font-bold p-3 rounded-xl border border-transparent hover:border-white/10">
          <LogOut size={18} /> EXIT HUD
        </button>
      </aside>

      {/* Main Command Center */}
      <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">CENTRAL <span className="text-tech-cyan">COMMAND</span></h1>
            <p className="text-[10px] md:text-xs text-slate-500 uppercase font-mono tracking-widest mt-1">Neuron Nexus 2026 MASTER CONTROL PANEL</p>
          </div>
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-4 items-center">
             {/* Registration Toggle */}
             <button
               onClick={toggleRegistration}
               disabled={isTogglingRegistration}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${isRegistrationEnabled ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'}`}
             >
               <div className={`w-2 h-2 rounded-full ${isRegistrationEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
               REGISTRATION: {isRegistrationEnabled ? 'OPEN' : 'CLOSED'}
             </button>

             <div className="relative flex-grow md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  placeholder="SEARCH PARTICIPANTS..."
                  className="w-full bg-space-900/80 border border-white/10 rounded-xl p-2 pl-10 text-xs text-white outline-none focus:border-tech-cyan transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 mb-12">
          <StatPanel label="USERS" value={stats.total} color="border-white/10" icon={<Users size={16} />} />
          <StatPanel label="HEADS" value={stats.participants} color="border-white/10" icon={<Users size={16} />} />
          <StatPanel label="REVENUE" value={`₹${stats.paidAmount}`} color="border-tech-cyan/30 text-tech-cyan" icon={<CreditCard size={16} />} />
          <StatPanel label="ON-SITE" value={stats.attendance} color="border-green-500/20 text-green-500" icon={<UserCheck size={16} />} />
          <StatPanel
            label="ALERTS"
            value={stats.openAlerts}
            color={stats.openAlerts > 0 ? 'border-red-500/50 shadow-red-500/20' : 'border-white/5 opacity-50'}
            icon={<Bell size={16} />}
            critical={stats.openAlerts > 0}
          />
        </div>

        <div className="mb-10 bg-space-900/50 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black tracking-widest uppercase text-red-400">Emergency Alerts</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Latest {latestAlerts.length}</span>
              <button
                onClick={clearAlertHistory}
                disabled={clearingHistory || alerts.length === 0}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/35 hover:bg-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-red-200 text-[10px] font-black uppercase tracking-wider transition-all"
              >
                {clearingHistory ? 'Clearing...' : 'Clear History'}
              </button>
            </div>
          </div>
          {latestAlerts.length === 0 ? (
            <div className="text-xs text-slate-500 uppercase tracking-wider">No active alerts.</div>
          ) : (
            <div className="space-y-3">
              {latestAlerts.map((a: any) => (
                <div key={a._id} className="p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-1 rounded border border-red-500/30 text-red-300 font-black uppercase tracking-wider">
                      {a.event || 'Unknown Event'}
                    </span>
                    <span className={`text-[10px] px-2 py-1 rounded border font-black uppercase tracking-wider ${isOpenAlert(a) ? 'border-red-500/40 text-red-300' : 'border-green-500/40 text-green-300'}`}>
                      {isOpenAlert(a) ? 'OPEN' : 'RESOLVED'}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      By {a.triggeredBy || 'Coordinator'}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {a.date ? new Date(a.date).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-white/90">{a.message}</p>
                  {isOpenAlert(a) && (
                    <button
                      onClick={() => resolveAlert(String(a._id || ''))}
                      disabled={resolvingAlertId === String(a._id || '')}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-200 text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      {resolvingAlertId === String(a._id || '') ? 'Clearing...' : 'Clear Alert'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-space-900/50 border border-white/10 rounded-2xl md:rounded-3xl overflow-x-auto backdrop-blur-md">
           <table className="min-w-[800px] w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-slate-500 uppercase tracking-widest font-mono">
                  <th className="p-4">Ticket / Pass</th>
                  <th className="p-4">Name / College / Dept</th>
                  <th className="p-4">Event</th>
                  <th className="p-4 text-center">Rounds</th>
                  <th className="p-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((reg) => (
                  <tr key={reg._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="text-tech-cyan font-black mb-1 tracking-tighter">{reg.ticketId}</div>
                      <div className="text-[9px] text-slate-600 uppercase font-mono tracking-tighter">Login: {reg.email}</div>
                    </td>
                    <td className="p-4">
                       <div className="font-bold text-white mb-1 uppercase tracking-tight">{reg.fullName}</div>
                       <div className="text-[10px] text-slate-500 uppercase leading-none">{reg.college}</div>
                       <div className="text-[9px] text-tech-blue/80 uppercase font-mono mt-1">{reg.department} | YEAR {reg.year}</div>
                    </td>
                    <td className="p-4">
                       <div className={`text-[9px] font-black px-2 py-0.5 rounded border mb-1 inline-block ${primaryCategoryOf(reg) === 'Technical' ? 'border-tech-blue/20 text-tech-blue' : 'border-purple-500/20 text-purple-400'}`}>
                         {primaryCategoryOf(reg) || 'Category'}
                       </div>
                       <div className="text-white font-bold">{eventSummaryOf(reg) || 'No event selected'}</div>
                    </td>
                    <td className="p-4 text-center">
                       <div className="inline-flex gap-1">
                         {[1,2,3].map(r => (
                           <div key={r} className={`w-5 h-5 rounded flex items-center justify-center font-black border text-[8px] ${reg.currentRound >= r ? 'bg-tech-cyan/20 border-tech-cyan/40 text-tech-cyan' : 'bg-white/5 border-white/10 text-slate-700'}`}>
                             {r}
                           </div>
                         ))}
                       </div>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(reg)}
                            className="p-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg hover:border-tech-cyan hover:text-tech-cyan transition-all"
                          >
                             <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => deleteRegistration(reg._id)}
                            className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </main>

      {/* Edit Participant Modal */}
      {editingReg && (
        <div className="fixed inset-0 z-[150] bg-space-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-space-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl my-8"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Edit Participant</h2>
                <p className="text-[10px] text-tech-cyan font-mono uppercase tracking-widest">{editingReg.ticketId}</p>
              </div>
              <button onClick={() => setEditingReg(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateRegistration} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditInput 
                  label="Full Name" 
                  value={editFormData.fullName} 
                  onChange={(v: string) => setEditFormData(p => ({...p, fullName: v}))} 
                />
                <EditInput 
                  label="Email (Login)" 
                  value={editFormData.email} 
                  onChange={(v: string) => setEditFormData(p => ({...p, email: v}))} 
                />
                <EditInput 
                  label="Phone" 
                  value={editFormData.phone} 
                  onChange={(v: string) => setEditFormData(p => ({...p, phone: v}))} 
                />
                <EditInput 
                  label="College" 
                  value={editFormData.college} 
                  onChange={(v: string) => setEditFormData(p => ({...p, college: v}))} 
                />
                <EditInput 
                  label="Department" 
                  value={editFormData.department} 
                  onChange={(v: string) => setEditFormData(p => ({...p, department: v}))} 
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Year</label>
                  <select
                    className="bg-space-950 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-tech-cyan transition-all appearance-none"
                    value={editFormData.year}
                    onChange={(e) => setEditFormData(p => ({...p, year: e.target.value}))}
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {editFormData.teamMembers.map((m, i) => (
                    <EditInput 
                      key={i}
                      label={`Member ${i+1}`}
                      value={m}
                      onChange={(v: string) => {
                        const newM = [...editFormData.teamMembers];
                        newM[i] = v;
                        setEditFormData(p => ({...p, teamMembers: newM}));
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Security Terminal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reset Section */}
                  <div className="bg-space-950 border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-full">
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Generated Passkey</p>
                      <p className={`text-sm font-mono font-bold ${generatedPass ? 'text-tech-cyan' : 'text-slate-700 italic'}`}>
                        {generatedPass || 'NOT GENERATED'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm("GENERATE NEW ACCESS KEY? This will overwrite the current password.")) return;
                        audioService.playClick();
                        try {
                          const res = await fetch(`${API_BASE}/api/admin/reset-password/${editingReg._id}`, { method: 'PATCH' });
                          const data = await res.json();
                          if (!res.ok) {
                            alert(data.message || 'Reset failed.');
                          } else if (data.success) {
                            setGeneratedPass(data.newPassword);
                          }
                        } catch (err) { alert("Reset failed."); }
                      }}
                      className="mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-space-950 transition-all"
                    >
                      Reset & Generate
                    </button>
                  </div>

                  {/* Manual Set Section */}
                  <div className="bg-space-950 border border-white/5 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Manual Override</label>
                      <button 
                        type="button"
                        onClick={() => setShowManualPass(!showManualPass)}
                        className="text-[8px] text-tech-cyan uppercase font-bold hover:underline"
                      >
                        {showManualPass ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input 
                      type={showManualPass ? "text" : "password"}
                      placeholder="Enter specific key..."
                      className="w-full bg-space-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-tech-cyan transition-all"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData(p => ({...p, password: e.target.value}))}
                    />
                    <p className="text-[8px] text-slate-600 mt-2 italic leading-tight">Setting this will override both generated and existing keys on save.</p>
                  </div>
                </div>
                
                <p className="text-[9px] text-slate-500 mt-4 ml-1 italic">* Security Note: All passkeys are encrypted after saving. Only the person who sets or resets them can see them in plain text during the current session.</p>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingReg(null)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-6 py-3 rounded-xl bg-tech-cyan text-space-950 font-black text-xs uppercase tracking-widest hover:bg-tech-cyan/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const EditInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">{label}</label>
    <input
      type={type}
      className="bg-space-950 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-tech-cyan transition-all"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const AdminNavLink = ({ icon, label, to, active }: any) => (
  <NavLink 
    to={to} 
    onMouseEnter={() => audioService.playHover()}
    onClick={() => audioService.playClick()}
    className={`flex items-center gap-3 p-4 rounded-xl transition-all font-bold text-sm ${active ? 'bg-tech-cyan/10 border border-tech-cyan/20 text-tech-cyan shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
  >
    {icon} {label}
  </NavLink>
);

const StatPanel = ({ label, value, icon, color, critical }: any) => (
  <div className={`p-6 rounded-3xl bg-space-950/80 backdrop-blur-md border transition-all ${color}`}>
    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-4 ${critical ? 'text-red-500' : 'opacity-60'}`}>
      {icon} {label}
    </div>
    <div className={`text-3xl font-black ${critical ? 'animate-pulse' : 'text-white'}`}>{value}</div>
  </div>
);

const UserCheck = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
);

export default SuperAdminDashboard;
