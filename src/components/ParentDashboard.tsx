"use client";

import React, { useEffect, useState } from "react";
import { Clock, BookOpen, Lightbulb, CheckCircle2, BarChart2 } from "@/components/Icons";
import { motion } from "framer-motion";
import ClayCard from "@/components/ui/ClayCard";
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

const getCategory = (target: string): "Literacy" | "Logic" | "Fine Motor" => {
  const t = target.toUpperCase();
  if (["SORTING", "PATTERN", "STORY", "DRUMMER", "BUNNY", "LOGIC", "ALCH", "MAZE"].includes(t)) {
    return "Logic";
  }
  if (["MARK", "MARKMAKER", "FINE_MOTOR", "SYMM"].includes(t)) {
    return "Fine Motor";
  }
  return "Literacy";
};

const getActivityName = (target: string): string => {
  const t = target.toUpperCase();
  if (t === "STORY") return "3-Piece Sequence";
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

export default function ParentDashboard({ childId }: { childId?: string }) {
  const [data, setData] = useState<Child | null>(null);

  useEffect(() => {
    if (!childId) return;
    const fetchProgress = () => {
      fetch(`/api/progress/${childId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.child) {
            setData(json.child);
          }
        });
    };
    fetchProgress();
  }, [childId]);

  if (!data) {
    return (
      <div className="p-8 text-center text-[var(--foreground)] font-bold animate-pulse">
        Loading Dashboard...
      </div>
    );
  }

  // Calculate dynamic statistics
  const totalSessions = data.progressRecord.length;
  
  const averageScore = totalSessions > 0 
    ? Math.round(data.progressRecord.reduce((acc, curr) => acc + curr.tracingScore, 0) / totalSessions)
    : 100;

  const totalTimeMs = data.progressRecord.reduce((acc, curr) => acc + curr.timeSpentMs, 0);
  const totalTimeMins = Math.round(totalTimeMs / 60000);
  const totalTimeStr = totalTimeMins > 0 ? `${totalTimeMins}m` : `${Math.round(totalTimeMs / 1000)}s`;

  // Radar Chart Constants & Helpers
  const cx = 150;
  const cy = 135;
  const maxR = 90;

  const records = data.progressRecord;
  const literacyScores = records.filter(r => getCategory(r.targetLetter) === "Literacy").map(r => r.tracingScore);
  const logicScores = records.filter(r => getCategory(r.targetLetter) === "Logic").map(r => r.tracingScore);
  const motorScores = records.filter(r => getCategory(r.targetLetter) === "Fine Motor").map(r => r.tracingScore);

  const avgLiteracy = literacyScores.length > 0 ? Math.round(literacyScores.reduce((a, b) => a + b, 0) / literacyScores.length) : 85;
  const avgLogic = logicScores.length > 0 ? Math.round(logicScores.reduce((a, b) => a + b, 0) / logicScores.length) : 80;
  const avgMotor = motorScores.length > 0 ? Math.round(motorScores.reduce((a, b) => a + b, 0) / motorScores.length) : 90;

  const getCoordinates = (literacy: number, logic: number, motor: number) => {
    const rLit = (literacy / 100) * maxR;
    const rLog = (logic / 100) * maxR;
    const rMot = (motor / 100) * maxR;
    
    const pLit = { x: cx, y: cy - rLit };
    const pLog = { x: cx + rLog * Math.cos(Math.PI / 6), y: cy + rLog * Math.sin(Math.PI / 6) };
    const pMot = { x: cx - rMot * Math.cos(Math.PI / 6), y: cy + rMot * Math.sin(5 * Math.PI / 6) };
    
    return `${pLit.x},${pLit.y} ${pLog.x},${pLog.y} ${pMot.x},${pMot.y}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 250, damping: 25 } }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="max-w-5xl mx-auto px-4 pb-20 pt-6"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-4xl font-black text-[#4A5358] uppercase mb-1 tracking-tight">Parent Dashboard</h2>
        <p className="text-sm font-bold text-[#4A5358]/70">Here is how {data.name || "Demo Student"} is doing today.</p>
      </motion.div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Accuracy */}
        <ClayCard 
          variants={itemVariants} 
          variant="primary"
          className="flex flex-col items-center justify-center text-center"
        >
          <div className="bg-white/80 border border-white/40 p-3 rounded-2xl mb-4 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_inset_-1px_-1px_3px_rgba(0,0,0,0.03)]">
            <CheckCircle2 className="text-[#ff85a1]" size={36} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#590d22]/70 mb-1">Accuracy</span>
          <div className="text-4xl font-black text-[#ff85a1]">{averageScore}%</div>
        </ClayCard>

        {/* Total Time */}
        <ClayCard 
          variants={itemVariants} 
          variant="tertiary"
          className="flex flex-col items-center justify-center text-center"
        >
          <div className="bg-white/80 border border-white/40 p-3 rounded-2xl mb-4 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_inset_-1px_-1px_3px_rgba(0,0,0,0.03)]">
            <Clock className="text-[#ffd166]" size={36} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#5c4d00]/70 mb-1">Total Time</span>
          <div className="text-4xl font-black text-[#ffd166]">{totalTimeStr}</div>
        </ClayCard>

        {/* Sessions */}
        <ClayCard 
          variants={itemVariants} 
          variant="secondary"
          className="flex flex-col items-center justify-center text-center"
        >
          <div className="bg-white/80 border border-white/40 p-3 rounded-2xl mb-4 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_inset_-1px_-1px_3px_rgba(0,0,0,0.03)]">
            <BarChart2 className="text-[#4ecdc4]" size={36} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#0b4a45]/70 mb-1">Sessions</span>
          <div className="text-4xl font-black text-[#4ecdc4]">{totalSessions}</div>
        </ClayCard>
      </div>

      {/* Developmental Progress & Weekly Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Left: Radar Chart */}
        <ClayCard className="p-6 bg-white border border-white/20 rounded-[2.5rem] shadow-clay-card flex flex-col items-center justify-center">
          <h3 className="text-xl font-black text-[#4A5358] uppercase mb-4 tracking-wide self-start pl-2">Developmental Radar</h3>
          <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
            <svg viewBox="0 0 300 270" className="w-full h-full overflow-visible">
              {/* Concentric grid lines */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => {
                const r = maxR * scale;
                const p1 = { x: cx, y: cy - r };
                const p2 = { x: cx + r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6) };
                const p3 = { x: cx - r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(5 * Math.PI / 6) };
                return (
                  <polygon
                    key={scale}
                    points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
                    fill="none"
                    stroke="rgba(74,83,88,0.08)"
                    strokeWidth="1.5"
                    strokeDasharray={scale === 1 ? undefined : "3 3"}
                  />
                );
              })}
              
              {/* Axis lines */}
              {[Math.PI / 6, 5 * Math.PI / 6, -Math.PI / 2].map((angle, i) => {
                const x2 = cx + maxR * Math.cos(angle);
                const y2 = cy + maxR * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={cx}
                    y1={cy}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(74,83,88,0.12)"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Labels */}
              <text x={cx} y={cy - maxR - 10} textAnchor="middle" className="text-[11px] font-black fill-[#ff85a1] uppercase">Literacy ({avgLiteracy}%)</text>
              <text x={cx + maxR * Math.cos(Math.PI / 6) + 5} y={cy + maxR * Math.sin(Math.PI / 6) + 12} textAnchor="start" className="text-[11px] font-black fill-[#4ecdc4] uppercase">Logic ({avgLogic}%)</text>
              <text x={cx - maxR * Math.cos(Math.PI / 6) - 5} y={cy + maxR * Math.sin(5 * Math.PI / 6) + 12} textAnchor="end" className="text-[11px] font-black fill-[#ffd166] uppercase">Fine Motor ({avgMotor}%)</text>

              {/* Data area */}
              <polygon
                points={getCoordinates(avgLiteracy, avgLogic, avgMotor)}
                fill="rgba(224, 115, 131, 0.25)"
                stroke="#e07383"
                strokeWidth="3.5"
                strokeLinejoin="round"
                className="drop-shadow-md"
              />
              
              {/* Data points */}
              {(() => {
                const rLit = (avgLiteracy / 100) * maxR;
                const rLog = (avgLogic / 100) * maxR;
                const rMot = (avgMotor / 100) * maxR;
                const pts = [
                  { x: cx, y: cy - rLit, color: "#ff85a1" },
                  { x: cx + rLog * Math.cos(Math.PI / 6), y: cy + rLog * Math.sin(Math.PI / 6), color: "#4ecdc4" },
                  { x: cx - rMot * Math.cos(Math.PI / 6), y: cy + rMot * Math.sin(5 * Math.PI / 6), color: "#ffd166" }
                ];
                return pts.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="white"
                    stroke={pt.color}
                    strokeWidth="3.5"
                    className="shadow-sm"
                  />
                ));
              })()}
            </svg>
          </div>
        </ClayCard>

        {/* Right: Weekly Analytics Summary */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Play Streak Card */}
            <ClayCard variant="primary" hoverEffect className="p-5 flex flex-col justify-between h-36">
              <span className="text-2xl">🔥</span>
              <div>
                <h4 className="text-xs font-black uppercase text-[#590d22]/60 tracking-wider">Play Streak</h4>
                <p className="text-2xl font-black text-[#e07383]">5 Days</p>
              </div>
            </ClayCard>

            {/* Badges Card */}
            <ClayCard variant="secondary" hoverEffect className="p-5 flex flex-col justify-between h-36">
              <span className="text-2xl">🏅</span>
              <div>
                <h4 className="text-xs font-black uppercase text-[#0b4a45]/60 tracking-wider">Badges Earned</h4>
                <p className="text-2xl font-black text-[#3fa394]">{Math.max(1, totalSessions)} Badges</p>
              </div>
            </ClayCard>
          </div>

          {/* Activity Focus Card */}
          <ClayCard variant="tertiary" className="p-6 flex-grow flex flex-col justify-center">
            <h4 className="text-sm font-black uppercase text-[#5c4d00]/70 tracking-wider mb-2">Development Focus</h4>
            <p className="text-sm font-bold text-[#4A5358]/85 leading-relaxed">
              {data.name || "Your child"} has made massive strides in <span className="font-extrabold text-[#e07383]">Fine Motor</span> drawing accuracy this week! Focus next on <span className="font-extrabold text-[#3fa394]">Logic & Sequencing</span> (like Pattern Explorer) to balance their milestone chart.
            </p>
          </ClayCard>
        </div>
      </div>

      {/* Session History Section */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-2xl font-black text-[#4A5358] uppercase">Session History</h3>
          <ClayButton variant="surface" size="sm" className="text-xs">Download Report</ClayButton>
        </div>

        <div className="flex flex-col gap-4">
          {data.progressRecord.map((record) => {
            let progressColor = "bg-primary";
            let textColor = "text-primary";
            let bgBadge = "bg-primary-container/60";
            
            if (record.tracingScore < 90) {
              progressColor = "bg-secondary";
              textColor = "text-secondary";
              bgBadge = "bg-secondary-container/60";
            }
            if (record.tracingScore < 80) {
              progressColor = "bg-tertiary";
              textColor = "text-tertiary";
              bgBadge = "bg-tertiary-container/60";
            }

            return (
              <ClayCard
                key={record.id}
                className="flex flex-col sm:flex-row items-center justify-between p-5 bg-white border border-white/20 rounded-[2rem] shadow-clay-card gap-4 hover:scale-[1.01] transition-transform duration-200"
              >
                {/* Left side: Icon, Name & Date */}
                <div className="flex items-center gap-4 w-full sm:w-auto text-left">
                  <div className={`w-12 h-12 rounded-2xl ${bgBadge} flex items-center justify-center border border-white/20 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_inset_-1px_-1px_3px_rgba(0,0,0,0.03)] shrink-0`}>
                    <BookOpen size={24} className="text-[#4a5358]" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-black text-[#4A5358]">{getActivityName(record.targetLetter)}</span>
                    <span className="text-xs font-bold text-[#4A5358]/55">
                      {new Date(record.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>

                {/* Right side: Accuracy & Progress Bar */}
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end flex-grow">
                  {/* Accuracy Stat */}
                  <div className="flex flex-col items-start sm:items-end shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#4A5358]/40 leading-none mb-0.5">Accuracy</span>
                    <span className={`text-base font-black ${textColor}`}>{record.tracingScore}%</span>
                  </div>
                  {/* Progress Pill Bar */}
                  <div className="w-full sm:w-44 bg-[#dbe8f2] rounded-full h-4 p-0.5 overflow-hidden border border-white/20 shadow-inner shrink-0">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${record.tracingScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${progressColor}`}
                    />
                  </div>
                </div>
              </ClayCard>
            );
          })}
          {totalSessions === 0 && (
            <div className="p-8 text-center text-gray-500 font-bold bg-white/40 border border-dashed border-[#9eb1bd]/40 rounded-[2rem]">
              No sessions recorded yet. Time to play!
            </div>
          )}
        </div>
      </motion.div>

      {/* Weekly Focus Suggestion */}
      <ClayCard 
        variants={itemVariants}
        className="flex flex-col md:flex-row items-center gap-6 bg-white/70"
      >
        <div className="w-24 h-24 bg-white border border-white/20 rounded-full flex items-center justify-center shadow-[6px_6px_12px_rgba(0,0,0,0.04),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)] flex-shrink-0 animate-float">
          <Lightbulb className="text-[#ff85a1] text-5xl" size={48} style={{ fill: "var(--primary-container)" }} />
        </div>
        <div>
          <h4 className="text-xl font-black text-[#4A5358] uppercase mb-2">Weekly Focus: &quot;Phonetic P&quot;</h4>
          <p className="text-sm font-bold text-[#4A5358]/70">
            {data.name || "Demo Student"} is doing great with visuals! This week, try spending more time on activities starting with the letter &apos;P&apos; to help reinforce phonetic recognition.
          </p>
          <div className="mt-4 flex gap-3">
            <ClayButton variant="primary" className="text-xs py-3 px-5">
              View Suggested Activities
            </ClayButton>
          </div>
        </div>
      </ClayCard>
    </motion.div>
  );
}
