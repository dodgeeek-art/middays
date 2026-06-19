import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ClayCard from '@/components/ui/ClayCard';
import MascotSVG from '@/components/MascotSVG';
import { CartoonSVG } from '@/lib/svgDictionary';

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
}

// Bespoke 3D Claymorphic Custom Icons for each game

const PencilIcon = (props: any) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
      <path d="M6 26 L10 22" stroke="#ff85a1" strokeWidth="5" />
      <path d="M9 23 L12 20" stroke="#9eb1bd" strokeWidth="4" />
      <path d="M11 21 L23 9" stroke="#ffd166" strokeWidth="6" />
      <path d="M22 10 L25 7" stroke="#e8cfa6" strokeWidth="5" />
      <path d="M24 8 L27 5" stroke="#4a5358" strokeWidth="4" />
    </g>
  </CartoonSVG>
);

const EraserIcon = (props: any) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
      <path d="M6 26 L22 10" stroke="#4a5358" strokeWidth="3" />
      <path d="M21 11 L25 7" stroke="#ff85a1" strokeWidth="4" />
      <path d="M22 6 L23 2 L24 6 L28 7 L24 8 L23 12 L22 8 L18 7 Z" fill="#ffd166" />
      <path d="M12 10 L13 8 L14 10 L16 11 L14 12 L13 14 L12 12 L10 11 Z" fill="#4ecdc4" />
    </g>
  </CartoonSVG>
);

const BubbleIcon = (props: any) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <g fill="none">
      <circle cx="16" cy="16" r="10" stroke="#4ecdc4" strokeWidth="2.5" fill="#c3f2ec" fillOpacity="0.4" />
      <path d="M11 11 A 7 7 0 0 1 21 11" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="7" cy="7" r="4" stroke="#ff85a1" strokeWidth="1.5" fill="#fcd5ce" fillOpacity="0.3" />
      <circle cx="26" cy="24" r="3.5" stroke="#b5cce6" strokeWidth="1.5" fill="#dbe8f2" fillOpacity="0.3" />
    </g>
  </CartoonSVG>
);

const MonsterIcon = (props: any) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <g fill="none">
      <rect x="5" y="5" width="22" height="22" rx="7" fill="#ddcbf5" stroke="#8a6cd6" strokeWidth="2.5" />
      <path d="M9 18 C 9 24, 23 24, 23 18 Z" fill="#4a5358" />
      <path d="M11 18 L13 20 L15 18 M17 18 L19 20 L21 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="12" r="2.5" fill="#4a5358" />
      <circle cx="11.5" cy="11.5" r="0.75" fill="white" />
      <circle cx="21" cy="12" r="2.5" fill="#4a5358" />
      <circle cx="21.5" cy="11.5" r="0.75" fill="white" />
    </g>
  </CartoonSVG>
);

const SearchIcon = (props: any) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
      <circle cx="13" cy="13" r="8" stroke="#3fa394" fill="#c3f2ec" fillOpacity="0.3" />
      <path d="M19 19 L27 27" stroke="#a56953" strokeWidth="3.5" />
      <path d="M8 8 L10 8 M9 7 L9 9" stroke="white" strokeWidth="1.5" />
    </g>
  </CartoonSVG>
);

const AdvancedSearchIcon = (props: any) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
      <circle cx="12" cy="12" r="8" stroke="#ffb5a7" fill="#ffd166" fillOpacity="0.3" />
      <path d="M18 18 L26 26" stroke="#4a5358" strokeWidth="3.5" />
      <path d="M22 8 L23 6 L24 8 L26 9 L24 10 L23 12 L22 10 L20 9 Z" fill="#ffd166" />
      <circle cx="7" cy="18" r="1.5" fill="#ff85a1" />
    </g>
  </CartoonSVG>
);

const MusicIcon = (props: any) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
      <circle cx="10" cy="22" r="4.5" fill="#ff85a1" stroke="#ff85a1" />
      <path d="M14 22 L14 8 L24 6 L24 14" stroke="#ff85a1" />
      <circle cx="20" cy="20" r="4" fill="#ff85a1" stroke="#ff85a1" />
    </g>
  </CartoonSVG>
);

const PuzzleIcon = (props: any) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10 H14 A 2.5 2.5 0 0 1 16.5 12.5 A 2.5 2.5 0 0 1 14 15 H10 V20 H6 Z" fill="#b5cce6" stroke="#1f3d68" />
      <path d="M14 15 H20 V25 H14 A 2.5 2.5 0 0 1 11.5 22.5 A 2.5 2.5 0 0 1 14 20 Z" fill="#bee8d4" stroke="#16533f" />
    </g>
  </CartoonSVG>
);

const DrumIcon = (props: any) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12 C 6 8, 26 8, 26 12 L26 20 C 26 24, 6 24, 6 20 Z" fill="#ff85a1" stroke="#5e1c22" />
      <ellipse cx="16" cy="12" rx="10" ry="3" fill="#fef9e9" stroke="#5e1c22" />
      <path d="M22 6 L28 12" stroke="#4a5358" strokeWidth="3" />
      <circle cx="28" cy="12" r="2" fill="#ffd166" />
    </g>
  </CartoonSVG>
);

const BasketIcon = (props: any) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 14 L8 24 C 8 26, 24 26, 24 24 L26 14 Z" fill="#ffd166" stroke="#544001" />
      <rect x="4" y="11" width="24" height="3" rx="1.5" fill="#f5e4a3" stroke="#544001" />
      <path d="M9 11 A 8 8 0 0 1 23 11" stroke="#544001" />
      <circle cx="16" cy="7" r="3.5" fill="#ff85a1" stroke="#5e1c22" />
    </g>
  </CartoonSVG>
);

