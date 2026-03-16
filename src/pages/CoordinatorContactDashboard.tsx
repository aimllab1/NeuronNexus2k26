import { useEffect, useMemo, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, MessageSquare, User, Filter, LogOut, Loader2, Users, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/api';

const ALL_EVENTS = [
  'Concept Expo', 'Proto Fest', 'Code Rush', 'App Architects', 'Brain Rush',
  'E-sports', 'Sonic Nexus', 'CID', 'Auction Battle', 'Crown Mate'
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

const participantCountOf = (reg: any) => {
  const direct = Number(reg?.participantCount);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const teamCount = Array.isArray(reg?.teamMembers)
    ? reg.teamMembers.filter((m: any) => String(m || '').trim()).length
    : 0;
  return 1 + teamCount;
};

const CoordinatorContactDashboard = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All'); // 'All', 'Paid', 'Unpaid'
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_session');
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchRegistrations();
  }, [navigate]);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/registrations`);
      const data = await response.json();
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!selectedEvent) return [];
    
    return registrations.filter((reg) => {
      const matchesSearch = 
        String(reg?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(reg?.phone || '').includes(searchTerm);
      
      const matchesEvent = matchesEventFilter(reg, selectedEvent);
      
      const matchesPayment = 
        paymentFilter === 'All' || 
        (paymentFilter === 'Paid' && reg.isPaid) || 
        (paymentFilter === 'Unpaid' && !reg.isPaid);

      return matchesSearch && matchesEvent && matchesPayment;
    });
  }, [registrations, searchTerm, selectedEvent, paymentFilter]);

  const stats = useMemo(() => {
    if (!selectedEvent) return { totalTeams: 0, totalPeople: 0, paid: 0, unpaid: 0 };
    
    const eventTeams = registrations.filter(reg => matchesEventFilter(reg, selectedEvent));
    
    return {
      totalTeams: eventTeams.length,
      totalPeople: eventTeams.reduce((sum, reg) => sum + participantCountOf(reg), 0),
      paid: eventTeams.filter(reg => reg.isPaid).length,
      unpaid: eventTeams.filter(reg => !reg.isPaid).length,
    };
  }, [registrations, selectedEvent]);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('super_admin_session');
    navigate('/login');
  };

  if (!selectedEvent && !loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-space-900/50 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md shadow-neon text-center"
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-tech-cyan/10 border border-tech-cyan/30">
            <Filter className="text-tech-cyan" size={40} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
            Select <span className="text-tech-cyan">Event</span>
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-8">
            Choose an event to view coordinator dashboard
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {ALL_EVENTS.map(event => (
              <button
                key={event}
                onClick={() => setSelectedEvent(event)}
                className="w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-tech-cyan/10 hover:border-tech-cyan/30 text-white text-xs font-black uppercase tracking-widest transition-all"
              >
                {event}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleLogout}
            className="mt-8 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
          >
            <LogOut size={14} /> Logout
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button 
              onClick={() => setSelectedEvent('')}
              className="text-tech-cyan/60 hover:text-tech-cyan transition-colors text-[10px] uppercase font-black tracking-widest flex items-center gap-1"
            >
              <Filter size={12} /> Change Event
            </button>
            <span className="text-slate-700">/</span>
            <span className="text-tech-cyan text-[10px] uppercase font-black tracking-widest">{selectedEvent}</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            Coordinator <span className="text-tech-cyan">Panel</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">
            View-only access for event coordinators
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 border border-white/10 hover:border-white/30 text-slate-400 hover:text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Teams" value={stats.totalTeams} icon={<Users className="text-white" size={20} />} />
        <StatCard label="Total People" value={stats.totalPeople} icon={<User className="text-tech-cyan" size={20} />} />
        <StatCard label="Paid Teams" value={stats.paid} icon={<CreditCard className="text-green-400" size={20} />} />
        <StatCard label="Unpaid Teams" value={stats.unpaid} icon={<CreditCard className="text-red-400" size={20} />} />
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tech-cyan/40 group-focus-within:text-tech-cyan transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search Team Leader Name or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-space-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-tech-cyan transition-all"
          />
        </div>

        <div className="flex bg-space-900 border border-white/10 rounded-2xl p-1">
          {['All', 'Paid', 'Unpaid'].map((f) => (
            <button
              key={f}
              onClick={() => setPaymentFilter(f)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                paymentFilter === f 
                  ? 'bg-tech-cyan text-space-950 shadow-neon' 
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="text-tech-cyan animate-spin" size={40} />
          <p className="text-xs text-tech-cyan/60 uppercase tracking-widest animate-pulse">Scanning Database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {filtered.length > 0 ? (
              filtered.map((reg, idx) => (
                <motion.div
                  key={reg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 rounded-3xl bg-space-900/50 border border-white/10 backdrop-blur-sm relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-tech-cyan/10 border border-tech-cyan/20 flex items-center justify-center">
                      <User className="text-tech-cyan" size={24} />
                    </div>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${
                      reg.isPaid 
                        ? 'text-green-400 bg-green-500/10 border-green-500/30' 
                        : 'text-red-400 bg-red-500/10 border-red-500/30'
                    }`}>
                      {reg.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-tech-cyan transition-colors">{reg.fullName}</h3>
                  <div className="space-y-1 mb-6">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono truncate">{reg.college}</p>
                    <p className="text-[9px] text-tech-cyan/80 uppercase font-mono">{reg.department} | Year {reg.year}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`tel:${reg.phone}`}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      <Phone size={14} /> Dial
                    </a>
                    <a
                      href={`https://wa.me/${reg.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500 text-sm uppercase tracking-widest">No teams found for this filter</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) => (
  <div className="bg-space-900/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      {icon}
    </div>
    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">{label}</p>
    <p className="text-3xl font-black text-white">{value}</p>
  </div>
);

export default CoordinatorContactDashboard;
