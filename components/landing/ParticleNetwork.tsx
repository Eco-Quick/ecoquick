"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/components/ThemeProvider";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

const PARTICLE_COUNT = 110;
const CONNECT_DIST = 130;
const MOUSE_DIST = 200;
const SPEED = 0.25;

export function ParticleNetwork({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number>(0);
  const { theme } = useTheme();

  const sizeRef = useRef({ w: 0, h: 0 });

  const spawn = useCallback((w: number, h: number) => {
    particles.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 1.4 + 0.8,
    }));
    sizeRef.current = { w, h };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
      // Always respawn on resize so particles fill the full area
      spawn(rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [spawn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = theme === "dark";

    const lineAlpha = isDark ? 0.18 : 0.12;
    const dotAlpha = isDark ? 0.55 : 0.35;
    const mouseAlpha = isDark ? 0.5 : 0.4;

    const dotClr = isDark ? [192, 132, 252] : [160, 160, 175];
    const lineClr = isDark ? [192, 132, 252] : [160, 160, 175];
    const mouseClr = [255, 155, 22];

    function rgba(c: number[], a: number) {
      return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    }

    function draw() {
      const w = sizeRef.current.w;
      const h = sizeRef.current.h;
      if (w === 0 || h === 0) { raf.current = requestAnimationFrame(draw); return; }

      ctx!.clearRect(0, 0, w, h);

      const pts = particles.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      }

      // Particle-to-particle connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * lineAlpha;
            ctx!.strokeStyle = rgba(lineClr, alpha);
            ctx!.lineWidth = 0.7;
            ctx!.beginPath();
            ctx!.moveTo(pts[i].x, pts[i].y);
            ctx!.lineTo(pts[j].x, pts[j].y);
            ctx!.stroke();
          }
        }
      }

      // Particles + mouse connections
      for (const p of pts) {
        const mdx = p.x - mx;
        const mdy = p.y - my;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < MOUSE_DIST) {
          const alpha = (1 - mdist / MOUSE_DIST) * mouseAlpha;
          ctx!.strokeStyle = rgba(mouseClr, alpha);
          ctx!.lineWidth = 1.2;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(mx, my);
          ctx!.stroke();
        }

        ctx!.fillStyle = rgba(dotClr, dotAlpha);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Mouse cursor dot
      if (mx > 0 && my > 0) {
        ctx!.fillStyle = rgba(mouseClr, 0.65);
        ctx!.beginPath();
        ctx!.arc(mx, my, 3, 0, Math.PI * 2);
        ctx!.fill();
      }

      raf.current = requestAnimationFrame(draw);
    }

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto absolute inset-0 ${className}`}
      aria-hidden
    />
  );
}
