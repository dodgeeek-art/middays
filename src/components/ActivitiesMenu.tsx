import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ClayCard from '@/components/ui/ClayCard';
import ClayButton from '@/components/ui/ClayButton';
import MascotSVG from '@/components/MascotSVG';
import { CartoonSVG, vocabularyList } from '@/lib/svgDictionary';
import { 
  PenTool, 
  Eraser, 
  Sparkles, 
  Smile, 
  Search, 
  Music, 
  Layers, 
  Volume2, 
  Grid, 
  HelpCircle, 
  BookOpen, 
  Lightbulb 
} from '@/components/Icons';

interface ActivitiesMenuProps {
  onSelectActivity: (
    activity: "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark" | "pattern" | "alchemy" | "maze" | "symmetry"
  ) => void;
}

interface ActivityItem {
  id: "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "scavenger-advanced" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark" | "pattern" | "alchemy" | "maze" | "symmetry";
  name: string;
  subtitle: string;
  clayVariant: "primary" | "secondary" | "tertiary" | "purple" | "blue" | "lime" | "peach" | "glass";
  textColor: string;
  disabled: boolean;
  floatDuration: number;
  benefit: string;
  glowColor: string;
  gradient: string;
}

// Bespoke 3D Claymorphic Custom Icons for each game imported from Components/Icons

const PencilIcon = (props: any) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <PenTool size="100%" className="text-[#ff85a1]" />
  </CartoonSVG>
);

const EraserIcon = (props: any) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <Eraser size="100%" className="text-[#4ecdc4]" />
  </CartoonSVG>
);

const BubbleIcon = (props: any) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <Sparkles size="100%" className="text-[#4ea0cd]" />
  </CartoonSVG>
);

const MonsterIcon = (props: any) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <Smile size="100%" className="text-[#9e7bf5]" />
  </CartoonSVG>
);

const SearchIcon = (props: any) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <Search size="100%" className="text-[#3fa394]" />
  </CartoonSVG>
);

const AdvancedSearchIcon = (props: any) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <Search size="100%" className="text-[#ff8552]" />
  </CartoonSVG>
);

const MusicIcon = (props: any) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <Music size="100%" className="text-[#f76ca0]" />
  </CartoonSVG>
);

const PuzzleIcon = (props: any) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <Layers size="100%" className="text-[#5c72eb]" />
  </CartoonSVG>
);

const DrumIcon = (props: any) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <Volume2 size="100%" className="text-[#e0a81b]" />
  </CartoonSVG>
);

const BasketIcon = (props: any) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <Grid size="100%" className="text-[#f75468]" />
  </CartoonSVG>
);

const BunnyIcon = (props: any) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <HelpCircle size="100%" className="text-[#1ca39c]" />
  </CartoonSVG>
);

const BookIcon = (props: any) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <BookOpen size="100%" className="text-[#925ceb]" />
  </CartoonSVG>
);

const PaletteIcon = (props: any) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <Lightbulb size="100%" className="text-[#e0c11b]" />
  </CartoonSVG>
);

const PatternIcon = (props: any) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <Grid size="100%" className="text-[#9e7bf5]" />
  </CartoonSVG>
);

const SymmetryIcon = (props: any) => {
  const ButterflyIcon = vocabularyList.find(v => v.name === "Butterfly")?.icon || Sparkles;
  return (
    <CartoonSVG animClass="anim-sway" {...props}>
      <ButterflyIcon size="100%" />
    </CartoonSVG>
  );
};

const AlchemyIcon = (props: any) => {
  const KoalaIcon = vocabularyList.find(v => v.name === "Koala")?.icon || Smile;
  return (
    <CartoonSVG animClass="anim-float" {...props}>
      <KoalaIcon size="100%" />
    </CartoonSVG>
  );
};

const MazeIcon = (props: any) => {
  const AlligatorIcon = vocabularyList.find(v => v.name === "Alligator")?.icon || Grid;
  return (
    <CartoonSVG animClass="anim-breathe" {...props}>
      <AlligatorIcon size="100%" />
    </CartoonSVG>
  );
};

