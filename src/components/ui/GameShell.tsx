import React from "react";

export type GameCategory = "literacy" | "sound" | "logic" | "creative" | "nature";

export const GAME_CATEGORY_STYLES: Record<
  GameCategory,
  {
    label: string;
    shortLabel: string;
    color: string;
    bg: string;
    border: string;
    text: string;
    icon: string;
    pill: string;
    strip: string;
    shadow: string;
  }
> = {
  literacy: {
    label: "Literacy",
    shortLabel: "Letters",
    color: "#ffb51f",
    bg: "bg-[#fff1b8]",
    border: "border-[#ffb51f]/35",
    text: "text-[#593900]",
    icon: "bg-[#ffb51f] text-[#593900]",
    pill: "bg-[#fffdf5]/88 text-[#593900] border-[#ffb51f]/25",
    strip: "bg-[#ffb51f]",
    shadow: "shadow-[0_16px_30px_rgba(255,181,31,0.2),0_4px_0_rgba(210,135,0,0.32)]",
  },
  sound: {
    label: "Sound",
    shortLabel: "Sound",
    color: "#42c7ff",
    bg: "bg-[#e2f7ff]",
    border: "border-[#42c7ff]/35",
    text: "text-[#0f4d69]",
    icon: "bg-[#42c7ff] text-[#0f4d69]",
    pill: "bg-[#fffdf5]/88 text-[#0f4d69] border-[#42c7ff]/25",
    strip: "bg-[#42c7ff]",
    shadow: "shadow-[0_16px_30px_rgba(66,199,255,0.18),0_4px_0_rgba(47,128,237,0.22)]",
  },
  logic: {
    label: "Logic",
    shortLabel: "Logic",
    color: "#00a9a5",
    bg: "bg-[#d9fbf4]",
    border: "border-[#00a9a5]/30",
    text: "text-[#063f3d]",
    icon: "bg-[#00a9a5] text-white",
    pill: "bg-[#fffdf5]/88 text-[#063f3d] border-[#00a9a5]/18",
    strip: "bg-[#00a9a5]",
    shadow: "shadow-[0_16px_30px_rgba(0,169,165,0.16),0_4px_0_rgba(0,129,126,0.28)]",
  },
  creative: {
    label: "Creative Motor",
    shortLabel: "Create",
    color: "#ff6f4f",
    bg: "bg-[#ffe2d7]",
    border: "border-[#ff6f4f]/30",
    text: "text-[#7a1d0f]",
    icon: "bg-[#ff6f4f] text-white",
    pill: "bg-[#fffdf5]/88 text-[#7a1d0f] border-[#ff6f4f]/18",
    strip: "bg-[#ff6f4f]",
    shadow: "shadow-[0_16px_30px_rgba(255,111,79,0.16),0_4px_0_rgba(196,74,47,0.22)]",
  },
  nature: {
    label: "Nature Logic",
    shortLabel: "Nature",
    color: "#8d6bff",
    bg: "bg-[#eee7ff]",
    border: "border-[#8d6bff]/30",
    text: "text-[#3c247a]",
    icon: "bg-[#8d6bff] text-white",
    pill: "bg-[#fffdf5]/88 text-[#3c247a] border-[#8d6bff]/18",
    strip: "bg-[#8d6bff]",
    shadow: "shadow-[0_16px_30px_rgba(141,107,255,0.16),0_4px_0_rgba(60,36,122,0.22)]",
  },
};

export function CategoryBadge({
  category,
  children,
  className = "",
}: {
  category: GameCategory;
  children?: React.ReactNode;
  className?: string;
}) {
  const style = GAME_CATEGORY_STYLES[category];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] sm:text-[9px] ${style.pill} ${className}`}
    >
      {children ?? style.shortLabel}
    </span>
  );
}

export function GameShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`brand-ray-field relative w-full overflow-visible rounded-[2rem] ${className}`}>
      {children}
    </section>
  );
}

export function GameHeader({
  title,
  eyebrow,
  subtitle,
  leading,
  trailing,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`brand-panel flex w-full items-center justify-between gap-3 overflow-visible px-3.5 py-3 sm:px-5 sm:py-4 ${className}`}
    >
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        {leading}
        <div className="min-w-0 text-left leading-none">
          <h1 className="truncate font-display text-2xl font-extrabold tracking-normal text-[var(--brand-ink)] sm:text-4xl">
            {title}
          </h1>
          {(eyebrow || subtitle) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              {eyebrow && (
                <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--brand-sun-deep)] sm:text-[10px]">
                  {eyebrow}
                </span>
              )}
              {subtitle && (
                <span className="hidden text-xs font-extrabold leading-tight text-[var(--brand-ink)]/72 sm:inline">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </header>
  );
}

export function GameControlBar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex w-full flex-row items-center justify-start gap-2 overflow-x-auto whitespace-nowrap py-1.5 sm:justify-center ${className}`}
    >
      {children}
    </div>
  );
}

export function GamePanel({
  category,
  children,
  featured = false,
  disabled = false,
  className = "",
  ariaLabel,
  onClick,
}: {
  category: GameCategory;
  children: React.ReactNode;
  featured?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
}) {
  const style = GAME_CATEGORY_STYLES[category];
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`brand-sunburst relative flex h-full w-full min-h-[166px] select-none flex-col justify-between overflow-hidden rounded-3xl border-2 p-2.5 text-left transition-transform duration-150 active:scale-[0.98] sm:min-h-[232px] sm:p-4 sm:hover:-translate-y-1 ${style.bg} ${style.border} ${style.shadow} ${
        disabled ? "cursor-not-allowed opacity-60 saturate-50" : "cursor-pointer"
      } ${className}`}
    >
      <div className={`brand-category-strip ${style.strip}`} aria-hidden="true" />
      {featured && (
        <div className="brand-sticker absolute right-1.5 top-1.5 z-20 h-6 w-6 bg-[#ffb51f] text-[10px] font-black text-[#593900] sm:right-3 sm:top-3 sm:h-8 sm:w-8 sm:text-xs">
          ★
        </div>
      )}
      {children}
    </button>
  );
}

export function GameIconTile({
  category,
  children,
  className = "",
}: {
  category: GameCategory;
  children: React.ReactNode;
  className?: string;
}) {
  const style = GAME_CATEGORY_STYLES[category];
  return (
    <div
      className={`relative z-10 flex h-16 w-16 items-center justify-center overflow-visible rounded-[1.45rem] border-2 border-white/70 p-2.5 shadow-[0_4px_0_rgba(34,49,63,0.1),0_8px_16px_rgba(34,49,63,0.08)] sm:h-[5.75rem] sm:w-[5.75rem] ${style.icon} ${className}`}
    >
      {children}
    </div>
  );
}

export function InstructionBubble({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border-2 border-[var(--brand-line)] bg-[var(--brand-paper)]/92 px-4 py-3 text-sm font-extrabold leading-snug text-[var(--brand-ink)] shadow-[0_10px_24px_rgba(34,49,63,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SuccessState({
  title = "Nice work",
  message,
  action,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="brand-panel brand-sunburst flex flex-col items-center gap-4 p-6 text-center">
      <div className="brand-sticker h-16 w-16 bg-[#ffb51f] text-3xl text-[#593900]">★</div>
      <div>
        <h2 className="brand-title text-3xl">{title}</h2>
        {message && <p className="brand-copy mt-2 text-sm">{message}</p>}
      </div>
      {action}
    </div>
  );
}