const BunnyIcon = (props: any) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 16 V6 C 11 4, 14 4, 14 6 V16 M18 16 V7 C 18 5, 21 5, 21 7 V16" fill="white" stroke="#ff85a1" />
      <path d="M6 24 C 4 20, 10 16, 12 18 C 14 16, 18 16, 20 18 C 22 16, 28 20, 26 24 Z" fill="#4ecdc4" stroke="#0d4036" />
    </g>
  </CartoonSVG>
);

const BookIcon = (props: any) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 24 C 12 21, 6 22, 6 22 V8 C 6 8, 12 7, 16 10 C 20 7, 26 8, 26 8 V22 C 26 22, 20 21, 16 24 Z" fill="#fef9e9" stroke="#8a6cd6" />
      <path d="M16 10 V25" stroke="#ff85a1" />
    </g>
  </CartoonSVG>
);

const PaletteIcon = (props: any) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 14 C 6 6, 26 6, 26 14 C 26 22, 18 26, 13 24 C 9 22, 6 22, 6 14 Z" fill="#fef9e9" stroke="#ffd166" />
      <circle cx="10" cy="18" r="2.5" fill="#edf3f0" stroke="#ffd166" />
      <circle cx="13" cy="10" r="2" fill="#ff85a1" />
      <circle cx="20" cy="11" r="2" fill="#4ecdc4" />
      <circle cx="21" cy="17" r="2" fill="#b5cce6" />
    </g>
  </CartoonSVG>
);


export default function ActivitiesMenu({ onSelectActivity }: ActivitiesMenuProps) {
  const router = useRouter();

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
      name: "Bunny", 
      subtitle: "Where is Bunny?",
      clayVariant: "glass",
      textColor: "text-[#0d4036]",
      disabled: false,
      floatDuration: 4.9,
      colSpan: "col-span-2 sm:col-span-1 md:col-span-2",
      benefit: "Spatial",
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
      subtitle: "Flamingo Trace",
      clayVariant: "glass",
      textColor: "text-[#544001]",
      disabled: false,
      floatDuration: 4.4,
      colSpan: "col-span-2 sm:col-span-1 md:col-span-2",
      benefit: "Writing",
      glowColor: "shadow-[0_20px_50px_rgba(245,228,163,0.18)] hover:shadow-[0_25px_60px_rgba(245,228,163,0.3)]",
      gradient: "from-[#f5e4a3]/40 to-[#ebd787]/30"
    }
  ];

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
      {/* Playful Hero Banner Card spanning all columns */}
      <motion.div 
        variants={itemVariants}
        className="col-span-2 sm:col-span-3 md:col-span-4 rounded-[2.5rem] overflow-hidden border-white/40 border-[3px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] aspect-[21/9] sm:aspect-[21/7] relative bg-white/20 backdrop-blur-md"
      >
        <img 
          alt="Playbook Banner"
          className="w-full h-full object-cover select-none pointer-events-none"
          src="/playbook_hero_banner.png"
        />
        {/* Soft layout shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
      </motion.div>

      {/* Playful unified branding & speech bubble Bento Card spanning all columns */}
      <motion.div 
        variants={itemVariants}
        className="col-span-2 sm:col-span-3 md:col-span-4 mb-2"
      >
        <ClayCard
          variant="glass"
          hoverEffect={false}
          className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 w-full border-white/40 border-[3px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] select-none overflow-visible relative"
        >
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-4 text-left shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-white/10 p-1 shadow-[0_6px_16px_rgba(0,0,0,0.03)] flex items-center justify-center shrink-0">
              <img
                alt="Midday Logo"
                className="w-full h-full object-contain"
                src="/logo.png"
              />
            </div>
            <div className="flex flex-col items-start leading-none text-left">
              <h1 className="font-sans text-2xl sm:text-3xl text-primary tracking-tight font-black uppercase">
                Midday
              </h1>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#0d4036]/50 mt-0.5">
                Playbook
              </span>
            </div>
          </div>

          {/* Buddy Greeting Bubble */}
          <div className="relative flex items-center gap-4 max-w-md w-full md:w-auto">
            {/* Speech Bubble */}
            <div className="relative bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-[1.75rem] border-2 border-white/60 shadow-[0_6px_18px_rgba(0,0,0,0.02)] flex-grow text-left">
              {/* Rotated square tail pointing to the right towards Buddy */}
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-white/95 border-t-2 border-r-2 border-white/60" />
              
              <div className="text-left relative z-10 pl-1">
                <p className="text-[9px] font-black text-[#d4a919] uppercase tracking-wider leading-none mb-1">Buddy says:</p>
                <p className="text-xs sm:text-sm font-bold text-[#4A5358]/80 leading-normal">Pick a game to play together!</p>
              </div>
            </div>

            {/* Floating Boy Mascot */}
            <div className="relative shrink-0 select-none w-16 h-16 sm:w-18 sm:h-18">
              {/* Sparkles */}
              <div className="absolute top-0 -left-1.5 text-[#ffd166] text-xs animate-sparkle-1 pointer-events-none">✨</div>
              <div className="absolute -bottom-1 -right-1 text-[#e07383] text-xs animate-sparkle-2 pointer-events-none">✨</div>
              <MascotSVG className="w-full h-full filter drop-shadow-[2px_4px_6px_rgba(0,0,0,0.06)] animate-float" />
            </div>
          </div>
        </ClayCard>
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
