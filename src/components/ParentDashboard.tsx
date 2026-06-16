"use client";

import React, { useEffect, useState } from "react";
import { Clock, Award, BookOpen, Lightbulb, CheckCircle2, ChevronRight, BarChart2 } from "lucide-react";
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
      {/* Header Title Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-4xl font-extrabold text-[#2e312f] mb-2 tracking-tight">Parent Dashboard</h2>
        <p className="text-lg font-bold text-gray-500">Here is how {data.name || "Demo Student"} is doing today.</p>
      </motion.div>

      {/* Telemetry Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Accuracy */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4 }}
          className="bg-[var(--primary-container)]/40 p-6 rounded-[32px] border-2 border-[var(--primary)]/20 neo-brutal-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="bg-white/80 p-3.5 rounded-2xl mb-4 border-2 border-[var(--slate-dark)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle2 className="text-[var(--primary)] text-4xl" size={32} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[var(--on-primary-container)] uppercase tracking-wider text-xs mb-1.5">Accuracy</span>
          <div className="text-4xl font-extrabold text-[var(--primary)]">{averageScore}%</div>
        </motion.div>

        {/* Total Time */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4 }}
          className="bg-[var(--tertiary-container)]/40 p-6 rounded-[32px] border-2 border-[var(--tertiary)]/20 neo-brutal-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="bg-white/80 p-3.5 rounded-2xl mb-4 border-2 border-[var(--slate-dark)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Clock className="text-[var(--tertiary)] text-4xl" size={32} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[var(--on-tertiary-container)] uppercase tracking-wider text-xs mb-1.5">Total Time</span>
          <div className="text-4xl font-extrabold text-[var(--tertiary)]">{totalTimeStr}</div>
        </motion.div>

        {/* Sessions */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4 }}
          className="bg-[var(--secondary-container)]/40 p-6 rounded-[32px] border-2 border-[var(--secondary)]/20 neo-brutal-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="bg-white/80 p-3.5 rounded-2xl mb-4 border-2 border-[var(--slate-dark)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <BarChart2 className="text-[var(--secondary)] text-4xl" size={32} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[var(--on-secondary-container)] uppercase tracking-wider text-xs mb-1.5">Sessions</span>
          <div className="text-4xl font-extrabold text-[var(--secondary)]">{totalSessions}</div>
        </motion.div>
      </div>

      {/* Session History Table Section */}
      <motion.div variants={itemVariants} className="mb-10">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-2xl font-black text-[#2e312f]">Session History</h3>
          <button className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
            <span>Download Report</span>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="glass-card rounded-[32px] overflow-hidden border-2 border-[var(--slate-dark)] neo-brutal-shadow">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--surface-container-high)]/50 text-left border-b-2 border-[var(--slate-dark)]">
                  <th className="p-6 font-bold text-gray-700 text-sm">Date</th>
                  <th className="p-6 font-bold text-gray-700 text-sm">Activity</th>
                  <th className="p-6 font-bold text-gray-700 text-sm">Accuracy</th>
                  <th className="p-6 font-bold text-gray-700 text-sm">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]/40">
                {data.progressRecord.map((record) => {
                  // Style colors based on accuracy
                  let progressColor = "bg-[var(--primary)]";
                  let textColor = "text-[var(--primary)]";
                  let bgBadge = "bg-[var(--primary-container)]";
                  
                  if (record.tracingScore < 90) {
                    progressColor = "bg-[var(--secondary)]";
                    textColor = "text-[var(--secondary)]";
                    bgBadge = "bg-[var(--secondary-container)]";
                  }
                  if (record.tracingScore < 80) {
                    progressColor = "bg-[var(--tertiary)]";
                    textColor = "text-[var(--tertiary)]";
                    bgBadge = "bg-[var(--tertiary-container)]";
                  }

                  return (
                    <tr key={record.id} className="hover:bg-white/40 transition-colors">
                      <td className="p-6 font-bold text-gray-600 text-sm">
                        {new Date(record.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${bgBadge} border-2 border-[var(--slate-dark)] flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                            <BookOpen size={20} className="text-gray-800" strokeWidth={2.5} />
                          </div>
                          <span className="font-extrabold text-gray-800">Trace Letter {record.targetLetter}</span>
                        </div>
                      </td>
                      <td className={`p-6 font-black ${textColor}`}>{record.tracingScore}%</td>
                      <td className="p-6 min-w-[150px]">
                        <div className="w-full bg-[var(--surface-container-highest)] border border-[var(--slate-dark)] rounded-full h-3.5 overflow-hidden p-0.5">
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

      {/* Weekly Focus Suggestion Banner */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        className="bg-[var(--surface-container-low)] rounded-[32px] p-8 border-2 border-[var(--slate-dark)] flex flex-col md:flex-row items-center gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="w-20 h-20 bg-white border-2 border-[var(--slate-dark)] rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
          <Lightbulb className="text-[var(--primary-container)]" size={44} strokeWidth={2.5} style={{ fill: "var(--primary-container)" }} />
        </div>
        <div>
          <h4 className="text-2xl font-black text-gray-800 mb-2">Weekly Focus: "Phonetic P"</h4>
          <p className="text-base font-bold text-gray-500 leading-relaxed">
            {data.name || "Demo Student"} is doing great with visuals! This week, try spending more time on activities starting with the letter 'P' to help reinforce phonetic recognition.
          </p>
          <div className="mt-4 flex gap-3">
            <button className="bg-[var(--primary)] text-white font-extrabold px-6 py-3 rounded-full border-2 border-[var(--slate-dark)] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
              View Suggested Activities
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
