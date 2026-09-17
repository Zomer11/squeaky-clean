"use client";

import { useEffect, useRef, useState } from "react";
import { DetailCar3D } from "@/components/DetailCar3D";

export function DrivewayScene3D() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: ny * -8, y: nx * 12 });
  }

  return (
    <div
      ref={ref}
      className="drive-scene card noise relative overflow-hidden"
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="absolute inset-0 drive-sky" aria-hidden />
      <div className="relative z-[1] flex items-end justify-center px-4 pb-6 pt-10 sm:px-6 sm:pb-8 sm:pt-12">
        <div
          className="drive-rig"
          style={{
            transform: `rotateX(${10 + tilt.x}deg) rotateY(${-6 + tilt.y}deg)`,
          }}
        >
          <div className="drive-platform" aria-hidden>
            <div className="drive-slab" />
            <div className="drive-grass" />
          </div>
          <div className="drive-cars">
            <div className="drive-car drive-car-a">
              <DetailCar3D vehicle="hatch" size="md" interactive={false} />
            </div>
            <div className="drive-car drive-car-b">
              <DetailCar3D vehicle="sedan" size="lg" interactive={false} />
            </div>
            <div className="drive-car drive-car-c">
              <DetailCar3D vehicle="suv" size="md" interactive={false} />
            </div>
          </div>
          <div className="kerb-sparkle" aria-hidden />
        </div>
      </div>
      <div className="relative z-[2] flex items-center justify-between gap-2 border-t border-line/70 bg-paper/80 px-4 py-3 backdrop-blur-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">
          Driveway · mobile
        </p>
        <span className="chip">We come to you</span>
      </div>
    </div>
  );
}
