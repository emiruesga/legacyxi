import type { ReactNode, CSSProperties } from "react";
import { Globe2, ShieldCheck, Star, Trophy } from "lucide-react";
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

/** A one-time full-screen celebratory moment — a trophy win or an
 * international debut — instead of just another line in the recap.
 * Tap anywhere to continue. */
export function MomentCelebration({
  icon,
  glowColor = "#e4c158",
  eyebrow,
  title,
  hint,
  confetti: showConfetti = true,
  onContinue,
}: {
  icon: ReactNode;
  glowColor?: string;
  eyebrow: string;
  title: string;
  hint: string;
  confetti?: boolean;
  onContinue: () => void;
}) {
  const confetti = Array.from({ length: 18 }, (_, i) => ({
    left: (i * 53) % 100,
    delay: (i * 137) % 22 / 10,
    duration: 2 + ((i * 71) % 12) / 10,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: (i * 47) % 180,
  }));
  return (
    <div className="trophy-overlay" onClick={onContinue} role="button" tabIndex={0}>
      {showConfetti && (
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
      )}
      <div className="trophy-panel">
        <div className="trophy-glow" style={{ "--moment-glow": glowColor } as CSSProperties}>
          {icon}
        </div>
        <div className="trophy-eyebrow" style={{ color: glowColor }}>
          {eyebrow}
        </div>
        <h2 className="trophy-title">{title}</h2>
        <div className="trophy-hint">{hint}</div>
      </div>
    </div>
  );
}

export function TrophyCelebration({ trophyName, year, onContinue }: { trophyName: string; year: number; onContinue: () => void }) {
  return (
    <MomentCelebration
      icon={<Trophy size={52} color="#e4c158" className="trophy-icon-pop" />}
      glowColor="#e4c158"
      eyebrow="Trophy won"
      title={trophyName}
      hint={`${year} · tap to continue`}
      onContinue={onContinue}
    />
  );
}

export function DebutCelebration({ countryName, onContinue }: { countryName: string; onContinue: () => void }) {
  return (
    <MomentCelebration
      icon={<ShieldCheck size={52} color="#5cff9e" className="trophy-icon-pop" />}
      glowColor="#5cff9e"
      eyebrow="International debut"
      title={`Full debut for ${countryName}`}
      hint="tap to continue"
      confetti={false}
      onContinue={onContinue}
    />
  );
}

export function AwardCelebration({ awardName, year, onContinue }: { awardName: string; year: number; onContinue: () => void }) {
  return (
    <MomentCelebration
      icon={<Star size={52} color="#5cff9e" className="trophy-icon-pop" />}
      glowColor="#5cff9e"
      eyebrow="Award won"
      title={awardName}
      hint={`${year} · tap to continue`}
      onContinue={onContinue}
    />
  );
}

/** The one moment in the calendar bigger than a trophy win: making the
 * World Cup squad at all. Distinct staging from MomentCelebration on
 * purpose — a spinning globe, the flag popping in, a light sweep across
 * the panel — so it reads as the biggest stage in the game, not just
 * another award. */
export function WorldCupMoment({ countryName, flag, year, onContinue }: { countryName: string; flag: string; year: number; onContinue: () => void }) {
  return (
    <div className="worldcup-overlay" onClick={onContinue} role="button" tabIndex={0}>
      <div className="worldcup-sweep" aria-hidden="true" />
      <div className="worldcup-panel">
        <Globe2 size={38} color="#e4c158" className="worldcup-globe" />
        <div className="worldcup-flag">{flag}</div>
        <div className="worldcup-eyebrow">World Cup</div>
        <h2 className="worldcup-title">Called up for {countryName}</h2>
        <p className="worldcup-subtitle">Representing {countryName} on the world's biggest stage, {year}.</p>
        <div className="worldcup-hint">tap to continue</div>
      </div>
    </div>
  );
}

/** The Legacy XI mark — a flat, single-accent monogram badge. No gradient,
 * no glow: a logo, not a hero graphic. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" rx="10" fill="var(--surface-2)" stroke="var(--line-strong)" />
      <text x="20" y="24" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="800" fontSize="16" fill="var(--ink)">
        XI
      </text>
      <line x1="12" y1="29" x2="28" y2="29" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Mark + wordmark lockup for the top of a screen. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="logo-lockup">
      <LogoMark size={size} />
      <span className="logo-wordmark">
        Legacy <span className="xi">XI</span>
      </span>
    </div>
  );
}

const GAUGE_MIN = 40;
const GAUGE_MAX = 99;

function gaugePct(value: number): number {
  return ((value - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100;
}

/** FIFA-style "growth" gauge: where a player sits now (or their peak)
 * against their scouted potential ceiling. */
export function PotentialGauge({ current, potential, currentLabel = "Now" }: { current: number; potential: number; currentLabel?: string }) {
  const reachedCeiling = current >= potential;
  return (
    <div>
      <div className="row between" style={{ fontSize: 12 }}>
        <span className="statlabel" style={{ marginTop: 0 }}>
          {currentLabel}
        </span>
        <span className="statlabel" style={{ marginTop: 0 }}>
          Potential
        </span>
      </div>
      <div className="pot-gauge">
        <div className="pot-gauge-fill" style={{ width: `${gaugePct(current)}%` }} />
        <div className="pot-gauge-marker now" style={{ left: `${gaugePct(current)}%` }}>
          <span className="pot-gauge-tag num">{current}</span>
          <span className="pin" />
        </div>
        {!reachedCeiling && (
          <div className="pot-gauge-marker ceiling" style={{ left: `${gaugePct(potential)}%` }}>
            <span className="pot-gauge-tag num">{potential}</span>
            <span className="pin" />
          </div>
        )}
      </div>
      <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
        {reachedCeiling ? "Maxed out their scouted ceiling." : `${potential - current} short of their scouted ceiling.`}
      </div>
    </div>
  );
}

export interface NationLegacyRow {
  label: string;
  rank: number;
  total?: number;
}

/** "You're Brazil's #4 player of all time" style framing — one row backed
 * by the real, persisted all-time leaderboard, one row an estimate from
 * the same rank math the world-rank milestones use, scoped to nationality. */
export function NationLegacy({ flag, countryName, rows }: { flag: string; countryName: string; rows: NationLegacyRow[] }) {
  return (
    <div className="card">
      <div className="row gap8">
        <span className="legacy-flag">{flag}</span>
        <h3 style={{ fontSize: 17 }}>{countryName} legacy</h3>
      </div>
      <div style={{ marginTop: 4 }}>
        {rows.map((r, i) => (
          <div key={i} className="legacy-row row between">
            <span style={{ fontSize: 14 }}>{r.label}</span>
            <span className="legacy-rank">
              #{r.rank}
              {r.total ? <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}> / {r.total}</span> : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
