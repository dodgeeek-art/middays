import React from "react";
import { ArrowLeft, Volume2 } from "@/components/Icons";
import { GameCategory, GAME_CATEGORY_STYLES } from "@/components/ui/GameShell";

export interface InGameShellMeta {
  title: string;
  eyebrow: string;
  instruction: string;
  category: GameCategory;
  status?: string;
}

interface InGameShellProps {
  children: React.ReactNode;
  meta: InGameShellMeta;
  onBack: () => void;
  onReplayInstruction?: () => void;
}

export default function InGameShell({
  children,
  meta,
  onBack,
  onReplayInstruction,
}: InGameShellProps) {
  const category = GAME_CATEGORY_STYLES[meta.category];

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--brand-line)] bg-[var(--brand-paper)]/86 shadow-[0_18px_48px_rgba(34,49,63,0.1)] backdrop-blur-sm">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--brand-line)] bg-[#fffdf7]/92 px-2.5 py-2 sm:px-4 sm:py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to game library"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--brand-line)] bg-white text-[var(--brand-ink)] shadow-[0_5px_14px_rgba(34,49,63,0.08)] transition active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={3.2} />
        </button>

        <div className="min-w-0 flex-1 px-1">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: category.color }}
            />
            <p className="truncate text-[8px] font-black uppercase tracking-[0.16em] text-[var(--brand-muted)] sm:text-[10px]">
              {meta.eyebrow}
            </p>
          </div>
          <h1 className="truncate font-display text-xl font-extrabold leading-none tracking-normal text-[var(--brand-ink)] sm:text-3xl">
            {meta.title}
          </h1>
        </div>

        {meta.status && (
          <span className="hidden shrink-0 rounded-full border border-[var(--brand-line)] bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-[var(--brand-muted)] sm:inline-flex">
            {meta.status}
          </span>
        )}
      </header>

      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--brand-line)] bg-[#fff8e7]/78 px-3 py-2 sm:px-4">
        <div
          className="h-8 w-1 shrink-0 rounded-full"
          style={{ background: category.color }}
          aria-hidden="true"
        />
        <p className="min-w-0 flex-1 text-xs font-extrabold leading-snug text-[var(--brand-ink)] sm:text-sm">
          {meta.instruction}
        </p>
        {onReplayInstruction && (
          <button
            type="button"
            onClick={onReplayInstruction}
            aria-label="Replay instruction"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--brand-line)] bg-white text-[var(--brand-ink)] shadow-[0_4px_12px_rgba(34,49,63,0.08)] transition active:scale-95"
          >
            <Volume2 className="h-4 w-4" strokeWidth={3} />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-1.5 sm:p-3">
        <div className="midday-game-content h-full min-h-0 overflow-hidden rounded-[1.35rem] bg-white/40">
          {children}
        </div>
      </div>
    </section>
  );
}
