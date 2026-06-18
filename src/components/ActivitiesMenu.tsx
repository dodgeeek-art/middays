import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, PenTool, Eraser, Smile, ChevronRight, Search, Music, Layers, Volume2 } from '@/components/Icons';
import ClayCard from '@/components/ui/ClayCard';
import MascotSVG from '@/components/MascotSVG';

interface ActivitiesMenuProps {
  onSelectActivity: (
    activity: "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer"
  ) => void;
}

interface ActivityItem {
  id: "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "scavenger-advanced" | "rhyme" | "match" | "drummer";
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  clayVariant: "primary" | "secondary" | "tertiary" | "purple" | "blue" | "lime" | "peach";
  textColor: string;
  pillBg: string;
  disabled: boolean;
  floatDuration: number;
}

export default function ActivitiesMenu({ onSelectActivity }: ActivitiesMenuProps) {
  const router = useRouter();
  const activities: ActivityItem[] = [
    { 
      id: "tracing", 
      name: "Trace", 
      subtitle: "Draw & Write",
      icon: <PenTool className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff85a1]" strokeWidth={3.5} />, 
      clayVariant: "primary",
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
      clayVariant: "secondary",
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
      clayVariant: "peach",
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
      clayVariant: "secondary",
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
      clayVariant: "lime",
      textColor: "text-[#0b4a45]",
      pillBg: "bg-white/90",
      disabled: false,
      floatDuration: 5.5
    },
    { 
      id: "scavenger-advanced", 
      name: "Search+", 
      subtitle: "Advanced Words",
      icon: <Search className="w-6 h-6 sm:w-7 sm:h-7 text-[#8a6cd6]" strokeWidth={3.5} />, 
      clayVariant: "purple",
      textColor: "text-[#3c1e70]",
      pillBg: "bg-white/90",
      disabled: false,
      floatDuration: 5.0
    },
    { 
      id: "rhyme", 
      name: "Rhyme", 
      subtitle: "Rhyme River",
      icon: <Music className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff85a1]" strokeWidth={3.5} />, 
      clayVariant: "blue",
      textColor: "text-[#1e3a8a]",
      pillBg: "bg-white/90",
      disabled: false,
      floatDuration: 4.3
    },
    { 
      id: "match", 
      name: "Match", 
      subtitle: "Phonics Match",
      icon: <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-[#8a6cd6]" strokeWidth={3.5} />, 
      clayVariant: "purple",
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
      clayVariant: "tertiary",
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
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto p-4 z-10 relative"
    >
      {/* Playful boy mascot header speech bubble spanning all columns */}
      <motion.div 
        variants={itemVariants}
        className="relative flex items-center justify-center gap-4 col-span-2 sm:col-span-3 md:col-span-4 mb-4 max-w-md mx-auto w-full px-2"
      >
        {/* Floating Sparkles around Mascot */}
        <div className="absolute top-0 left-4 text-[#ffd166] text-base animate-sparkle-1 pointer-events-none select-none">✨</div>
        <div className="absolute -bottom-1 left-2 text-[#e07383] text-sm animate-sparkle-2 pointer-events-none select-none">✨</div>
        <div className="absolute top-3 left-18 text-[#3fa394] text-[10px] animate-sparkle-3 pointer-events-none select-none">✨</div>

        {/* Floating Boy Mascot */}
        <MascotSVG className="w-16 h-16 select-none shrink-0 filter drop-shadow-[2px_4px_6px_rgba(0,0,0,0.06)] z-10" />
        
        {/* Speech Bubble */}
        <div className="relative bg-white p-4 rounded-[2rem] border-[3px] border-white/50 shadow-clay-card flex-grow">
          {/* Rotated square tail */}
          <div className="absolute left-[-9px] top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-white border-l-[3px] border-b-[3px] border-white/50" />
          
          <div className="text-left relative z-10 pl-1">
            <p className="text-[10px] font-black text-[#d4a919] uppercase tracking-wider leading-none mb-1">Buddy says:</p>
            <p className="text-xs font-bold text-[#4A5358]/80 leading-normal">Pick a game to play together!</p>
          </div>
        </div>
      </motion.div>

      {activities.map((act) => (
        <ClayCard
          key={act.id}
          variant={act.disabled ? "default" : act.clayVariant}
          hoverEffect={!act.disabled}
          onClick={() => {
            if (act.disabled) return;
            if (act.id === "scavenger-advanced") {
              router.push("/advanced-search");
            } else {
              onSelectActivity(act.id as any);
            }
          }}
          className={`relative overflow-hidden aspect-[1.1] p-5 sm:p-6 flex flex-col items-center justify-center text-center w-full ${
            act.disabled ? "opacity-55 saturate-50 cursor-not-allowed border-dashed border-[#9eb1bd]/40" : "cursor-pointer"
          }`}
        >
          {/* Recessed carved clay pocket for icons */}
          <motion.div 
            animate={act.disabled ? {} : { 
              y: [0, -4, 0],
              rotate: [0, 1.5, -1.5, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: act.floatDuration,
              ease: "easeInOut"
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-t-[2px] border-l-[2px] border-b-white/30 border-r-white/30 border-t-black/10 border-l-black/10 bg-black/5 shadow-[inset_2px_2.5px_5px_rgba(0,0,0,0.12),_inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.45)] shrink-0 mb-3"
          >
            {act.icon}
          </motion.div>
          
          <div className="flex flex-col items-center">
            <h2 className={`text-base sm:text-lg font-black tracking-wide uppercase ${act.textColor} leading-tight`}>{act.name}</h2>
            <span className={`text-[10px] sm:text-xs font-bold ${act.textColor}/60 mt-0.5`}>
              {act.subtitle}
            </span>
          </div>

          {/* Gold highlight badge for new/featured "Trace" activity */}
          {!act.disabled && act.id === "tracing" && (
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full border-2 border-white/60 bg-[#f2c94c] text-[#544001] flex items-center justify-center text-[10px] font-black shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8),_inset_-1px_-1px_2px_rgba(0,0,0,0.1),0px_2px_4px_rgba(212,169,25,0.3)] animate-pulse-bounce">
              ⭐
            </div>
          )}

          {/* Locked overlay badge if disabled */}
          {act.disabled && (
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full border border-white/30 bg-white/95 flex items-center justify-center text-xs shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.9),_inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.04)] shrink-0">
              🔒
            </div>
          )}
        </ClayCard>
      ))}
    </motion.div>
  );
}

