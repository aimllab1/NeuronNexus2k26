import React from 'react';
import Button from './Button';

interface Session {
  id: string;
  title: string;
  speaker: string;
  time: string;
  description: string;
  type: 'technical' | 'non-technical';
}

interface Props {
  session: Session;
  onClose: () => void;
}

const SessionModal: React.FC<Props> = ({ session, onClose }) => {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-secondary max-w-3xl w-full mx-4 rounded-2xl p-6 md:p-8 shadow-2xl transform transition duration-300 scale-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-text mb-1">{session.title}</h3>
            <p className="text-sm text-text-lighter">{session.speaker} • {session.time}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="text-text-light leading-relaxed">
          <p>{session.description}</p>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;
