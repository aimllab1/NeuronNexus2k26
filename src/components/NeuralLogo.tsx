type NeuralLogoProps = {
  size?: number;
  className?: string;
};

const NeuralLogo = ({ size = 42, className = '' }: NeuralLogoProps) => {
  return (
    <div
      className={`relative rounded-xl border border-tech-cyan/45 bg-space-950/70 shadow-[0_0_18px_rgba(6,182,212,0.35)] overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img 
        src="/logo.png" 
        alt="Neuron Nexus Logo" 
        className="w-full h-full object-contain p-1"
      />
      <div className="absolute inset-0 rounded-xl border border-cyan-200/15 pointer-events-none" />
    </div>
  );
};

export default NeuralLogo;
