import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Rocket, Terminal, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NeuralLogo from './NeuralLogo';
import { audioService } from '../utils/audio';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Home', path: '/', icon: <Rocket size={18} /> },
    { name: 'Technical', path: '/technical', icon: <Terminal size={18} /> },
    { name: 'Non-Technical', path: '/non-technical', icon: <Activity size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-12 pb-5 flex justify-between items-center gap-3">
        {/* Logo Area */}
        <NavLink 
          to="/" 
          onMouseEnter={() => audioService.playHover()}
          onClick={() => audioService.playClick()}
          className="flex items-center gap-3 group min-w-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          <NeuralLogo size={40} className="shrink-0 group-hover:scale-105 transition-transform duration-300" />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-300 uppercase tracking-[0.18em] font-mono truncate font-black">APEC CSE (AI and ML)</p>
            <span className="block text-base sm:text-lg md:text-xl font-black tracking-tight text-white group-hover:text-tech-cyan transition-colors truncate">
              Neuron <span className="text-tech-cyan">Nexus 2026</span>
            </span>
          </div>
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onMouseEnter={() => audioService.playHover()}
              onClick={() => audioService.playClick()}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-black tracking-widest uppercase transition-all duration-300 relative py-1 px-3
                ${isActive ? 'text-tech-cyan' : 'text-slate-200 hover:text-white'}
                `
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                    {link.icon}
                  </span>
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-tech-cyan shadow-[0_0_10px_#06b6d4]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          <NavLink 
            to="/login"
            onMouseEnter={() => audioService.playHover()}
            onClick={() => audioService.playClick()}
            className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-tech-cyan transition-all"
          >
            Login
          </NavLink>
          <NavLink 
            to="/register"
            onMouseEnter={() => audioService.playHover()}
            onClick={() => audioService.playClick()}
            className="px-6 py-2.5 bg-tech-cyan text-space-950 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            Register Now
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => { setIsOpen(!isOpen); audioService.playClick(); }}
          onMouseEnter={() => audioService.playHover()}
          className="md:hidden text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] shrink-0"
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-space-900 border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onMouseEnter={() => audioService.playHover()}
                  onClick={() => { setIsOpen(false); audioService.playClick(); }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 text-lg font-medium p-3 rounded-lg border border-transparent transition-all
                    ${isActive 
                      ? 'bg-tech-cyan/10 border-tech-cyan/30 text-tech-cyan shadow-neon' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
              <div className="pt-2 border-t border-white/10 grid grid-cols-1 gap-3">
                <NavLink
                  to="/login"
                  onMouseEnter={() => audioService.playHover()}
                  onClick={() => { setIsOpen(false); audioService.playClick(); }}
                  className="text-center py-3 rounded-lg border border-white/10 text-slate-300 font-bold text-sm uppercase tracking-widest hover:border-tech-cyan/40 hover:text-tech-cyan transition-all"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onMouseEnter={() => audioService.playHover()}
                  onClick={() => { setIsOpen(false); audioService.playClick(); }}
                  className="text-center py-3 rounded-lg bg-tech-cyan text-space-950 font-black text-sm uppercase tracking-widest hover:bg-tech-cyan/90 transition-all shadow-[0_0_14px_rgba(6,182,212,0.35)]"
                >
                  Register Now
                </NavLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
