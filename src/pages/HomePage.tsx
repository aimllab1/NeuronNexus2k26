import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, Coffee, Coins, Calendar, Users, Award, Gift } from 'lucide-react';
import { audioService } from '../utils/audio';

const HomePage = () => {
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden bg-transparent">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Branding Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col items-center"
        >
          <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-[0.2em] mb-2 drop-shadow-lg">
            Adhiparasakthi Engineering College
          </h2>
          <div className="h-px w-48 bg-gradient-to-r from-transparent via-tech-cyan to-transparent mb-4 shadow-[0_0_10px_#06b6d4]"></div>
          <h3 className="text-md md:text-xl font-bold text-tech-cyan uppercase tracking-widest opacity-90">
            Department of CSE (AI & ML)
          </h3>
          <p className="text-[10px] font-mono text-slate-500 mt-4 uppercase tracking-[0.5em]">Presents</p>
        </motion.div>

        {/* Main Title Area */}
        <div className="relative w-full mb-16 py-10">
          
          {/* MAIN TITLE - Split into two lines */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-7xl md:text-[6rem] lg:text-[8.5rem] font-black tracking-tight md:tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500 relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] uppercase leading-none"
          >
            NEURON
            <br />
            <span className="text-tech-cyan">NEXUS 2026</span>
          </motion.h1>

          {/* PARALLEL FLOATING NODES (Visible on tablets and larger to support zoom) */}
          <div className="hidden lg:block">
            {/* LEVEL 1: TOP */}
            <FloatingNode 
              icon={<Calendar size={28} />}
              label="Event Date"
              value="18th March 2026"
              className="absolute -top-10 left-[0%] xl:left-[2%] text-tech-cyan"
              delay={1.2}
              bounce={15}
            />
            <FloatingNode 
              icon={<Users size={24} />}
              label="Formation"
              value="Max 4 Members"
              className="absolute -top-10 right-[0%] xl:right-[2%] text-purple-400"
              delay={1.4}
              bounce={18}
            />

            {/* LEVEL 2: MIDDLE */}
            <FloatingNode 
              icon={<Coins size={24} />}
              label="Entry Fee"
              value="Rs. 100 / Head"
              className="absolute top-[35%] -left-8 xl:-left-4 text-amber-400"
              delay={1.6}
              bounce={12}
            />
            <FloatingNode 
              icon={<Award size={24} />}
              label="Recognition"
              value="Certificates"
              className="absolute top-[35%] -right-8 xl:-right-4 text-emerald-400"
              delay={1.8}
              bounce={10}
            />

            {/* LEVEL 3: BOTTOM */}
            <FloatingNode 
              icon={<Coffee size={24} />}
              label="Hospitality"
              value="Refreshments"
              className="absolute top-[75%] left-[2%] xl:left-[5%] text-tech-blue"
              delay={2.0}
              bounce={14}
            />
            <FloatingNode 
              icon={<Gift size={24} />}
              label="Rewards"
              value="Exciting Prizes"
              className="absolute top-[75%] right-[2%] xl:right-[5%] text-rose-400"
              delay={2.2}
              bounce={16}
            />
          </div>
        </div>

        {/* Mobile Display Badge List (Hidden on Large Desktop) */}
        <div className="lg:hidden flex flex-wrap justify-center gap-4 mb-12">
          <MobileInfoBadge icon={<Calendar size={14}/>} value="18 Mar 2026" color="text-tech-cyan" />
          <MobileInfoBadge icon={<Coins size={14}/>} value="Rs. 100" color="text-amber-400" />
          <MobileInfoBadge icon={<Users size={14}/>} value="Team Max 4" color="text-purple-400" />
          <MobileInfoBadge icon={<Gift size={14}/>} value="Exciting Prizes" color="text-rose-400" />
        </div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-2xl text-slate-400 max-w-3xl mb-10 leading-relaxed font-medium"
        >
          National level student seminar On tech fusion
          <br />
          <span className="text-xl md:text-3xl font-black text-white mt-4 block tracking-tighter uppercase">
            Where engineering meets Intelligence
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 mb-20"
        >
          <NavLink 
            to="/register" 
            onMouseEnter={() => audioService.playHover()}
            onClick={() => audioService.playClick()}
            className="group relative px-10 py-5 bg-tech-blue hover:bg-tech-blue/90 text-white font-black rounded-xl overflow-hidden transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] text-sm tracking-widest uppercase"
          >
            <span className="relative z-10 flex items-center gap-2">
              New Registration <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </NavLink>
          
          <NavLink 
            to="/login"
            onMouseEnter={() => audioService.playHover()}
            onClick={() => audioService.playClick()}
            className="px-10 py-5 bg-white/5 border border-white/10 hover:border-tech-cyan/50 text-slate-300 hover:text-white font-black rounded-xl transition-all hover:bg-white/10 text-sm tracking-widest uppercase flex items-center gap-2"
          >
            Access Dashboard <LayoutDashboard size={18} className="text-tech-cyan" />
          </NavLink>
        </motion.div>
      </section>

      {/* Seminar Logistics */}
      <section className="px-6 max-w-5xl mx-auto mb-24 relative z-10 text-left">
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-tech-cyan/5 blur-[80px] -z-10"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="mb-6 p-5 rounded-3xl border border-tech-cyan/25 bg-tech-cyan/5">
                <p className="text-sm font-black text-tech-cyan uppercase tracking-[0.3em] mb-2 font-mono">Status Uplink</p>
                <p className="text-3xl font-black text-white uppercase tracking-tight">18th March 2026</p>
                <div className="mt-4 space-y-1">
                  <p className="text-lg text-slate-200 font-black">Registration: 08:45 AM</p>
                  <p className="text-lg text-slate-200 font-black">Inauguration: 09:30 AM</p>
                </div>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-4">
                Tech <span className="text-tech-cyan">Seminar</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-4 font-bold">
                National Level Student Seminar & Tech Fusion. Explore the boundaries of Innovation & Technology
              </p>
            </div>

            <div className="space-y-4">
              <AgendaItem time="09:00 - 10:00" title="Registration" desc="Welcome & Kit Collection" />
              <AgendaItem time="10:00 - 11:00" title="Inauguration" desc="Guest Address & Ceremony" />
              <AgendaItem time="11:00 - 04:00" title="Main Events" desc="Concurrent Sessions" />
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tech-blue/5 rounded-full blur-[120px] -z-10"></div>
    </div>
  );
};

