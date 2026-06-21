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
  colSpan: string;
  rowSpan?: string;
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
      colSpan: "col-span-2",
      rowSpan: "row-span-2",
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
      colSpan: "col-span-1",
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
      colSpan: "col-span-1",
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
      colSpan: "col-span-1",
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
      colSpan: "col-span-1",
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
      colSpan: "col-span-2",
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
      colSpan: "col-span-1",
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
      colSpan: "col-span-1",
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
      colSpan: "col-span-1",
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
      colSpan: "col-span-1",
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
      colSpan: "col-span-2 sm:col-span-1 md:col-span-2",
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
      colSpan: "col-span-2",
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
      colSpan: "col-span-2 sm:col-span-1 md:col-span-2",
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
      colSpan: "col-span-1",
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
      colSpan: "col-span-1",
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
      colSpan: "col-span-1",
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
      colSpan: "col-span-2 sm:col-span-1 md:col-span-2",
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
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 w-full max-w-4xl mx-auto p-4 z-10 relative overflow-visible"
    >
      {/* Playful header layout: Mascot on the left, Speech Bubble on the right */}
      <motion.div 
        variants={itemVariants}
        className="col-span-2 sm:col-span-3 md:col-span-4 mb-2 flex items-center gap-4 sm:gap-6 overflow-visible w-full"
      >
        {/* Floating Boy Mascot on the left */}
        <div className="relative shrink-0 select-none w-18 h-18 sm:w-20 sm:h-20">
          <div className="absolute top-0 -left-1.5 text-[#ffd166] text-xs animate-sparkle-1 pointer-events-none">✨</div>
          <div className="absolute -bottom-1 -right-1 text-[#e07383] text-xs animate-sparkle-2 pointer-events-none">✨</div>
          <MascotSVG className="w-full h-full filter drop-shadow-[2px_4px_8px_rgba(0,0,0,0.06)] animate-float" />
        </div>

        {/* Speech Bubble on the right containing Midday branding + message */}
        <div className="flex-1 relative bg-white/95 backdrop-blur-md px-6 py-4 rounded-[2.2rem] border-white/60 border-[3px] shadow-[0_12px_30px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Rotated square tail pointing to the left towards Buddy */}
          <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-white/95 border-b-2 border-l-2 border-white/60 z-20" />
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full text-left relative z-10">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-11 h-11 rounded-xl bg-white border-2 border-white/10 p-1 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-center shrink-0">
                <img
                  alt="Midday Logo"
                  className="w-full h-full object-contain"
                  src="/logo.png"
                />
              </div>
              <div className="flex flex-col items-start leading-none text-left">
                <h1 className="font-sans text-xl sm:text-2xl text-primary tracking-tight font-black uppercase">
                  Midday
                </h1>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#0d4036]/50 mt-0.5">
                  Playbook
                </span>
              </div>
            </div>

            {/* Vertical divider on desktop, horizontal on mobile */}
            <div className="hidden sm:block w-[2px] h-8 bg-[#0d4036]/10 self-center" />

            {/* Speech text */}
            <div className="flex-grow flex flex-col justify-center text-center sm:text-left">
              <p className="text-[9px] font-black text-[#d4a919] uppercase tracking-wider leading-none mb-1">Buddy says:</p>
              <p className="text-xs sm:text-sm font-bold text-[#4A5358]/85 leading-snug">Pick a game to play together!</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Playful Category Switcher */}
      <div className="col-span-2 sm:col-span-3 md:col-span-4 flex flex-wrap justify-center gap-2.5 my-2 z-10">
        {(["all", "phonics", "logic", "creative"] as const).map((cat) => {
          const isActive = activeCategory === cat;
          const labels = {
            all: "🌈 All Games",
            phonics: "🔤 Letters & Sounds",
            logic: "🧩 Word & Logic",
            creative: "🎨 Story & Draw"
          };
          return (
            <ClayButton
              key={cat}
              variant={isActive ? "primary" : "surface"}
              onClick={() => setActiveCategory(cat)}
              className="py-2.5 px-5 text-xs font-black uppercase rounded-full toddler-target shadow-sm active:scale-95 transition-all"
            >
              {labels[cat]}
            </ClayButton>
          );
        })}
      </div>

      {filteredActivities.map((act) => {
        // Layout calculations for responsive grid cells
        const isTracing = act.id === "tracing";
        const isDoubleWidth = act.colSpan.includes("col-span-2");
        
        return (
          <motion.div
            key={act.id}
            layout
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
                  onSelectActivity(act.id as "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark" | "pattern" | "alchemy" | "maze" | "symmetry");
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
                    {getGameIcon(act.id, act.floatDuration)}
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
                    {getGameIcon(act.id, act.floatDuration)}
                  </div>
                </div>
              ) : (
                // Standard 1x1 Cards
                <div className="flex flex-col items-center justify-between text-center h-full w-full gap-3 relative overflow-visible min-h-[140px] pt-1">
                  {/* Top-aligned animal illustration floating freely */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 overflow-visible relative flex items-center justify-center z-10">
                    {getGameIcon(act.id, act.floatDuration)}
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
