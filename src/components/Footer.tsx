import { Twitter, Linkedin, Mail, Youtube, Phone, MessageCircle } from 'lucide-react';
import NeuralLogo from './NeuralLogo';

const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 text-slate-400 py-12 px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-tech-cyan/50 to-transparent shadow-[0_0_10px_#06b6d4]"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 z-10 relative">

        {/* Brand */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <NeuralLogo size={40} className="hover:scale-110 transition-transform duration-300 cursor-pointer" />
            <h2 className="text-2xl font-black text-white">NEURON <span className="text-tech-cyan">NEXUS 2026</span></h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center md:items-start opacity-70">
            <p className="text-xs font-medium tracking-wide">(c) 2026 Dept of CSE (AI&ML). APEC.</p>
            <a href="/login" className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-tech-cyan transition-colors">Admin Hub Access</a>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Connect</h3>
          <div className="flex flex-wrap justify-center md:justify-end gap-4">
            <FooterLink href="https://x.com/Aiml_Apec" label="Twitter X" icon={<Twitter size={20} />} />
            <FooterLink href="https://www.linkedin.com/in/aiml-apec/" label="LinkedIn" icon={<Linkedin size={20} />} />
            <FooterLink href="https://www.youtube.com/@Aiml-Apec" label="YouTube" icon={<Youtube size={20} />} />
            <FooterLink href="mailto:cseaimlmail@gmail.com" label="Mail" icon={<Mail size={20} />} />
          </div>
          <p className="text-xs text-slate-500 text-center md:text-right">
            cseaimlmail@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, icon, label }: { href: string, icon: any, label: string }) => (
  <a 
    href={href} 
    aria-label={label}
    target={href.startsWith('http') ? '_blank' : undefined}
    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
    className="p-2 rounded-full border border-white/5 bg-white/5 hover:bg-tech-cyan/20 hover:text-tech-cyan hover:border-tech-cyan/50 transition-all duration-300"
  >
    {icon}
  </a>
);

export default Footer;

