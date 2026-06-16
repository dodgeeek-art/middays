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
      {/* Header Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-[#2e312f] mb-2">Parent Dashboard</h2>
        <p className="font-body-md text-on-surface-variant">Here is how {data.name || "Demo Student"} is doing today.</p>
      </motion.div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Accuracy */}
        <motion.div 
          variants={itemVariants} 
          className="bg-primary-container/40 p-6 rounded-3xl border-2 border-primary/20 neo-brutal-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="bg-white/60 p-3 rounded-2xl mb-4">
            <CheckCircle2 className="text-primary text-4xl" size={36} strokeWidth={2.5} />
          </div>
          <span className="font-label-lg text-on-primary-fixed-variant uppercase tracking-widest text-xs mb-1">Accuracy</span>
          <div className="font-display-lg text-primary">{averageScore}%</div>
        </motion.div>

        {/* Total Time */}
        <motion.div 
          variants={itemVariants} 
          className="bg-tertiary-container/40 p-6 rounded-3xl border-2 border-tertiary/20 neo-brutal-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="bg-white/60 p-3 rounded-2xl mb-4">
            <Clock className="text-tertiary text-4xl" size={36} strokeWidth={2.5} />
          </div>
          <span className="font-label-lg text-on-tertiary-fixed-variant uppercase tracking-widest text-xs mb-1">Total Time</span>
          <div className="font-display-lg text-tertiary">{totalTimeStr}</div>
        </motion.div>

        {/* Sessions */}
        <motion.div 
          variants={itemVariants} 
          className="bg-secondary-container/40 p-6 rounded-3xl border-2 border-secondary/20 neo-brutal-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="bg-white/60 p-3 rounded-2xl mb-4">
            <BarChart2 className="text-secondary text-4xl" size={36} strokeWidth={2.5} />
          </div>
          <span className="font-label-lg text-on-secondary-fixed-variant uppercase tracking-widest text-xs mb-1">Sessions</span>
          <div className="font-display-lg text-secondary">{totalSessions}</div>
        </motion.div>
      </div>

      {/* Session History Section */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="font-headline-md text-headline-md">Session History</h3>
          <button className="font-label-lg text-primary hover:underline">Download Report</button>
        </div>

        <div className="glass-card rounded-[32px] overflow-hidden border-2 border-outline-variant/30 neo-brutal-shadow">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 text-left">
                  <th className="p-6 font-label-lg text-on-surface-variant border-b border-outline-variant">Date</th>
                  <th className="p-6 font-label-lg text-on-surface-variant border-b border-outline-variant">Activity</th>
                  <th className="p-6 font-label-lg text-on-surface-variant border-b border-outline-variant">Accuracy</th>
                  <th className="p-6 font-label-lg text-on-surface-variant border-b border-outline-variant">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {data.progressRecord.map((record) => {
                  let progressColor = "bg-primary";
                  let textColor = "text-primary";
                  let bgBadge = "bg-primary-container";
                  
                  if (record.tracingScore < 90) {
                    progressColor = "bg-secondary";
                    textColor = "text-secondary";
                    bgBadge = "bg-secondary-container";
                  }
                  if (record.tracingScore < 80) {
                    progressColor = "bg-tertiary";
                    textColor = "text-tertiary";
                    bgBadge = "bg-tertiary-container";
                  }

                  return (
                    <tr key={record.id} className="hover:bg-white/40 transition-colors">
                      <td className="p-6 font-body-md text-on-surface">
                        {new Date(record.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${bgBadge} flex items-center justify-center`}>
                            <BookOpen size={20} className="text-gray-800" strokeWidth={2.5} />
                          </div>
                          <span className="font-body-lg text-on-surface">Trace Letter {record.targetLetter}</span>
                        </div>
                      </td>
                      <td className={`p-6 font-label-lg ${textColor}`}>{record.tracingScore}%</td>
                      <td className="p-6 min-w-[150px]">
                        <div className="w-full bg-surface-container-highest rounded-full h-3 p-0.5 overflow-hidden border border-outline-variant/20">
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
        className="bg-surface-container-low rounded-[32px] p-8 border-2 border-outline-variant flex flex-col md:flex-row items-center gap-6"
      >
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center neo-brutal-shadow flex-shrink-0">
          <Lightbulb className="text-primary text-5xl" size={48} style={{ fill: "var(--primary-container)" }} />
        </div>
        <div>
          <h4 className="font-headline-md text-headline-md mb-2">Weekly Focus: "Phonetic P"</h4>
          <p className="font-body-md text-on-surface-variant">
            {data.name || "Demo Student"} is doing great with visuals! This week, try spending more time on activities starting with the letter 'P' to help reinforce phonetic recognition.
          </p>
          <div className="mt-4 flex gap-3">
            <button className="bg-primary text-white font-label-lg px-6 py-3 rounded-full neo-brutal-shadow neo-brutal-press transition-all">
              View Suggested Activities
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
