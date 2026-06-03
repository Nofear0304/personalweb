"use client";

import { useEffect, useRef, useCallback } from "react";

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number; // 0=white, 1=blue, 2=purple
}

const TRAIL_LIFETIME = 500; // ms
const TRAIL_MAX_LENGTH = 35;
const SPARKS_PER_STEP = 6;

export default function CursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const prevMouseRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resize();

    const onMouseMove = (e: MouseEvent) => {
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };

      const now = performance.now();
      trailRef.current.push({ x: e.clientX, y: e.clientY, time: now });

      // Trim old trail points
      while (
        trailRef.current.length > 0 &&
        now - trailRef.current[0].time > TRAIL_LIFETIME
      ) {
        trailRef.current.shift();
      }
      if (trailRef.current.length > TRAIL_MAX_LENGTH) {
        trailRef.current = trailRef.current.slice(-TRAIL_MAX_LENGTH);
      }

      // Spawn sparks based on mouse velocity
      const dx = mouseRef.current.x - prevMouseRef.current.x;
      const dy = mouseRef.current.y - prevMouseRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 3) {
        const angle = Math.atan2(dy, dx);
        const perpAngle = angle + Math.PI / 2;

        for (let i = 0; i < SPARKS_PER_STEP; i++) {
          const spreadAngle = perpAngle + (Math.random() - 0.5) * Math.PI * 0.8;
          const sparkSpeed = Math.random() * 2.5 + 0.5;
          const hueChoice = Math.random();
          sparksRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 6,
            y: e.clientY + (Math.random() - 0.5) * 6,
            vx: Math.cos(spreadAngle) * sparkSpeed,
            vy: Math.sin(spreadAngle) * sparkSpeed,
            life: Math.random() * 350 + 150, // ms
            maxLife: 500,
            size: Math.random() * 2.5 + 1,
            hue:
              hueChoice < 0.4 ? 0 : hueChoice < 0.75 ? 1 : 2,
          });
        }
      }

      // Always spawn at least 1 spark for gentle glow
      if (speed <= 3) {
        sparksRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: Math.random() * 200 + 100,
          maxLife: 300,
          size: Math.random() * 1.5 + 0.5,
          hue: Math.random() < 0.5 ? 0 : 1,
        });
      }
    };

    const onMouseLeave = () => {
      // Clear trail on leave
      trailRef.current = [];
    };

    const onResize = () => resize();

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", onResize);

    const render = (timestamp: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const trail = trailRef.current;
      const now = performance.now();

      // ── Draw comet tail (smooth gradient line) ──
      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          const prev = trail[i - 1];
          const curr = trail[i];
          const age = now - curr.time;
          const alpha = Math.max(0, 1 - age / TRAIL_LIFETIME);

          if (alpha <= 0) continue;

          // Outer glow
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.strokeStyle = `rgba(140, 190, 255, ${alpha * 0.35})`;
          ctx.lineWidth = 5;
          ctx.lineCap = "round";
          ctx.stroke();

          // Inner core
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.strokeStyle = `rgba(200, 225, 255, ${alpha * 0.65})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Bright white center
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Head glow at current position
        const head = trail[trail.length - 1];
        const gradient = ctx.createRadialGradient(
          head.x, head.y, 0,
          head.x, head.y, 18
        );
        gradient.addColorStop(0, "rgba(200, 220, 255, 0.6)");
        gradient.addColorStop(0.4, "rgba(140, 180, 255, 0.25)");
        gradient.addColorStop(1, "rgba(100, 150, 255, 0)");
        ctx.beginPath();
        ctx.arc(head.x, head.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // ── Draw sparks ──
      const dt = 16; // approximate frame time
      sparksRef.current = sparksRef.current.filter((spark) => {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life -= dt;
        spark.vx *= 0.97;
        spark.vy *= 0.97;

        if (spark.life <= 0) return false;

        const alpha = Math.max(0, spark.life / spark.maxLife);

        // Color based on hue
        let color: string;
        if (spark.hue === 0) {
          color = `rgba(255, 255, 255, ${alpha * 0.8})`;
        } else if (spark.hue === 1) {
          color = `rgba(170, 210, 255, ${alpha * 0.75})`;
        } else {
          color = `rgba(200, 180, 255, ${alpha * 0.7})`;
        }

        // Glow
        const sparkGradient = ctx.createRadialGradient(
          spark.x, spark.y, 0,
          spark.x, spark.y, spark.size * 3
        );
        const glowColor =
          spark.hue === 0
            ? `rgba(255, 255, 255, ${alpha * 0.5})`
            : spark.hue === 1
              ? `rgba(160, 200, 255, ${alpha * 0.45})`
              : `rgba(190, 170, 255, ${alpha * 0.4})`;
        sparkGradient.addColorStop(0, glowColor);
        sparkGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = sparkGradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        return true;
      });

      // Limit total sparks
      if (sparksRef.current.length > 250) {
        sparksRef.current = sparksRef.current.slice(-200);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [resize]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9998 }}
      aria-hidden="true"
    />
  );
}
