import { useEffect, useMemo, useState } from 'react';
import { Award, Download, Printer } from 'lucide-react';
import { API_BASE } from '../utils/api';
import BrandHeader from '../components/BrandHeader';

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

const EVENT_FILTER_ALIASES: Record<string, string[]> = {
  CID: ['CID', 'CID (Criminal Investigation Department)'],
  'Auction Battle': ['Auction Battle', 'Champian Pics', 'Champion Pics'],
};

const normalize = (value: unknown) => String(value || '').trim().toLowerCase();

const eventNamesOf = (reg: any): string[] => {
  const selected = Array.isArray(reg?.selectedEvents)
    ? reg.selectedEvents.map((selection: any) => String(selection?.event || '').trim()).filter(Boolean)
    : [];
  if (selected.length > 0) return selected;

  const single = String(reg?.event || '').trim();
  return single ? [single] : [];
};

const matchesEventFilter = (reg: any, eventFilter: string) => {
  const aliases = EVENT_FILTER_ALIASES[eventFilter] || [eventFilter];
  const aliasSet = new Set(aliases.map((alias) => normalize(alias)));
  return eventNamesOf(reg).some((eventName) => aliasSet.has(normalize(eventName)));
};

const CertificationDashboard = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>(EVENT_OPTIONS[0]);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/registrations`);
      const data = await response.json();
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const totalScore = (reg: any) => reg.scores ? reg.scores.reduce((a: number, b: number) => a + b, 0) : 0;
  const eventSummaryOf = (reg: any) => {
    const selected = eventNamesOf(reg);
    if (selected.length > 0) return selected.join(', ');
    return String(reg?.event || '').trim();
  };

  const rankedResults = useMemo(
    () =>
      registrations
        .filter((reg) => matchesEventFilter(reg, selectedEvent))
        .sort((a, b) => totalScore(b) - totalScore(a)),
    [registrations, selectedEvent]
  );

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <BrandHeader />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">RANKINGS <span className="text-tech-cyan">& CERTS</span></h1>
          <p className="text-slate-500 font-mono text-sm tracking-widest uppercase italic">Admin 4: Result Generation</p>
        </div>
        <div className="w-full md:w-72">
          <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-2">Select Event</label>
          <select
            className="w-full bg-space-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-tech-cyan text-sm"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            {EVENT_OPTIONS.map((eventName) => (
              <option key={eventName} value={eventName}>{eventName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-space-900 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Award className="text-yellow-400" /> FINAL RANKING LIST ({selectedEvent})
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-tech-cyan text-space-950 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-tech-cyan/90 transition-all">
              <Download size={16} /> Export CSV
            </button>
          </div>

          <div className="space-y-4">
            {rankedResults.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-10 border border-white/10 rounded-2xl bg-white/5">
                No participants found for this event.
              </div>
            ) : (
              rankedResults.map((reg, i) => (
                <div
                  key={reg._id}
                  className={`group relative p-6 rounded-2xl flex items-center justify-between transition-all border ${
                    i === 0
                      ? 'bg-yellow-500/10 border-yellow-400/45 shadow-[0_0_28px_rgba(250,204,21,0.18)]'
                      : i === 1
                      ? 'bg-slate-400/10 border-slate-300/45 shadow-[0_0_24px_rgba(203,213,225,0.15)]'
                      : i === 2
                      ? 'bg-amber-600/10 border-amber-500/45 shadow-[0_0_24px_rgba(217,119,6,0.15)]'
                      : 'bg-white/5 border-white/5 hover:border-tech-cyan/30'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg ${
                      i === 0
                        ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-300/50'
                        : i === 1
                        ? 'bg-slate-300/20 text-slate-300 border border-slate-200/50'
                        : i === 2
                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/50'
                        : 'bg-white/5 text-slate-500 border border-white/10'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{reg.fullName}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">{reg.college} | {eventSummaryOf(reg)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">TOTAL POINTS</span>
                      <span className={`text-2xl font-black ${i < 3 ? 'text-white' : 'text-tech-cyan'}`}>{totalScore(reg)}</span>
                    </div>
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                      <Printer size={16} /> CERT
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-tech-blue/10 border border-tech-blue/30 rounded-3xl p-8 text-center">
            <Award size={48} className="mx-auto text-tech-blue mb-4" />
            <h4 className="text-xl font-bold text-white mb-2 uppercase">VERIFY DATA</h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">Ensure all scores are finalized by coordinators before generating certificates.</p>
            <button className="w-full py-4 bg-tech-blue text-white font-black rounded-xl uppercase tracking-widest text-xs hover:bg-tech-blue/90 shadow-neon transition-all">
              LOCK RESULTS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationDashboard;
