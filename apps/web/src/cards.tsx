import { Trophy } from "lucide-react";
import type { CardStats, CrestColors, PositionId } from "@legacyxi/sim";
import { POSITIONS, crestFor } from "@legacyxi/sim";

/** Top-to-bottom rows mirroring a pitch viewed attack-first: tap where you play. */
const PITCH_ROWS: PositionId[][] = [["ST", "W"], ["AM"], ["CM", "DM"], ["FB", "CB"], ["GK"]];

export function PositionPicker({ value, onChange }: { value: PositionId | null; onChange: (p: PositionId) => void }) {
  return (
    <div className="pitch">
      {PITCH_ROWS.map((row, i) => (
        <div className="pitch-row" key={i}>
          {row.map((id) => {
            const def = POSITIONS.find((p) => p.id === id)!;
            return (
              <button key={id} type="button" className={`pitch-dot ${value === id ? "active" : ""}`} onClick={() => onChange(id)}>
                {def.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function relativeLuminance(hex: string): number {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** An original, generated club badge — never a real club's logo. Two-tone
 * shield with the club's initials, colors chosen deterministically by name. */
export function Crest({ clubName, size = 28 }: { clubName: string; size?: number }) {
  const { primary, secondary, initials }: CrestColors = crestFor(clubName);
  const textColor = relativeLuminance(primary) > 0.5 ? "#1a1a1a" : "#f4f4f4";
  return (
    <svg className="crest" width={size} height={size * 1.15} viewBox="0 0 40 46" aria-label={`${clubName} crest`}>
      <path d="M2 2 H38 V22 C38 34 29 42 20 44 C11 42 2 34 2 22 Z" fill={primary} stroke={secondary} strokeWidth="2" />
      <path d="M2 22 C2 34 11 42 20 44 C20 44 20 30 20 30 L2 22 Z" fill={secondary} opacity="0.55" />
      <text x="20" y="26" textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight="600" fontSize="13" fill={textColor}>
        {initials}
      </text>
    </svg>
  );
}

export type CardTier = "bronze" | "silver" | "gold" | "icon" | "goat";

export function cardTier(rating: number): CardTier {
  if (rating >= 99) return "goat";
  if (rating >= 90) return "icon";
  if (rating >= 80) return "gold";
  if (rating >= 65) return "silver";
  return "bronze";
}

export function PlayerCard({
  rating,
  position,
  name,
  flag,
  clubName,
  stats,
  size = "full",
}: {
  rating: number;
  position: PositionId;
  name: string;
  flag: string;
  clubName: string;
  stats: CardStats;
  size?: "full" | "sm";
}) {
  const tier = cardTier(rating);
  const posLabel = POSITIONS.find((p) => p.id === position)?.label.split(" ")[0].toUpperCase() ?? position;
  return (
    <div className={`pcard pcard-${tier} ${size === "sm" ? "pcard-sm" : ""}`}>
      <div className="pcard-top">
        <div>
          <div className="pcard-rating num">{rating}</div>
          <div className="pcard-pos">{posLabel}</div>
        </div>
        <div className="pcard-id">
          <span style={{ fontSize: size === "sm" ? 16 : 20 }}>{flag}</span>
          <Crest clubName={clubName} size={size === "sm" ? 22 : 28} />
        </div>
      </div>
      <div className="pcard-name">{name}</div>
      <div className="pcard-divider" />
      <div className="pcard-stats">
        <div>
          <span className="k">PAC </span>
          {stats.pac}
        </div>
        <div>
          <span className="k">DRI </span>
          {stats.dri}
        </div>
        <div>
          <span className="k">SHO </span>
          {stats.sho}
        </div>
        <div>
          <span className="k">DEF </span>
          {stats.def}
        </div>
        <div>
          <span className="k">PAS </span>
          {stats.pas}
        </div>
        <div>
          <span className="k">PHY </span>
          {stats.phy}
        </div>
      </div>
    </div>
  );
}

const CONFETTI_COLORS = ["#e4c158", "#5cff9e", "#c9cdd3", "#e2554b", "#f6dd8c"];

/** A one-time celebratory moment for winning a trophy — not just a line in
 * the recap. Tap anywhere to continue. */
export function TrophyCelebration({ trophyName, year, onContinue }: { trophyName: string; year: number; onContinue: () => void }) {
  const confetti = Array.from({ length: 18 }, (_, i) => ({
    left: (i * 53) % 100,
    delay: (i * 137) % 22 / 10,
    duration: 2 + ((i * 71) % 12) / 10,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: (i * 47) % 180,
  }));
  return (
    <div className="trophy-overlay" onClick={onContinue} role="button" tabIndex={0}>
      <div className="confetti" aria-hidden="true">
        {confetti.map((c, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              transform: `rotate(${c.rotate}deg)`,
            }}
          />
        ))}
      </div>
      <div className="trophy-panel">
        <div className="trophy-glow">
          <Trophy size={52} color="#e4c158" className="trophy-icon-pop" />
        </div>
        <div className="trophy-eyebrow">Trophy won</div>
        <h2 className="trophy-title">{trophyName}</h2>
        <div className="trophy-hint">{year} · tap to continue</div>
      </div>
    </div>
  );
}

/** Faint pitch markings behind the intro hero — touchlines, center circle,
 * halfway line, both penalty boxes. Purely decorative. */
export function PitchMarkings() {
  return (
    <svg className="pitch-hero-lines" viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="#5cff9e" strokeOpacity="0.5" strokeWidth="1.4">
        <rect x="10" y="10" width="380" height="240" />
        <line x1="10" y1="130" x2="390" y2="130" />
        <circle cx="200" cy="130" r="36" />
        <circle cx="200" cy="130" r="2" fill="#5cff9e" />
        <rect x="10" y="70" width="46" height="120" />
        <rect x="344" y="70" width="46" height="120" />
      </g>
    </svg>
  );
}

export function BallIcon({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <circle cx="20" cy="20" r="18" fill="#f1f5f0" stroke="#1b1305" strokeWidth="1.4" />
      <g fill="#14171a">
        <polygon points="20,10 26,14.5 24,21.5 16,21.5 14,14.5" />
        <polygon points="8,17 14,14.5 16,21.5 12,27.5 6,25" />
        <polygon points="32,17 26,14.5 24,21.5 28,27.5 34,25" />
        <polygon points="14,32 16,24.5 24,24.5 26,32 20,36" />
      </g>
    </svg>
  );
}
