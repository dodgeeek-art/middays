"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ClayCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "tertiary"
    | "purple"
    | "blue"
    | "lime"
    | "peach";
  hoverEffect?: boolean;
  organicShape?: "none" | "wavy-1" | "wavy-2";
  children: React.ReactNode;
}

export default function ClayCard({
  variant = "default",
  hoverEffect = false,
  organicShape = "none",
  children,
  className = "",
  ...props
}: ClayCardProps) {
  const baseStyle =
    "border-[3px] p-6 transition-all duration-200 shadow-clay-card select-none";

  // Wavy organic radiuses
  const shapeStyles = {
    none: "rounded-[2rem]",
    "wavy-1": "rounded-[2.2rem_1.8rem_2.4rem_1.9rem_/_1.9rem_2.3rem_1.8rem_2.1rem]",
    "wavy-2": "rounded-[1.8rem_2.4rem_1.9rem_2.3rem_/_2.1rem_1.9rem_2.2rem_1.8rem]",
  };

  const variantStyles = {
    default:
      "bg-white border-white/50 text-[#4A5358] shadow-clay-card hover:shadow-clay-card-hover",
    primary:
      "bg-[#f2c1c6] border-white/40 text-[#5e1c22] shadow-clay-pink hover:shadow-clay-pink-hover",
    secondary:
      "bg-[#c3e6dc] border-white/40 text-[#0d4036] shadow-clay-mint hover:shadow-clay-mint-hover",
    tertiary:
      "bg-[#f5e4a3] border-white/40 text-[#544001] shadow-clay-yellow hover:shadow-clay-yellow-hover",
    purple:
      "bg-[#ddcbf5] border-white/40 text-[#42236b] shadow-clay-purple hover:shadow-clay-purple-hover",
    blue:
      "bg-[#b5cce6] border-white/40 text-[#1f3d68] shadow-clay-blue hover:shadow-clay-blue-hover",
    lime:
      "bg-[#bee8d4] border-white/40 text-[#16533f] shadow-clay-mint hover:shadow-clay-mint-hover",
    peach:
      "bg-[#f7c2b3] border-white/40 text-[#732010] shadow-clay-pink hover:shadow-clay-pink-hover",
  };

  const cardStyle = `${baseStyle} ${shapeStyles[organicShape]} ${variantStyles[variant]} ${className}`;

  const motionProps = hoverEffect
    ? {
        whileHover: { y: -5, scale: 1.025 },
        whileTap: { y: 3, scale: 0.985 },
        transition: { type: "spring" as const, stiffness: 300, damping: 18 },
        className: `${cardStyle} cursor-pointer`,
      }
    : {
        className: cardStyle,
      };

  return (
    <motion.div {...motionProps} {...props}>
      {children}
    </motion.div>
  );
}
