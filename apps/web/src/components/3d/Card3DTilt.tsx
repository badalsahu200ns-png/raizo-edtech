"use client";

import React, { useRef, useState } from "react";

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
  onClick?: () => void;
}

export default function Card3DTilt({
  children,
  className = "",
  maxTilt = 10,
  glowColor = "rgba(56, 189, 248, 0.18)",
  onClick
}: Card3DTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const mouseXPercent = (x / rect.width) * 100;
    const mouseYPercent = (y / rect.height) * 100;

    cardRef.current.style.setProperty("--mouse-x", `${mouseXPercent}%`);
    cardRef.current.style.setProperty("--mouse-y", `${mouseYPercent}%`);

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`,
      boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 25px -5px ${glowColor}`
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={tiltStyle}
      className={`raizo-3d-card group rounded-2xl border border-[#27303B] bg-[#121822] p-6 transition-all duration-200 cursor-pointer ${className}`}
    >
      <div className="raizo-3d-sheen" />
      <div className="relative z-10 preserve-3d">{children}</div>
    </div>
  );
}
