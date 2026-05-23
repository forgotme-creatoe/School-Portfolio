import React from 'react';
import { motion } from 'motion/react';

export function Hero() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-start w-full py-16 md:py-24 relative"
    >
      {/* Decorative floating elements */}
      <motion.div 
        animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none"
      />
      <motion.div 
        animate={{ y: [0, 15, 0], opacity: [0.2, 0.4, 0.2] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-[50px] pointer-events-none"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, delay: 0.1, type: "spring", bounce: 0.4 }}
        className="px-5 py-2 rounded-full border border-zinc-700/50 bg-zinc-800/30 shadow-lg backdrop-blur-md text-zinc-300 text-sm font-medium tracking-wide mb-8 hover:bg-zinc-800/50 transition-colors cursor-default"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          English Project Portfolio
        </span>
      </motion.div>

      <div className="overflow-hidden mb-6">
        <motion.h1 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="text-5xl md:text-7xl font-display font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-500 to-zinc-100 bg-[length:200%_auto] animate-shimmer max-w-4xl leading-[1.1] pb-2"
        >
          Effect of the Pandemic <br className="hidden md:block" /> on the People.
        </motion.h1>
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-lg md:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed mb-10"
      >
          Pandemics Across Time: How Disease Has Shaped Humanity
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="flex flex-wrap items-center gap-3"
      >
        <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest mr-2">Project Team:</span>
        {["Pratham Tyagi", "Pranjal Khandelwal", "Praksh Bansal", "Pragya", "Priyanshi Kaushik", "Rivyanshi"].map((name) => (
          <span key={name} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-zinc-300 text-sm hover:bg-white/10 transition-colors shadow-sm cursor-default hover:text-white hover:border-white/20">
            {name}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
