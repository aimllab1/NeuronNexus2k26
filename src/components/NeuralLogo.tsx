type NeuralLogoProps = {
  size?: number;
  className?: string;
};

const NeuralLogo = ({ size = 42, className = '' }: NeuralLogoProps) => {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img 
        src="https://uploads.onecompiler.io/44fjqfzxs/44fjqgf4u/icon.png" 
        alt="Neural Nexus Logo" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default NeuralLogo;
