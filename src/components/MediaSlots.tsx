const SLOTS = [
  { id: "hero-still", label: "Photo", caption: "Hero still — wet paint, driveway" },
  { id: "before", label: "Photo", caption: "Before" },
  { id: "after", label: "Photo", caption: "After" },
  { id: "reel", label: "Video", caption: "Phone reel — 9:16" },
  { id: "wheels", label: "Photo", caption: "Wheels / glass close-up" },
  { id: "interior", label: "Photo", caption: "Interior extract" },
  { id: "sunset", label: "Video", caption: "Squeegee intro clip" },
  { id: "van", label: "Photo", caption: "Us on the street" },
] as const;

export function MediaSlots() {
  return (
    <section className="mt-16">
      <h2 className="font-display text-3xl font-semibold">Photos & video</h2>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        Empty on purpose. Drop real driveway shots here. Watermarked stock is
        fine until then — nothing we don’t have rights to.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SLOTS.map((slot) => (
          <li
            key={slot.id}
            className={`media-slot ${slot.label === "Video" ? "media-slot--video" : ""}`}
          >
            <span className="media-slot-tag">{slot.label} slot</span>
            <span className="media-slot-cap">{slot.caption}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
