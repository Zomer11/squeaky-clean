"use client";

import { DetailCar3D } from "@/components/DetailCar3D";

export function DetailBeforeAfter() {
  return (
    <div className="card noise overflow-hidden p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">
          Paint check · 3D
        </p>
        <p className="text-xs font-semibold text-fresh-deep">Before → after</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <figure className="relative overflow-hidden rounded-2xl bg-cream-deep px-2 pb-3 pt-6">
          <div className="flex justify-center">
            <DetailCar3D vehicle="sedan" dirty size="md" />
          </div>
          <figcaption className="mt-2 text-center text-xs font-semibold text-ink-soft">
            Dust · swirl · crumbs
          </figcaption>
        </figure>
        <figure className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-fresh/15 to-paper px-2 pb-3 pt-6 ring-1 ring-fresh/30">
          <div className="flex justify-center">
            <DetailCar3D vehicle="sedan" dirty={false} size="md" />
          </div>
          <figcaption className="mt-2 text-center text-xs font-semibold text-fresh-deep">
            Washed · wiped · squeaky
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
