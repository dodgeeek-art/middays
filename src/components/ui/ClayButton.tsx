"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ClayButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "disabled"> {
  variant?: "primary" | "secondary" | "tertiary" | "surface" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isDisabled?: boolean;
  children: React.ReactNode;
}

export default function ClayButton({
  variant = "surface",
  size = "md",
  isDisabled = false,
  children,
  className = "",
  ...props
}: ClayButtonProps) {
  // Styles mapping
  const baseStyle =
    "inline-flex items-center justify-center font-black uppercase tracking-wide border transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-4 focus-visible:ring-primary/45";

  // Size mapping
  const sizeStyles = {
    sm: "px-4 py-2 text-xs rounded-2xl border-[2px]",
    md: "px-6 py-3.5 text-sm rounded-3xl border-[3px]",
    lg: "px-8 py-5 text-lg rounded-[2rem] border-[4px]",
    icon: "p-3.5 rounded-full border-[3px] aspect-square",
  };

  // Color variants mapping (background, text, border, shadows)
  const variantStyles = {
    primary:
      "bg-primary text-white border-white/30 shadow-[4px_6px_12px_rgba(255,133,161,0.35),_inset_-4px_-4px_8px_rgba(0,0,0,0.08),_inset_4px_4px_8px_rgba(255,255,255,0.4)] hover:bg-primary/95 active:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.4),_inset_4px_4px_8px_rgba(0,0,0,0.2)]",
    secondary:
      "bg-secondary text-[#0b4a45] border-white/30 shadow-[4px_6px_12px_rgba(78,205,196,0.3),_inset_-4px_-4px_8px_rgba(0,0,0,0.08),_inset_4px_4px_8px_rgba(255,255,255,0.4)] hover:bg-secondary/95 active:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.4),_inset_4px_4px_8px_rgba(0,0,0,0.2)]",
    tertiary:
      "bg-tertiary text-[#5c4d00] border-white/30 shadow-[4px_6px_12px_rgba(255,209,102,0.3),_inset_-4px_-4px_8px_rgba(0,0,0,0.1),_inset_4px_4px_8px_rgba(255,255,255,0.4)] hover:bg-tertiary/95 active:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.4),_inset_4px_4px_8px_rgba(0,0,0,0.2)]",
    surface:
      "bg-white text-[#4A5358] border-white/50 shadow-[4px_6px_12px_rgba(0,0,0,0.04),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)] hover:bg-white/98 active:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),_inset_4px_4px_8px_rgba(0,0,0,0.12)]",
    danger:
      "bg-red-500 text-white border-white/30 shadow-[4px_6px_12px_rgba(239,68,68,0.3),_inset_-4px_-4px_8px_rgba(0,0,0,0.1),_inset_4px_4px_8px_rgba(255,255,255,0.4)] hover:bg-red-500/95 active:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.4),_inset_4px_4px_8px_rgba(0,0,0,0.2)]",
  };

  // Disabled style overrides
  const disabledStyles =
    "bg-gray-100 text-gray-400 border-gray-200/50 shadow-inner cursor-not-allowed opacity-50 transform-none pointer-events-none";

  const buttonStyle = `${baseStyle} ${sizeStyles[size]} ${
    isDisabled ? disabledStyles : variantStyles[variant]
  } ${className}`;

  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      whileHover={isDisabled ? {} : { y: -3, scale: 1.02 }}
      whileTap={isDisabled ? {} : { y: 3, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={buttonStyle}
      {...props}
    >
      {children}
    </motion.button>
  );
}
