"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Heart, Lock, Sparkles, Star, Trophy } from "@/components/Icons";
import { motion } from "framer-motion";

interface Badge {
  id: string;
  badgeName: string;
  earnedAt: string;
}

interface ProgressRecord {
  id: string;
  targetLetter: string;
  tracingScore: number;
}

interface ProgressData {
  progressRecord: ProgressRecord[];
}

const rewards = [
  {
    id: "sound-starter",
    name: "Sound Starter",
    subtitle: "First letter sound",
    icon: BookOpen,
    color: "#ffb51f",
    unlock: ({ badges, sessionsCount }: RewardState) => badges.some((b) => b.badgeName.toLowerCase().startsWith("a")) || sessionsCount > 0,
  },
  {
    id: "star-catcher",
    name: "Star Catcher",
    subtitle: "Practice streak",
    icon: Star,
    color: "#f08a00",
    unlock: ({ sessionsCount }: RewardState) => sessionsCount >= 1,
  },
  {
    id: "pattern-finder",
    name: "Pattern Finder",
    subtitle: "Logic play",
    icon: CheckCircle2,
    color: "#00a9a5",
    unlock: ({ sessionsCount }: RewardState) => sessionsCount >= 2,
  },
  {
    id: "drawing-builder",
    name: "Drawing Builder",
    subtitle: "5 sessions",
    icon: Sparkles,
    color: "#8d6bff",
    unlock: ({ sessionsCount }: RewardState) => sessionsCount >= 5,
    progress: ({ sessionsCount }: RewardState) => Math.min((sessionsCount / 5) * 100, 100),
  },
  {
    id: "kind-heart",
    name: "Kind Heart",
    subtitle: "Daily habit",
    icon: Heart,
    color: "#2f80ed",
    unlock: ({ sessionsCount }: RewardState) => sessionsCount >= 1,
  },
  {
    id: "alphabet-builder",
    name: "Alphabet Builder",
    subtitle: "5 letters",
    icon: Trophy,
    color: "#ff6f4f",
    unlock: ({ uniqueLettersCount }: RewardState) => uniqueLettersCount >= 5,
    progress: ({ uniqueLettersCount }: RewardState) => Math.min((uniqueLettersCount / 5) * 100, 100),
  },
];

interface RewardState {
  badges: Badge[];
  sessionsCount: number;
  uniqueLettersCount: number;
}

export default function ProgressVisualizer({ childId }: { childId?: string }) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  useEffect(() => {
    if (!childId) return;
    const fetchBadges = () => {
      fetch(`/api/badges/${childId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.badges) setBadges(json.badges);
        });

      fetch(`/api/progress/${childId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.child) setProgressData(json.child);
        });
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 4000);
    return () => clearInterval(interval);
  }, [childId]);

  const sessionsCount = progressData ? progressData.progressRecord.length : 0;
  const uniqueLettersCount = progressData
    ? new Set(progressData.progressRecord.map((r) => r.targetLetter[0]?.toUpperCase()).filter(Boolean)).size
    : 0;
  const starsCount = 12 + sessionsCount * 3;

  const rewardState = { badges, sessionsCount, uniqueLettersCount };

  const unlockedRewards = rewards.filter((reward) => reward.unlock(rewardState)).length;
  const completionPercent = Math.round((unlockedRewards / rewards.length) * 100);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative mx-auto max-w-5xl px-4 pb-24 pt-5"
    >
      <motion.section variants={itemVariants} className="brand-panel mb-6 overflow-hidden p-5 sm:p-7">
        <div className="grid gap-6 md:grid-cols-[1fr_0.72fr] md:items-center">
          <div>
            <span className="brand-chip mb-4">Trophy Room</span>
            <h1 className="brand-title text-4xl sm:text-6xl">Progress that feels earned.</h1>
            <p className="brand-copy mt-3 max-w-xl">
              Badges celebrate practice, sounds, patterns, and drawing control without turning the experience into noise.
            </p>
          </div>

          <div className="brand-panel-quiet relative overflow-hidden p-5">
            <div className="absolute right-4 top-4 text-[var(--brand-sun)] opacity-35">
              <Sparkles size={34} />
            </div>
            <div className="mb-5 flex items-center gap-4">
              <div className="brand-icon-tile h-20 w-20 bg-[var(--tertiary-container)] text-[var(--brand-sun)]">
                <Trophy size={46} className="fill-current" />
              </div>
              <div>
                <p className="mb-0 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand-muted)]">Room complete</p>
                <p className="mb-0 font-display text-5xl font-black leading-none text-[var(--brand-ink)]">{completionPercent}%</p>
              </div>
            </div>
            <div className="brand-progress-track h-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="brand-progress-fill"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <div className="mb-7 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Badges", value: badges.length, icon: Trophy, color: "#ffb51f" },
          { label: "Stars", value: starsCount, icon: Star, color: "#f08a00" },
          { label: "Letters", value: uniqueLettersCount, icon: BookOpen, color: "#00a9a5" },
          { label: "Sessions", value: sessionsCount, icon: CheckCircle2, color: "#2f80ed" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={itemVariants} className="brand-panel p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="brand-icon-tile h-11 w-11" style={{ background: `${stat.color}18`, color: stat.color }}>
                  <Icon size={24} className={stat.label === "Stars" || stat.label === "Badges" ? "fill-current" : undefined} />
                </div>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: stat.color }} />
              </div>
              <p className="mb-0 font-display text-4xl font-black leading-none" style={{ color: stat.color }}>{stat.value}</p>
              <p className="mb-0 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand-muted)]">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mb-4 flex flex-col gap-2 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="brand-title text-3xl">Reward shelf</h2>
          <p className="brand-copy mt-1 text-sm">Cute, readable rewards tied to real practice milestones.</p>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {rewards.map((reward) => {
          const isUnlocked = reward.unlock(rewardState);
          const progressPercent = reward.progress ? reward.progress(rewardState) : isUnlocked ? 100 : 0;
          const Icon = reward.icon;

          return (
            <motion.div
              key={reward.id}
              variants={itemVariants}
              whileHover={isUnlocked ? { y: -3 } : undefined}
              className={`brand-panel relative flex min-h-[190px] flex-col justify-between p-5 transition ${
                isUnlocked ? "" : "border-dashed opacity-72"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="brand-icon-tile h-16 w-16"
                  style={{
                    color: isUnlocked ? reward.color : "rgba(34,49,63,0.42)",
                    background: isUnlocked ? `${reward.color}18` : "rgba(34,49,63,0.06)",
                  }}
                >
                  {isUnlocked ? <Icon size={34} className="fill-current" /> : <Lock size={30} />}
                </div>
                {isUnlocked && <span className="brand-chip">Earned</span>}
              </div>

              <div>
                <h3 className="mb-1 font-display text-2xl font-black leading-none text-[var(--brand-ink)]">{isUnlocked ? reward.name : "Keep Playing"}</h3>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand-muted)]">{reward.subtitle}</p>
                {!isUnlocked && (
                  <div className="brand-progress-track h-3">
                    <div className="h-full rounded-full" style={{ width: `${progressPercent}%`, background: reward.color }} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
