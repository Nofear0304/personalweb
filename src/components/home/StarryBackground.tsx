"use client";

import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

/**
 * Deep-space distant stars — tiny, numerous, dim.
 * Simulates the Milky Way "dust" feel.
 */
function DistantStars() {
  return (
    <Particles
      id="tsparticles-distant"
      options={{
        fullScreen: false,
        detectRetina: true,
        fpsLimit: 60,
        particles: {
          number: {
            value: 1600,
            density: {
              enable: true,
              width: 1920,
              height: 1080,
            },
          },
          color: {
            value: [
              "#c8d8ff",
              "#b0c4f0",
              "#d0dfff",
              "#e0d8ff",
              "#c0d0f8",
              "#b8c8e8",
              "#d8e4ff",
            ],
          },
          opacity: {
            value: { min: 0.03, max: 0.25 },
            animation: {
              enable: true,
              speed: 0.15,
              minimumValue: 0.02,
              sync: false,
              mode: "random",
            },
          },
          size: {
            value: { min: 0.1, max: 0.9 },
            animation: {
              enable: true,
              speed: 0.3,
              minimumValue: 0.1,
              sync: false,
              mode: "random",
            },
          },
          move: {
            enable: true,
            speed: 0.04,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
          },
          shape: {
            type: "circle",
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "bubble",
            },
          },
          modes: {
            bubble: {
              distance: 120,
              size: 2.5,
              duration: 2,
              opacity: 0.3,
              color: {
                value: ["#c8d8ff", "#ffffff"],
              },
            },
          },
        },
      }}
      className="absolute inset-0"
    />
  );
}

/**
 * Foreground bright stars — larger, brighter, with noticeable twinkle.
 * These are the "hero" stars that give depth and sparkle.
 */
function NearStars() {
  return (
    <Particles
      id="tsparticles-near"
      options={{
        fullScreen: false,
        detectRetina: true,
        fpsLimit: 60,
        particles: {
          number: {
            value: 350,
            density: {
              enable: true,
              width: 1920,
              height: 1080,
            },
          },
          color: {
            value: [
              "#ffffff",
              "#f0f4ff",
              "#e0ecff",
              "#f8f0ff",
              "#e8f0ff",
              "#fff8f0",
            ],
          },
          opacity: {
            value: { min: 0.15, max: 0.9 },
            animation: {
              enable: true,
              speed: 0.4,
              minimumValue: 0.08,
              sync: false,
              mode: "random",
            },
          },
          size: {
            value: { min: 0.6, max: 3.5 },
            animation: {
              enable: true,
              speed: 0.7,
              minimumValue: 0.4,
              sync: false,
              mode: "random",
            },
          },
          move: {
            enable: true,
            speed: 0.08,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
          },
          shape: {
            type: "circle",
          },
          // Glow effect — some stars get a radiant halo
          shadow: {
            enable: true,
            blur: 4,
            color: {
              value: ["#a0c4ff", "#c0b8ff", "#ffffff"],
            },
            offset: {
              x: 0,
              y: 0,
            },
          },
          // Subtle stroke outline for the brightest stars
          stroke: {
            width: 0.3,
            color: {
              value: "#ffffff",
            },
            opacity: 0.4,
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "bubble",
            },
          },
          modes: {
            bubble: {
              distance: 200,
              size: 6,
              duration: 2,
              opacity: 0.9,
              color: {
                value: ["#e0ebff", "#d8ccff", "#ffffff"],
              },
            },
          },
        },
      }}
      className="absolute inset-0 z-[1]"
    />
  );
}

export default function StarryBackground() {
  return (
    <ParticlesProvider init={loadSlim}>
      {/* Distant tiny stars — deep background layer */}
      <DistantStars />
      {/* Bright near stars — foreground sparkle layer */}
      <NearStars />
    </ParticlesProvider>
  );
}
