"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Heart, Star, Lock, Sparkles } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import ClayCard from "@/components/ui/ClayCard";

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

interface SparkleItem {
  id: number;
  left: string;
  top: string;
  size: number;
}

export default function ProgressVisualizer({ childId }: { childId?: string }) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [sparkles, setSparkles] = useState<SparkleItem[]>([]);

  // Periodically generate sparkles around the hero trophy
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const newSparkle: SparkleItem = {
        id,
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`,
        size: Math.random() * 20 + 12
      };
      
      setSparkles(prev => [...prev, newSparkle]);

      // Remove the sparkle after its animation completes
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== id));
      }, 1500);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 250, damping: 20 } }
  };

  const trophyItems = [
    {
      id: "super-reader",
      name: "Super Reader",
      subtitle: "Letter A",
      iconType: "image",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwLte_AnOfV7E_qQKXq1UQOTM-GQ-_gsUXsH9K3OO6r6ZGpXZQwRb2vdpHKsMEoHautKXqJw4izTUtaRm5YgMFOT6MVMKJzAwDsUTzQlmtGm8B4Mju4C-hgHC0PCEqlRojn6kdQKtP1pvu9AnFrHxYlYbopXBKM1z5C6-j6t9LqMkf7i_wKpkrJKQrHhVpCsW34qwcs96DWwl6KXMYIiXzOECTkfZhfcuFe4Ewoa9nTN8ugkumNzUBC4KilVbq1srzscr6Atb-kCeN",
      bgClass: "bg-secondary-container",
      shadowClass: "shadow-purple",
      isUnlocked: hasBadge("A") || sessionsCount > 0
    },
    {
      id: "star-catcher",
      name: "Star Catcher",
      subtitle: "10 Stars",
      iconType: "star",
      bgClass: "bg-primary-container",
      shadowClass: "shadow-lime",
      isUnlocked: starsCount >= 12000
    },
    {
      id: "early-bird",
      name: "Early Bird",
      subtitle: "Morning Lab",
      iconType: "image",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBefsVuSPSbUPa9gRWLY5keeUrgJqBNcXZQKFJ3sUp1vvKg-oj8GGvccmV9GP-98FqZKZky-9g6e-mzpVHbcWO4gExdJWWqjY1ZSYD-fELSaiJ_-2eD2W4TM_EW8UrxEIU9mFZ3V_TQsKKR5itl_7j_iBdlZJiL_pIoX2XD5KaR5LCeiFGOOW4F6L1qWLwHNgAQ6RkwioK40UGUELMNUjBaQ7g6O3zs5wUGsz5-XNT8fqdLNgJqzJUKdRE3zqB5emKa-XNnMZKYeQcw",
      bgClass: "bg-tertiary-container",
      shadowClass: "shadow-peach",
      isUnlocked: hasBadge("C") || sessionsCount >= 2
    },
    {
      id: "picasso-kid",
      name: "Picasso Kid",
      subtitle: "5 Drawings",
      iconType: "palette",
      bgClass: "bg-secondary-container",
      shadowClass: "shadow-purple",
      isUnlocked: sessionsCount >= 5,
      progressPercent: Math.min((sessionsCount / 5) * 100, 100)
    },
    {
      id: "kindness-star",
      name: "Kindness Star",
      subtitle: "Daily Habit",
      iconType: "eco",
      bgClass: "bg-primary-container",
      shadowClass: "shadow-lime",
      isUnlocked: sessionsCount >= 1
    },
    {
      id: "alphabet-hero",
      name: "Alphabet Hero",
      subtitle: "5 Letters",
      iconType: "text",
      bgClass: "bg-tertiary-container",
      shadowClass: "shadow-peach",
      isUnlocked: uniqueLettersCount >= 5,
      progressPercent: Math.min((uniqueLettersCount / 5) * 100, 100)
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 pt-4 relative">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mb-8 relative">
        <div className="relative w-48 h-48 mb-6">
          <div className="absolute inset-0 bg-primary-container/30 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative z-10 w-full h-full flex items-center justify-center animate-float">
            <img 
              alt="Smiling Golden Trophy"
              className="w-full h-full object-contain animate-slow-rotate" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDVFUsWUUvuBoEcUnIR2TSaLYPh_Or5vFfA20DHIrcZ2IIQZudqXRuzaRFcxh6twFk9V6prUEX7wZGLSiaIGSia15mPts03pGU-gyBJKCPuvMf6QLisXoCgmMoIy-yAQ9gY90-GCntm5Hcs1UbTfCrN564nBTG_n8gxTxrA2QY93mnOrwmhNOP2bwl2XADnJH0PBJqpTry2GSGvWq2GwEVftvEyq-gkSD1810KezJzK7xRGVyvKDzGCHiDHvk5FOkCSg-Pn5ApTUbv" 
              style={{ animationDuration: "30s" }}
            />
            
            {/* Sparkles particles overlay */}
            <AnimatePresence>
              {sparkles.map((sp) => (
                <motion.div
                  key={sp.id}
                  initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                  animate={{ opacity: 0.8, scale: 1.5, rotate: 45 }}
                  exit={{ opacity: 0, scale: 0, rotate: 180 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute text-yellow-400 pointer-events-none fill"
                  style={{
                    left: sp.left,
                    top: sp.top,
                    width: sp.size,
                    height: sp.size
                  }}
                >
                  <Sparkles size={sp.size} className="text-[#a2ea63]" style={{ fill: "#a2ea63" }} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-[#ff85a1] uppercase mb-1 tracking-tight">My Trophy Room</h1>
        <p className="text-sm font-bold text-[#4A5358]/70 max-w-[280px]">Look at all the amazing things you&apos;ve done today!</p>
      </section>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <ClayCard 
          variant="primary"
          className="col-span-1 flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center mb-2 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_inset_-1px_-1px_3px_rgba(0,0,0,0.03)] border border-white/20">
            <Trophy className="text-[#ff85a1]" size={24} />
          </div>
          <span className="text-3xl font-black text-[#590d22]">{badges.length}</span>
          <span className="text-xs font-black uppercase tracking-wider text-[#590d22]/70">Badges</span>
        </ClayCard>
        
        <ClayCard 
          variant="tertiary"
          className="col-span-1 flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center mb-2 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_inset_-1px_-1px_3px_rgba(0,0,0,0.03)] border border-white/20">
            <Heart className="text-[#ffd166] fill-[#ffd166]" size={24} />
          </div>
          <span className="text-3xl font-black text-[#5c4d00]">{uniqueLettersCount}</span>
          <span className="text-xs font-black uppercase tracking-wider text-[#5c4d00]/70">Daily Habits</span>
        </ClayCard>
      </div>

      {/* Trophy Grid */}
      <h2 className="text-2xl font-black text-[#4A5358] uppercase mb-6 px-2">Earned Trophies</h2>
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-2 gap-6"
      >
        {trophyItems.map((item, index) => {
          const delayStyle = { animationDelay: `${0.1 + index * 0.2}s` };
          
          return (
            <ClayCard
              key={item.id}
              variants={itemVariants}
              hoverEffect={item.isUnlocked}
              style={delayStyle}
              className={`p-6 flex flex-col items-center justify-center text-center aspect-[1.1] relative ${
                item.isUnlocked 
                  ? "bg-white border-white/20 animate-float" 
                  : "bg-white/40 border-2 border-dashed border-[#9eb1bd]/40 opacity-70 shadow-none"
              }`}
            >
              {item.isUnlocked ? (
                <>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.85),_inset_-2px_-2px_4px_rgba(0,0,0,0.05)] border border-white/10 ${item.bgClass}`}>
                    {item.iconType === "image" && item.imageUrl ? (
                      <img className="w-12 h-12 object-contain" src={item.imageUrl} alt={item.name} />
                    ) : item.iconType === "star" ? (
                      <Star className="text-on-primary-container fill-on-primary-container" size={32} />
                    ) : item.iconType === "palette" ? (
                      <span className="text-3xl">🎨</span>
                    ) : item.iconType === "eco" ? (
                      <span className="text-3xl">🌱</span>
                    ) : (
                      <span className="text-2xl font-black">🔤</span>
                    )}
                  </div>
                  <span className="text-base font-black text-[#4A5358]">{item.name}</span>
                  <div className="flex items-center mt-1 text-primary">
                    <Star className="text-primary w-3.5 h-3.5 fill-primary mr-1" />
                    <span className="text-xs font-black uppercase text-[#4A5358]/60">{item.subtitle}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#dbe8f2]/40 rounded-full flex items-center justify-center mb-3 shadow-inner border border-dashed border-[#9eb1bd]/30">
                    <Lock className="text-[#9eb1bd]" size={28} />
                  </div>
                  <span className="text-sm font-black uppercase tracking-wider text-[#9eb1bd]">Keep Playing!</span>
                  <div className="bg-[#dbe8f2] h-2.5 w-20 rounded-full mt-3 overflow-hidden p-0.5 border border-white/20 shadow-inner">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${item.progressPercent || 0}%` }}
                    />
                  </div>
                </>
              )}
            </ClayCard>
          );
        })}
      </motion.div>
    </div>
  );
}
