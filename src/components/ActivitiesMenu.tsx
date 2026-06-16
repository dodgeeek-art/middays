import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, PenTool, Eraser, Smile, ChevronRight } from 'lucide-react';

interface ActivitiesMenuProps {
  onSelectActivity: (activity: "tracing" | "reveal" | "bubbles" | "monster") => void;
}

export default function ActivitiesMenu({ onSelectActivity }: ActivitiesMenuProps) {
  const activities = [
    { 
      id: "tracing", 
      name: "Trace", 
      subtitle: "Draw & Write",
      icon: <PenTool className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" strokeWidth={3} />, 
      gradient: "from-emerald-400 via-emerald-400 to-lime-300", 
      shadowClass: "shadow-[0_12px_24px_-8px_rgba(16,185,129,0.5)]",
      textColor: "text-emerald-950",
      pillBg: "bg-emerald-50/80",
      disabled: false 
    },
    { 
      id: "reveal", 
      name: "Reveal", 
      subtitle: "Magic Eraser",
      icon: <Eraser className="w-6 h-6 sm:w-7 sm:h-7 text-violet-600" strokeWidth={3} />, 
      gradient: "from-violet-400 via-violet-400 to-fuchsia-300", 
      shadowClass: "shadow-[0_12px_24px_-8px_rgba(139,92,246,0.5)]",
      textColor: "text-violet-950",
      pillBg: "bg-violet-50/80",
      disabled: false 
    },
    { 
      id: "bubbles", 
      name: "Pop", 
      subtitle: "Bubble Fun",
      icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-600" strokeWidth={3} />, 
      gradient: "from-cyan-400 via-cyan-400 to-teal-300", 
      shadowClass: "shadow-[0_12px_24px_-8px_rgba(6,182,212,0.5)]",
      textColor: "text-cyan-950",
      pillBg: "bg-cyan-50/80",
      disabled: false 
    },
    { 
      id: "monster", 
      name: "Feed", 
      subtitle: "Hungry Monster",
      icon: <Smile className="w-6 h-6 sm:w-7 sm:h-7 text-rose-600" strokeWidth={3} />, 
      gradient: "from-rose-400 via-rose-400 to-orange-300", 
      shadowClass: "shadow-[0_12px_24px_-8px_rgba(244,63,94,0.5)]",
      textColor: "text-rose-950",
      pillBg: "bg-rose-50/80",
      disabled: false 
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: "spring" as const, stiffness: 220, damping: 18 } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-6 w-full max-w-md mx-auto p-4 z-10 relative"
    >
      {/* Playful Dui the Frog mascot header sticker */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-4 bg-white/95 backdrop-blur-sm p-3.5 pl-3 rounded-3xl border-2 border-slate-dark/95 shadow-[0_8px_30px_rgba(0,0,0,0.05)] max-w-sm mx-auto mb-2 rotate-[-1deg]"
      >
        <div className="w-14 h-14 select-none shrink-0 relative overflow-hidden rounded-2xl border-2 border-slate-dark bg-emerald-50/50 p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <img 
            alt="Dui Frog Mascot" 
            className="w-full h-full object-contain" 
            src="/dui.png" 
          />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider leading-none mb-1">Dui says:</p>
          <p className="text-xs font-black text-slate-800 leading-tight">Tap a game below to start playing!</p>
        </div>
      </motion.div>

      {activities.map((act) => (
        <motion.button
          variants={itemVariants}
          key={act.id}
          whileHover={act.disabled ? {} : { scale: 1.02, y: -2 }}
          whileTap={act.disabled ? {} : { scale: 0.98 }}
          onClick={() => !act.disabled && onSelectActivity(act.id as any)}
          className={`relative overflow-hidden rounded-[2rem] border-2 border-slate-dark p-4 sm:p-5 flex items-center justify-between w-full bg-gradient-to-r ${act.gradient} ${act.shadowClass} transition-all duration-300 cursor-pointer`}
        >
          {/* Shine reflection animation */}
          {!act.disabled && (
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transform duration-1000 ease-in-out pointer-events-none" />
          )}
          
          <div className="flex items-center gap-4">
            {/* Playful floating icon badge container */}
            <motion.div 
              animate={act.disabled ? {} : { 
                y: [0, -3, 0],
                rotate: [0, 1.5, -1.5, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 3 + Math.random() * 2,
                ease: "easeInOut"
              }}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 border-slate-dark ${act.pillBg} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0`}
            >
              {act.icon}
            </motion.div>
            
            <div className="flex flex-col items-start text-left">
              <h2 className={`text-xl sm:text-2xl font-black tracking-wide uppercase ${act.textColor} leading-tight`}>{act.name}</h2>
              <span className={`text-xs font-bold ${act.textColor}/70`}>
                {act.subtitle}
              </span>
            </div>
          </div>

          {/* Right Action Badge */}
          {!act.disabled ? (
            <div className="w-10 h-10 rounded-full border-2 border-slate-dark bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
              <ChevronRight className="w-5 h-5 text-slate-dark" strokeWidth={3} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-slate-dark bg-white/95 flex items-center justify-center text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
              🔒
            </div>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}
