import React, { useState } from 'react';
import Button from './Button';
import SessionModal from './SessionModal';
import { Laptop, Mic, Settings, Star, User, Clock } from 'lucide-react';

interface SessionProps {
  session: {
    id: string;
    title: string;
    speaker: string;
    time: string;
    description: string;
    type: 'technical' | 'non-technical';
  };
}

const SessionCard: React.FC<SessionProps> = ({ session }) => {
  const isTechnical = session.type === 'technical';
  const borderColor = isTechnical ? 'border-accent/20' : 'border-secondary/20';
  const badgeBg = isTechnical ? 'bg-accent/20 text-accent' : 'bg-secondary/20 text-text';
  const hoverBorder = isTechnical ? 'group-hover:border-accent/50' : 'group-hover:border-secondary/50';
  const buttonBg = isTechnical ? 'bg-accent/10 text-accent hover:bg-accent' : 'bg-secondary/10 text-text hover:bg-secondary';
  const [open, setOpen] = useState(false);
  
  return (
    <div className="group h-full">
      <div className={`relative bg-secondary border ${borderColor} rounded-xl p-6 min-h-[340px] flex flex-col transition-all duration-300 ${hoverBorder} hover:shadow-lg`}>
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-secondary">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${badgeBg}`}>
                {isTechnical ? <><Laptop className="w-4 h-4" /> Technical</> : <><Mic className="w-4 h-4" /> Non-Technical</>}
              </span>
            </div>
          </div>
          <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
            {isTechnical ? <Settings className="w-6 h-6" /> : <Star className="w-6 h-6" />}
          </div>
        </div>

        <h3 className="text-2xl font-bold text-text mb-4 group-hover:text-accent transition-colors line-clamp-2">
          {session.title}
        </h3>

        <div className="space-y-3 mb-6 flex-grow">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-text-lighter" />
            <div className="flex-1">
                          <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Speaker</p>
                          <p className="text-text font-semibold">{session.speaker}</p>
                        </div>
                      </div>
              
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-text-muted" />
                        <div className="flex-1">
                          <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Time</p>
                          <p className="text-text font-semibold">{session.time}</p>            </div>
          </div>
        </div>

        <p className="text-text-muted text-sm leading-relaxed mb-6 line-clamp-3">
          {session.description}
        </p>

        <div className="mt-auto">
          <Button variant="primary" className={`${buttonBg} w-full`} onClick={() => setOpen(true)}>
            View Details
          </Button>
        </div>
      </div>

      {open && <SessionModal session={session} onClose={() => setOpen(false)} />}
    </div>
  );
};

export default SessionCard;
