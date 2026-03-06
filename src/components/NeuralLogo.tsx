type NeuralLogoProps = {
  size?: number;
  className?: string;
};

const NeuralLogo = ({ size = 42, className = '' }: NeuralLogoProps) => {
  return (
    <div
      className={`relative rounded-xl border border-tech-cyan/45 bg-space-950/70 shadow-[0_0_18px_rgba(6,182,212,0.35)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
        <defs>
          <linearGradient id="nnGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="41" fill="none" stroke="url(#nnGradient)" strokeWidth="4.5" opacity="0.8" />
        <path
          d="M22 70V30L50 64V30L78 70V30"
          fill="none"
          stroke="url(#nnGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="absolute inset-0 rounded-xl border border-cyan-200/15" />
    </div>
  );
};

export default NeuralLogo;
