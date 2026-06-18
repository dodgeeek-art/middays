"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdvancedSearchEngine from "@/components/AdvancedSearchEngine";

export default function AdvancedSearchPage() {
  const router = useRouter();
  const [childId, setChildId] = useState<string | null>(null);

  // Seed a dummy child on load, matching home page logic
  useEffect(() => {
    fetch("/api/seed", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.child) {
          setChildId(data.child.id);
        } else {
          console.error("No child data returned from /api/seed");
        }
      })
      .catch((err) => {
        console.error("Failed to seed child:", err);
      });
  }, []);

  return (
    <div className="flex flex-col font-sans relative overflow-hidden bg-background text-foreground h-[100dvh] max-h-[100dvh]">
      {/* Animated Ambient Background Blobs from Stitch */}
      <div 
        className="fixed -z-10 bg-[#a2ea63] w-96 h-96 rounded-full blur-[100px] opacity-25 -top-20 -left-20"
        style={{ animation: "float 20s infinite alternate ease-in-out" }}
      ></div>
      <div 
        className="fixed -z-10 bg-[#ffc4c0] w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 -bottom-32 -right-32"
        style={{ animation: "float 20s infinite alternate ease-in-out", animationDelay: "-5s" }}
      ></div>
      <div 
        className="fixed -z-10 bg-[#eaddfc] w-80 h-80 rounded-full blur-[95px] opacity-20 top-1/2 left-1/4"
        style={{ animation: "float 20s infinite alternate ease-in-out", animationDelay: "-10s" }}
      ></div>

      {/* Main View Shell */}
      <main className="flex-grow max-w-6xl mx-auto w-full flex flex-col justify-center relative z-0 h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)] p-2 sm:p-4 pb-2 sm:pb-4 overflow-hidden mt-1 sm:mt-2">
        {!childId ? (
          <div className="flex justify-center items-center h-64">
            <motion.p 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-2xl font-bold text-primary"
            >
              Loading advanced adventure...
            </motion.p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key="advanced-search" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              className="h-full min-h-0 flex flex-col justify-center"
            >
              <AdvancedSearchEngine 
                childId={childId} 
                onBack={() => router.push("/")} 
              />
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
