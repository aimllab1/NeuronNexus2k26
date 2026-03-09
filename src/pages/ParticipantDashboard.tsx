import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Edit2, Save, X, CheckCircle2, Clock, LogOut, LayoutDashboard, AlertTriangle, Smartphone, QrCode, MessageCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/api';
import { audioService } from '../utils/audio';
import BrandHeader from '../components/BrandHeader';

const ParticipantDashboard = () => {
  const UPI_ID = 'gxwr1.wallet@phonepe';
  const PAYMENT_WHATSAPP = '919486202263';
  const [participant, setParticipant] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [showQr, setShowQr] = useState(false);
  const paymentPanelRef = useRef<HTMLDivElement | null>(null);
  const [editData, setEditData] = useState({
    fullName: '',
    phone: '',
    college: '',
    department: '',
    year: '',
    teamMembers: ['', '', ''],
  });

  // Track which event's progress we are looking at
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem('participant_id');

  const fetchProfile = async (syncEditState = false) => {
    if (!userId) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/participant/${userId}`);
      const data = await res.json();
      if (!res.ok || data?.success === false) return;
      setParticipant(data);
      if (syncEditState && !isEditing) {
        const normalizedMembers = Array.isArray(data.teamMembers) ? [...data.teamMembers] : [];
        while (normalizedMembers.length < 3) normalizedMembers.push('');
        setEditData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          college: data.college || '',
          department: data.department || '',
          year: data.year || '',
          teamMembers: normalizedMembers.slice(0, 3),
        });
      }
      if (!data.isPasswordChanged) setShowPassModal(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile(true);
    const interval = window.setInterval(() => fetchProfile(false), 10000);
    return () => window.clearInterval(interval);
  }, [userId]);

  const handleUpdatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return alert("Passwords don't match");
    try {
      const res = await fetch(`${API_BASE}/api/participant/update-password/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: passData.new })
      });
      if (res.ok) {
        alert("Password updated successfully!");
        setShowPassModal(false);
        fetchProfile();
      }
    } catch (err) { alert("Failed to update password."); }
  };

  const handleSaveProfile = async () => {
    if (!editData.fullName.trim()) {
      alert('Full name cannot be empty.');
      return;
    }
    const teamPayload = participant?.isPaid
      ? (Array.isArray(participant?.teamMembers) ? participant.teamMembers : [])
      : editData.teamMembers.map((m) => m.trim()).filter(Boolean);
    try {
      const res = await fetch(`${API_BASE}/api/participant/update-profile/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editData.fullName.trim(),
          phone: editData.phone.trim(),
          college: editData.college.trim(),
          department: editData.department.trim(),
          year: editData.year.trim(),
          teamMembers: teamPayload,
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.participant) setParticipant(data.participant);
        setIsEditing(false);
        fetchProfile(true);
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.message || 'Failed to update profile.');
      }
    } catch (err) { alert("Failed to update profile."); }
  };

  const handleLogout = () => {
    localStorage.removeItem('participant_id');
    navigate('/login');
  };

  if (loading) return <div className="pt-40 text-center font-mono text-tech-cyan animate-pulse">SYNCHRONIZING SECURE UPLINK...</div>;

  const participantCount = Number(participant?.participantCount) > 0
    ? Number(participant.participantCount)
    : 1 + (Array.isArray(participant?.teamMembers)
      ? participant.teamMembers.filter((m: any) => String(m || '').trim()).length
      : 0);
  const paymentPerHead = Number(participant?.paymentPerHead) > 0 ? Number(participant.paymentPerHead) : 100;
  const paymentAmount = Number(participant?.paymentAmount) >= 0
    ? Number(participant.paymentAmount)
    : participantCount * paymentPerHead;
  const isTeamLocked = Boolean(participant?.isPaid);
  
  const selectedEventsList = Array.isArray(participant?.selectedEvents) && participant.selectedEvents.length > 0
    ? participant.selectedEvents
        .map((selection: any) => ({
          category: String(selection?.category || '').trim(),
          event: String(selection?.event || '').trim(),
        }))
        .filter((selection: any) => selection.event)
    : (participant?.event
      ? [{ category: String(participant?.category || '').trim(), event: String(participant.event).trim() }]
      : []);

  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('Neural Nexus 2026')}&am=${encodeURIComponent(String(paymentAmount))}&cu=INR&tn=${encodeURIComponent(`Registration Fee ${participant?.ticketId || ''}`)}`;
  const whatsappProofLink = `https://wa.me/${PAYMENT_WHATSAPP}?text=${encodeURIComponent(
    `Hello Team Neural Nexus 2026,\n\nI have completed payment.\nName: ${participant?.fullName || ''}\nTicket ID: ${participant?.ticketId || ''}\nAmount: Rs.${paymentAmount}\nUPI ID: ${UPI_ID}\n\nPlease verify payment.`
  )}`;

  const activeEvent = selectedEventsList[activeEventIndex];
  const progressData = participant?.eventProgress?.[activeEvent?.event] || { round: 1, scores: [0, 0, 0] };
  const currentRound = progressData.round || 1;
  const scores = progressData.scores || [0, 0, 0];

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-6xl mx-auto min-h-screen">
      <BrandHeader />
      
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-tech-cyan/10 border border-tech-cyan/30 text-tech-cyan text-[10px] font-black rounded-full mb-3 uppercase tracking-widest">
            <LayoutDashboard size={14} /> Participant Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase">
            {participant.fullName.split(' ')[0]} <span className="text-tech-cyan">Terminal</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-mono tracking-[0.2em] uppercase mt-1 opacity-70">
            Secure ID: {participant.ticketId}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { handleLogout(); audioService.playClick(); }}
            onMouseEnter={() => audioService.playHover()}
            className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-all font-bold text-[10px] uppercase tracking-widest bg-white/5 p-2 px-4 rounded-xl border border-white/5"
          >
             <LogOut size={16} /> Exit
          </button>
        </div>
      </div>

      {/* Payment Notification */}
      {!participant?.isPaid && (
        <div ref={paymentPanelRef} className="mb-8 rounded-[2rem] border border-amber-400/20 bg-amber-500/5 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">Fee Verification Required</h3>
                <p className="text-sm text-amber-200/70 font-medium">
                  Total Payable: <span className="font-black text-white">Rs.{paymentAmount}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={upiLink}
                onClick={() => audioService.playClick()}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-tech-cyan text-space-950 font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-neon"
              >
                <Smartphone size={16} /> Pay via UPI
              </a>
              <button
                onClick={() => { setShowQr(!showQr); audioService.playClick(); }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <QrCode size={16} /> {showQr ? 'Hide' : 'QR'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showQr && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-6 flex flex-col items-center border-t border-white/5 pt-6"
              >
                <div className="p-4 bg-white rounded-2xl">
                  <img src="https://uploads.onecompiler.io/44fjqfzxs/44fjqgf4u/icon.png" alt="UPI QR" className="w-48 h-48" />
                </div>
                <p className="mt-4 text-[10px] text-slate-500 font-mono uppercase tracking-widest">Scan to Pay: {UPI_ID}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-medium italic">After payment, send the screenshot on WhatsApp for verification.</p>
            <a
              href={whatsappProofLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audioService.playClick()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 font-black text-[10px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all"
            >
              <MessageCircle size={14} /> Verify via WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Event Progress & Selection */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Event Selection Tabs */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
            <h3 className="text-xs font-black text-tech-cyan uppercase tracking-widest mb-6 flex items-center gap-2">
              <Star size={16}/> Select Event to View Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedEventsList.map((evt: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => { setActiveEventIndex(idx); audioService.playClick(); }}
                  onMouseEnter={() => audioService.playHover()}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${activeEventIndex === idx ? 'bg-tech-cyan/10 border-tech-cyan/40 shadow-neon' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                >
                  <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${activeEventIndex === idx ? 'text-tech-cyan' : 'text-slate-500'}`}>
                    {evt.category}
                  </div>
                  <div className={`text-sm font-bold truncate ${activeEventIndex === idx ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {evt.event}
                  </div>
                  {activeEventIndex === idx && (
                    <motion.div layoutId="active-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-tech-cyan" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    {activeEvent?.event || 'Seminar Event'}
                  </h3>
                  <p className="text-xs text-tech-cyan font-bold uppercase tracking-widest mt-1 opacity-70">
                    Current Progress: Round {currentRound}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${participant.attendance ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                  {participant.attendance ? 'Checked-In' : 'Arrival Pending'}
                </div>
              </div>

              {/* Rounds Progress Bar */}
              <div className="grid grid-cols-3 gap-4 mb-12">
                {[1, 2, 3].map((r) => {
                  const isCurrent = currentRound === r;
                  const isCompleted = currentRound > r;
                  
                  return (
                    <div key={r} className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className={isCompleted ? 'text-green-400' : isCurrent ? 'text-tech-cyan' : 'text-slate-600'}>
                          Round {r}
                        </span>
                        {isCompleted && <CheckCircle2 size={12} className="text-green-400" />}
                      </div>
                      <div className={`h-2.5 rounded-full border transition-all duration-700 ${isCompleted ? 'bg-green-500/40 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : isCurrent ? 'bg-tech-cyan/40 border-tech-cyan/20 shadow-neon' : 'bg-white/5 border-white/5'}`}></div>
                    </div>
                  );
                })}
              </div>

              {/* Score breakdown for selected event */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((r, i) => {
                  const score = scores?.[i] || 0;
                  return (
                    <div key={r} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Round {r} Score</span>
                      <span className="text-2xl font-black text-white">{score}</span>
                      <span className="text-[9px] font-bold text-tech-cyan/50 uppercase mt-1">Points</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Visual background element */}
            <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
              <NeuralLogo size={240} />
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Info */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Profile Details */}
          <div className={`bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md transition-all ${isEditing ? 'ring-2 ring-tech-cyan/30' : ''}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <User size={16}/> Team Details
              </h3>
              <button 
                onClick={() => { setIsEditing(!isEditing); audioService.playClick(); }}
                onMouseEnter={() => audioService.playHover()}
                className={`p-2 rounded-xl transition-all ${isEditing ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-tech-cyan/50 hover:text-white'}`}
                title={isEditing ? "Close Editor" : "Edit Profile"}
              >
                {isEditing ? <X size={16}/> : <Edit2 size={16}/>}
              </button>
            </div>

            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      className="w-full bg-space-950 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-tech-cyan transition-all"
                      value={editData.fullName}
                      onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">College</label>
                    <input 
                      className="w-full bg-space-950 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-tech-cyan transition-all"
                      value={editData.college}
                      onChange={(e) => setEditData({...editData, college: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Dept</label>
                      <input 
                        className="w-full bg-space-950 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-tech-cyan transition-all"
                        value={editData.department}
                        onChange={(e) => setEditData({...editData, department: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Year</label>
                      <input 
                        className="w-full bg-space-950 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-tech-cyan transition-all"
                        value={editData.year}
                        onChange={(e) => setEditData({...editData, year: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Team Formation</label>
                    {editData.teamMembers.map((member, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 text-[10px] font-black text-slate-600">{i+1}</span>
                        <input 
                          className="flex-grow bg-space-950 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-tech-cyan transition-all disabled:opacity-50"
                          value={member}
                          disabled={isTeamLocked}
                          placeholder="Team Member Name"
                          onChange={(e) => {
                            const newM = [...editData.teamMembers];
                            newM[i] = e.target.value;
                            setEditData({...editData, teamMembers: newM});
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={handleSaveProfile}
                    className="w-full mt-4 py-4 bg-tech-cyan text-space-950 font-black rounded-xl shadow-neon flex items-center justify-center gap-2 hover:bg-white transition-all uppercase tracking-widest text-[10px]"
                  >
                     <Save size={14}/> Synchronize Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Full Name</p>
                    <p className="text-lg font-black text-white uppercase">{participant.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Institution</p>
                    <p className="text-sm font-bold text-slate-300">{participant.college}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Department</p>
                      <p className="text-xs font-bold text-slate-300">{participant.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Year</p>
                      <p className="text-xs font-bold text-slate-300">{participant.year}</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Team Composition</p>
                    <div className="space-y-3">
                      {participant.teamMembers?.length > 0 ? (
                        participant.teamMembers.map((m: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-tech-cyan/40"></div>
                            <span className="text-xs font-bold text-slate-300 uppercase">{m}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-600 italic">Solo Participant</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Small Summary Card */}
          <div className="bg-tech-blue/5 border border-tech-blue/20 rounded-[2rem] p-6 flex items-center justify-between">
            <div>
              <p className="text-[9px] text-tech-blue font-black uppercase tracking-widest mb-1">Pass Status</p>
              <p className="text-sm font-bold text-white uppercase">{participant.isPaid ? 'Active Matrix' : 'Pending Link'}</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${participant.isPaid ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'}`}>
              {participant.isPaid ? <CheckCircle2 size={20} /> : <Clock size={20} />}
            </div>
          </div>
        </div>
      </div>

      {/* Force Password Change Modal */}
      <AnimatePresence>
        {showPassModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-space-950/90">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-space-900 border border-tech-cyan/30 p-8 sm:p-10 rounded-[2.5rem] max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.2)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-tech-cyan/10 border border-tech-cyan/30 flex items-center justify-center text-tech-cyan mx-auto mb-8">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white text-center uppercase tracking-tighter mb-2">Security Handshake</h2>
              <p className="text-slate-500 text-[10px] text-center uppercase tracking-[0.2em] mb-8 leading-relaxed">System requires a persistent passkey update to continue.</p>
              
              <form onSubmit={handleUpdatePass} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] text-tech-cyan uppercase font-black tracking-widest ml-1">Enter New Access Key</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full bg-space-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-tech-cyan transition-all text-center tracking-widest"
                    value={passData.new}
                    onChange={(e) => setPassData({...passData, new: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-tech-cyan uppercase font-black tracking-widest ml-1">Re-verify Access Key</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full bg-space-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-tech-cyan transition-all text-center tracking-widest"
                    value={passData.confirm}
                    onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-tech-cyan text-space-950 font-black rounded-2xl uppercase tracking-widest text-xs mt-4 shadow-neon hover:bg-white transition-all">
                  Initialize Access
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParticipantDashboard;
