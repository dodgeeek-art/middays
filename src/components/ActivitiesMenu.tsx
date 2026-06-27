import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import MascotSVG from '@/components/MascotSVG';
import { CartoonSVG, vocabularyList } from '@/lib/svgDictionary';
import {
  CategoryBadge,
  GAME_CATEGORY_STYLES,
  GameCategory,
  GameIconTile,
} from '@/components/ui/GameShell';
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
  BookOpen, 
  Lightbulb,
  Grid as GridIcon
} from '@/components/Icons';

interface ActivitiesMenuProps {
  onSelectActivity: (
    activity: "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark" | "pattern" | "alchemy" | "maze" | "symmetry" | "garden" | "magicsoundbubbles"
  ) => void;
}

interface ActivityItem {
  id: "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "scavenger-advanced" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark" | "pattern" | "alchemy" | "maze" | "symmetry" | "garden" | "magicsoundbubbles";
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

type ActivityIconProps = React.SVGProps<SVGSVGElement> & { size?: number | string; animClass?: string };

const PencilIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <PenTool size="100%" className="text-[#ff85a1]" />
  </CartoonSVG>
);

const EraserIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <Eraser size="100%" className="text-[#4ecdc4]" />
  </CartoonSVG>
);

const BubbleIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <Sparkles size="100%" className="text-[#4ea0cd]" />
  </CartoonSVG>
);

const MagicSoundBubblesIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <g fill="none">
      <circle cx="16" cy="16" r="12" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.6" />
      <circle cx="21" cy="12" r="1.5" fill="#ffffff" opacity="0.4" />
    </g>
  </CartoonSVG>
);

const MonsterIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <Smile size="100%" className="text-[#9e7bf5]" />
  </CartoonSVG>
);

const SearchIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <Search size="100%" className="text-[#3fa394]" />
  </CartoonSVG>
);

const AdvancedSearchIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <Search size="100%" className="text-[#ff8552]" />
  </CartoonSVG>
);

const MusicIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <Music size="100%" className="text-[#f76ca0]" />
  </CartoonSVG>
);

const PuzzleIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <Layers size="100%" className="text-[#5c72eb]" />
  </CartoonSVG>
);

const DrumIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <Volume2 size="100%" className="text-[#e0a81b]" />
  </CartoonSVG>
);

const BasketIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <Grid size="100%" className="text-[#f75468]" />
  </CartoonSVG>
);

const BunnyIcon = (props: ActivityIconProps) => {
  const RabbitIcon = vocabularyList.find(v => v.name === "Rabbit")?.icon || Smile;
  return (
    <CartoonSVG animClass="anim-breathe" {...props}>
      <RabbitIcon size="100%" />
    </CartoonSVG>
  );
};

const BookIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <BookOpen size="100%" className="text-[#925ceb]" />
  </CartoonSVG>
);

const PaletteIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <Lightbulb size="100%" className="text-[#e0c11b]" />
  </CartoonSVG>
);

const PatternIcon = (props: ActivityIconProps) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <Grid size="100%" className="text-[#9e7bf5]" />
  </CartoonSVG>
);

const SymmetryIcon = (props: ActivityIconProps) => {
  const ButterflyIcon = vocabularyList.find(v => v.name === "Butterfly")?.icon || Sparkles;
  return (
    <CartoonSVG animClass="anim-sway" {...props}>
      <ButterflyIcon size="100%" />
    </CartoonSVG>
  );
};

const AlchemyIcon = (props: ActivityIconProps) => {
  const KoalaIcon = vocabularyList.find(v => v.name === "Koala")?.icon || Smile;
  return (
    <CartoonSVG animClass="anim-float" {...props}>
      <KoalaIcon size="100%" />
    </CartoonSVG>
  );
};

const MazeIcon = (props: ActivityIconProps) => {
  const AlligatorIcon = vocabularyList.find(v => v.name === "Alligator")?.icon || Grid;
  return (
    <CartoonSVG animClass="anim-breathe" {...props}>
      <AlligatorIcon size="100%" />
    </CartoonSVG>
  );
};

const GardenIcon = (props: ActivityIconProps) => {
  const SunflowerIcon = vocabularyList.find(v => v.name === "Sunflower")?.icon || Sparkles;
  return (
    <CartoonSVG animClass="anim-sway" {...props}>
      <SunflowerIcon size="100%" />
    </CartoonSVG>
  );
};

const BUILD_VERSION = "v2026.06.25.2";

type ActivityFilter = "all" | "phonics" | "logic" | "creative";