const BUILD_VERSION = "v2026.06.23.5";



export default function ActivitiesMenu({ onSelectActivity }: ActivitiesMenuProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<"all" | "phonics" | "logic" | "creative">("all");

  const activities: ActivityItem[] = [
    { 
      id: "tracing", 
      name: "Trace", 
      subtitle: "Draw & Write",
      clayVariant: "glass",
      textColor: "text-[#5e1c22]",
      disabled: false,
      floatDuration: 4.5,
      benefit: "Fine Motor",
      glowColor: "shadow-[0_20px_50px_rgba(224,115,131,0.18)] hover:shadow-[0_25px_60px_rgba(224,115,131,0.3)]",
      gradient: "from-[#fcd5ce]/40 to-[#ffb5a7]/30"
    },
    { 
      id: "reveal", 
      name: "Reveal", 
      subtitle: "Magic Eraser",
      clayVariant: "glass",
      textColor: "text-[#0d4036]",
      disabled: false,
      floatDuration: 5.2,
      benefit: "Visual ID",
      glowColor: "shadow-[0_20px_50px_rgba(63,163,148,0.14)] hover:shadow-[0_25px_60px_rgba(63,163,148,0.25)]",
      gradient: "from-[#c3e6dc]/40 to-[#a3d9cf]/30"
    },
    { 
      id: "bubbles", 
      name: "Pop", 
      subtitle: "Bubble Fun",
      clayVariant: "glass",
      textColor: "text-[#732010]",
      disabled: false,
      floatDuration: 4.1,
      benefit: "Motor Skills",
      glowColor: "shadow-[0_20px_50px_rgba(247,194,179,0.18)] hover:shadow-[0_25px_60px_rgba(247,194,179,0.3)]",
      gradient: "from-[#f7c2b3]/40 to-[#f9b5a2]/30"
    },
    { 
      id: "monster", 
      name: "Feed", 
      subtitle: "Hungry Monster",
      clayVariant: "glass",
      textColor: "text-[#0d4036]",
      disabled: false,
      floatDuration: 4.8,
      benefit: "Phonics",
      glowColor: "shadow-[0_20px_50px_rgba(63,163,148,0.14)] hover:shadow-[0_25px_60px_rgba(63,163,148,0.25)]",
      gradient: "from-[#c3e6dc]/40 to-[#a3d9cf]/30"
    },
    { 
      id: "scavenger", 
      name: "Search", 
      subtitle: "Sound Hunt",
      clayVariant: "glass",
      textColor: "text-[#16533f]",
      disabled: false,
      floatDuration: 5.5,
      benefit: "Sound ID",
      glowColor: "shadow-[0_20px_50px_rgba(190,232,212,0.14)] hover:shadow-[0_25px_60px_rgba(190,232,212,0.25)]",
      gradient: "from-[#bee8d4]/40 to-[#a3d8c1]/30"
    },
    { 
      id: "scavenger-advanced", 
      name: "Search+", 
      subtitle: "Advanced Words",
      clayVariant: "glass",
      textColor: "text-[#42236b]",
      disabled: false,
      floatDuration: 5.0,
      benefit: "Vocabulary",
      glowColor: "shadow-[0_20px_50px_rgba(221,203,245,0.18)] hover:shadow-[0_25px_60px_rgba(221,203,245,0.3)]",
      gradient: "from-[#ddcbf5]/40 to-[#ceb5f2]/30"
    },
    { 
      id: "rhyme", 
      name: "Rhyme", 
      subtitle: "Rhyme River",
      clayVariant: "glass",
      textColor: "text-[#1f3d68]",
      disabled: false,
      floatDuration: 4.3,
      benefit: "Language",
      glowColor: "shadow-[0_20px_50px_rgba(181,204,230,0.14)] hover:shadow-[0_25px_60px_rgba(181,204,230,0.25)]",
      gradient: "from-[#b5cce6]/40 to-[#9cbcdb]/30"
    },
    { 
      id: "match", 
      name: "Match", 
      subtitle: "Phonics Match",
      clayVariant: "glass",
      textColor: "text-[#42236b]",
      disabled: false,
      floatDuration: 5.0,
      benefit: "Memory",
      glowColor: "shadow-[0_20px_50px_rgba(221,203,245,0.14)] hover:shadow-[0_25px_60px_rgba(221,203,245,0.25)]",
      gradient: "from-[#ddcbf5]/40 to-[#ceb5f2]/30"
    },
    { 
      id: "drummer", 
      name: "Beats", 
      subtitle: "Syllable Drum",
      clayVariant: "glass",
      textColor: "text-[#544001]",
      disabled: false,
      floatDuration: 4.6,
      benefit: "Rhythm",
      glowColor: "shadow-[0_20px_50px_rgba(245,228,163,0.14)] hover:shadow-[0_25px_60px_rgba(245,228,163,0.25)]",
      gradient: "from-[#f5e4a3]/40 to-[#ebd787]/30"
    },
    { 
      id: "sorting", 
      name: "Sort", 
      subtitle: "Sorting Basket",
      clayVariant: "glass",
      textColor: "text-[#5e1c22]",
      disabled: false,
      floatDuration: 4.2,
      benefit: "Logic & Math",
      glowColor: "shadow-[0_20px_50px_rgba(247,194,179,0.14)] hover:shadow-[0_25px_60px_rgba(247,194,179,0.25)]",
      gradient: "from-[#f7c2b3]/40 to-[#f9b5a2]/30"
    },
    { 
      id: "bunny", 
      name: "Shelter", 
      subtitle: "Animal Homes",
      clayVariant: "glass",
      textColor: "text-[#0d4036]",
      disabled: false,
      floatDuration: 4.9,
      benefit: "Biology",
      glowColor: "shadow-[0_20px_50px_rgba(196,240,225,0.18)] hover:shadow-[0_25px_60px_rgba(196,240,225,0.3)]",
      gradient: "from-[#c3e6dc]/40 to-[#a3d9cf]/30"
    },
    { 
      id: "story", 
      name: "Story", 
      subtitle: "3-Piece Sequence",
      clayVariant: "glass",
      textColor: "text-[#42236b]",
      disabled: false,
      floatDuration: 5.1,
      benefit: "Narrative",
      glowColor: "shadow-[0_20px_50px_rgba(221,203,245,0.18)] hover:shadow-[0_25px_60px_rgba(221,203,245,0.3)]",
      gradient: "from-[#ddcbf5]/40 to-[#ceb5f2]/30"
    },
    { 
      id: "mark", 
      name: "Draw", 
      subtitle: "Trace & Color",
      clayVariant: "glass",
      textColor: "text-[#544001]",
      disabled: false,
      floatDuration: 4.4,
      benefit: "Writing",
      glowColor: "shadow-[0_20px_50px_rgba(245,228,163,0.18)] hover:shadow-[0_25px_60px_rgba(245,228,163,0.3)]",
      gradient: "from-[#f5e4a3]/40 to-[#ebd787]/30"
    },
    { 
      id: "pattern", 
      name: "Patterns", 
      subtitle: "Pattern Explorer",
      clayVariant: "glass",
      textColor: "text-[#42236b]",
      disabled: false,
      floatDuration: 4.8,
      benefit: "Logic",
      glowColor: "shadow-[0_20px_50px_rgba(221,203,245,0.14)] hover:shadow-[0_25px_60px_rgba(221,203,245,0.25)]",
      gradient: "from-[#ddcbf5]/40 to-[#ceb5f2]/30"
    },
    { 
      id: "alchemy", 
      name: "Alchemy", 
      subtitle: "Clay Alchemy",
      clayVariant: "glass",
      textColor: "text-[#0d4036]",
      disabled: false,
      floatDuration: 4.7,
      benefit: "Color Logic",
      glowColor: "shadow-[0_20px_50px_rgba(63,163,148,0.14)] hover:shadow-[0_25px_60px_rgba(63,163,148,0.25)]",
      gradient: "from-[#c3e6dc]/40 to-[#a3d9cf]/30"
    },
    { 
      id: "maze", 
      name: "Maze", 
      subtitle: "Maze Router",
      clayVariant: "glass",
      textColor: "text-[#42236b]",
      disabled: false,
      floatDuration: 5.3,
      benefit: "Spatial Logic",
      glowColor: "shadow-[0_20px_50px_rgba(221,203,245,0.18)] hover:shadow-[0_25px_60px_rgba(221,203,245,0.3)]",
      gradient: "from-[#ddcbf5]/40 to-[#ceb5f2]/30"
    },
    { 
      id: "symmetry", 
      name: "Symmetry", 
      subtitle: "Symmetry Painter",
      clayVariant: "glass",
      textColor: "text-[#5e1c22]",
      disabled: false,
      floatDuration: 4.2,
      benefit: "Symmetry",
      glowColor: "shadow-[0_20px_50px_rgba(247,194,179,0.18)] hover:shadow-[0_25px_60px_rgba(247,194,179,0.3)]",
      gradient: "from-[#f7c2b3]/40 to-[#f9b5a2]/30"
    }
  ];

  const filteredActivities = activities.filter(act => {
    if (activeCategory === "all") return true;
    if (activeCategory === "phonics") {
      return ["tracing", "reveal", "bubbles", "monster", "scavenger", "scavenger-advanced"].includes(act.id);
    }
    if (activeCategory === "logic") {
      return ["match", "drummer", "sorting", "bunny", "pattern", "maze"].includes(act.id);
    }
    if (activeCategory === "creative") {
      return ["story", "mark", "alchemy", "symmetry"].includes(act.id);
    }
    return true;
  });

  const getGameIcon = (id: string, floatDuration: number) => {
    const props = {
      size: "100%",
      className: "w-full h-full drop-shadow-[4px_6px_10px_rgba(0,0,0,0.1)] hover:rotate-2 select-none pointer-events-none"
    };

    switch (id) {
      case "tracing": return <PencilIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "reveal": return <EraserIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "bubbles": return <BubbleIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "monster": return <MonsterIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "scavenger": return <SearchIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "scavenger-advanced": return <AdvancedSearchIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "rhyme": return <MusicIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "match": return <PuzzleIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "drummer": return <DrumIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "sorting": return <BasketIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "bunny": return <BunnyIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "story": return <BookIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "mark": return <PaletteIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "pattern": return <PatternIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "alchemy": return <AlchemyIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "maze": return <MazeIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "symmetry": return <SymmetryIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
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
      className="grid grid-cols-3 gap-2.5 sm:gap-6 w-full max-w-4xl mx-auto p-2 sm:p-4 z-10 relative overflow-visible"
    >
      {/* Playful compact header bar */}
      <motion.div 
        variants={itemVariants}
        className="col-span-3 mb-1 flex items-center justify-between w-full bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-[1.8rem] border-white/60 border-[3px] shadow-[0_8px_20px_rgba(0,0,0,0.02)] overflow-visible"
      >
        <div className="flex items-center gap-2.5">
          {/* Small Mascot avatar */}
          <div className="relative shrink-0 select-none w-9 h-9">
            <MascotSVG className="w-full h-full filter drop-shadow-[1px_2px_4px_rgba(0,0,0,0.05)] animate-float" />
          </div>
          {/* Logo Branding */}
          <div className="flex items-center gap-2">
            <img
              alt="Midday Logo"
              className="w-6 h-6 object-contain shrink-0"
              src="/logo.png"
            />
            <div className="flex flex-col text-left leading-none">
              <h1 className="font-sans text-sm sm:text-base text-primary tracking-tight font-black uppercase">
                Midday
              </h1>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-[#0d4036]/50">
                  Playbook
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Small header text info */}
        <div className="text-right flex flex-col items-end justify-center gap-1">
          <span className="rounded-full bg-[#2f3e46] px-2.5 py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white shadow-[0_4px_10px_rgba(47,62,70,0.18)]">
            {BUILD_VERSION}
          </span>
          <p className="text-[8px] font-black text-[#d4a919] uppercase tracking-wider leading-none mb-0.5">Buddy says:</p>
          <p className="text-[10px] sm:text-xs font-bold text-[#4A5358]/85 leading-none">Pick a game to play together!</p>
        </div>
      </motion.div>

      {/* Playful Category Switcher */}
      <div className="col-span-3 flex flex-row items-center justify-start sm:justify-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 my-1 z-10 w-full">
        {(["all", "phonics", "logic", "creative"] as const).map((cat) => {
          const isActive = activeCategory === cat;
          const labels = {
            all: "🌈 All",
            phonics: "🔤 Phonics",
            logic: "🧩 Logic",
            creative: "🎨 Creative"
          };
          return (
            <ClayButton
              key={cat}
              variant={isActive ? "primary" : "surface"}
              onClick={() => setActiveCategory(cat)}
              className="py-1.5 px-3.5 text-[10px] sm:text-xs font-black uppercase rounded-full toddler-target shadow-sm active:scale-95 transition-all shrink-0"
            >
              {labels[cat]}
            </ClayButton>
          );
        })}
      </div>

      {filteredActivities.map((act) => {
        return (
          <motion.div
            key={act.id}
            layout
            variants={itemVariants}
            whileHover={{ scale: 1.04, y: -6 }}
            whileTap={{ scale: 0.96, y: 2 }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 16 }}
            className="w-full"
          >
            <ClayCard
              variant="glass"
              hoverEffect={false}
              onClick={() => {
                if (act.disabled) return;
                if (act.id === "scavenger-advanced") {
                  router.push("/advanced-search");
                } else {
                  onSelectActivity(act.id as "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark" | "pattern" | "alchemy" | "maze" | "symmetry");
                }
              }}
              className={`relative overflow-visible p-2.5 sm:p-5 flex flex-col justify-between h-full w-full min-h-[150px] sm:min-h-[220px] select-none cursor-pointer border-white/50 border-[3px] bg-gradient-to-br ${act.gradient} ${act.glowColor} ${act.disabled ? "opacity-60 saturate-50 cursor-not-allowed" : ""}`}
            >
              {/* Gold highlight badge for new/featured "Trace" activity */}
              {!act.disabled && act.id === "tracing" && (
                <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-20 w-6 h-6 sm:w-8 h-8 rounded-full border-2 border-white/60 bg-[#f2c94c] text-[#544001] flex items-center justify-center text-[10px] sm:text-xs font-black shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8),0px_2px_4px_rgba(212,169,25,0.3)] animate-pulse-bounce">
                  ⭐
                </div>
              )}

              {/* Standardized Grid Card Layout */}
              <div className="flex flex-col items-center justify-between text-center h-full w-full gap-2.5 sm:gap-4 relative overflow-visible pt-1">
                {/* Top-aligned animal/item illustration floating freely */}
                <div className="w-14 h-14 sm:w-20 sm:h-20 overflow-visible relative flex items-center justify-center z-10">
                  {getGameIcon(act.id, act.floatDuration)}
                </div>

                {/* Center text info */}
                <div className="flex flex-col items-center w-full">
                  <h2 className={`text-xs sm:text-base md:text-lg font-black tracking-wide uppercase ${act.textColor} leading-tight`}>
                    {act.name}
                  </h2>
                  <span className={`text-[9px] sm:text-xs font-bold ${act.textColor}/60 mt-0.5`}>
                    {act.subtitle}
                  </span>
                </div>

                {/* Bottom developmental benefit pill */}
                <div className="w-full flex justify-center mt-auto">
                  <span className={`inline-flex px-2 py-0.5 sm:px-3 sm:py-1 bg-white/75 border border-white/40 rounded-full text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider ${act.textColor}`}>
                    💡 {act.benefit}
                  </span>
                </div>
              </div>
            </ClayCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
