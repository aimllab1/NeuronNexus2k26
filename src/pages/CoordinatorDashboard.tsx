import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Star, LogOut, Activity, ShieldAlert, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/api';

const EVENT_OPTIONS = [
  'Concept Expo',
  'Proto Fest',
  'Code Rush',
  'App Architects',
  'Brain Rush',
  'E-sports',
  'Sonic Nexus',
  'CID',
  'Auction Battle',
  'Crown Mate',
];

const EVENT_MATCH_ALIASES: Record<string, string[]> = {
  'Concept Expo': ['Concept Expo', 'Paper Presentation'],
  'Proto Fest': ['Proto Fest', 'Prototype Display'],
  'Code Rush': ['Code Rush', 'Debug'],
  'App Architects': ['App Architects', 'Application Building'],
  'Brain Rush': ['Brain Rush'],
  'E-sports': ['E-sports'],
  'Sonic Nexus': ['Sonic Nexus', 'Fun Track'],
  'CID': ['CID', 'CID (Criminal Investigation Department)'],
  'Auction Battle': ['Auction Battle', 'Champian Pics', 'Champion Pics'],
  'Crown Mate': ['Crown Mate', 'Chess'],
};

type Registration = {
  _id: string;
  ticketId: string;
  fullName: string;
  college?: string;
  event?: string;
  selectedEvents?: { category?: string; event?: string }[];
  attendance?: boolean;
  currentRound: number;
  scores: number[];
  teamMembers?: string[];
  // For individual scoring (virtual fields)
  isIndividual?: boolean;
  memberIndex?: number;
  displayName?: string;
};

const normalize = (value: unknown) => String(value || '').trim().toLowerCase();
const eventNamesOf = (registration: Registration) => {
  const selected = Array.isArray(registration?.selectedEvents)
    ? registration.selectedEvents
        .map((selection) => String(selection?.event || '').trim())
        .filter(Boolean)
    : [];
  if (selected.length > 0) return selected;

  const single = String(registration?.event || '').trim();
  return single ? [single] : [];
};

const CoordinatorDashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<string>(() => {
    const saved = String(localStorage.getItem('coordinator_event') || '').trim();
    return EVENT_OPTIONS.includes(saved) ? saved : EVENT_OPTIONS[0];
  });
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('coordinator_event', event);
  }, [event]);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/registrations`);
      const all = await response.json();
      setRegistrations(Array.isArray(all) ? all : []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (id: string, round: number, score?: number, promote?: boolean, memberIndex?: number) => {
    try {
      const payload: any = { round, score, promote, eventName: event };
      if (memberIndex !== undefined) payload.memberIndex = memberIndex;

      const response = await fetch(`${API_BASE}/api/coordinator/update-progress/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        fetchRegistrations();
        return;
      }
      const errData = await response.json().catch(() => null);
      alert(errData?.message || 'Failed to update progress.');
    } catch (err) {
      alert('Failed to update progress.');
    }
  };

  const triggerEmergency = async () => {
    const message = window.prompt('State your emergency issue for Admin 5:');
    if (!message) return;
    try {
      const triggeredBy = localStorage.getItem('admin_user') || 'Coordinator';
      const response = await fetch(`${API_BASE}/api/coordinator/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, message, triggeredBy }),
      });
      if (response.ok) alert('EMERGENCY SIGNAL SENT TO ADMIN 5.');
    } catch (err) {
      alert('Failed to send alert.');
    }
  };

  useEffect(() => {
    fetchRegistrations();
    const interval = setInterval(fetchRegistrations, 10000);
    return () => clearInterval(interval);
  }, []);

  const eventParticipants = useMemo(
    () => {
      const matchValues = EVENT_MATCH_ALIASES[event] || [event];
      const matchSet = new Set(matchValues.map((v) => normalize(v)));
      const baseList = registrations.filter((r) =>
        eventNamesOf(r).some((eventName) => matchSet.has(normalize(eventName)))
      );

      // Handle Crown Mate individual splitting
      if (event === 'Crown Mate') {
        const expanded: Registration[] = [];
        baseList.forEach(reg => {
          // Add leader
          expanded.push({
            ...reg,
            displayName: reg.fullName,
            memberIndex: -1, // -1 means leader
            isIndividual: true,
            // Use individual scores if backend supports it, otherwise fallback
            // For now, let's assume we use unique keys for score tracking
          });

          // Add team members as individuals
          if (Array.isArray(reg.teamMembers)) {
            reg.teamMembers.forEach((member, idx) => {
              if (member && member.trim()) {
                expanded.push({
                  ...reg,
                  displayName: member,
                  memberIndex: idx,
                  isIndividual: true,
                });
              }
            });
          }
        });
        return expanded;
      }

      return baseList;
    },
    [registrations, event]
  );

  const attendedParticipants = useMemo(
    () => eventParticipants.filter((r) => Boolean(r.attendance)),
    [eventParticipants]
  );

  const leaderboard = useMemo(
    () =>
      [...attendedParticipants]
        .sort(
          (a, b) => {
            const getScoreSum = (p: Registration) => {
              const scores = p.isIndividual 
                ? (p as any).individualScores?.[String(p.memberIndex)] ?? [0, 0, 0]
                : p.scores ?? [0, 0, 0];
              return (scores[0] || 0) + (scores[1] || 0) + (scores[2] || 0);
            };
            return getScoreSum(b) - getScoreSum(a);
          }
        )
        .slice(0, 5),
    [attendedParticipants]
  );

  return (
    <div className="flex h-screen bg-space-950/55 text-white overflow-hidden backdrop-blur-[1px]">
      <aside className="w-64 border-r border-white/10 flex flex-col p-6 bg-space-900/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2 mb-12">
          <div className="p-2 border border-purple-500/50 rounded-lg bg-purple-500/10 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <Activity size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase font-mono tracking-tight">
            APEC <span className="text-purple-400">COORD</span>
          </span>
        </div>

        <nav className="flex-grow space-y-4">
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 shadow-lg">
            <div className="text-[10px] uppercase font-black tracking-widest text-purple-400 mb-2 opacity-60">
              EVENT ASSIGNED
            </div>
            <select
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-full bg-space-950 border border-purple-500/30 rounded-lg p-2 text-sm font-bold text-white outline-none"
            >
              {EVENT_OPTIONS.map((evt) => (
                <option key={evt} value={evt}>
                  {evt}
                </option>
              ))}
            </select>
            <p className="mt-3 text-[10px] uppercase font-mono tracking-widest text-slate-400">
              PLAYERS: {attendedParticipants.length}
            </p>
          </div>
        </nav>

        <button
          onClick={triggerEmergency}
          className="mb-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all animate-pulse text-xs tracking-widest uppercase"
        >
          <ShieldAlert size={18} /> EMERGENCY SIGNAL
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-sm font-bold p-3 rounded-xl border border-transparent hover:border-white/10"
        >
          <LogOut size={18} /> EXIT HUD
        </button>
      </aside>

      <main className="flex-grow overflow-y-auto p-8 custom-scrollbar">
        <div className="mb-12">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            PARTICIPANT <span className="text-purple-400">ENGAGEMENT</span>
          </h1>
          <p className="text-xs text-slate-500 uppercase font-mono tracking-widest mt-1 tracking-[0.2em]">
            EVENT: {event} | {event === 'Crown Mate' ? 'INDIVIDUAL PLAYER MODE' : 'TEAM MODE'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-4">
            {!loading && attendedParticipants.length === 0 && (
              <div className="bg-space-900 border border-white/10 p-8 rounded-3xl text-center text-slate-400">
                No attended participants found for this event. Mark attendance in Admin 2 first.
              </div>
            )}

            {attendedParticipants.map((reg) => {
              const uniqueId = reg.isIndividual ? `${reg._id}-member-${reg.memberIndex}` : reg._id;
              
              // Get event-specific progress
              const progress = (reg as any).eventProgress?.[event] || { round: 1, scores: [0, 0, 0] };
              const currentRound = progress.round || 1;
              const baseScores = progress.scores || [0, 0, 0];

              return (
                <div
                  key={uniqueId}
                  className="bg-space-900 border border-white/10 p-6 rounded-3xl hover:border-purple-500/30 transition-all flex flex-col md:flex-row gap-8 items-center"
                >
                  <div className="flex-grow flex flex-col md:flex-row gap-6 items-center">
                    <div className="text-center md:text-left min-w-0">
                      <div className="text-[10px] font-mono text-purple-400 font-bold mb-1 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                        {reg.ticketId} {reg.isIndividual && <span className="px-1 bg-purple-500/20 rounded text-[8px]">INDIVIDUAL</span>}
                      </div>
                      <h4 className="text-xl font-bold text-white mb-1 truncate max-w-[250px]">{reg.displayName || reg.fullName}</h4>
                      <p className="text-xs text-slate-500 uppercase font-mono tracking-tighter opacity-60 truncate">
                        {reg.college}
                      </p>
                      {reg.isIndividual && reg.memberIndex !== -1 && (
                         <div className="mt-1 text-[9px] text-slate-500 uppercase font-bold italic">
                           Registered under: {reg.fullName}
                         </div>
                      )}
                    </div>

                    <div className="flex gap-1 h-fit">
                      {[1, 2, 3].map((r) => (
                        <div
                          key={r}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border transition-all ${currentRound >= r ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-white/5 border-white/10 text-slate-700 opacity-50'}`}
                        >
                          R{r}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full md:w-auto shrink-0">
                    {[1, 2, 3].map((r) => {
                      const currentScore = reg.isIndividual 
                        ? (reg as any).individualScores?.[`${event}_member_${reg.memberIndex}`]?.[r-1] ?? 0
                        : baseScores[r-1] ?? 0;

                      return (
                        <div
                          key={r}
                          className={`p-3 rounded-2xl border text-center relative ${currentRound === r ? 'bg-white/5 border-purple-500/30 shadow-lg' : 'bg-black/20 border-white/5 opacity-40'}`}
                        >
                          <span className="text-[9px] font-mono text-slate-600 block mb-1">R{r} SCORE</span>
                          <div className="text-lg font-black text-white">{currentScore}</div>
                          {currentRound === r && (
                            <div className="mt-2 space-y-2">
                              <div className="relative">
                                <Star size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-300" />
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  className="w-full bg-space-950 border border-white/10 rounded-lg py-2 pl-7 pr-2 text-[11px] text-white outline-none focus:border-purple-400"
                                  value={scoreInputs[`${uniqueId}-${r}`] ?? String(currentScore)}
                                  onChange={(e) =>
                                    setScoreInputs((prev) => ({
                                      ...prev,
                                      [`${uniqueId}-${r}`]: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const raw = scoreInputs[`${uniqueId}-${r}`] ?? String(currentScore);
                                  const parsed = Number.parseInt(raw, 10);
                                  if (Number.isNaN(parsed)) return alert('Enter a valid score.');
                                  updateProgress(reg._id, r, parsed, false, reg.memberIndex);
                                }}
                                className="w-full py-2 bg-white/10 border border-white/20 text-white font-black text-[9px] uppercase tracking-widest rounded-lg hover:border-purple-400 transition-all"
                              >
                                SAVE SCORE
                              </button>
                              {r < 3 && (
                                <button
                                  onClick={() => updateProgress(reg._id, r, undefined, true, reg.memberIndex)}
                                  className="w-full py-2 bg-purple-500 text-space-950 font-black text-[9px] uppercase tracking-widest rounded-lg shadow-purple-500/20 hover:scale-105 transition-all"
                                >
                                  PROMOTE
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="bg-space-900 border border-white/10 p-8 rounded-3xl text-center shadow-2xl">
              <Trophy size={48} className="mx-auto text-yellow-400 mb-4" />
              <h4 className="text-xl font-bold text-white mb-2 tracking-tight uppercase">Leaderboard</h4>
              <div className="space-y-3 text-left">
                {leaderboard.map((top, i) => (
                  <div
                    key={`${top._id}-${top.memberIndex}`}
                    className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3"
                  >
                    <span className="text-lg font-black text-purple-400/50">#{i + 1}</span>
                    <div className="flex-grow min-w-0">
                      <div className="text-xs font-bold text-white truncate">{top.displayName || top.fullName}</div>
                      <div className="text-[10px] text-slate-500 uppercase">
                        {(top.scores?.[0] || 0) + (top.scores?.[1] || 0) + (top.scores?.[2] || 0)} PTS
                      </div>
                    </div>
                  </div>
                ))}
                {!loading && leaderboard.length === 0 && (
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-mono text-center py-4">
                    No ranked players yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoordinatorDashboard;
