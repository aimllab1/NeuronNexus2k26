import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Users, ArrowRight, ArrowLeft, ExternalLink, Ticket, UserCircle2, Mail } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { API_BASE } from '../utils/api';

type EventCategory = 'Technical' | 'Non-Technical';
type SelectedEvent = { category: EventCategory; event: string };

const TECHNICAL_EVENTS = ['Concept Expo', 'Proto Fest', 'Code Rush', 'App Architects', 'Brain Rush'];
const NON_TECHNICAL_EVENTS = [
  'E-sports',
  'Sonic Nexus',
  'CID',
  'Auction Battle',
  'Crown Mate',
];

const EVENT_LIMIT = 2;

const validateSelectedEvents = (selectedEvents: SelectedEvent[]) => {
  if (selectedEvents.length < 1) {
    return 'Select at least 1 event.';
  }
  if (selectedEvents.length > EVENT_LIMIT) {
    return `Maximum ${EVENT_LIMIT} events are allowed.`;
  }

  // rules when two events are chosen
  if (selectedEvents.length === 2) {
    const technicalCount = selectedEvents.filter((s) => s.category === 'Technical').length;
    const nonTechnicalCount = selectedEvents.filter((s) => s.category === 'Non-Technical').length;

    // two non-technical events not allowed
    if (nonTechnicalCount === 2) {
      return 'You cannot participate in two non-technical events. Please choose at most one non-technical event.';
    }
    // two technical events or one of each are both fine
  }

  return '';
};

