import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, PenTool, Eraser, Smile, ChevronRight, Search, Music, Layers, Volume2 } from 'lucide-react';

interface ActivitiesMenuProps {
  onSelectActivity: (
    activity: "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer"
  ) => void;
}

export default function ActivitiesMenu({ onSelectActivity }: ActivitiesMenuProps) {
  const activities = [
    { 
      id: "tracing", 
      name: "Trace", 
      subtitle: "Draw & Write",
      icon: <PenTool className="w-6 h-6 sm:w-7 sm:h-7 text-[#8E9F85]" strokeWidth={2.5} />, 
      gradient: "from-[#FAF5EB] via-[#FAF5EB] to-[#C8D3C4]", 
      shadowClass: "shadow-[3px_3px_0px_0px_rgba(58,65,58,1)]",
      textColor: "text-[#3A413A]",
      pillBg: "bg-white/90",
      disabled: false 
    },
    { 
      id: "reveal", 
      name: "Reveal", 
      subtitle: "Magic Eraser",
      icon: <Eraser className="w-6 h-6 sm:w-7 sm:h-7 text-[#95A5A6]" strokeWidth={2.5} />, 
      gradient: "from-[#FAF9F5] via-[#FAF9F5] to-[#E8E4D9]", 
      shadowClass: "shadow-[3px_3px_0px_0px_rgba(58,65,58,1)]",
      textColor: "text-[#3A413A]",
      pillBg: "bg-white/90",
      disabled: false 
    },
    { 
      id: "bubbles", 
      name: "Pop", 
      subtitle: "Bubble Fun",
      icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#E5B6A8]" strokeWidth={2.5} />, 
      gradient: "from-[#FAF9F5] via-[#FAF9F5] to-[#E5B6A8]/40", 
      shadowClass: "shadow-[3px_3px_0px_0px_rgba(58,65,58,1)]",
      textColor: "text-[#3A413A]",
      pillBg: "bg-white/90",
      disabled: false 
    },
    { 
      id: "monster", 
      name: "Feed", 
      subtitle: "Hungry Monster",
      icon: <Smile className="w-6 h-6 sm:w-7 sm:h-7 text-[#8E9F85]" strokeWidth={2.5} />, 
      gradient: "from-[#FAF5EB] via-[#FAF5EB] to-[#C8D3C4]/60", 
      shadowClass: "shadow-[3px_3px_0px_0px_rgba(58,65,58,1)]",
      textColor: "text-[#3A413A]",
      pillBg: "bg-white/90",
      disabled: false 
    },
    { 
      id: "scavenger", 
      name: "Search", 
      subtitle: "Sound Hunt",
      icon: <Search className="w-6 h-6 sm:w-7 sm:h-7 text-[#9BB2B1]" strokeWidth={2.5} />, 
      gradient: "from-[#FAF9F5] via-[#FAF9F5] to-[#9BB2B1]/40", 
      shadowClass: "shadow-[3px_3px_0px_0px_rgba(58,65,58,1)]",
      textColor: "text-[#3A413A]",
      pillBg: "bg-white/90",
      disabled: false 
    },
    { 
      id: "rhyme", 
      name: "Rhyme", 
      subtitle: "Rhyme River",
      icon: <Music className="w-6 h-6 sm:w-7 sm:h-7 text-[#E5B6A8]" strokeWidth={2.5} />, 
      gradient: "from-[#FAF9F5] via-[#FAF9F5] to-[#E5B6A8]/40", 
      shadowClass: "shadow-[3px_3px_0px_0px_rgba(58,65,58,1)]",
      textColor: "text-[#3A413A]",
      pillBg: "bg-white/90",
      disabled: false 
    },
    { 
      id: "match", 
      name: "Match", 
      subtitle: "Phonics Match",
      icon: <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-[#8E9F85]" strokeWidth={2.5} />, 
      gradient: "from-[#FAF5EB] via-[#FAF5EB] to-[#C8D3C4]/50", 
      shadowClass: "shadow-[3px_3px_0px_0px_rgba(58,65,58,1)]",
      textColor: "text-[#3A413A]",
      pillBg: "bg-white/90",
      disabled: false 
    },
    { 
      id: "drummer", 
      name: "Beats", 
      subtitle: "Syllable Drum",
      icon: <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#95A5A6]" strokeWidth={2.5} />, 
      gradient: "from-[#FAF9F5] via-[#FAF9F5] to-[#E8E4D9]/80", 
      shadowClass: "shadow-[3px_3px_0px_0px_rgba(58,65,58,1)]",
      textColor: "text-[#3A413A]",
      pillBg: "bg-white/90",
      disabled: false 
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
        className="flex items-center gap-4 bg-white/95 backdrop-blur-sm p-3.5 pl-3 rounded-3xl border-2 border-[#3A413A] shadow-[3px_3px_0px_0px_rgba(58,65,58,1)] max-w-sm mx-auto mb-2 rotate-[-0.5deg] sm:col-span-2"
      >
        <div className="w-12 h-12 select-none shrink-0 relative overflow-hidden rounded-2xl border-2 border-[#3A413A] bg-[#C8D3C4]/20 p-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(58,65,58,1)]">
          <img 
            alt="Dui Frog Mascot" 
            className="w-full h-full object-contain" 
            src="/dui.png" 
          />
        </div>
        <div className="text-left">
          <p className="text-[9px] font-black text-[#8E9F85] uppercase tracking-wider leading-none mb-1">Dui says:</p>
          <p className="text-xs font-black text-[#3A413A] leading-tight">Pick a game to play together!</p>
        </div>
      </motion.div>

      {activities.map((act) => (
        <motion.button
          variants={itemVariants}
          key={act.id}
          whileHover={act.disabled ? {} : { scale: 1.02, y: -2 }}
          whileTap={act.disabled ? {} : { scale: 0.98 }}
          onClick={() => !act.disabled && onSelectActivity(act.id as any)}
          className={`relative overflow-hidden rounded-[2rem] border-2 border-[#3A413A] p-4 flex items-center justify-between w-full bg-gradient-to-r ${act.gradient} ${act.shadowClass} transition-all duration-300 cursor-pointer`}
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
                duration: 4 + Math.random() * 2,
                ease: "easeInOut"
              }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border-2 border-[#3A413A] ${act.pillBg} shadow-[2px_2px_0px_0px_rgba(58,65,58,1)] shrink-0`}
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
            <div className="w-8 h-8 rounded-full border-2 border-[#3A413A] bg-white flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_rgba(58,65,58,1)] shrink-0">
              <ChevronRight className="w-4 h-4 text-[#3A413A]" strokeWidth={3} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-[#3A413A] bg-white/95 flex items-center justify-center text-sm shadow-[1.5px_1.5px_0px_0px_rgba(58,65,58,1)] shrink-0">
              🔒
            </div>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}
