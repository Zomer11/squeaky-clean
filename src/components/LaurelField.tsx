type Pt = { x: number; y: number };

function polar(cx: number, cy: number, r: number, deg: number): Pt & { deg: number } {
  const a = (deg * Math.PI) / 180;
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, deg };
}

function ArcSprig({
  cx,
  cy,
  r,
  from,
  to,
  count = 14,
  leafW = 6.2,
  leafH = 15,
  berries = false,
}: {
  cx: number;
  cy: number;
  r: number;
  from: number;
  to: number;
  count?: number;
  leafW?: number;
  leafH?: number;
  berries?: boolean;
}) {
  const dir = Math.sign(to - from) || 1;
  const stem: Pt[] = [];
  const samples = count + 4;
  for (let i = 0; i <= samples; i++) {
    stem.push(polar(cx, cy, r, from + (i / samples) * (to - from)));
  }
  const stemD = stem
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const leaves = Array.from({ length: count }, (_, i) => {
    const t = (i + 0.45) / count;
    const deg = from + t * (to - from);
    const p = polar(cx, cy, r, deg);
    const rad = (deg * Math.PI) / 180;
    const tanX = -Math.sin(rad) * dir;
    const tanY = Math.cos(rad) * dir;
    const tanAngle = (Math.atan2(tanY, tanX) * 180) / Math.PI;
    const side = i % 2 === 0 ? 1 : -1;
    const grow = 0.62 + (1 - t) * 0.38;
    const lx = p.x + -tanY * side * leafW * 1.15 * grow;
    const ly = p.y + tanX * side * leafW * 1.15 * grow;
    return { lx, ly, rot: tanAngle + side * 26, rx: leafW * grow, ry: leafH * grow, berry: berries && i % 4 === 1, bx: p.x, by: p.y };
  });

  return (
    <g fill="currentColor">
      <path
        d={stemD}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      {leaves.map((leaf, i) => (
        <g key={i}>
          {leaf.berry ? <circle cx={leaf.bx} cy={leaf.by} r={2.1} /> : null}
          <ellipse
            cx={leaf.lx}
            cy={leaf.ly}
            rx={leaf.rx}
            ry={leaf.ry}
            transform={`rotate(${leaf.rot} ${leaf.lx} ${leaf.ly})`}
          />
        </g>
      ))}
    </g>
  );
}

function qPoint(a: Pt, b: Pt, c: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * b.x + t * t * c.x,
    y: u * u * a.y + 2 * u * t * b.y + t * t * c.y,
  };
}

function qTan(a: Pt, b: Pt, c: Pt, t: number): Pt {
  const dx = 2 * (1 - t) * (b.x - a.x) + 2 * t * (c.x - b.x);
  const dy = 2 * (1 - t) * (b.y - a.y) + 2 * t * (c.y - b.y);
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

function Branch({
  a,
  b,
  c,
  count = 12,
  leafW = 6,
  leafH = 14.5,
  berries = false,
}: {
  a: Pt;
  b: Pt;
  c: Pt;
  count?: number;
  leafW?: number;
  leafH?: number;
  berries?: boolean;
}) {
  const leaves = Array.from({ length: count }, (_, i) => {
    const t = 0.05 + (i / (count - 1)) * 0.9;
    const p = qPoint(a, b, c, t);
    const tan = qTan(a, b, c, t);
    const tanAngle = (Math.atan2(tan.y, tan.x) * 180) / Math.PI;
    const side = i % 2 === 0 ? 1 : -1;
    const grow = 0.55 + (1 - t) * 0.45;
    const lx = p.x + -tan.y * side * leafW * 1.2 * grow;
    const ly = p.y + tan.x * side * leafW * 1.2 * grow;
    return { lx, ly, rot: tanAngle + side * 24, rx: leafW * grow, ry: leafH * grow, berry: berries && i % 3 === 1, bx: p.x, by: p.y };
  });

  return (
    <g fill="currentColor">
      <path
        d={`M${a.x} ${a.y} Q ${b.x} ${b.y} ${c.x} ${c.y}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      {leaves.map((leaf, i) => (
        <g key={i}>
          {leaf.berry ? <circle cx={leaf.bx} cy={leaf.by} r={2.1} /> : null}
          <ellipse
            cx={leaf.lx}
            cy={leaf.ly}
            rx={leaf.rx}
            ry={leaf.ry}
            transform={`rotate(${leaf.rot} ${leaf.lx} ${leaf.ly})`}
          />
        </g>
      ))}
    </g>
  );
}

function UWreath({
  cx,
  cy,
  w,
  h,
  berries = false,
}: {
  cx: number;
  cy: number;
  w: number;
  h: number;
  berries?: boolean;
}) {
  return (
    <g>
      <Branch
        a={{ x: cx, y: cy + h * 0.42 }}
        b={{ x: cx - w * 0.58, y: cy + h * 0.08 }}
        c={{ x: cx - w * 0.28, y: cy - h * 0.48 }}
        count={13}
        berries={berries}
      />
      <Branch
        a={{ x: cx, y: cy + h * 0.42 }}
        b={{ x: cx + w * 0.58, y: cy + h * 0.08 }}
        c={{ x: cx + w * 0.28, y: cy - h * 0.48 }}
        count={13}
        berries={berries}
      />
    </g>
  );
}

function RingWreath({
  cx,
  cy,
  r,
  berries = false,
}: {
  cx: number;
  cy: number;
  r: number;
  berries?: boolean;
}) {
  return (
    <g>
      <ArcSprig cx={cx} cy={cy} r={r} from={108} to={252} count={16} berries={berries} />
      <ArcSprig cx={cx} cy={cy} r={r} from={72} to={-72} count={16} berries={berries} />
    </g>
  );
}

export function MiniWreath({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" aria-hidden>
      <g transform="translate(40 46) scale(0.42)">
        <UWreath cx={0} cy={0} w={110} h={130} />
      </g>
    </svg>
  );
}

/** Shaded laurel wreaths — the Greek olive-branch kind, not random petals. */
export function LaurelField() {
  return (
    <div className="laurel-field" aria-hidden>
      <svg
        className="laurel-field-svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <g opacity="0.9">
          <RingWreath cx={1260} cy={150} r={150} />
        </g>
        <g opacity="0.75">
          <UWreath cx={210} cy={730} w={300} h={260} />
        </g>
        <g opacity="0.7">
          <RingWreath cx={180} cy={210} r={175} berries />
        </g>
        <g opacity="0.65">
          <UWreath cx={1220} cy={760} w={260} h={230} berries />
        </g>
        <g opacity="0.55">
          <Branch
            a={{ x: 520, y: 70 }}
            b={{ x: 720, y: 30 }}
            c={{ x: 930, y: 80 }}
            count={14}
          />
        </g>
        <g opacity="0.5">
          <Branch
            a={{ x: 980, y: 430 }}
            b={{ x: 1120, y: 500 }}
            c={{ x: 1280, y: 470 }}
            count={11}
            berries
          />
        </g>
      </svg>
    </div>
  );
}
