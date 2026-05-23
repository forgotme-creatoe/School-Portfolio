import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export function ParticlesBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2px to 6px
      initialX: Math.random() * 100, // 0-100%
      initialY: Math.random() * 100, // 0-100%
      moveX: (Math.random() - 0.5) * 50, // -25vw to 25vw
      moveY: (Math.random() - 0.5) * 50, // -25vh to 25vh
      duration: Math.random() * 25 + 25, // 25s to 50s
      delay: Math.random() * -30, // Negative delay to start immediately in motion
      opacity: Math.random() * 0.4 + 0.2, // 0.2 to 0.6 opacity
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-300 shadow-[0_0_12px_rgba(165,180,252,0.8)]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.initialX}%`,
            top: `${p.initialY}%`,
            opacity: p.opacity,
          }}
          animate={{
            x: [0, `${p.moveX}vw`],
            y: [0, `${p.moveY}vh`],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
