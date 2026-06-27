"use client";

import React, { useEffect, useState } from "react";
import { BarChart2, BookOpen, CheckCircle2, Clock, Lightbulb, Star } from "@/components/Icons";
import { motion } from "framer-motion";
import ClayButton from "@/components/ui/ClayButton";

interface ProgressRecord {
  id: string;
  targetLetter: string;
  tracingScore: number;
  timeSpentMs: number;
  createdAt: string;
}

interface Child {
  id: string;
  name: string;
  progressRecord: ProgressRecord[];
}

const BRAND_COLORS = {
  literacy: "#ffb51f",
  logic: "#00a9a5",
  motor: "#8d6bff",
  sun: "#ffb51f",
  coral: "#ff6f4f",
  blue: "#2f80ed",
};

const getCategory = (target: string): "Literacy" | "Logic" | "Creative Motor" => {
  const t = target.toUpperCase();
  if (["SORTING", "PATTERN", "STORY", "DRUMMER", "BUNNY", "LOGIC", "ALCH", "MAZE"].includes(t)) {
    return "Logic";
  }
  if (["MARK", "MARKMAKER", "FINE_MOTOR", "SYMM"].includes(t)) {
    return "Creative Motor";
  }
  return "Literacy";
};

const getActivityName = (target: string): string => {
  const t = target.toUpperCase();
  if (t === "STORY") return "Story Sequence";
  if (t === "PATTERN") return "Pattern Explorer";
  if (t === "SORTING") return "Sorting Basket";
  if (t === "MARK") return "Trace & Color";
  if (t === "DRUMMER") return "Syllable Drummer";
  if (t === "BUNNY") return "Animal Homes";
  if (t === "ALCH") return "Clay Alchemy";
  if (t === "MAZE") return "Maze Router";
  if (t === "SYMM") return "Symmetry Painter";
  if (t.length === 1) return `Trace Letter ${t}`;
  return t;
};

const average = (scores: number[], fallback: number) =>
  scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : fallback;

