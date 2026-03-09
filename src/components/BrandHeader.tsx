import React from 'react';
import NeuralLogo from './NeuralLogo';

const BrandHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
      <NeuralLogo size={50} className="shrink-0" />
      <div className="min-w-0">
        <h2 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.2em] font-mono truncate">
          Adhiparasakthi Engineering College
        </h2>
        <h3 className="text-[10px] sm:text-xs font-bold text-tech-cyan uppercase tracking-[0.15em] font-mono truncate mt-0.5">
          Department of CSE (AI & ML)
        </h3>
        <p className="text-lg sm:text-2xl font-black text-white uppercase tracking-tighter mt-1">
          Neural <span className="text-tech-cyan">Nexus 2026</span>
        </p>
      </div>
    </div>
  );
};

export default BrandHeader;
