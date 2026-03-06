import { motion } from 'framer-motion';
import type { Session } from '../data/sessions';
import { User, Zap } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
}

const SessionList: React.FC<SessionListProps> = ({ sessions }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 p-0 sm:p-2 max-w-7xl mx-auto">
      {sessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ scale: 1.015, y: -4 }}
          className="relative group bg-space-900 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm hover:border-tech-cyan/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-500"
        >
          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Top Line Accent */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-tech-cyan to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

          <div className="p-6 relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                session.type === 'technical' 
                  ? 'border-tech-blue/30 bg-tech-blue/10 text-tech-blue' 
                  : 'border-purple-500/30 bg-purple-500/10 text-purple-400'
              }`}>
                {session.type}
              </span>
              <Zap className={`w-5 h-5 ${
                session.type === 'technical' ? 'text-tech-cyan' : 'text-purple-400'
              }`} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-tech-cyan transition-colors">
              {session.title}
            </h3>

            {/* Speaker Info */}
            <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm">
              <User size={16} className="text-tech-blue" />
              <span>{session.speaker}</span>
            </div>

            {/* Description */}
            <p className="text-slate-500 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
              {session.description}
            </p>

            {/* Footer / Optional Time */}
            {session.time ? (
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center text-xs text-slate-400 font-mono">
                <span>{session.time}</span>
              </div>
            ) : null}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SessionList;
