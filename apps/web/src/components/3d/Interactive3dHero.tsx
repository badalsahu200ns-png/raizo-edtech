"use client";

import React, { useRef, useEffect, useState } from "react";
import { Sparkles, Compass, Eye, ShieldCheck, ArrowRight, Activity, Layers } from "lucide-react";
import Link from "next/link";

interface Node3D {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  glow: string;
  score: number;
  status: "verified" | "active" | "milestone";
  connections: number[];
}

export default function Interactive3dHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node3D | null>(null);
  const [activeMode, setActiveMode] = useState<"orbit" | "flow">("orbit");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    window.addEventListener("resize", handleResize);

    // 3D Nodes Dataset (Knowledge Topology)
    const baseRadius = Math.min(width, height) * 0.28;
    const rawNodes: Node3D[] = [
      { id: "sql_win", name: "SQL Window Functions", x: 0.8, y: -0.3, z: 0.2, radius: 9, color: "#38BDF8", glow: "rgba(56, 189, 248, 0.6)", score: 88, status: "verified", connections: [1, 2, 4] },
      { id: "sql_join", name: "Multi-Table JOINs", x: 0.4, y: -0.7, z: -0.4, radius: 8, color: "#38BDF8", glow: "rgba(56, 189, 248, 0.4)", score: 92, status: "verified", connections: [0, 3] },
      { id: "pandas_clean", name: "Pandas Data Cleaning", x: -0.5, y: -0.4, z: 0.7, radius: 8, color: "#34D399", glow: "rgba(52, 211, 153, 0.5)", score: 74, status: "active", connections: [0, 5] },
      { id: "desc_stats", name: "Descriptive Statistics", x: -0.7, y: 0.2, z: -0.5, radius: 7, color: "#FBBF24", glow: "rgba(251, 191, 36, 0.4)", score: 85, status: "verified", connections: [1, 6] },
      { id: "powerbi", name: "Power BI Dashboards", x: 0.6, y: 0.5, z: 0.5, radius: 9, color: "#818CF8", glow: "rgba(129, 140, 248, 0.5)", score: 78, status: "verified", connections: [0, 7] },
      { id: "py_vectors", name: "Python ETL Pipelines", x: -0.3, y: 0.7, z: 0.3, radius: 7, color: "#34D399", glow: "rgba(52, 211, 153, 0.4)", score: 70, status: "active", connections: [2, 7] },
      { id: "ab_test", name: "A/B Testing & Inference", x: -0.2, y: -0.8, z: 0.4, radius: 7, color: "#FBBF24", glow: "rgba(251, 191, 36, 0.4)", score: 65, status: "active", connections: [3] },
      { id: "capstone", name: "Evidence Ledger (HMAC)", x: 0.1, y: 0.1, z: -0.8, radius: 11, color: "#10B981", glow: "rgba(16, 185, 129, 0.7)", score: 95, status: "milestone", connections: [4, 5, 0] },
      { id: "dense_rank", name: "DENSE_RANK() Logic", x: 0.9, y: 0.2, z: -0.2, radius: 6, color: "#38BDF8", glow: "rgba(56, 189, 248, 0.3)", score: 90, status: "verified", connections: [0] },
      { id: "outlier_iqr", name: "IQR Outlier Detection", x: -0.8, y: -0.1, z: 0.1, radius: 6, color: "#FBBF24", glow: "rgba(251, 191, 36, 0.3)", score: 80, status: "verified", connections: [3] },
      { id: "cohort_rev", name: "Cohort Retention Models", x: 0.3, y: 0.8, z: -0.4, radius: 7, color: "#818CF8", glow: "rgba(129, 140, 248, 0.4)", score: 72, status: "active", connections: [4] }
    ];

    // Scale nodes to radius
    const nodes = rawNodes.map((n) => ({
      ...n,
      x: n.x * baseRadius,
      y: n.y * baseRadius,
      z: n.z * baseRadius
    }));

    // Mouse Interaction Coordinates
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.5;
      targetRotX = -y * 1.5;

      // Hit testing for hover
      const dpr = window.devicePixelRatio;
      const cursorX = (e.clientX - rect.left) * dpr;
      const cursorY = (e.clientY - rect.top) * dpr;

      let found: Node3D | null = null;
      for (const n of projectedNodes) {
        const dx = cursorX - n.projX;
        const dy = cursorY - n.projY;
        if (Math.sqrt(dx * dx + dy * dy) < n.projRadius * 1.8) {
          found = n;
          break;
        }
      }
      setHoveredNode(found);
    };

    window.addEventListener("mousemove", handlePointerMove);

    // Projected Nodes for Drawing & Hover Hit-testing
    let projectedNodes: any[] = [];

    // Animation Loop
    let angle = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth camera rotation
      angle += 0.004;
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      const cosY = Math.cos(angle + rotY);
      const sinY = Math.sin(angle + rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const focalLength = 650 * (width / 900);
      const centerX = width / 2;
      const centerY = height / 2;

      // Project all nodes
      projectedNodes = nodes.map((n) => {
        // Rotate around Y
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.z * cosY + n.x * sinY;

        // Rotate around X
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + n.y * sinX;

        // Perspective projection
        const scale = focalLength / (focalLength + z2 + 300);
        const projX = centerX + x1 * scale;
        const projY = centerY + y2 * scale;
        const projRadius = Math.max(3, n.radius * scale * 1.1);

        return {
          ...n,
          projX,
          projY,
          projRadius,
          projScale: scale,
          depthZ: z2
        };
      });

      // Sort by depth (Z-buffer painter's algorithm)
      projectedNodes.sort((a, b) => b.depthZ - a.depthZ);

      // 1. Draw 3D Connecting Vector Lines
      for (let i = 0; i < projectedNodes.length; i++) {
        const n1 = projectedNodes[i];
        for (const connIdx of n1.connections) {
          const n2 = projectedNodes[connIdx];
          if (!n2) continue;

          const avgDepth = (n1.depthZ + n2.depthZ) / 2;
          const lineAlpha = Math.max(0.12, Math.min(0.65, (avgDepth + 200) / 400));

          ctx.beginPath();
          ctx.moveTo(n1.projX, n1.projY);
          ctx.lineTo(n2.projX, n2.projY);

          // Glowing laser line
          ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha * 0.7})`;
          ctx.lineWidth = Math.max(1, 1.8 * n1.projScale);
          ctx.stroke();

          // Particle pulse along vector
          if (activeMode === "flow") {
            const pulseT = ((Date.now() / 1500) + (i * 0.2)) % 1;
            const px = n1.projX + (n2.projX - n1.projX) * pulseT;
            const py = n1.projY + (n2.projY - n1.projY) * pulseT;
            ctx.fillStyle = "#38BDF8";
            ctx.beginPath();
            ctx.arc(px, py, 2.5 * n1.projScale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 2. Draw 3D Spherical Nodes with Specular Glow
      for (const n of projectedNodes) {
        const isHovered = hoveredNode?.id === n.id;

        // Radial Halo
        const glowRadius = n.projRadius * (isHovered ? 3.5 : 2.2);
        const glowGrad = ctx.createRadialGradient(
          n.projX,
          n.projY,
          n.projRadius * 0.2,
          n.projX,
          n.projY,
          glowRadius
        );
        glowGrad.addColorStop(0, n.glow);
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(n.projX, n.projY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node Solid Sphere
        ctx.beginPath();
        ctx.arc(n.projX, n.projY, isHovered ? n.projRadius * 1.3 : n.projRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? "#FFFFFF" : n.color;
        ctx.fill();

        // 3D Inner Specular Light
        const specGrad = ctx.createRadialGradient(
          n.projX - n.projRadius * 0.3,
          n.projY - n.projRadius * 0.3,
          1,
          n.projX,
          n.projY,
          n.projRadius
        );
        specGrad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        specGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = specGrad;
        ctx.beginPath();
        ctx.arc(n.projX, n.projY, isHovered ? n.projRadius * 1.3 : n.projRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node Text Label in 3D space
        if (n.depthZ > -80 || isHovered) {
          ctx.fillStyle = isHovered ? "#FFFFFF" : "rgba(245, 247, 250, 0.85)";
          ctx.font = `${Math.max(10, Math.round(11 * n.projScale))}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(n.name, n.projX, n.projY + n.projRadius + 14);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeMode]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-3xl border border-[#27303B] bg-gradient-to-b from-[#0B0F17] to-[#070A0F] overflow-hidden shadow-2xl edtech-mesh-gradient p-6 sm:p-10"
    >
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Floating HUD Badges & Content */}
      <div className="relative z-10 pointer-events-none flex flex-col justify-between min-h-[420px] sm:min-h-[500px]">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#11161D]/80 backdrop-blur-md border border-[#27303B] text-xs text-[#F5F7FA]">
            <Compass className="h-3.5 w-3.5 text-[#38BDF8] animate-spin" style={{ animationDuration: "12s" }} />
            <span className="font-mono text-[11px] font-bold text-[#38BDF8]">3D KNOWLEDGE CONSTELLATION</span>
            <span className="h-1 w-1 rounded-full bg-[#27303B]" />
            <span className="text-[10px] text-[#94A3B8]">Interactive Orbit</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMode(activeMode === "orbit" ? "flow" : "orbit")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border backdrop-blur-md transition-all ${
                activeMode === "flow"
                  ? "bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]"
                  : "bg-[#11161D]/70 border-[#27303B] text-[#94A3B8] hover:text-[#F5F7FA]"
              }`}
            >
              <Activity className="h-3 w-3 inline mr-1" />
              <span>{activeMode === "flow" ? "Vector Flow: Active" : "Vector Flow: Off"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic 3D Hover Tooltip */}
        {hoveredNode && (
          <div className="self-center sm:self-end bg-[#11161D]/90 backdrop-blur-xl border border-[#38BDF8]/40 p-4 rounded-2xl shadow-xl max-w-xs space-y-1.5 animate-in fade-in zoom-in-95 pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#F5F7FA]">{hoveredNode.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                {hoveredNode.status === "milestone" ? "★ Milestone" : `${hoveredNode.score}% Verified`}
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Prerequisite-aware competency node linked across diagnostic checkpoints and verified code submissions.
            </p>
          </div>
        )}

        {/* Bottom Hero Callout */}
        <div className="pt-8 max-w-lg pointer-events-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[11px] font-semibold text-[#10B981]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Cryptographic HMAC-SHA256 Evidence Tracking</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight leading-tight">
            Learn By Proving. <br />
            Not Just Watching.
          </h2>

          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Move your cursor across the 3D constellation to inspect how SQL window functions, Pandas cleaning, and descriptive statistics connect into certified career readiness.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38BDF8] text-[#070A0F] text-xs font-bold shadow-lg shadow-[#38BDF8]/20 hover:bg-[#60A5FA] transition-all hover:translate-y-[-1px]"
            >
              <span>Explore Interactive Tracks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#151B23]/80 backdrop-blur-md border border-[#27303B] text-xs font-semibold text-[#F5F7FA] hover:bg-[#1C2430] transition-all"
            >
              <span>Take Diagnostic (25m)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
