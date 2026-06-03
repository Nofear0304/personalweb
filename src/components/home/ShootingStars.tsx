"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MeteorData {
  id: number;
  top: number;       // 0–75  (%)
  left: number;      // 0–75  (%)
  angle: number;     // degrees — fall direction
  distance: number;  // px — travel distance
  duration: number;  // seconds
  headSize: number;  // px — diameter of the bright head
  tailLength: number;// px — length of the fading trail
  tailWidth: number; // px — thickness of the trail
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Pick a random fall angle.  Most meteors fall top-left → bottom-right. */
function randomAngle(): number {
  const r = Math.random();
  if (r < 0.75) return 32 + Math.random() * 28;          // 32°–60°  (TL→BR)
  if (r < 0.90) return 120 + Math.random() * 30;          // 120°–150° (TR→BL)
  return 60 + Math.random() * 60;                          // 60°–120° (steep / varied)
}

/* ------------------------------------------------------------------ */
/*  Single meteor particle                                             */
/* ------------------------------------------------------------------ */

function MeteorParticle({
  data,
  onDone,
}: {
  data: MeteorData;
  onDone: (id: number) => void;
}) {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const anim = el.animate(
      [
        { transform: "translateX(0)", opacity: 0 },
        { transform: "translateX(0)", opacity: 1, offset: 0.06 },
        {
          transform: `translateX(${data.distance * 0.5}px)`,
          opacity: 0.9,
          offset: 0.5,
        },
        {
          transform: `translateX(${data.distance * 0.85}px)`,
          opacity: 0.3,
          offset: 0.85,
        },
        { transform: `translateX(${data.distance}px)`, opacity: 0, offset: 1 },
      ],
      {
        duration: data.duration * 1000,
        fill: "both",
        easing: "linear",
      },
    );

    anim.onfinish = () => onDone(data.id);

    return () => anim.cancel();
  }, [data, onDone]);

  const glowRadius = data.headSize * 2.5;
  const glowSpread = data.headSize * 1.5;

  return (
    <div
      className="absolute"
      style={{
        top: `${data.top}%`,
        left: `${data.left}%`,
        transform: `rotate(${data.angle}deg)`,
        transformOrigin: "0 0",
      }}
    >
      {/* Animated inner wrapper — translateX + opacity via WAAPI */}
      <div ref={innerRef}>
        {/* Meteor body: tail + head */}
        <div
          className="relative"
          style={{
            width: `${data.tailLength}px`,
            height: `${Math.max(data.headSize, data.tailWidth)}px`,
          }}
        >
          {/* ── Tail ──
              The meteor moves → in local space, so the tail trails ← .
              Gradient: bright at the head (right), fading to transparent (left). */}
          <div
            className="absolute inset-0 rounded-[1px]"
            style={{
              background: `linear-gradient(
                to left,
                rgba(255,255,255,1)       0%,
                rgba(240,248,255,0.85)    10%,
                rgba(200,225,255,0.5)     35%,
                rgba(140,190,255,0.15)    65%,
                rgba(100,150,255,0.03)    85%,
                transparent               100%
              )`,
            }}
          />

          {/* ── Head ──
              Bright glowing dot at the leading edge (right side of tail). */}
          <div
            className="absolute rounded-full"
            style={{
              right: `${-(data.headSize / 2)}px`,
              top: "50%",
              transform: "translateY(-50%)",
              width: `${data.headSize}px`,
              height: `${data.headSize}px`,
              background: "#ffffff",
              boxShadow: `
                0 0 ${glowRadius}px ${glowSpread}px rgba(200,225,255,0.95),
                0 0 ${glowRadius * 2.5}px ${glowSpread * 3}px rgba(150,200,255,0.45),
                0 0 ${glowRadius * 0.6}px ${glowSpread * 0.5}px rgba(255,255,255,0.9)
              `,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Meteor field — orchestrates spawning & lifecycle                   */
/* ------------------------------------------------------------------ */

/** Keep total on-screen meteors within this range. */
const MIN_METEORS = 3;
const MAX_METEORS = 8;

/** Spawn interval range (ms). */
const SPAWN_MIN_MS = 2000;
const SPAWN_MAX_MS = 5000;

export default function ShootingStars() {
  const [meteors, setMeteors] = useState<MeteorData[]>([]);
  const nextId = useRef(0);
  const timerRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const meteorsRef = useRef(meteors);

  // Keep a ref in sync so the spawner always reads the latest count
  meteorsRef.current = meteors;

  const handleDone = useCallback((id: number) => {
    setMeteors((prev) => prev.filter((m) => m.id !== id));
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    function spawn() {
      if (!mountedRef.current) return;

      // Decide how many to create based on current count
      const currentCount = meteorsRef.current.length;
      const room = MAX_METEORS - currentCount;
      if (room <= 0) {
        // No room — check again later
        scheduleNext();
        return;
      }

      // Spawn 1–2 meteors (or up to available room)
      const count = Math.min(1 + Math.floor(Math.random() * 2), room);
      const batch: MeteorData[] = [];

      for (let i = 0; i < count; i++) {
        batch.push({
          id: nextId.current++,
          top: Math.random() * 72,               // 0%–72% (room to travel)
          left: Math.random() * 72,              // 0%–72%
          angle: randomAngle(),
          distance: 260 + Math.random() * 440,    // 260–700 px
          duration: 1.0 + Math.random() * 1.0,    // 1.0–2.0 s
          headSize: 2.5 + Math.random() * 4.0,    // 2.5–6.5 px
          tailLength: 50 + Math.random() * 140,   // 50–190 px
          tailWidth: 0.8 + Math.random() * 1.7,   // 0.8–2.5 px
        });
      }

      setMeteors((prev) => [...prev, ...batch]);

      scheduleNext();
    }

    function scheduleNext() {
      if (!mountedRef.current) return;
      const delay = SPAWN_MIN_MS + Math.random() * (SPAWN_MAX_MS - SPAWN_MIN_MS);
      timerRef.current = window.setTimeout(spawn, delay);
    }

    // Initial burst — fill to MIN_METEORS right away
    function initialBurst() {
      if (!mountedRef.current) return;
      const batch: MeteorData[] = [];
      for (let i = 0; i < MIN_METEORS; i++) {
        batch.push({
          id: nextId.current++,
          top: Math.random() * 72,
          left: Math.random() * 72,
          angle: randomAngle(),
          distance: 260 + Math.random() * 440,
          duration: 1.0 + Math.random() * 1.0,
          headSize: 2.5 + Math.random() * 4.0,
          tailLength: 50 + Math.random() * 140,
          tailWidth: 0.8 + Math.random() * 1.7,
        });
      }
      setMeteors(batch);
      scheduleNext();
    }

    // Stagger the first burst so the page has loaded
    const initialDelay = window.setTimeout(initialBurst, 600 + Math.random() * 900);

    return () => {
      mountedRef.current = false;
      clearTimeout(initialDelay);
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-[2]"
      aria-hidden="true"
    >
      {meteors.map((m) => (
        <MeteorParticle key={m.id} data={m} onDone={handleDone} />
      ))}
    </div>
  );
}