const FloatingNode = ({ icon, label, value, className, delay, bounce }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      y: [0, -bounce, 0],
      rotate: [0, -2, 2, -2, 0]
    }}
    transition={{ 
      opacity: { delay },
      scale: { delay, type: "spring", stiffness: 100 },
      y: { repeat: Infinity, duration: 3 + Math.random(), ease: "easeInOut" },
      rotate: { repeat: Infinity, duration: 4 + Math.random(), ease: "easeInOut" }
    }}
    className={`pointer-events-none z-20 flex flex-col items-center drop-shadow-2xl ${className}`}
  >
    <div className="flex flex-col items-center group">
      <div className="mb-3 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">{label}</p>
      <p className="text-xl font-black uppercase tracking-tight whitespace-nowrap drop-shadow-lg">{value}</p>
    </div>
  </motion.div>
);

const MobileInfoBadge = ({ icon, value, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full ${color}`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{value}</span>
  </motion.div>
);

const AgendaItem = ({ time, title, desc }: any) => (
  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-tech-cyan/30 transition-all group relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-tech-cyan/20 group-hover:bg-tech-cyan transition-colors"></div>
    <div className="flex flex-col shrink-0">
      <div className="text-tech-cyan font-mono text-xl font-black tracking-tighter uppercase leading-none">
        {time.split(' - ')[0]}
      </div>
      <div className="text-slate-500 font-mono text-[10px] font-bold uppercase tracking-widest mt-1">
        to {time.split(' - ')[1]}
      </div>
    </div>
    <div className="flex flex-col justify-center">
      <h4 className="text-white font-black text-lg group-hover:text-tech-cyan transition-colors uppercase tracking-tight leading-tight">
        {title}
      </h4>
      <p className="text-slate-400 text-sm mt-1 font-medium italic opacity-80 group-hover:opacity-100 transition-opacity">
        {desc}
      </p>
    </div>
  </div>
);

export default HomePage;
