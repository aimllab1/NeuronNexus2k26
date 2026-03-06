import React, { useEffect, useMemo, useRef } from 'react';

type DustParticle = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
};

const BackgroundHUD: React.FC = () => {
  const sphereRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const dustParticles = useMemo<DustParticle[]>(
    () =>
      Array.from({ length: 180 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.4 + 0.6,
        opacity: Math.random() * 0.45 + 0.2,
        duration: Math.random() * 16 + 10,
        delay: Math.random() * 18,
        driftX: (Math.random() - 0.5) * 160,
        driftY: Math.random() * 220 + 40,
      })),
    []
  );

  useEffect(() => {
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;

    const onMove = (event: MouseEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      target.x = nx * 42;
      target.y = ny * 30;
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      if (sphereRef.current) {
        sphereRef.current.style.transform = `translate(calc(-50% + ${current.x.toFixed(2)}px), calc(-50% + ${current.y.toFixed(2)}px))`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${(current.x * 0.55).toFixed(2)}px, ${(current.y * 0.55).toFixed(2)}px)`;
      }
      if (gridRef.current) {
        gridRef.current.style.transform = `translate(${(-current.x * 0.12).toFixed(2)}px, ${(-current.y * 0.12).toFixed(2)}px)`;
      }
      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#020617_0%,#06142b_40%,#071a35_70%,#020617_100%)]" />
      <div
        ref={glowRef}
        className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_45%,rgba(0,207,255,0.18),transparent_70%)] will-change-transform transition-transform duration-200"
      />
      <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_12%_12%,rgba(0,140,255,0.12),transparent_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_88%_80%,rgba(0,190,255,0.12),transparent_75%)]" />

      <div
        ref={gridRef}
        className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,180,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,180,255,0.1)_1px,transparent_1px)] bg-[size:56px_56px] animate-[gridDrift_34s_linear_infinite] will-change-transform transition-transform duration-200"
      />
      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_3px,rgba(0,220,255,0.06)_4px)]" />

      <div className="absolute inset-0">
        {dustParticles.map((p, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-cyan-200"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              boxShadow: '0 0 12px rgba(0, 210, 255, 0.45)',
              animation: `dustFloat ${p.duration}s linear -${p.delay}s infinite`,
              ['--dx' as any]: `${p.driftX}px`,
              ['--dy' as any]: `${-p.driftY}px`,
            }}
          />
        ))}
      </div>

      <div
        ref={sphereRef}
        className="absolute left-1/2 top-[50%] w-[min(62vw,620px)] aspect-square"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,207,255,0.24)_0%,rgba(0,207,255,0.08)_38%,transparent_72%)] blur-2xl" />
        <div className="absolute inset-[7%] rounded-full border border-cyan-300/35 animate-[sphereSpin_34s_linear_infinite]" />
        <div className="absolute inset-[14%] rounded-full border border-cyan-200/20 animate-[sphereSpinReverse_26s_linear_infinite]" />

        <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full opacity-90 animate-[sphereSpin_42s_linear_infinite]">
          <defs>
            <filter id="sphereGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#sphereGlow)" fill="none" stroke="#00cfff" strokeWidth="1.4" opacity="0.82">
            <circle cx="300" cy="300" r="170" />
            <ellipse cx="300" cy="300" rx="170" ry="130" />
            <ellipse cx="300" cy="300" rx="170" ry="80" />
            <ellipse cx="300" cy="300" rx="170" ry="42" />

            <ellipse cx="300" cy="300" rx="135" ry="170" transform="rotate(25 300 300)" />
            <ellipse cx="300" cy="300" rx="105" ry="170" transform="rotate(70 300 300)" />
            <ellipse cx="300" cy="300" rx="72" ry="170" transform="rotate(112 300 300)" />
          </g>

          <g fill="#77e8ff" opacity="0.9">
            <circle cx="300" cy="130" r="3.2" />
            <circle cx="446" cy="248" r="2.7" />
            <circle cx="392" cy="438" r="2.7" />
            <circle cx="210" cy="438" r="2.7" />
            <circle cx="154" cy="248" r="2.7" />
            <circle cx="300" cy="300" r="3.8" />
          </g>
        </svg>

        <div className="absolute inset-0 rounded-full border border-cyan-100/25 [box-shadow:0_0_55px_rgba(0,207,255,0.3),inset_0_0_35px_rgba(0,207,255,0.18)]" />

        <div className="absolute -inset-6 rounded-full border border-cyan-300/15 animate-[haloPulse_8s_ease-in-out_infinite]" />
      </div>

      <div className="absolute inset-6 md:inset-8 rounded-[36px] border border-cyan-300/35 [box-shadow:0_0_35px_rgba(0,200,255,0.48),inset_0_0_18px_rgba(0,200,255,0.22)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-[42%] bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-[42%] bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-300 rounded-tl-[36px]" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-300 rounded-tr-[36px]" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-300 rounded-bl-[36px]" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-300 rounded-br-[36px]" />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes sphereSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes sphereSpinReverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          @keyframes haloPulse {
            0%, 100% { opacity: 0.35; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.03); }
          }
          @keyframes gridDrift {
            from { background-position: 0 0, 0 0; }
            to { background-position: 620px 620px, 620px 620px; }
          }
          @keyframes dustFloat {
            0% { transform: translate3d(0, 0, 0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translate3d(var(--dx, 0), calc(var(--dy, -220px)), 0); opacity: 0; }
          }
        `,
        }}
      />
    </div>
  );
};

export default BackgroundHUD;
