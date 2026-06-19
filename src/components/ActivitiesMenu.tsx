import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ClayCard from '@/components/ui/ClayCard';
import MascotSVG from '@/components/MascotSVG';
import { objectDictionary } from '@/lib/svgDictionary';

interface ActivitiesMenuProps {
  onSelectActivity: (
    activity: "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark"
  ) => void;
}

interface ActivityItem {
  id: "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "scavenger-advanced" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark";
  name: string;
  subtitle: string;
  clayVariant: "primary" | "secondary" | "tertiary" | "purple" | "blue" | "lime" | "peach" | "glass";
  textColor: string;
  disabled: boolean;
  floatDuration: number;
  colSpan: string;
  rowSpan?: string;
  benefit: string;
  glowColor: string;
  gradient: string;
  animalKey: string;
}

export default function ActivitiesMenu({ onSelectActivity }: ActivitiesMenuProps) {
  const router = useRouter();

  // Resolve animal icon components dynamically from svgDictionary objectDictionary
  const Elephant = objectDictionary["E"].icon;
  const Cat = objectDictionary["C"].icon;
  const Whale = objectDictionary["W"].icon;
  const Lion = objectDictionary["L"].icon;
  const Fox = objectDictionary["F"].icon;
  const Unicorn = objectDictionary["U"].icon;
  const Hippo = objectDictionary["H"].icon;
  const Zebra = objectDictionary["Z"].icon;
  const Monkey = objectDictionary["M"].icon;
  const Pig = objectDictionary["P"].icon;
  const Rabbit = objectDictionary["R"].icon;
  const Owl = objectDictionary["O"].icon;
  const Giraffe = objectDictionary["G"].icon;

  const activities: ActivityItem[] = [
    { 
      id: "tracing", 
      name: "Trace", 
      subtitle: "Draw & Write",
      clayVariant: "glass",
      textColor: "text-[#5e1c22]",
      disabled: false,
      floatDuration: 4.5,
      colSpan: "col-span-2",
      rowSpan: "row-span-2",
      benefit: "Fine Motor",
      glowColor: "shadow-[0_20px_50px_rgba(224,115,131,0.18)] hover:shadow-[0_25px_60px_rgba(224,115,131,0.3)]",
      gradient: "from-[#fcd5ce]/40 to-[#ffb5a7]/30",
      animalKey: "E"
    },
    { 
      id: "reveal", 
      name: "Reveal", 
      subtitle: "Magic Eraser",
      clayVariant: "glass",
      textColor: "text-[#0d4036]",
      disabled: false,
      floatDuration: 5.2,
      colSpan: "col-span-1",
      benefit: "Visual ID",
      glowColor: "shadow-[0_20px_50px_rgba(63,163,148,0.14)] hover:shadow-[0_25px_60px_rgba(63,163,148,0.25)]",
      gradient: "from-[#c3e6dc]/40 to-[#a3d9cf]/30",
      animalKey: "C"
    },
    { 
      id: "bubbles", 
      name: "Pop", 
      subtitle: "Bubble Fun",
      clayVariant: "glass",
      textColor: "text-[#732010]",
      disabled: false,
      floatDuration: 4.1,
      colSpan: "col-span-1",
      benefit: "Motor Skills",
      glowColor: "shadow-[0_20px_50px_rgba(247,194,179,0.18)] hover:shadow-[0_25px_60px_rgba(247,194,179,0.3)]",
      gradient: "from-[#f7c2b3]/40 to-[#f9b5a2]/30",
      animalKey: "W"
    },
    { 
      id: "monster", 
      name: "Feed", 
      subtitle: "Hungry Monster",
      clayVariant: "glass",
      textColor: "text-[#0d4036]",
      disabled: false,
      floatDuration: 4.8,
      colSpan: "col-span-1",
      benefit: "Phonics",
      glowColor: "shadow-[0_20px_50px_rgba(63,163,148,0.14)] hover:shadow-[0_25px_60px_rgba(63,163,148,0.25)]",
      gradient: "from-[#c3e6dc]/40 to-[#a3d9cf]/30",
      animalKey: "L"
    },
    { 
      id: "scavenger", 
      name: "Search", 
      subtitle: "Sound Hunt",
      clayVariant: "glass",
      textColor: "text-[#16533f]",
      disabled: false,
      floatDuration: 5.5,
      colSpan: "col-span-1",
      benefit: "Sound ID",
      glowColor: "shadow-[0_20px_50px_rgba(190,232,212,0.14)] hover:shadow-[0_25px_60px_rgba(190,232,212,0.25)]",
      gradient: "from-[#bee8d4]/40 to-[#a3d8c1]/30",
      animalKey: "F"
    },
    { 
      id: "scavenger-advanced", 
      name: "Search+", 
      subtitle: "Advanced Words",
      clayVariant: "glass",
      textColor: "text-[#42236b]",
      disabled: false,
      floatDuration: 5.0,
      colSpan: "col-span-2",
      benefit: "Vocabulary",
      glowColor: "shadow-[0_20px_50px_rgba(221,203,245,0.18)] hover:shadow-[0_25px_60px_rgba(221,203,245,0.3)]",
      gradient: "from-[#ddcbf5]/40 to-[#ceb5f2]/30",
      animalKey: "U"
    },
    { 
      id: "rhyme", 
      name: "Rhyme", 
      subtitle: "Rhyme River",
      clayVariant: "glass",
      textColor: "text-[#1f3d68]",
      disabled: false,
      floatDuration: 4.3,
      colSpan: "col-span-1",
      benefit: "Language",
      glowColor: "shadow-[0_20px_50px_rgba(181,204,230,0.14)] hover:shadow-[0_25px_60px_rgba(181,204,230,0.25)]",
      gradient: "from-[#b5cce6]/40 to-[#9cbcdb]/30",
      animalKey: "H"
    },
    { 
      id: "match", 
      name: "Match", 
      subtitle: "Phonics Match",
      clayVariant: "glass",
      textColor: "text-[#42236b]",
      disabled: false,
      floatDuration: 5.0,
      colSpan: "col-span-1",
      benefit: "Memory",
      glowColor: "shadow-[0_20px_50px_rgba(221,203,245,0.14)] hover:shadow-[0_25px_60px_rgba(221,203,245,0.25)]",
      gradient: "from-[#ddcbf5]/40 to-[#ceb5f2]/30",
      animalKey: "Z"
    },
    { 
      id: "drummer", 
      name: "Beats", 
      subtitle: "Syllable Drum",
      clayVariant: "glass",
      textColor: "text-[#544001]",
      disabled: false,
      floatDuration: 4.6,
      colSpan: "col-span-1",
      benefit: "Rhythm",
      glowColor: "shadow-[0_20px_50px_rgba(245,228,163,0.14)] hover:shadow-[0_25px_60px_rgba(245,228,163,0.25)]",
      gradient: "from-[#f5e4a3]/40 to-[#ebd787]/30",
      animalKey: "M"
    },
    { 
      id: "sorting", 
      name: "Sort", 
      subtitle: "Sorting Basket",
      clayVariant: "glass",
      textColor: "text-[#5e1c22]",
      disabled: false,
      floatDuration: 4.2,
      colSpan: "col-span-1",
      benefit: "Logic & Math",
      glowColor: "shadow-[0_20px_50px_rgba(247,194,179,0.14)] hover:shadow-[0_25px_60px_rgba(247,194,179,0.25)]",
      gradient: "from-[#f7c2b3]/40 to-[#f9b5a2]/30",
      animalKey: "P"
    },
    { 
      id: "bunny", 
      name: "Bunny", 
      subtitle: "Where is Bunny?",
      clayVariant: "glass",
      textColor: "text-[#0d4036]",
      disabled: false,
      floatDuration: 4.9,
      colSpan: "col-span-2 sm:col-span-1 md:col-span-2",
      benefit: "Spatial",
      glowColor: "shadow-[0_20px_50px_rgba(196,240,225,0.18)] hover:shadow-[0_25px_60px_rgba(196,240,225,0.3)]",
      gradient: "from-[#c3e6dc]/40 to-[#a3d9cf]/30",
      animalKey: "R"
    },
    { 
      id: "story", 
      name: "Story", 
      subtitle: "3-Piece Sequence",
      clayVariant: "glass",
      textColor: "text-[#42236b]",
      disabled: false,
      floatDuration: 5.1,
      colSpan: "col-span-2",
      benefit: "Narrative",
      glowColor: "shadow-[0_20px_50px_rgba(221,203,245,0.18)] hover:shadow-[0_25px_60px_rgba(221,203,245,0.3)]",
      gradient: "from-[#ddcbf5]/40 to-[#ceb5f2]/30",
      animalKey: "O"
    },
    { 
      id: "mark", 
      name: "Draw", 
      subtitle: "Flamingo Trace",
      clayVariant: "glass",
      textColor: "text-[#544001]",
      disabled: false,
      floatDuration: 4.4,
      colSpan: "col-span-2 sm:col-span-1 md:col-span-2",
      benefit: "Writing",
      glowColor: "shadow-[0_20px_50px_rgba(245,228,163,0.18)] hover:shadow-[0_25px_60px_rgba(245,228,163,0.3)]",
      gradient: "from-[#f5e4a3]/40 to-[#ebd787]/30",
      animalKey: "G"
    }
  ];

  const getAnimalIcon = (key: string, floatDuration: number) => {
    const props = {
      size: "100%",
      className: "w-full h-full drop-shadow-[4px_6px_10px_rgba(0,0,0,0.1)] hover:rotate-2 select-none pointer-events-none"
    };

    switch (key) {
      case "E": return <Elephant {...props} animClass="anim-breathe" style={{ animationDuration: `${floatDuration}s` }} />;
      case "C": return <Cat {...props} animClass="anim-sway" style={{ animationDuration: `${floatDuration}s` }} />;
      case "W": return <Whale {...props} animClass="anim-float" style={{ animationDuration: `${floatDuration}s` }} />;
      case "L": return <Lion {...props} animClass="anim-breathe" style={{ animationDuration: `${floatDuration}s` }} />;
      case "F": return <Fox {...props} animClass="anim-float" style={{ animationDuration: `${floatDuration}s` }} />;
      case "U": return <Unicorn {...props} animClass="anim-sway" style={{ animationDuration: `${floatDuration}s` }} />;
      case "H": return <Hippo {...props} animClass="anim-float" style={{ animationDuration: `${floatDuration}s` }} />;
      case "Z": return <Zebra {...props} animClass="anim-sway" style={{ animationDuration: `${floatDuration}s` }} />;
      case "M": return <Monkey {...props} animClass="anim-breathe" style={{ animationDuration: `${floatDuration}s` }} />;
      case "P": return <Pig {...props} animClass="anim-float" style={{ animationDuration: `${floatDuration}s` }} />;
      case "R": return <Rabbit {...props} animClass="anim-breathe" style={{ animationDuration: `${floatDuration}s` }} />;
      case "O": return <Owl {...props} animClass="anim-sway" style={{ animationDuration: `${floatDuration}s` }} />;
      case "G": return <Giraffe {...props} animClass="anim-float" style={{ animationDuration: `${floatDuration}s` }} />;
      default: return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: "spring" as const, stiffness: 180, damping: 15 } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 w-full max-w-4xl mx-auto p-4 z-10 relative overflow-visible"
    >
      {/* Playful speech bubble header spanning all columns */}
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
        <div className="relative bg-white/90 backdrop-blur-md p-4 rounded-[2rem] border-[3px] border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] flex-grow">
          {/* Rotated square tail */}
          <div className="absolute left-[-9px] top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-white/90 border-l-[3px] border-b-[3px] border-white/60" />
          
          <div className="text-left relative z-10 pl-1">
            <p className="text-[10px] font-black text-[#d4a919] uppercase tracking-wider leading-none mb-1">Buddy says:</p>
            <p className="text-xs font-bold text-[#4A5358]/80 leading-normal">Pick a game to play together!</p>
          </div>
        </div>
      </motion.div>

      {activities.map((act) => {
        // Layout calculations for responsive grid cells
        const isTracing = act.id === "tracing";
        const isDoubleWidth = act.colSpan.includes("col-span-2");
        
        return (
          <motion.div
            key={act.id}
            variants={itemVariants}
            className={`${act.colSpan} ${act.rowSpan || "row-span-1"}`}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98, y: 2 }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 16 }}
          >
            <ClayCard
              variant="glass"
              hoverEffect={false} // Handle animations using direct parent motion.div for smoother Bento layout response
              onClick={() => {
                if (act.disabled) return;
                if (act.id === "scavenger-advanced") {
                  router.push("/advanced-search");
                } else {
                  onSelectActivity(act.id as "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark");
                }
              }}
              className={`relative overflow-visible p-5 sm:p-6 flex flex-col justify-between h-full w-full select-none cursor-pointer border-white/40 border-[3px] ${act.glowColor} ${act.disabled ? "opacity-60 saturate-50 cursor-not-allowed" : ""}`}
            >
              {/* Gold highlight badge for new/featured "Trace" activity */}
              {!act.disabled && act.id === "tracing" && (
                <div className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full border-2 border-white/60 bg-[#f2c94c] text-[#544001] flex items-center justify-center text-xs font-black shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8),0px_2px_4px_rgba(212,169,25,0.3)] animate-pulse-bounce">
                  ⭐
                </div>
              )}

              {/* Bento Inner Content Layouts */}
              {isTracing ? (
                // Tracing card (2x2 Featured Hero Card)
                <div className="flex flex-col justify-between h-full w-full min-h-[300px] relative overflow-visible">
                  {/* Top Text Details */}
                  <div className="flex flex-col text-left gap-1 mt-6">
                    <h2 className={`text-2xl font-black tracking-wide uppercase ${act.textColor} leading-tight`}>
                      {act.name}
                    </h2>
                    <span className={`text-xs font-bold ${act.textColor}/60`}>
                      {act.subtitle}
                    </span>
                  </div>

                  {/* Character Illustration breaking borders (bottom right placement) */}
                  <div className="absolute bottom-6 -right-6 w-36 h-36 md:w-44 md:h-44 overflow-visible z-10">
                    {getAnimalIcon(act.animalKey, act.floatDuration)}
                  </div>

                  {/* Bottom developmental benefit pill */}
                  <div className="mt-auto self-start z-10">
                    <span className={`inline-flex px-3 py-1 bg-white/70 border border-white/50 rounded-full text-[9px] font-black uppercase tracking-wider ${act.textColor}`}>
                      💡 {act.benefit}
                    </span>
                  </div>
                </div>
              ) : isDoubleWidth ? (
                // Horizontal 2x1 Spanning Cards (e.g. advanced search, sequence story, bunny, mark trace)
                // Using responsive flex layout that wraps on tablet viewports where bunny & mark become 1x1
                <div className={`flex flex-row ${act.id === 'bunny' || act.id === 'mark' ? 'sm:flex-col sm:justify-between' : ''} md:flex-row items-center justify-between h-full w-full gap-4 relative overflow-visible min-h-[120px]`}>
                  {/* Left-aligned text info */}
                  <div className="flex flex-col text-left gap-1 justify-center flex-1">
                    <h2 className={`text-lg sm:text-xl font-black tracking-wide uppercase ${act.textColor} leading-tight`}>
                      {act.name}
                    </h2>
                    <span className={`text-xs font-bold ${act.textColor}/60 mb-2`}>
                      {act.subtitle}
                    </span>
                    <div className="self-start">
                      <span className={`inline-flex px-2.5 py-0.5 bg-white/70 border border-white/50 rounded-full text-[9px] font-black uppercase tracking-wider ${act.textColor}`}>
                        💡 {act.benefit}
                      </span>
                    </div>
                  </div>

                  {/* Right-aligned animal illustration popping out */}
                  <div className={`relative flex items-center justify-center shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 overflow-visible ${act.id === 'bunny' || act.id === 'mark' ? 'sm:w-20 sm:h-20 sm:mx-auto' : ''}`}>
                    {getAnimalIcon(act.animalKey, act.floatDuration)}
                  </div>
                </div>
              ) : (
                // Standard 1x1 Cards
                <div className="flex flex-col items-center justify-between text-center h-full w-full gap-3 relative overflow-visible min-h-[140px] pt-1">
                  {/* Top-aligned animal illustration floating freely */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 overflow-visible relative flex items-center justify-center z-10">
                    {getAnimalIcon(act.animalKey, act.floatDuration)}
                  </div>

                  {/* Bottom-aligned text info */}
                  <div className="flex flex-col items-center w-full mt-1">
                    <h2 className={`text-sm sm:text-base font-black tracking-wide uppercase ${act.textColor} leading-tight`}>
                      {act.name}
                    </h2>
                    <span className={`text-[10px] sm:text-xs font-bold ${act.textColor}/60 mb-1.5`}>
                      {act.subtitle}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 bg-white/75 border border-white/40 rounded-full text-[8px] font-black uppercase tracking-wider ${act.textColor}`}>
                      {act.benefit}
                    </span>
                  </div>
                </div>
              )}
            </ClayCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
