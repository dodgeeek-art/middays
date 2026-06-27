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
    | "peach"
    | "glass";
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
    "border-2 p-6 transition-all duration-200 shadow-clay-card select-none";

  // Wavy organic radiuses
  const shapeStyles = {
    none: "rounded-3xl",
    "wavy-1": "rounded-[1.8rem_1.35rem_1.7rem_1.45rem_/_1.45rem_1.8rem_1.35rem_1.7rem]",
    "wavy-2": "rounded-[1.35rem_1.8rem_1.45rem_1.7rem_/_1.7rem_1.4rem_1.8rem_1.45rem]",
  };

  const variantStyles = {
    default:
      "bg-[#fffdf6] border-[#22313f]/10 text-[#22313f] shadow-clay-card hover:shadow-clay-card-hover",
    primary:
      "bg-[#fff1b8] border-[#ffb51f]/25 text-[#593900] shadow-clay-yellow hover:shadow-clay-yellow-hover",
    secondary:
      "bg-[#d9fbf4] border-[#00a9a5]/20 text-[#063f3d] shadow-clay-mint hover:shadow-clay-mint-hover",
    tertiary:
      "bg-[#ffe2d7] border-[#ff6f4f]/20 text-[#7a1d0f] shadow-clay-pink hover:shadow-clay-pink-hover",
    purple:
      "bg-[#eee7ff] border-[#8d6bff]/20 text-[#3c247a] shadow-clay-purple hover:shadow-clay-purple-hover",
    blue:
      "bg-[#e2f2ff] border-[#2f80ed]/20 text-[#164a8c] shadow-clay-blue hover:shadow-clay-blue-hover",
    lime:
      "bg-[#ebffd5] border-[#7fc72f]/20 text-[#2e5f12] shadow-clay-mint hover:shadow-clay-mint-hover",
    peach:
      "bg-[#ffe2d3] border-[#ff8c5a]/20 text-[#733018] shadow-clay-pink hover:shadow-clay-pink-hover",
    glass:
      "bg-white/88 backdrop-blur-sm border-[#22313f]/10 text-[#22313f] shadow-[0_16px_34px_rgba(34,49,63,0.1),0_3px_0_rgba(34,49,63,0.12)] hover:bg-white transition-all duration-300",
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
