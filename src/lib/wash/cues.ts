/**
 * Camera script for the hero. Each cue is pinned to a point in the hero's
 * scroll progress (0 → 1). The engine blends between neighbouring cues and
 * then eases toward the result every frame, so the camera never snaps.
 *
 * Car space: +x is the nose, y is up, +z is the side facing the camera.
 */
export type Shot = {
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
  /** Shift the framing sideways (fraction of width). +ve pushes the car right. */
  offset?: number;
};

export type Cue = { id: string; at: number; shot: Shot; mobile?: Partial<Shot> };

export const CUES: Cue[] = [
  {
    id: "hero",
    at: 0,
    shot: { pos: [5.4, 1.1, 5.1], look: [0.2, 0.62, 0], fov: 30, offset: 0.2 },
    mobile: { pos: [8.0, 2.6, 8.0], look: [0.3, -0.95, 0], fov: 50, offset: 0 },
  },
  {
    id: "foam",
    at: 0.16,
    shot: { pos: [2.4, 1.5, 7.2], look: [1.0, 1.0, 0], fov: 32, offset: 0.12 },
    mobile: { pos: [2.6, 2.4, 11.2], look: [1.0, -0.85, 0], fov: 50, offset: 0 },
  },
  {
    id: "rinse",
    at: 0.36,
    shot: { pos: [0.2, 1.5, 7.2], look: [0.0, 1.0, 0], fov: 32, offset: 0.12 },
    mobile: { pos: [0.2, 2.4, 11.2], look: [0.0, -0.85, 0], fov: 50, offset: 0 },
  },
  {
    id: "rinse-end",
    at: 0.52,
    shot: { pos: [-5.8, 1.7, 6.2], look: [-0.4, 0.95, 0], fov: 32, offset: 0.1 },
    mobile: { pos: [-8.0, 2.6, 8.4], look: [-0.3, -0.85, 0], fov: 50, offset: 0 },
  },
  {
    id: "gloss",
    at: 0.62,
    shot: { pos: [4.6, 2.0, 4.3], look: [0.4, 0.9, 0], fov: 32, offset: 0.2 },
    mobile: { pos: [6.2, 3.2, 6.6], look: [0.6, -0.7, 0], fov: 46, offset: 0 },
  },
  {
    id: "callouts",
    at: 0.74,
    shot: { pos: [5.1, 2.35, 5.6], look: [0.1, 0.62, 0], fov: 30, offset: 0 },
    mobile: { pos: [8.0, 3.8, 8.6], look: [0.1, -0.55, 0], fov: 48, offset: 0 },
  },
  {
    id: "showroom",
    at: 0.88,
    shot: { pos: [6.0, 1.05, -5.0], look: [0.1, 0.35, 0], fov: 30, offset: 0.17 },
    mobile: { pos: [8.4, 2.2, -7.6], look: [0.1, -0.95, 0], fov: 50, offset: 0 },
  },
  {
    id: "outro",
    at: 1,
    shot: { pos: [7.2, 1.35, -2.6], look: [0, 0.3, 0], fov: 30, offset: 0.17 },
    mobile: { pos: [10.4, 2.4, -3.6], look: [0, -0.95, 0], fov: 50, offset: 0 },
  },
];

/** Wash timeline driven by scroll, 0 → 1. */
export const WASH_RANGE: [number, number] = [0.1, 0.52];
/** Reflection sweep (studio rotates) during the gloss beat. */
export const GLOSS_RANGE: [number, number] = [0.54, 0.74];
/** Callout labels visible window. */
export const CALLOUT_RANGE: [number, number] = [0.68, 0.84];
/** Turntable spin. */
export const SPIN_RANGE: [number, number] = [0.82, 1];

export function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Opacity for a beat that fades in at a, holds, and fades out at b. */
export function window01(p: number, a: number, b: number, fade = 0.04) {
  return Math.min(smoothstep(a - fade, a, p), 1 - smoothstep(b, b + fade, p));
}
