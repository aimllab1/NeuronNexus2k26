import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const base = 'inline-flex items-center justify-center font-bold rounded-lg transition-transform focus:outline-none';
  const variants: Record<string, string> = {
    primary: 'bg-accent text-white px-4 py-2 hover:shadow-lg hover:-translate-y-0.5',
    ghost: 'bg-transparent border border-accent text-accent px-4 py-2 hover:bg-accent/10',
  };

  const cls = `${base} ${variants[variant]} ${className}`.trim();

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
};

export default Button;
