import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useCursor } from '../context/CursorContext';

const Cursor = () => {
  const { isMagnetic } = useCursor();

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - (isMagnetic ? 20 : 8));
      cursorY.set(e.clientY - (isMagnetic ? 20 : 8));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY, isMagnetic]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        x: cursorX,
        y: cursorY,
      }}
      animate={{
        width: isMagnetic ? 40 : 16,
        height: isMagnetic ? 40 : 16,
        backgroundColor: isMagnetic ? 'rgba(6, 182, 212, 0.2)' : '#06b6d4',
        border: isMagnetic ? '1px solid #06b6d4' : 'none',
        mixBlendMode: 'screen'
      }}
      className="hidden md:block rounded-full shadow-[0_0_10px_#06b6d4]"
    />
  );
};

export default Cursor;
