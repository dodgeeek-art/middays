"use client";

import React, { useEffect, useState } from "react";
import { Clock, BookOpen, Lightbulb, CheckCircle2, BarChart2 } from "@/components/Icons";
import { motion } from "framer-motion";

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
        <motion.div 
          variants={itemVariants} 
          className="clay-card bg-primary-container/30 border-white/20 p-6 flex flex-col items-center justify-center text-center shadow-[6px_6px_12px_rgba(255,133,161,0.06),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)]"
        >
          <div className="bg-white/80 border border-white/40 p-3 rounded-2xl mb-4 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_inset_-1px_-1px_3px_rgba(0,0,0,0.03)]">
            <CheckCircle2 className="text-[#ff85a1]" size={36} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#590d22]/70 mb-1">Accuracy</span>
          <div className="text-4xl font-black text-[#ff85a1]">{averageScore}%</div>
        </motion.div>

        {/* Total Time */}
        <motion.div 
          variants={itemVariants} 
          className="clay-card bg-tertiary-container/30 border-white/20 p-6 flex flex-col items-center justify-center text-center shadow-[6px_6px_12px_rgba(255,209,102,0.06),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)]"
        >
          <div className="bg-white/80 border border-white/40 p-3 rounded-2xl mb-4 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_inset_-1px_-1px_3px_rgba(0,0,0,0.03)]">
            <Clock className="text-[#ffd166]" size={36} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#5c4d00]/70 mb-1">Total Time</span>
          <div className="text-4xl font-black text-[#ffd166]">{totalTimeStr}</div>
        </motion.div>

        {/* Sessions */}
        <motion.div 
          variants={itemVariants} 
          className="clay-card bg-secondary-container/30 border-white/20 p-6 flex flex-col items-center justify-center text-center shadow-[6px_6px_12px_rgba(78,205,196,0.06),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)]"
        >
          <div className="bg-white/80 border border-white/40 p-3 rounded-2xl mb-4 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_inset_-1px_-1px_3px_rgba(0,0,0,0.03)]">
            <BarChart2 className="text-[#4ecdc4]" size={36} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#0b4a45]/70 mb-1">Sessions</span>
          <div className="text-4xl font-black text-[#4ecdc4]">{totalSessions}</div>
        </motion.div>
      </div>

      {/* Session History Section */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-2xl font-black text-[#4A5358] uppercase">Session History</h3>
          <button className="font-black text-xs uppercase px-4 py-2 bg-white border border-white/20 rounded-full clay-btn hover:scale-102 active:scale-96 transition-all text-[#4A5358] cursor-pointer shadow-sm">Download Report</button>
        </div>

        <div className="clay-card border border-white/20 rounded-[2rem] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] text-left">
                  <th className="p-5 text-xs font-black uppercase tracking-wider text-[#4A5358]/60 border-b border-[#9eb1bd]/20">Date</th>
                  <th className="p-5 text-xs font-black uppercase tracking-wider text-[#4A5358]/60 border-b border-[#9eb1bd]/20">Activity</th>
                  <th className="p-5 text-xs font-black uppercase tracking-wider text-[#4A5358]/60 border-b border-[#9eb1bd]/20">Accuracy</th>
                  <th className="p-5 text-xs font-black uppercase tracking-wider text-[#4A5358]/60 border-b border-[#9eb1bd]/20">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9eb1bd]/10">
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
                    <tr key={record.id} className="hover:bg-[#f3f8fc]/40 transition-colors">
                      <td className="p-5 text-sm font-bold text-[#4A5358]">
                        {new Date(record.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${bgBadge} flex items-center justify-center border border-white/20 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_inset_-1px_-1px_3px_rgba(0,0,0,0.03)]`}>
                            <BookOpen size={20} className="text-[#4a5358]" strokeWidth={2.5} />
                          </div>
                          <span className="text-sm font-black text-[#4A5358]">Trace Letter {record.targetLetter}</span>
                        </div>
                      </td>
                      <td className={`p-5 text-sm font-black ${textColor}`}>{record.tracingScore}%</td>
                      <td className="p-5 min-w-[150px]">
                        <div className="bg-[#dbe8f2] rounded-full h-3.5 p-0.5 overflow-hidden border border-white/20 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${record.tracingScore}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${progressColor}`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {totalSessions === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 font-bold">
                      No sessions recorded yet. Time to play!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Weekly Focus Suggestion */}
      <motion.div 
        variants={itemVariants}
        className="clay-card border border-white/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-6 bg-white/70"
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
            <button className="bg-primary text-white text-xs font-black uppercase px-6 py-3.5 rounded-full clay-btn border border-white/20 hover:scale-102 active:scale-96 transition-all shadow-md">
              View Suggested Activities
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