const RegistrationPage = () => {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [paymentInfo, setPaymentInfo] = useState({ participantCount: 1, paymentAmount: 100, paymentPerHead: 100 });
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const firstTeamInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: '1',
    selectedEvents: [] as SelectedEvent[],
    teamMembers: ['', '', ''],
  });

  const WHATSAPP_LINK = 'https://chat.whatsapp.com/E9nE06fN6OPJQbFjwNzppO';

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const isValidPhone = (value: string) => /^\d{10}$/.test(value.replace(/\D/g, ''));

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName.trim()) return alert('Please enter your full name.');
      if (!isValidEmail(formData.email)) return alert('Please enter a valid email ID.');
      if (!isValidPhone(formData.phone)) return alert('Please enter a valid 10-digit phone number.');
      if (!formData.college.trim()) return alert('Please enter your college name.');
      if (!formData.department.trim()) return alert('Please enter your department.');
    }
    setStep((s) => Math.min(2, s + 1));
  };

  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  useEffect(() => {
    if (step !== 2) return;
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      firstTeamInputRef.current?.focus();
    });
  }, [step]);

  const isEventSelected = (eventName: string) =>
    formData.selectedEvents.some((selection) => selection.event === eventName);

  const toggleEventSelection = (category: EventCategory, eventName: string) => {
    setFormData((prev) => {
      const exists = prev.selectedEvents.some((selection) => selection.event === eventName);
      if (exists) {
        return {
          ...prev,
          selectedEvents: prev.selectedEvents.filter((selection) => selection.event !== eventName),
        };
      }
      if (prev.selectedEvents.length >= EVENT_LIMIT) {
        alert(`Maximum ${EVENT_LIMIT} events are allowed.`);
        return prev;
      }

      // if user already has one non-technical event, prevent adding another
      if (
        category === 'Non-Technical' &&
        prev.selectedEvents.length === 1 &&
        prev.selectedEvents[0].category === 'Non-Technical'
      ) {
        alert('You cannot select two non-technical events. Please choose at most one non-technical event.');
        return prev;
      }

      return {
        ...prev,
        selectedEvents: [...prev.selectedEvents, { category, event: eventName }],
      };
    });
  };

  const submitRegistration = async () => {
    const selectionError = validateSelectedEvents(formData.selectedEvents);
    if (selectionError) {
      alert(selectionError);
      return;
    }

    const cleanedTeamMembers = formData.teamMembers.map((m) => m.trim()).filter(Boolean);
    const primarySelection = formData.selectedEvents[0];

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          college: formData.college,
          department: formData.department,
          year: formData.year,
          category: primarySelection?.category || '',
          event: primarySelection?.event || '',
          selectedEvents: formData.selectedEvents,
          teamMembers: cleanedTeamMembers,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setTicketId(data.ticketId);
        setPaymentInfo({
          participantCount: Number(data.participantCount) > 0 ? Number(data.participantCount) : 1,
          paymentAmount: Number(data.paymentAmount) >= 0 ? Number(data.paymentAmount) : 100,
          paymentPerHead: Number(data.paymentPerHead) > 0 ? Number(data.paymentPerHead) : 100,
        });
        if (data?.sheetsSync?.attempted && !data?.sheetsSync?.success) {
          alert(`Registration saved, but Apps Script sync failed: ${data.sheetsSync.error || 'Unknown error'}`);
        }
        setSuccess(true);
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch {
      alert('Error connecting to server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const updateTeamMember = (index: number, value: string) => {
    setFormData((prev) => {
      const newMembers = [...prev.teamMembers];
      newMembers[index] = value;
      return { ...prev, teamMembers: newMembers };
    });
  };

  const selectedNonTechnicalCount = formData.selectedEvents.filter((s) => s.category === 'Non-Technical').length;

  if (success) {
    return (
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-space-900 border border-tech-cyan/50 p-12 rounded-3xl shadow-neon backdrop-blur-md"
        >
          <CheckCircle className="w-16 h-16 text-tech-cyan mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-8 tracking-tighter uppercase">
            REGISTRATION{' '}
            <span className="text-tech-cyan text-sm block tracking-widest opacity-60">CONFIRMED</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Team Leader Name</p>
              <div className="text-xl font-black text-white flex items-center justify-center gap-2">
                <UserCircle2 size={20} className="text-tech-cyan" /> {formData.fullName}
              </div>
            </div>
            <div className="p-6 bg-tech-blue/10 border border-tech-blue/20 rounded-2xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Generated ID</p>
              <div className="text-2xl font-black text-white flex items-center justify-center gap-2">
                <Ticket size={20} className="text-tech-cyan" /> {ticketId}
              </div>
            </div>
            <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Registered Mail ID</p>
              <div className="text-sm font-black text-white flex items-center justify-center gap-2 break-all">
                <Mail size={18} className="text-purple-400" /> {formData.email}
              </div>
            </div>
          </div>
          <div className="mb-6 p-6 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Payment Summary</p>
            <div className="text-xl font-black text-white">
              {paymentInfo.participantCount} Members x Rs.{paymentInfo.paymentPerHead} = Rs.{paymentInfo.paymentAmount}
            </div>
          </div>
          <div className="mb-6 p-4 rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-200 text-xs font-bold uppercase tracking-wider">
            Login credentials sent to your mail.
          </div>
          <div className="p-8 bg-tech-blue/10 border border-tech-blue/30 rounded-2xl mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <ExternalLink size={100} />
            </div>
            <p className="text-white font-bold mb-4 tracking-tight uppercase">Join the Official Neural Nexus Community</p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-black py-4 px-8 rounded-xl transition-all shadow-lg text-sm tracking-widest"
            >
              WHATSAPP GROUP <ExternalLink size={18} />
            </a>
          </div>
          <div className="flex flex-col items-center gap-4">
            <NavLink
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tech-cyan text-space-950 font-black text-xs uppercase tracking-widest hover:bg-tech-cyan/90 transition-all"
            >
              Login <ArrowRight size={16} />
            </NavLink>
            <p className="text-slate-500 text-xs font-mono uppercase leading-relaxed max-w-sm mx-auto text-center">
              Join whatsapp community and use mail credentials to access participant dashboard.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">
          Neuron Nexus 2026 <span className="text-tech-cyan">REGISTRATION</span>
        </h1>
        <div className="flex justify-center items-center gap-4 mt-8">
          {[1, 2].map((num) => (
            <div
              key={num}
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black transition-all border ${
                step >= num
                  ? 'bg-tech-cyan text-space-950 border-tech-cyan'
                  : 'bg-white/5 border-white/10 text-slate-700'
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      <form
        ref={formRef}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && step < 2) {
            e.preventDefault();
            handleNext();
            return;
          }
          if (e.key === 'Enter' && step === 2) {
            e.preventDefault();
          }
        }}
        className="bg-space-900/40 border border-white/5 p-8 md:p-12 rounded-[2rem] backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-tech-cyan/30 to-transparent" />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 bg-tech-cyan rounded-full" />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  Step 1: Participant Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" value={formData.fullName} onChange={(val: string) => setFormData((p) => ({ ...p, fullName: val }))} required />
                <Input label="Email ID" type="email" value={formData.email} onChange={(val: string) => setFormData((p) => ({ ...p, email: val }))} required />
                <Input label="Phone Number" value={formData.phone} onChange={(val: string) => setFormData((p) => ({ ...p, phone: val }))} required />
                <Input label="College Name" value={formData.college} onChange={(val: string) => setFormData((p) => ({ ...p, college: val }))} required />
                <Input label="Department" value={formData.department} onChange={(val: string) => setFormData((p) => ({ ...p, department: val }))} required />
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-tech-cyan uppercase font-black tracking-widest opacity-60">Year of Study</label>
                  <select
                    className="bg-space-950 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-tech-cyan transition-all appearance-none text-sm font-bold"
                    value={formData.year}
                    onChange={(e) => setFormData((p) => ({ ...p, year: e.target.value }))}
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-tech-cyan rounded-full" />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Step 2: Events and Team Details</h3>
              </div>

              <p className="text-slate-400 mb-6 text-xs font-mono uppercase tracking-widest">
                Select 1 or 2 events. Two non-technical selections are not allowed; you may choose two technical events or mix one technical with one non-technical. Team members are optional.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <EventPicker
                  title="Technical Events"
                  events={TECHNICAL_EVENTS}
                  category="Technical"
                  isEventSelected={isEventSelected}
                  onToggle={toggleEventSelection}
                  activeClassName="border-tech-blue/50 bg-tech-blue/20 text-tech-blue"
                />
                <EventPicker
                  title="Non-Technical Events"
                  events={NON_TECHNICAL_EVENTS}
                  category="Non-Technical"
                  isEventSelected={isEventSelected}
                  onToggle={toggleEventSelection}
                  activeClassName="border-purple-500/50 bg-purple-500/20 text-purple-300"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-8">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  Selected: {formData.selectedEvents.length}/{EVENT_LIMIT} | Technical: {selectedTechnicalCount} | Non-Technical: {selectedNonTechnicalCount}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.selectedEvents.map((selection) => (
                    <span
                      key={selection.event}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${selection.category === 'Technical' ? 'border-tech-blue/40 text-tech-blue bg-tech-blue/10' : 'border-purple-400/40 text-purple-300 bg-purple-500/10'}`}
                    >
                      {selection.event}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Team Members (Optional)</h4>
                <div className="space-y-4">
                  {formData.teamMembers.map((member, i) => (
                    <div key={i} className="relative group">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Users className="text-slate-700 group-focus-within:text-tech-cyan w-5 h-5 transition-colors" />
                      </div>
                      <input
                        id={`team-member-${i}`}
                        ref={i === 0 ? firstTeamInputRef : undefined}
                        placeholder={`Team Member ${i + 1} Name (Full Name)`}
                        className="w-full bg-space-950/50 border border-white/10 rounded-2xl p-5 pl-14 text-white outline-none focus:border-tech-cyan focus:bg-space-950 transition-all font-medium"
                        value={member}
                        onChange={(e) => updateTeamMember(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.preventDefault();
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto flex items-center gap-2 bg-tech-blue hover:bg-tech-blue/90 text-white font-black py-4 px-10 rounded-xl shadow-neon transition-all text-xs tracking-widest"
            >
              Next Phase <ArrowRight size={18} />
            </button>
          ) : (
              <button
              type="button"
              onClick={submitRegistration}
              disabled={loading}
              className="ml-auto flex items-center gap-2 bg-tech-cyan hover:bg-tech-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed text-space-950 font-black py-5 px-12 rounded-xl shadow-neon transition-all text-sm tracking-tighter"
            >
              {loading ? 'PROCESSING...' : 'FINALIZE and GENERATE PASS'} <ArrowRight size={20} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const EventPicker = ({
  title,
  events,
  category,
  isEventSelected,
  onToggle,
  activeClassName,
}: {
  title: string;
  events: string[];
  category: EventCategory;
  isEventSelected: (eventName: string) => boolean;
  onToggle: (category: EventCategory, eventName: string) => void;
  activeClassName: string;
}) => (
  <div className="rounded-2xl border border-white/10 p-4 bg-space-950/40">
    <p className="text-[10px] text-tech-cyan uppercase font-black tracking-widest opacity-60 mb-3">{title}</p>
    <div className="grid grid-cols-1 gap-2">
      {events.map((eventName) => {
        const selected = isEventSelected(eventName);
        return (
          <button
            key={eventName}
            type="button"
            onClick={() => onToggle(category, eventName)}
            className={`text-left px-3 py-3 rounded-xl border text-sm font-bold tracking-tight transition-all ${selected ? activeClassName : 'border-white/10 text-slate-300 hover:bg-white/5'}`}
          >
            {eventName}
          </button>
        );
      })}
    </div>
  </div>
);

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] text-tech-cyan uppercase font-black tracking-widest opacity-60">{label}</label>
    <input
      type={type}
      required={required}
      className="bg-space-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-tech-cyan transition-all text-sm font-medium"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default RegistrationPage;
