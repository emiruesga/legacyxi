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
