import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, PenTool, Eraser, Smile, ChevronRight, Search, Music, Layers, Volume2 } from '@/components/Icons';

interface ActivitiesMenuProps {
  onSelectActivity: (
    activity: "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer"
  ) => void;
}

interface ActivityItem {
  id: "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer";
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  shadowClass: string;
  textColor: string;
  pillBg: string;
  disabled: boolean;
  floatDuration: number;
}

export default function ActivitiesMenu({ onSelectActivity }: ActivitiesMenuProps) {
  const activities: ActivityItem[] = [
    { 
      id: "tracing", 
      name: "Trace", 
      subtitle: "Draw & Write",
      icon: <PenTool className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff85a1]" strokeWidth={3.5} />, 
      gradient: "from-[#FAF9F5] to-[#ffcad4]/60", 
      shadowClass: "shadow-peach",
      textColor: "text-[#590d22]",
      pillBg: "bg-white/90",
      disabled: false,
      floatDuration: 4.5
    },
    { 
      id: "reveal", 
      name: "Reveal", 
      subtitle: "Magic Eraser",
      icon: <Eraser className="w-6 h-6 sm:w-7 sm:h-7 text-[#49a39a]" strokeWidth={3.5} />, 
      gradient: "from-[#FAF9F5] to-[#d2f4e6]/60", 
      shadowClass: "shadow-mint",
      textColor: "text-[#0b4a45]",
      pillBg: "bg-white/90",
      disabled: false,
      floatDuration: 5.2
    },
    { 
      id: "bubbles", 
      name: "Pop", 
      subtitle: "Bubble Fun",
      icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#e0756b]" strokeWidth={3.5} />, 
      gradient: "from-[#FAF9F5] to-[#ffcad4]/50", 
      shadowClass: "shadow-peach",
      textColor: "text-[#590d22]",
      pillBg: "bg-white/90",
      disabled: false,
      floatDuration: 4.1
    },
    { 
      id: "monster", 
      name: "Feed", 
      subtitle: "Hungry Monster",
      icon: <Smile className="w-6 h-6 sm:w-7 sm:h-7 text-[#4ecdc4]" strokeWidth={3.5} />, 
      gradient: "from-[#FAF9F5] to-[#d2f4e6]/60", 
      shadowClass: "shadow-mint",
      textColor: "text-[#0b4a45]",
      pillBg: "bg-white/90",
      disabled: false,
      floatDuration: 4.8
    },
    { 
      id: "scavenger", 
      name: "Search", 
      subtitle: "Sound Hunt",
      icon: <Search className="w-6 h-6 sm:w-7 sm:h-7 text-[#49a39a]" strokeWidth={3.5} />, 
      gradient: "from-[#FAF9F5] to-[#d2f4e6]/60", 
      shadowClass: "shadow-mint",
      textColor: "text-[#0b4a45]",
      pillBg: "bg-white/90",
      disabled: false,
      floatDuration: 5.5
    },
    { 
      id: "rhyme", 
      name: "Rhyme", 
      subtitle: "Rhyme River",
      icon: <Music className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff85a1]" strokeWidth={3.5} />, 
      gradient: "from-[#FAF9F5] to-[#ffcad4]/60", 
      shadowClass: "shadow-peach",
      textColor: "text-[#590d22]",
      pillBg: "bg-white/90",
      disabled: false,
      floatDuration: 4.3
    },
    { 
      id: "match", 
      name: "Match", 
      subtitle: "Phonics Match",
      icon: <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-[#8a6cd6]" strokeWidth={3.5} />, 
      gradient: "from-[#FAF9F5] to-[#e9d5ff]/70", 
      shadowClass: "shadow-purple",
      textColor: "text-[#3c1e70]",
      pillBg: "bg-white/90",
      disabled: false,
      floatDuration: 5.0
    },
    { 
      id: "drummer", 
      name: "Beats", 
      subtitle: "Syllable Drum",
      icon: <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#ffd166]" strokeWidth={3.5} />, 
      gradient: "from-[#FAF9F5] to-[#fef5d1]/80", 
      shadowClass: "shadow-peach",
      textColor: "text-[#5c4d00]",
      pillBg: "bg-white/90",
      disabled: false,
      floatDuration: 4.6
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 15 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: "spring" as const, stiffness: 200, damping: 16 } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full max-w-2xl mx-auto p-4 z-10 relative"
    >
      {/* Playful Dui the Frog mascot header sticker spanning all columns */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-4 bg-white/95 p-3.5 pl-3 rounded-[2rem] border border-white/30 shadow-[10px_10px_20px_rgba(0,0,0,0.04),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)] max-w-sm mx-auto mb-2 rotate-[-0.5deg] sm:col-span-2"
      >
        <div className="w-12 h-12 select-none shrink-0 relative overflow-hidden rounded-2xl border border-white/25 bg-[#C8D3C4]/20 p-0.5 shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.9),_inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.04)] filter drop-shadow-[2px_2px_4px_rgba(0,0,0,0.04)]">
          <img 
            alt="Dui Frog Mascot" 
            className="w-full h-full object-contain" 
            src="/dui.png" 
          />
        </div>
        <div className="text-left">
          <p className="text-[9px] font-black text-[#8E9F85] uppercase tracking-wider leading-none mb-1">Dui says:</p>
          <p className="text-xs font-black text-[#4A5358] leading-tight">Pick a game to play together!</p>
        </div>
      </motion.div>

      {activities.map((act) => (
        <motion.button
          variants={itemVariants}
          key={act.id}
          whileHover={act.disabled ? {} : { scale: 1.03, y: -4 }}
          whileTap={act.disabled ? {} : { scale: 0.97, y: 4 }}
          onClick={() => !act.disabled && onSelectActivity(act.id)}
          className={`relative overflow-hidden rounded-[2rem] border border-white/20 p-4 flex items-center justify-between w-full bg-gradient-to-r ${act.gradient} shadow-[6px_8px_16px_rgba(0,0,0,0.04),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)] hover:shadow-[10px_16px_28px_rgba(0,0,0,0.07),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.12),_inset_-4px_-4px_8px_rgba(255,255,255,0.85)] transition-all duration-200 cursor-pointer`}
        >
          <div className="flex items-center gap-4">
            {/* Playful floating icon badge container */}
            <motion.div 
              animate={act.disabled ? {} : { 
                y: [0, -2, 0],
                rotate: [0, 1, -1, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: act.floatDuration,
                ease: "easeInOut"
              }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border border-white/30 ${act.pillBg} shadow-[inset_2px_2px_4px_rgba(255,255,255,0.95),_inset_-2px_-2px_4px_rgba(0,0,0,0.04)] filter drop-shadow-[2px_3px_4px_rgba(0,0,0,0.05)] shrink-0`}
            >
              {act.icon}
            </motion.div>
            
            <div className="flex flex-col items-start text-left">
              <h2 className={`text-lg sm:text-xl font-black tracking-wide uppercase ${act.textColor} leading-tight`}>{act.name}</h2>
              <span className={`text-[10px] sm:text-xs font-bold ${act.textColor}/60`}>
                {act.subtitle}
              </span>
            </div>
          </div>

          {/* Right Action Badge */}
          {!act.disabled ? (
            <div className="w-8 h-8 rounded-full border border-white/30 bg-white flex items-center justify-center shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.9),_inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.04)] filter drop-shadow-[1.5px_2px_3px_rgba(0,0,0,0.04)] shrink-0">
              <ChevronRight className="w-4 h-4 text-[#4A5358]" strokeWidth={3.5} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full border border-white/30 bg-white/95 flex items-center justify-center text-sm shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.9),_inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.04)] filter drop-shadow-[1.5px_2px_3px_rgba(0,0,0,0.04)] shrink-0">
              🔒
            </div>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}