export default function ActivitiesMenu({ onSelectActivity }: ActivitiesMenuProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<ActivityFilter>("all");

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
      id: "garden", 
      name: "Garden", 
      subtitle: "Sound Garden",
      clayVariant: "glass",
      textColor: "text-[#16533f]",
      disabled: false,
      floatDuration: 4.8,
      benefit: "Beginning Sounds",
      glowColor: "shadow-[0_20px_50px_rgba(190,232,212,0.14)] hover:shadow-[0_25px_60px_rgba(190,232,212,0.25)]",
      gradient: "from-[#bee8d4]/40 to-[#a3d8c1]/30"
    },
    { 
      id: "magicsoundbubbles", 
      name: "Bubbles", 
      subtitle: "Magic Sounds",
      clayVariant: "glass",
      textColor: "text-[#1d4ed8]",
      disabled: false,
      floatDuration: 4.5,
      benefit: "Sound Popping",
      glowColor: "shadow-[0_20px_50px_rgba(186,230,253,0.18)] hover:shadow-[0_25px_60px_rgba(186,230,253,0.3)]",
      gradient: "from-[#bae6fd]/40 to-[#7dd3fc]/30"
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

  const getActivityCategory = (id: ActivityItem["id"]): GameCategory => {
    if (["tracing", "rhyme", "match"].includes(id)) return "literacy";
    if (["reveal", "bubbles", "monster", "scavenger", "scavenger-advanced", "garden", "magicsoundbubbles", "drummer"].includes(id)) return "sound";
    if (["sorting", "pattern", "maze"].includes(id)) return "logic";
    if (["story", "mark", "alchemy", "symmetry"].includes(id)) return "creative";
    return "nature";
  };

  const filteredActivities = activities.filter(act => {
    if (activeCategory === "all") return true;
    if (activeCategory === "phonics") {
      return ["literacy", "sound"].includes(getActivityCategory(act.id));
    }
    if (activeCategory === "logic") {
      return ["logic", "nature"].includes(getActivityCategory(act.id));
    }
    if (activeCategory === "creative") {
      return getActivityCategory(act.id) === "creative";
    }
    return true;
  });

  const categoryOptions = [
    { id: "all" as const, label: "All", Icon: Sparkles },
    { id: "phonics" as const, label: "Phonics", Icon: BookOpen },
    { id: "logic" as const, label: "Logic", Icon: GridIcon },
    { id: "creative" as const, label: "Creative", Icon: Lightbulb },
  ];

  const gameSections: {
    id: ActivityFilter | "nature";
    title: string;
    subtitle: string;
    categories: GameCategory[];
  }[] = [
    {
      id: "phonics",
      title: "Letters & Sounds",
      subtitle: "Tracing, listening, rhyming, and phonics games.",
      categories: ["literacy", "sound"],
    },
    {
      id: "logic",
      title: "Logic & Patterns",
      subtitle: "Sorting, mazes, patterns, and discovery play.",
      categories: ["logic", "nature"],
    },
    {
      id: "creative",
      title: "Create & Draw",
      subtitle: "Drawing, color logic, stories, and symmetry.",
      categories: ["creative"],
    },
  ];

  const visibleSections = gameSections
    .map((section) => ({
      ...section,
      activities: filteredActivities.filter((activity) =>
        section.categories.includes(getActivityCategory(activity.id))
      ),
    }))
    .filter((section) => section.activities.length > 0);

  const recommendedActivity = activities.find((activity) => activity.id === "tracing") ?? activities[0];

  const handleActivitySelect = (activity: ActivityItem) => {
    if (activity.disabled) return;
    if (activity.id === "scavenger-advanced") {
      router.push("/advanced-search");
      return;
    }
    onSelectActivity(activity.id as "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark" | "pattern" | "alchemy" | "maze" | "symmetry" | "garden" | "magicsoundbubbles");
  };

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
      case "garden": return <GardenIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      case "magicsoundbubbles": return <MagicSoundBubblesIcon {...props} style={{ animationDuration: `${floatDuration}s` }} />;
      default: return null;
    }
  };

  return (
    <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-4 px-1 pb-4 sm:gap-5 sm:px-4">
      <header className="flex items-center justify-between gap-4 px-1 py-2 sm:px-2 sm:py-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative shrink-0">
            <span className="absolute inset-[-0.45rem] -z-10 rounded-full bg-[#ffb51f]/12 blur-xl" />
            <Image
              alt="Midday Logo"
              className="h-14 w-14 rounded-[1.35rem] object-cover shadow-[0_8px_22px_rgba(255,181,31,0.16)] sm:h-16 sm:w-16"
              height={64}
              src="/midday-sun-logo-flat.png"
              unoptimized
              width={64}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h1 className="truncate font-display text-[2.6rem] font-extrabold leading-[0.85] tracking-normal text-[var(--brand-ink)] sm:text-[3.5rem]">
                Midday
              </h1>
              <MascotSVG className="hidden h-8 w-8 shrink-0 sm:block" />
            </div>
            <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--brand-sun-deep)]">
              Game Library
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-[#22313f]/10 bg-[#22313f] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white shadow-[0_10px_24px_rgba(34,49,63,0.12)] sm:px-4 sm:py-2 sm:text-[10px]">
          {BUILD_VERSION}
        </span>
      </header>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,0.88fr)_minmax(300px,0.46fr)]">
        <button
          type="button"
          aria-label={`${recommendedActivity.name}: ${recommendedActivity.subtitle}. ${recommendedActivity.benefit}.`}
          onClick={() => handleActivitySelect(recommendedActivity)}
          className="group relative overflow-hidden rounded-[1.5rem] border border-[rgba(255,181,31,0.32)] bg-[linear-gradient(135deg,rgba(255,181,31,0.18),rgba(255,253,247,0.96)_56%)] p-3 text-left shadow-[0_14px_34px_rgba(255,181,31,0.12)] transition-transform duration-150 active:scale-[0.985] sm:p-4 sm:hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-full bg-[#ffb51f] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#593900]">
                Today&apos;s Pick
              </span>
              <h2 className="mt-3 font-display text-2xl font-extrabold leading-none tracking-normal text-[var(--brand-ink)] sm:text-4xl">
                Trace
              </h2>
              <p className="mt-1 max-w-md text-xs font-extrabold leading-snug text-[var(--brand-muted)] sm:text-sm">
                Warm up with letters and drawing.
              </p>
            </div>
            <GameIconTile category="literacy" className="h-14 w-14 rounded-[1.25rem] p-2 shadow-[0_5px_0_rgba(34,49,63,0.12),0_10px_18px_rgba(34,49,63,0.08)] sm:h-20 sm:w-20">
              {getGameIcon(recommendedActivity.id, recommendedActivity.floatDuration)}
            </GameIconTile>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-9 items-center justify-center rounded-full bg-[#22313f] px-4 text-xs font-black text-white">
              Play now
            </span>
            <CategoryBadge category="literacy" className="min-h-9 px-3 text-[8px]">
              Fine motor
            </CategoryBadge>
          </div>
        </button>

        <aside className="rounded-[1.5rem] border border-[var(--brand-line)] bg-[var(--brand-paper)]/88 p-3 shadow-[0_12px_28px_rgba(34,49,63,0.06)]">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--brand-muted)]">
            Focus
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1.5 lg:grid-cols-2">
            {categoryOptions.map(({ id, label, Icon }) => {
              const isActive = activeCategory === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveCategory(id)}
                  className={`flex min-h-10 items-center justify-center gap-1 rounded-[1rem] border px-1.5 text-[8px] font-black uppercase tracking-[0.03em] transition sm:text-[10px] lg:min-h-11 lg:gap-1.5 lg:px-2 ${
                    isActive
                      ? "border-[#ffb51f]/50 bg-[#ffb51f] text-[#593900] shadow-[0_10px_24px_rgba(255,181,31,0.22)]"
                      : "border-[var(--brand-line)] bg-white/66 text-[var(--brand-ink)]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {visibleSections.map((section) => {
        const sectionColor = GAME_CATEGORY_STYLES[section.categories[0]].color;
        return (
          <section key={section.id} className="rounded-[1.75rem] border border-[var(--brand-line)] bg-[var(--brand-paper)]/72 p-3 shadow-[0_14px_34px_rgba(34,49,63,0.07)] sm:p-4">
            <div className="mb-3 flex items-end justify-between gap-3 px-1">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: sectionColor }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--brand-muted)]">
                    {section.activities.length} games
                  </span>
                </div>
                <h2 className="font-display text-xl font-extrabold leading-none tracking-normal text-[var(--brand-ink)] sm:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-1 text-[11px] font-extrabold leading-snug text-[var(--brand-muted)] sm:text-sm">
                  {section.subtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {section.activities.map((act) => {
                const category = getActivityCategory(act.id);
                const palette = GAME_CATEGORY_STYLES[category];
                return (
                  <button
                    key={act.id}
                    type="button"
                    disabled={act.disabled}
                    aria-label={`${act.name}: ${act.subtitle}. ${act.benefit}.`}
                    onClick={() => handleActivitySelect(act)}
                    className={`group flex min-h-[154px] w-full flex-col items-center rounded-[1.25rem] border bg-white/78 p-2.5 text-center shadow-[0_8px_22px_rgba(34,49,63,0.06)] transition duration-150 active:scale-[0.985] sm:min-h-[172px] sm:rounded-[1.5rem] sm:p-3 sm:hover:-translate-y-0.5 ${
                      act.disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer"
                    } ${palette.border}`}
                  >
                    <GameIconTile category={category} className="h-11 w-11 shrink-0 rounded-[0.95rem] p-2 shadow-[0_3px_0_rgba(34,49,63,0.1),0_6px_10px_rgba(34,49,63,0.06)] sm:h-14 sm:w-14 sm:rounded-[1.15rem]">
                      {getGameIcon(act.id, act.floatDuration)}
                    </GameIconTile>

                    <div className="mt-4 flex min-w-0 flex-1 flex-col items-center">
                      <h3 className={`max-w-full truncate font-display text-[14px] font-extrabold leading-none tracking-normal sm:text-lg ${palette.text}`}>
                        {act.name}
                      </h3>
                      <p className="mt-2 max-w-full truncate text-[9px] font-extrabold leading-none text-[var(--brand-muted)] sm:text-xs">
                        {act.subtitle}
                      </p>
                      <span className="mt-2 hidden max-w-full truncate rounded-full bg-[#fff8e7] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[var(--brand-ink)] sm:inline-flex">
                        {act.benefit}
                      </span>
                      <CategoryBadge category={category} className="mt-2 px-1.5 text-[6px] sm:hidden" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </section>
  );
}
