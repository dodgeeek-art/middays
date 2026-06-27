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
    "inline-flex items-center justify-center font-extrabold uppercase tracking-wide border transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-4 focus-visible:ring-primary/35";

  // Size mapping
  const sizeStyles = {
    sm: "px-4 py-2 text-xs rounded-xl border-2",
    md: "px-6 py-3.5 text-sm rounded-2xl border-2",
    lg: "px-8 py-5 text-lg rounded-2xl border-2",
    icon: "p-3.5 rounded-2xl border-2 aspect-square",
  };

  // Color variants mapping (background, text, border, shadows)
  const variantStyles = {
    primary:
      "bg-primary text-[#593900] border-[#c47a00]/20 shadow-[0_7px_0_#d28700,0_16px_28px_rgba(255,181,31,0.28)] hover:bg-[#ffc247] active:shadow-[0_2px_0_#d28700,0_8px_14px_rgba(255,181,31,0.18)]",
    secondary:
      "bg-secondary text-white border-[#007d79]/20 shadow-[0_7px_0_#00817e,0_16px_28px_rgba(0,169,165,0.22)] hover:bg-[#009d99] active:shadow-[0_2px_0_#00817e,0_8px_14px_rgba(0,169,165,0.16)]",
    tertiary:
      "bg-tertiary text-white border-[#bd3d22]/20 shadow-[0_7px_0_#c44a2f,0_16px_28px_rgba(255,111,79,0.22)] hover:bg-[#ff603d] active:shadow-[0_2px_0_#c44a2f,0_8px_14px_rgba(255,111,79,0.16)]",
    surface:
      "bg-[#fffdf6] text-[#22313f] border-[#22313f]/10 shadow-[0_6px_0_rgba(34,49,63,0.12),0_12px_22px_rgba(34,49,63,0.08)] hover:bg-white active:shadow-[0_2px_0_rgba(34,49,63,0.15),0_6px_10px_rgba(34,49,63,0.06)]",
    danger:
      "bg-red-500 text-white border-red-700/20 shadow-[0_7px_0_#b91c1c,0_16px_28px_rgba(239,68,68,0.24)] hover:bg-red-600 active:shadow-[0_2px_0_#b91c1c,0_8px_14px_rgba(239,68,68,0.16)]",
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
