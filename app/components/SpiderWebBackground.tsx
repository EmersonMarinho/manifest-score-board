"use client";
import React from "react";
import Particles from "@tsparticles/react";
import type { Engine } from "@tsparticles/engine";
import { loadFull } from "tsparticles";
import { OutMode } from "@tsparticles/engine";

export default function SpiderWebBackground() {
  // Configuração do efeito de teia
  const options = {
    background: {
      color: "transparent"
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse"
        },
        resize: { enable: true }
      },
      modes: {
        repulse: {
          distance: 120,
          duration: 0.4
        }
      }
    },
    particles: {
      color: {
        value: "#b3b3b3"
      },
      links: {
        color: "#b3b3b3",
        distance: 120,
        enable: true,
        opacity: 0.4,
        width: 1
      },
      collisions: {
        enable: false
      },
      move: {
        direction: "none" as const,
        enable: true,
        outModes: { default: OutMode.bounce },
        random: false,
        speed: 1.2,
        straight: false
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 60
      },
      opacity: {
        value: 0.5
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 1, max: 3 }
      }
    },
    detectRetina: true
  };

  // Carregar engine completa para máxima compatibilidade
  const particlesInit = async (engine: Engine) => {
    await loadFull(engine);
  };

  return (
    <Particles
      id="spiderweb-bg"
      options={options}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
} 