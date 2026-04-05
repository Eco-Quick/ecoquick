"use client";

import { useReveal } from "@/hooks/useReveal";

type RevealProps = {
  children: React.ReactNode;
  animation?: "up" | "fade" | "scale" | "left" | "right";
  delay?: number;
  className?: string;
  stagger?: boolean;
};

export function Reveal({
  children,
  animation = "up",
  delay = 0,
  className = "",
  stagger = false,
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.12);

  const animClass = `reveal-${animation}`;
  const staggerClass = stagger ? "reveal-stagger" : "";

  return (
    <div
      ref={ref}
      className={`${animClass} ${visible ? "revealed" : ""} ${staggerClass} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
