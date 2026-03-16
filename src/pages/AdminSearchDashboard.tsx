import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Phone, Mail, User, Filter, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/api';

interface Participant {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  event: string;
  selectedEvents: { category: string; event: string }[];
}

const ALL_EVENTS = [
  'Concept Expo', 'Proto Fest', 'Code Rush', 'App Architects', 'Brain Rush',
  'E-sports', 'Sonic Nexus', 'CID', 'Auction Battle', 'Crown Mate'
];

const AdminSearchDashboard = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_session');
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchParticipants();
  }, [navigate]);

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/registrations`);
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);
    
    const matchesEvent = 
      selectedEvent === 'All Events' || 
      p.selectedEvents?.some(e => e.event === selectedEvent) ||
      p.event === selectedEvent;

    return matchesSearch && matchesEvent;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-tech-cyan/60 hover:text-tech-cyan transition-colors mb-4 text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Back to Login
          </button>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Users className="text-tech-cyan" size={32} />
            Participant <span className="text-tech-cyan">Directory</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">
            Search and contact registered participants
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-tech-cyan/40 group-focus-within:text-tech-cyan transition-colors" size={18} />
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="bg-space-900 border border-white/10 rounded-xl py-3 pl-12 pr-10 text-white text-sm outline-none focus:border-tech-cyan appearance-none cursor-pointer min-w-[200px]"
            >
              <option value="All Events">All Events</option>
              {ALL_EVENTS.map(event => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tech-cyan/40 group-focus-within:text-tech-cyan transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search Name, Email or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-space-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-tech-cyan w-full md:w-80"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-space-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="text-tech-cyan animate-spin" size={40} />
            <p className="text-xs text-tech-cyan/60 uppercase tracking-widest animate-pulse">Scanning Database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-6 text-[10px] font-mono text-tech-cyan uppercase tracking-widest">Participant</th>
                  <th className="p-6 text-[10px] font-mono text-tech-cyan uppercase tracking-widest">Contact Info</th>
                  <th className="p-6 text-[10px] font-mono text-tech-cyan uppercase tracking-widest">Registered Events</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode='popLayout'>
                  {filteredParticipants.length > 0 ? (
                    filteredParticipants.map((p, idx) => (
                      <motion.tr
                        key={p._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-tech-cyan/10 border border-tech-cyan/20 flex items-center justify-center">
                              <User className="text-tech-cyan" size={20} />
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">{p.fullName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">ID: {p._id.slice(-8).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 space-y-2">
                          <div className="flex items-center gap-3 group">
                            <Phone className="text-tech-cyan/40 group-hover:text-tech-cyan transition-colors" size={14} />
                            <a href={`tel:${p.phone}`} className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                              {p.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-3 group">
                            <Mail className="text-tech-cyan/40 group-hover:text-tech-cyan transition-colors" size={14} />
                            <a href={`mailto:${p.email}`} className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                              {p.email}
                            </a>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-wrap gap-2">
                            {(p.selectedEvents && p.selectedEvents.length > 0 ? p.selectedEvents : [{event: p.event}]).map((e, i) => (
                              <span key={i} className="text-[10px] bg-tech-cyan/10 text-tech-cyan border border-tech-cyan/20 px-2 py-1 rounded-md uppercase font-mono tracking-wider">
                                {e.event}
                              </span>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-20 text-center">
                        <p className="text-slate-500 text-sm uppercase tracking-widest">No participants found</p>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {!loading && (
        <div className="mt-6 flex justify-end">
          <p className="text-[10px] font-mono text-tech-cyan/60 uppercase tracking-widest">
            Total Results: <span className="text-tech-cyan">{filteredParticipants.length}</span> / {participants.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminSearchDashboard;
