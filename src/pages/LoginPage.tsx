import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { API_BASE } from '../utils/api';
import BrandHeader from '../components/BrandHeader';

type AdminConfig = {
  password: string;
  route: string;
  superAdmin?: boolean;
};

const ADMIN_CREDENTIALS: Record<string, AdminConfig> = {
  admin1: { password: 'sympo2026p1', route: '/admin-control-pannel-1' },
  admin2: { password: 'sympo2026p2', route: '/admin-control-pannel-2' },
  coordinator: { password: 'sympo2026c', route: '/coordinator-panel-3' },
  admin4: { password: 'sympo2026p4', route: '/admin-control-pannel-4' },
  admin5: { password: '@AiMl@', route: '/admin-control-pannel-5', superAdmin: true },
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setUsername('');
    setPassword('');
  }, []);

  const handleParticipantLogin = async () => {
    const loginEmail = username.trim().toLowerCase();
    const loginPassword = password.trim();
    const response = await fetch(`${API_BASE}/api/participant/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    const data = await response.json();

    if (!data.success) {
      setPassword('');
      alert(data.message || 'Login failed.');
      return;
    }

    localStorage.setItem('participant_id', data.id);
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('super_admin_session');
    setPassword('');
    navigate('/dashboard');
  };

  const handleAdminLogin = () => {
    const adminUser = username.trim().toLowerCase();
    const config = ADMIN_CREDENTIALS[adminUser];

    if (!config || password !== config.password) {
      setPassword('');
      alert('Invalid Credentials. Access Denied.');
      return;
    }

    localStorage.setItem('admin_session', 'true');
    localStorage.setItem('admin_user', adminUser);
    localStorage.removeItem('participant_id');

    if (config.superAdmin) {
      localStorage.setItem('super_admin_session', 'true');
    } else {
      localStorage.removeItem('super_admin_session');
    }

    setPassword('');
    navigate(config.route);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginId = username.trim();
    if (!loginId || !password) {
      alert('Enter login ID and password.');
      return;
    }

    const isEmailLogin = loginId.includes('@');

    if (isEmailLogin) {
      try {
        await handleParticipantLogin();
      } catch {
        setPassword('');
        alert('Server connection failed. Make sure the backend is running.');
      }
      return;
    }

    handleAdminLogin();
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-md mx-auto min-h-screen">
      <div className="mb-8">
        <BrandHeader />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-space-900/50 border border-white/10 p-10 rounded-[2rem] backdrop-blur-md shadow-neon relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-tech-cyan/30 to-transparent" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-tech-cyan/10 border border-tech-cyan/30">
            <Shield className="text-tech-cyan" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Unified <span className="text-tech-cyan">Login</span>
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">
            Use Email for Participant, Username for Admin
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-tech-cyan uppercase tracking-widest opacity-60">
              Email or Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
              <input
                required
                autoComplete="off"
                name="login_id"
                className="w-full bg-space-950 border border-white/10 rounded-xl p-4 pl-12 text-white outline-none focus:border-tech-cyan transition-all font-medium"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-tech-cyan uppercase tracking-widest opacity-60">
              Security Pass
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
              <input
                type="password"
                required
                autoComplete="new-password"
                name="security_pass"
                className="w-full bg-space-950 border border-white/10 rounded-xl p-4 pl-12 text-white outline-none focus:border-tech-cyan transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full font-black py-4 rounded-xl shadow-neon transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest bg-tech-cyan text-space-950 hover:bg-tech-cyan/90"
          >
            Open Dashboard <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
