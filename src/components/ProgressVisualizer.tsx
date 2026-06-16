"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Heart, Star, Lock, Eye } from "lucide-react";
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
    
    // Polling for updates
    const interval = setInterval(fetchBadges, 4000);
    return () => clearInterval(interval);
  }, [childId]);

  // Check if specific letters are completed
  const hasBadge = (letterPrefix: string) => {
    return badges.some(b => b.badgeName.toLowerCase().startsWith(letterPrefix.toLowerCase()));
  };

  const sessionsCount = progressData ? progressData.progressRecord.length : 0;
  const uniqueLettersCount = progressData 
    ? new Set(progressData.progressRecord.map(r => r.targetLetter[0].toUpperCase())).size
    : 0;

  // Star counts mapping: 12000 base + 1000 per progress record
  const starsCount = 12000 + sessionsCount * 1000;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 250, damping: 20 } }
  };

  // Grid items combining real badge state with Stitch concepts
  const trophyItems = [
    {
      id: "super-reader",
      name: "Super Reader",
      subtitle: "Letter A",
      iconType: "image",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwLte_AnOfV7E_qQKXq1UQOTM-GQ-_gsUXsH9K3OO6r6ZGpXZQwRb2vdpHKsMEoHautKXqJw4izTUtaRm5YgMFOT6MVMKJzAwDsUTzQlmtGm8B4Mju4C-hgHC0PCEqlRojn6kdQKtP1pvu9AnFrHxYlYbopXBKM1z5C6-j6t9LqMkf7i_wKpkrJKQrHhVpCsW34qwcs96DWwl6KXMYIiXzOECTkfZhfcuFe4Ewoa9nTN8ugkumNzUBC4KilVbq1srzscr6Atb-kCeN",
      bgClass: "bg-secondary-container/40",
      isUnlocked: hasBadge("A") || sessionsCount > 0 // Guarantee unlocked if child has played at least once
    },
    {
      id: "star-catcher",
      name: "Star Catcher",
      subtitle: "10 Stars",
      iconType: "star",
      bgClass: "bg-primary-container/40",
      isUnlocked: starsCount >= 12000
    },
    {
      id: "early-bird",
      name: "Early Bird",
      subtitle: "Morning Lab",
      iconType: "image",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBefsVuSPSbUPa9gRWLY5keeUrgJqBNcXZQKFJ3sUp1vvKg-oj8GGvccmV9GP-98FqZKZky-9g6e-mzpVHbcWO4gExdJWWqjY1ZSYD-fELSaiJ_-2eD2W4TM_EW8UrxEIU9mFZ3V_TQsKKR5itl_7j_iBdlZJiL_pIoX2XD5KaR5LCeiFGOOW4F6L1qWLwHNgAQ6RkwioK40UGUELMNUjBaQ7g6O3zs5wUGsz5-XNT8fqdLNgJqzJUKdRE3zqB5emKa-XNnMZKYeQcw",
      bgClass: "bg-tertiary-container/40",
      isUnlocked: hasBadge("C") || sessionsCount >= 2
    },
    {
      id: "picasso-kid",
      name: "Picasso Kid",
      subtitle: "5 Drawings",
      iconType: "palette",
      bgClass: "bg-secondary-container/30",
      isUnlocked: sessionsCount >= 5,
      progressPercent: Math.min((sessionsCount / 5) * 100, 100)
    },
    {
      id: "kindness-star",
      name: "Kindness Star",
      subtitle: "Daily Habit",
      iconType: "eco",
      bgClass: "bg-primary-container/30",
      isUnlocked: sessionsCount >= 1
    },
    {
      id: "alphabet-hero",
      name: "Alphabet Hero",
      subtitle: "5 Letters",
      iconType: "text",
      bgClass: "bg-tertiary-container/30",
      isUnlocked: uniqueLettersCount >= 5,
      progressPercent: Math.min((uniqueLettersCount / 5) * 100, 100)
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 pt-4 relative">
      {/* Hero Golden Trophy Section */}
      <section className="flex flex-col items-center text-center mb-8 relative">
        <div className="relative w-44 h-44 mb-4">
          {/* Pulsing light glow */}
          <div className="absolute inset-0 bg-[var(--primary-container)]/30 rounded-full blur-3xl animate-pulse"></div>
          
          {/* Floating Golden Trophy Image */}
          <div className="relative z-10 w-full h-full flex items-center justify-center animate-float">
            <img 
              alt="Smiling Golden Trophy"
              className="w-full h-full object-contain animate-slow-rotate" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDVFUsWUUvuBoEcUnIR2TSaLYPh_Or5vFfA20DHIrcZ2IIQZudqXRuzaRFcxh6twFk9V6prUEX7wZGLSiaIGSia15mPts03pGU-gyBJKCPuvMf6QLisXoCgmMoIy-yAQ9gY90-GCntm5Hcs1UbTfCrN564nBTG_n8gxTxrA2QY93mnOrwmhNOP2bwl2XADnJH0PBJqpTry2GSGvWq2GwEVftvEyq-gkSD1810KezJzK7xRGVyvKDzGCHiDHvk5FOkCSg-Pn5ApTUbv" 
              style={{ animationDuration: "30s" }}
            />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[var(--primary)] mb-1 tracking-tight">My Trophy Room</h1>
        <p className="text-base font-bold text-gray-500 max-w-[280px]">Look at all the amazing things you've done today!</p>
      </section>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[var(--primary-container)] p-5 rounded-[32px] border-2 border-[var(--slate-dark)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center justify-center text-center">
          <Trophy className="text-[var(--primary)] text-3xl mb-1.5" size={36} style={{ fill: "var(--primary)" }} />
          <span className="text-3xl font-black text-[var(--primary)]">{badges.length}</span>
          <span className="text-sm font-extrabold text-[var(--primary)]/80">Badges</span>
        </div>
        
        <div className="bg-[var(--tertiary-container)] p-5 rounded-[32px] border-2 border-[var(--slate-dark)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center justify-center text-center">
          <Heart className="text-[var(--tertiary)] text-3xl mb-1.5" size={36} style={{ fill: "var(--tertiary)" }} />
          <span className="text-3xl font-black text-[var(--tertiary)]">{uniqueLettersCount}</span>
          <span className="text-sm font-extrabold text-[var(--tertiary)]/80">Daily Habits</span>
        </div>
      </div>

      {/* Trophy Grid */}
      <h2 className="text-2xl font-black text-gray-800 mb-4 px-2">Earned Trophies</h2>
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-2 gap-4"
      >
        {trophyItems.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            whileHover={item.isUnlocked ? { scale: 1.03, y: -2 } : {}}
            whileTap={item.isUnlocked ? { scale: 0.97, y: 2 } : {}}
            className={`border-2 border-[var(--slate-dark)] flex flex-col items-center justify-center p-5 rounded-[28px] relative transition-all text-center aspect-[1.1] ${
              item.isUnlocked 
                ? "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer" 
                : "bg-[var(--surface-container-low)] border-dashed opacity-60"
            }`}
          >
            {item.isUnlocked ? (
              /* Unlocked State */
              <>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 border-2 border-[var(--slate-dark)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.bgClass}`}>
                  {item.iconType === "image" && item.imageUrl ? (
                    <img className="w-12 h-12 object-contain" src={item.imageUrl} alt={item.name} />
                  ) : item.iconType === "star" ? (
                    <Star className="text-[var(--primary)]" size={32} style={{ fill: "var(--primary)" }} />
                  ) : item.iconType === "palette" ? (
                    <span className="text-2xl">🎨</span>
                  ) : item.iconType === "eco" ? (
                    <span className="text-2xl">🌱</span>
                  ) : (
                    <span className="text-xl font-black">🔤</span>
                  )}
                </div>
                <span className="font-extrabold text-gray-800 text-sm md:text-base leading-tight">{item.name}</span>
                <div className="flex items-center mt-1">
                  <span className="text-xs font-bold text-gray-400">{item.subtitle}</span>
                </div>
              </>
            ) : (
              /* Locked State Concept */
              <>
                <div className="w-16 h-16 bg-[var(--surface-container-highest)] border-2 border-dashed border-[var(--outline)] rounded-full flex items-center justify-center mb-3">
                  <Lock className="text-gray-400" size={28} />
                </div>
                <span className="font-extrabold text-gray-400 text-sm">{item.name}</span>
                <div className="w-20 bg-[var(--surface-container-highest)] border border-[var(--slate-dark)] h-2 rounded-full mt-2 overflow-hidden p-0.5">
                  <div 
                    className="bg-[var(--primary)] h-full rounded-full" 
                    style={{ width: `${item.progressPercent || 0}%` }}
                  />
                </div>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
