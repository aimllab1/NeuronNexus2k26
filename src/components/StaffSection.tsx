import React from 'react';
import { GraduationCap, UserCheck, School, Laptop, User, Phone, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StaffMember {
  name: string;
  position: string;
  icon: React.ReactNode;
}

const StaffSection: React.FC = () => {
  const leadership: StaffMember[] = [
    {
      name: 'Ms. POORNIMADEVI',
      position: 'Convenor',
      icon: <UserCheck className="w-8 h-8 text-rose-400" />
    },
    {
      name: 'Dr. N ELAMATHI',
      position: 'HOD - CSE (AI & ML)',
      icon: <Laptop className="w-8 h-8 text-yellow-400" />
    },
    {
      name: 'Dr. A BHUVANESHWARI',
      position: 'Vice Principal',
      icon: <School className="w-8 h-8 text-tech-blue" />
    },
    {
      name: 'Dr. V RAMASAMY',
      position: 'Dean',
      icon: <UserCheck className="w-8 h-8 text-purple-400" />
    },
    {
      name: 'Dr. J RAJA',
      position: 'Principal',
      icon: <GraduationCap className="w-8 h-8 text-tech-cyan" />
    },
    {
      name: 'Mr. J SENTHIL KUMAR',
      position: 'Assistant HOD',
      icon: <UserCheck className="w-8 h-8 text-emerald-400" />
    },
  ];

  const coordinators = [
    {
      name: 'Mr. Gowri Sankar',
      position: 'Chairperson',
      phone: '9486202263',
      icon: <UserCheck className="w-6 h-6 text-tech-cyan" />,
      highlight: true,
    },
    {
      name: 'Mr. Malarmannan M',
      position: 'Student Coordinator',
      phone: '9342660767',
      icon: <User className="w-6 h-6 text-slate-300" />,
      highlight: false,
    },
    {
      name: 'Mr. Rishigesh K',
      position: 'Student Coordinator',
      phone: '6369634756',
      icon: <User className="w-6 h-6 text-slate-300" />,
      highlight: false,
    },
    {
      name: 'Mr. Praveen Kumar T',
      position: 'Student Coordinator',
      phone: '9025737858',
      icon: <User className="w-6 h-6 text-slate-300" />,
      highlight: false,
    },
    {
      name: 'Mr. Tharun K',
      position: 'Student Coordinator',
      phone: '6384271205',
      icon: <User className="w-6 h-6 text-slate-300" />,
      highlight: false,
    },
  ];

  const otherCoordinators = [
    'Mr. Sanjay Kumar',
    'Mr. Syed Rashid',
    'Mr. Hariharan',
    'Ms. Narkis Banu',
    'Ms. Karthika',
    'Ms. Janani',
    'Mr. Jeevanantham',
    'Mr. Gopinath',
    'Mr. Thenamuthan',
    'Mr. Vishwa',
    'Mr. Logeswaran',
  ];

  return (
    <section className="relative py-24 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight uppercase">
            LEADERSHIP <span className="text-tech-cyan">&</span> COORDINATION
          </h2>
          <div className="h-1 w-24 bg-tech-cyan mx-auto rounded-full shadow-[0_0_10px_#06b6d4]"></div>
        </div>

        {/* Leadership Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-20">
          {leadership.map((member, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative backdrop-blur-sm border p-6 rounded-xl transition-all bg-space-900/50 border-white/10 hover:border-tech-cyan/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >
              <div className="mb-4 p-3 bg-space-950 w-fit rounded-lg border border-white/5 group-hover:border-tech-cyan/30 transition-colors">
                {member.icon}
              </div>
              <h3 className="text-lg font-bold mb-1 transition-colors text-white group-hover:text-tech-cyan">
                {member.name}
              </h3>
              <p className="text-sm text-slate-400 font-mono uppercase tracking-widest">{member.position}</p>
            </motion.div>
          ))}
        </div>

        {/* Coordinators Section */}
        <div className="border border-white/10 rounded-2xl bg-space-900/30 p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold text-center text-white mb-8">Symposium Coordinators</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {coordinators.map((coordinator, index) => (
              <div key={index} className="flex flex-col items-center gap-4 group p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-tech-cyan/30 transition-all">
                <div className={`p-4 rounded-full border transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] ${coordinator.highlight ? 'bg-tech-cyan/10 border-tech-cyan/40 group-hover:bg-tech-cyan/20 group-hover:border-tech-cyan' : 'bg-white/5 border-white/10 group-hover:bg-tech-cyan/10 group-hover:border-tech-cyan/50'}`}>
                  {coordinator.icon}
                </div>
                <div className="text-center">
                  <h4 className={`text-base font-bold transition-colors group-hover:text-tech-cyan ${coordinator.highlight ? 'text-tech-cyan' : 'text-white'}`}>{coordinator.name}</h4>
                  <p className={`text-[10px] uppercase tracking-widest mb-4 ${coordinator.highlight ? 'text-tech-cyan/70' : 'text-slate-500'}`}>{coordinator.position}</p>
                  
                  {/* Contact Buttons */}
                  <div className="flex gap-2 justify-center mt-2">
                    <a
                      href={`tel:${coordinator.phone}`}
                      className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 transition-all"
                      title="Call"
                    >
                      <Phone size={14} />
                    </a>
                    <a
                      href={`https://wa.me/91${coordinator.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20 hover:text-green-200 transition-all"
                      title="WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Coordinators */}
        <div className="mt-8 border border-white/10 rounded-2xl bg-space-900/30 p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold text-center text-white mb-6">Other Coordinators</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-w-6xl mx-auto">
            {otherCoordinators.map((name) => (
              <div key={name} className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-200 text-center">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaffSection;
