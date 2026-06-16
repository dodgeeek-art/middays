import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, PenTool, Eraser, Smile } from 'lucide-react';

interface ActivitiesMenuProps {
  onSelectActivity: (activity: "tracing" | "reveal" | "bubbles" | "monster") => void;
}

export default function ActivitiesMenu({ onSelectActivity }: ActivitiesMenuProps) {
  const activities = [
    { 
      id: "tracing", 
      name: "Trace", 
      subtitle: "Draw & Write",
      icon: <PenTool size={44} strokeWidth={3} className="text-[#336b00]" />, 
      bgColor: "var(--lime-green)", 
      wavyClass: "card-wavy-1",
      disabled: false 
    },
    { 
      id: "reveal", 
      name: "Reveal", 
      subtitle: "Magic Eraser",
      icon: <Eraser size={44} strokeWidth={3} className="text-[#635a75]" />, 
      bgColor: "var(--light-purple)", 
      wavyClass: "card-wavy-2",
      disabled: false 
    },
    { 
      id: "bubbles", 
      name: "Pop", 
      subtitle: "Bubble Fun",
      icon: <Sparkles size={44} strokeWidth={3} className="text-[#086c62]" />, 
      bgColor: "var(--light-mint)", 
      wavyClass: "card-wavy-1",
      disabled: false 
    },
    { 
      id: "monster", 
      name: "Feed", 
      subtitle: "Hungry Monster",
      icon: <Smile size={44} strokeWidth={3} className="text-[#9e2a2b]" />, 
      bgColor: "var(--light-peach)", 
      wavyClass: "card-wavy-2",
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
    hidden: { opacity: 0, scale: 0.85, y: 30 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: "spring" as const, stiffness: 200, damping: 15 } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-6 w-full max-w-2xl mx-auto p-4 z-10 relative"
    >
      {activities.map((act) => (
        <motion.button
          variants={itemVariants}
          key={act.id}
          whileHover={act.disabled ? {} : { scale: 1.04, rotate: act.id === "tracing" ? -1.5 : 1.5 }}
          whileTap={act.disabled ? {} : { scale: 0.96, y: 4 }}
          onClick={() => !act.disabled && onSelectActivity(act.id as any)}
          className={`card-organic ${act.wavyClass} ${act.disabled ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'} 
                     p-6 flex flex-col items-center justify-center aspect-square relative overflow-hidden group border-2 border-slate-dark`}
          style={{
            backgroundColor: act.bgColor,
            boxShadow: act.disabled ? "none" : "6px 6px 0px 0px var(--slate-dark)",
            transformStyle: "preserve-3d",
            borderRadius: "2.5rem"
          }}
        >
          {/* Shine reflection animation */}
          {!act.disabled && (
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-tr from-white/0 via-white to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transform duration-1000 ease-in-out pointer-events-none" />
          )}
          
          {/* Themed lock indicator sticker */}
          {act.disabled && (
            <div className="absolute top-4 right-4 bg-white/90 border-2 border-slate-dark w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              🔒
            </div>
          )}
          
          {/* Playful floating icon badge container */}
          <motion.div 
            animate={act.disabled ? {} : { 
              y: [0, -6, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 4 + Math.random() * 2,
              ease: "easeInOut"
            }}
            className="bg-white border-2 border-slate-dark w-24 h-24 rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-4 group-hover:scale-105 transition-transform duration-300"
          >
            {act.icon}
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-black tracking-wide uppercase text-slate-dark">{act.name}</h2>
          <span className={`text-xs font-bold mt-1 ${act.disabled ? 'text-gray-500' : 'text-slate-dark/70'}`}>
            {act.subtitle}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
