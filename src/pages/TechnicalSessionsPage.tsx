import SessionList from '../components/SessionList';
import { sessions } from '../data/sessions';
const TechnicalSessionsPage = () => {
  const technicalSessions = sessions.filter(session => session.type === 'technical');

  return (
    <div className="pt-24 min-h-screen text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-5 text-center text-tech-cyan">Technical Event Rules</h1>
        <p className="text-slate-400 text-sm sm:text-base text-center mb-10 sm:mb-12 max-w-2xl mx-auto">
          Present, build, debug, and solve through focused technical rounds.
        </p>
        <SessionList sessions={technicalSessions} />
      </div>
    </div>
  );
};

export default TechnicalSessionsPage;
