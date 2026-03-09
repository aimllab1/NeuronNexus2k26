import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, CheckCircle2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  if (eventFilter === 'All Events') return true;
  const aliases = EVENT_FILTER_ALIASES[eventFilter] || [eventFilter];
  const aliasSet = new Set(aliases.map((alias) => normalize(alias)));
  return eventNamesOf(reg).some((eventName) => aliasSet.has(normalize(eventName)));
};

const AttendanceDashboard = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('All Events');
  const navigate = useNavigate();

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/registrations`);
      const data = await response.json();
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  const toggleAttendance = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/toggle-attendance/${id}`, {
        method: 'PATCH',
      });
      if (response.ok) fetchRegistrations();
    } catch (err) {
      alert('Failed to update attendance status.');
    }
  };

  useEffect(() => {
    fetchRegistrations();
    const interval = setInterval(fetchRegistrations, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    const key = searchTerm.toLowerCase();
    return registrations.filter((reg) => {
      const matchesSearch =
        String(reg?.fullName || '').toLowerCase().includes(key) ||
        String(reg?.ticketId || '').toLowerCase().includes(key);
      const matchesEvent = matchesEventFilter(reg, eventFilter);
      return matchesSearch && matchesEvent;
    });
  }, [registrations, searchTerm, eventFilter]);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('super_admin_session');
    navigate('/login');
  };

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <BrandHeader />
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">
            Admin 2 <span className="text-tech-cyan">Attendance</span>
          </h1>
          <p className="text-slate-500 font-mono text-xs tracking-widest uppercase">
            Attendance marking only
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 border border-white/10 hover:border-white/30 text-slate-400 hover:text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-4 mb-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            placeholder="Search participant name or ticket ID..."
            className="w-full bg-space-900 border border-white/10 rounded-xl p-3 pl-12 text-white outline-none focus:border-tech-cyan"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="w-full bg-space-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-tech-cyan text-sm"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
        >
          <option value="All Events">All Events</option>
          {EVENT_OPTIONS.map((eventName) => (
            <option key={eventName} value={eventName}>
              {eventName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((reg) => {
          const events = eventNamesOf(reg);
          return (
            <motion.div
              key={reg._id}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-space-900/80 border border-white/10 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-mono text-tech-cyan tracking-widest px-2 py-1 bg-tech-cyan/10 border border-tech-cyan/20 rounded-md">
                  {reg.ticketId}
                </span>
                <span
                  className={`text-[9px] font-black px-2 py-1 rounded uppercase border ${
                    reg.attendance
                      ? 'text-tech-cyan bg-tech-cyan/10 border-tech-cyan/30'
                      : 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  {reg.attendance ? 'PRESENT' : 'ABSENT'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{reg.fullName}</h3>
              <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-widest font-mono truncate">{reg.college}</p>

              <div className="mb-4 p-3 rounded-xl border border-white/10 bg-white/5">
                <p className="text-[10px] uppercase tracking-widest font-mono text-slate-500 mb-1">Events</p>
                <p className="text-xs font-bold text-white leading-relaxed">{events.length > 0 ? events.join(', ') : '-'}</p>
              </div>

              <button
                onClick={() => toggleAttendance(reg._id)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${
                  reg.attendance
                    ? 'bg-white/10 border border-white/20 text-slate-200 hover:border-tech-cyan/40'
                    : 'bg-green-500/15 border border-green-500/30 text-green-300 hover:bg-green-500/25'
                }`}
              >
                {reg.attendance ? <CheckCircle2 size={14} /> : <UserCheck size={14} />}
                {reg.attendance ? 'Unmark Attendance' : 'Mark Attendance'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceDashboard;