export default function ParentDashboard({ childId }: { childId?: string }) {
  const [data, setData] = useState<Child | null>(null);

  useEffect(() => {
    if (!childId) return;
    const fetchProgress = () => {
      fetch(`/api/progress/${childId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.child) setData(json.child);
        });
    };
    fetchProgress();
  }, [childId]);

  if (!data) {
    return (
      <div className="mx-auto mt-12 w-fit rounded-full border border-[var(--brand-line)] bg-[var(--brand-paper)] px-6 py-4 text-center text-sm font-black text-[var(--brand-muted)] shadow-clay-card">
        Loading dashboard
      </div>
    );
  }

  const records = data.progressRecord;
  const childName = data.name || "Demo Student";
  const totalSessions = records.length;
  const averageScore = totalSessions > 0
    ? Math.round(records.reduce((acc, curr) => acc + curr.tracingScore, 0) / totalSessions)
    : 100;

  const totalTimeMs = records.reduce((acc, curr) => acc + curr.timeSpentMs, 0);
  const totalTimeMins = Math.round(totalTimeMs / 60000);
  const totalTimeStr = totalTimeMins > 0 ? `${totalTimeMins}m` : `${Math.round(totalTimeMs / 1000)}s`;

  const literacyScores = records.filter((r) => getCategory(r.targetLetter) === "Literacy").map((r) => r.tracingScore);
  const logicScores = records.filter((r) => getCategory(r.targetLetter) === "Logic").map((r) => r.tracingScore);
  const motorScores = records.filter((r) => getCategory(r.targetLetter) === "Creative Motor").map((r) => r.tracingScore);

  const avgLiteracy = average(literacyScores, 85);
  const avgLogic = average(logicScores, 80);
  const avgMotor = average(motorScores, 90);

  const strongestArea = [
    { label: "Literacy", value: avgLiteracy, color: BRAND_COLORS.literacy },
    { label: "Logic", value: avgLogic, color: BRAND_COLORS.logic },
    { label: "Creative Motor", value: avgMotor, color: BRAND_COLORS.motor },
  ].sort((a, b) => b.value - a.value)[0];

  const nextFocus = [
    { label: "letter sounds", value: avgLiteracy },
    { label: "patterns and sequencing", value: avgLogic },
    { label: "drawing control", value: avgMotor },
  ].sort((a, b) => a.value - b.value)[0];

  const cx = 150;
  const cy = 135;
  const maxR = 90;

  const getCoordinates = (literacy: number, logic: number, motor: number) => {
    const rLit = (literacy / 100) * maxR;
    const rLog = (logic / 100) * maxR;
    const rMot = (motor / 100) * maxR;
    const pLit = { x: cx, y: cy - rLit };
    const pLog = { x: cx + rLog * Math.cos(Math.PI / 6), y: cy + rLog * Math.sin(Math.PI / 6) };
    const pMot = { x: cx - rMot * Math.cos(Math.PI / 6), y: cy + rMot * Math.sin(5 * Math.PI / 6) };
    return `${pLit.x},${pLit.y} ${pLog.x},${pLog.y} ${pMot.x},${pMot.y}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 26 } },
  };

  const statCards = [
    {
      label: "Accuracy",
      value: `${averageScore}%`,
      detail: "Average scored sessions",
      color: BRAND_COLORS.literacy,
      icon: CheckCircle2,
    },
    {
      label: "Practice Time",
      value: totalTimeStr,
      detail: "Total recorded play",
      color: BRAND_COLORS.sun,
      icon: Clock,
    },
    {
      label: "Sessions",
      value: `${totalSessions}`,
      detail: "Completed activities",
      color: BRAND_COLORS.logic,
      icon: BarChart2,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl px-4 pb-24 pt-5"
    >
      <motion.header variants={itemVariants} className="mb-7 brand-panel p-5 sm:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="brand-chip mb-4">Parent Dashboard</span>
            <h2 className="brand-title text-4xl sm:text-5xl">Learning snapshot</h2>
            <p className="brand-copy mt-3 max-w-2xl">
              A clear view of {childName}&apos;s practice across letters, logic, and creative motor skills.
            </p>
          </div>
          <div className="brand-panel-quiet flex items-center gap-3 px-4 py-3">
            <div className="brand-icon-tile h-12 w-12 text-[var(--brand-sun)]">
              <Star size={26} className="fill-current" />
            </div>
            <div>
              <p className="mb-0 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand-muted)]">Strongest area</p>
              <p className="mb-0 text-lg font-black" style={{ color: strongestArea.color }}>{strongestArea.label}</p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={itemVariants} className="brand-panel p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="brand-icon-tile h-12 w-12" style={{ color: card.color, background: `${card.color}18` }}>
                  <Icon size={28} />
                </div>
                <span className="h-3 w-3 rounded-full" style={{ background: card.color }} />
              </div>
              <p className="mb-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand-muted)]">{card.label}</p>
              <p className="mb-1 font-display text-5xl font-black leading-none" style={{ color: card.color }}>{card.value}</p>
              <p className="mb-0 text-sm font-extrabold text-[var(--brand-muted)]">{card.detail}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.section variants={itemVariants} className="brand-panel p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h3 className="brand-title text-3xl">Skill balance</h3>
              <p className="brand-copy mt-1 text-sm">Three core learning categories, scored from recent sessions.</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-5 md:flex-row">
            <div className="relative flex aspect-square w-full max-w-[330px] items-center justify-center">
              <svg viewBox="0 0 300 270" className="h-full w-full overflow-visible">
                {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => {
                  const r = maxR * scale;
                  const p1 = { x: cx, y: cy - r };
                  const p2 = { x: cx + r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6) };
                  const p3 = { x: cx - r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(5 * Math.PI / 6) };
                  return (
                    <polygon
                      key={scale}
                      points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
                      fill={scale === 1 ? "rgba(255,253,246,0.5)" : "none"}
                      stroke="rgba(34,49,63,0.12)"
                      strokeWidth="1.5"
                      strokeDasharray={scale === 1 ? undefined : "3 3"}
                    />
                  );
                })}
                {[Math.PI / 6, 5 * Math.PI / 6, -Math.PI / 2].map((angle, i) => (
                  <line
                    key={i}
                    x1={cx}
                    y1={cy}
                    x2={cx + maxR * Math.cos(angle)}
                    y2={cy + maxR * Math.sin(angle)}
                    stroke="rgba(34,49,63,0.14)"
                    strokeWidth="1.5"
                  />
                ))}
                <text x={cx} y={cy - maxR - 10} textAnchor="middle" className="fill-[var(--brand-sun-deep)] text-[11px] font-black uppercase">Literacy {avgLiteracy}%</text>
                <text x={cx + maxR * Math.cos(Math.PI / 6) + 8} y={cy + maxR * Math.sin(Math.PI / 6) + 12} textAnchor="start" className="fill-[var(--brand-teal)] text-[11px] font-black uppercase">Logic {avgLogic}%</text>
                <text x={cx - maxR * Math.cos(Math.PI / 6) - 8} y={cy + maxR * Math.sin(5 * Math.PI / 6) + 12} textAnchor="end" className="fill-[var(--brand-violet)] text-[11px] font-black uppercase">Motor {avgMotor}%</text>
                <polygon
                  points={getCoordinates(avgLiteracy, avgLogic, avgMotor)}
                  fill="rgba(255, 92, 122, 0.18)"
                  stroke="var(--brand-sun-deep)"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                {[
                  { x: cx, y: cy - (avgLiteracy / 100) * maxR, color: BRAND_COLORS.literacy },
                  {
                    x: cx + (avgLogic / 100) * maxR * Math.cos(Math.PI / 6),
                    y: cy + (avgLogic / 100) * maxR * Math.sin(Math.PI / 6),
                    color: BRAND_COLORS.logic,
                  },
                  {
                    x: cx - (avgMotor / 100) * maxR * Math.cos(Math.PI / 6),
                    y: cy + (avgMotor / 100) * maxR * Math.sin(5 * Math.PI / 6),
                    color: BRAND_COLORS.motor,
                  },
                ].map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="white" stroke={pt.color} strokeWidth="3.5" />
                ))}
              </svg>
            </div>
            <div className="grid w-full gap-3">
              {[
                { label: "Literacy", value: avgLiteracy, color: BRAND_COLORS.literacy },
                { label: "Logic", value: avgLogic, color: BRAND_COLORS.logic },
                { label: "Creative Motor", value: avgMotor, color: BRAND_COLORS.motor },
              ].map((item) => (
                <div key={item.label} className="brand-panel-quiet p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-black text-[var(--brand-ink)]">{item.label}</span>
                    <span className="text-sm font-black" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="brand-progress-track h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.aside variants={itemVariants} className="grid gap-4">
          <div className="brand-panel p-5">
            <span className="brand-chip mb-4">Next Focus</span>
            <h3 className="brand-title text-3xl">Build on {nextFocus.label}</h3>
            <p className="brand-copy mt-3 text-sm">
              Balance the week with short games that reinforce {nextFocus.label}. Keep sessions brief and repeat the same concept across two or three activities.
            </p>
          </div>
          <div className="brand-panel p-5">
            <span className="brand-chip mb-4">Weekly Rhythm</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="brand-panel-quiet p-4">
                <span className="text-2xl">5</span>
                <p className="mb-0 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand-muted)]">Day streak</p>
              </div>
              <div className="brand-panel-quiet p-4">
                <span className="text-2xl">{Math.max(1, totalSessions)}</span>
                <p className="mb-0 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand-muted)]">Badges</p>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>

      <motion.section variants={itemVariants} className="mb-8">
        <div className="mb-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="brand-title text-3xl">Session history</h3>
            <p className="brand-copy mt-1 text-sm">Recent practice entries and scoring.</p>
          </div>
          <ClayButton variant="surface" size="sm" className="w-fit text-xs">
            Download Report
          </ClayButton>
        </div>

        <div className="grid gap-3">
          {records.map((record) => {
            const category = getCategory(record.targetLetter);
            const color = category === "Literacy" ? BRAND_COLORS.literacy : category === "Logic" ? BRAND_COLORS.logic : BRAND_COLORS.motor;
            return (
              <div key={record.id} className="brand-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="brand-icon-tile h-12 w-12 shrink-0" style={{ color, background: `${color}16` }}>
                    <BookOpen size={23} />
                  </div>
                  <div className="min-w-0">
                    <p className="mb-0 truncate text-sm font-black text-[var(--brand-ink)]">{getActivityName(record.targetLetter)}</p>
                    <p className="mb-0 text-xs font-extrabold text-[var(--brand-muted)]">
                      {category} · {new Date(record.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:min-w-[250px]">
                  <div className="shrink-0 text-right">
                    <p className="mb-0 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--brand-muted)]">Accuracy</p>
                    <p className="mb-0 text-lg font-black" style={{ color }}>{record.tracingScore}%</p>
                  </div>
                  <div className="brand-progress-track h-3 flex-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${record.tracingScore}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {totalSessions === 0 && (
            <div className="rounded-[1.5rem] border-2 border-dashed border-[var(--brand-line)] bg-[var(--brand-paper)] p-8 text-center text-sm font-black text-[var(--brand-muted)]">
              No sessions recorded yet. Start with one short game.
            </div>
          )}
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="brand-panel flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center">
        <div className="brand-icon-tile h-20 w-20 shrink-0 text-[var(--brand-sun)]">
          <Lightbulb size={42} />
        </div>
        <div className="flex-1">
          <h4 className="brand-title text-2xl">Recommended focus: phonetic P</h4>
          <p className="brand-copy mb-0 mt-2 text-sm">
            {childName} is building visual confidence. This week, add a few short games around the letter P to connect tracing, sound recognition, and vocabulary.
          </p>
        </div>
        <ClayButton variant="primary" className="w-full shrink-0 text-sm md:w-auto">
          View Activities
        </ClayButton>
      </motion.section>
    </motion.div>
  );
}
