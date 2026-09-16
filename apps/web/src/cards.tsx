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

/** A generic gold trophy cup — deliberately a stylized silhouette (bowl,
 * two handles, stem, plinth) rather than any real competition's actual
 * trophy design, which is a protected 3D sculpture. Shines with an
 * animated diagonal sweep clipped to the cup. */
function AnimatedTrophy({ size = 96 }: { size?: number }) {
  const cupPath = "M25 8 H75 A6 6 0 0 1 75 20 C75 46 64 62 50 66 C36 62 25 46 25 20 A6 6 0 0 1 25 8 Z";
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 100 125" className="trophy-svg-pop">
      <defs>
        <linearGradient id="lxi-trophy-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff6da" />
          <stop offset="45%" stopColor="#e4c158" />
          <stop offset="100%" stopColor="#a9781f" />
        </linearGradient>
        <clipPath id="lxi-trophy-clip">
          <path d={cupPath} />
        </clipPath>
      </defs>
      <path
        d="M18 14 C6 14 6 34 15 40 C19 43 23 43 25 41"
        fill="none"
        stroke="#c9973a"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M82 14 C94 14 94 34 85 40 C81 43 77 43 75 41"
        fill="none"
        stroke="#c9973a"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d={cupPath} fill="url(#lxi-trophy-fill)" stroke="#7a5c17" strokeWidth="1.5" />
      <g clipPath="url(#lxi-trophy-clip)">
        <rect className="trophy-shine" x="-40" y="0" width="30" height="70" fill="rgba(255,255,255,0.55)" transform="skewX(-18)" />
      </g>
      <rect x="45" y="66" width="10" height="16" fill="#c9973a" />
      <rect x="34" y="82" width="32" height="10" rx="2" fill="url(#lxi-trophy-fill)" stroke="#7a5c17" strokeWidth="1.5" />
      <rect x="26" y="92" width="48" height="10" rx="2" fill="url(#lxi-trophy-fill)" stroke="#7a5c17" strokeWidth="1.5" />
    </svg>
  );
}

const STREAMER_COLORS = ["#e4c158", "#5cff9e", "#f6dd8c", "#c9cdd3"];

/** The single biggest moment in the game: winning a tournament with your
 * national team. An animated trophy, a heavier confetti/streamer mix, and
 * the flag, staged distinctly bigger than a club trophy win. */
export function ChampionMoment({
  countryName,
  flag,
  trophyName,
  year,
  onContinue,
}: {
  countryName: string;
  flag: string;
  trophyName: string;
  year: number;
  onContinue: () => void;
}) {
  const confetti = Array.from({ length: 32 }, (_, i) => ({
    left: (i * 31) % 100,
    delay: (i * 113) % 26 / 10,
    duration: 2.4 + ((i * 59) % 16) / 10,
    color: STREAMER_COLORS[i % STREAMER_COLORS.length],
    rotate: (i * 53) % 180,
    streamer: i % 4 === 0,
  }));
  return (
    <div className="champion-overlay" onClick={onContinue} role="button" tabIndex={0}>
      <div className="confetti" aria-hidden="true">
        {confetti.map((c, i) => (
          <span
            key={i}
            className={c.streamer ? "confetti-piece confetti-streamer" : "confetti-piece"}
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
      <div className="champion-panel">
        <div className="champion-trophy-glow">
          <AnimatedTrophy />
        </div>
        <div className="champion-flag">{flag}</div>
        <div className="champion-eyebrow">Champions</div>
        <h2 className="champion-title">
          {countryName} win the {trophyName}!
        </h2>
        <p className="champion-subtitle">{year} · a place in the history books</p>
        <div className="champion-hint">tap to continue</div>
      </div>
    </div>
  );
}

/** A generic gold ball-on-a-plinth trophy — "Ballon d'Or" literally means
 * "golden ball", so a gold sphere with soccer-ball seams on a small base is
 * the natural, generic reading of the award's name, not a copy of any
 * manufacturer's actual trophy sculpture. Spins slowly with a shine sweep. */
function AnimatedGoldenBall({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120">
      <defs>
        <radialGradient id="lxi-ball-fill" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff6da" />
          <stop offset="45%" stopColor="#e4c158" />
          <stop offset="100%" stopColor="#9c7018" />
        </radialGradient>
        <clipPath id="lxi-ball-clip">
          <circle cx="50" cy="42" r="32" />
        </clipPath>
      </defs>
      <g className="ball-spin-slow" style={{ transformOrigin: "50px 42px" }}>
        <circle cx="50" cy="42" r="32" fill="url(#lxi-ball-fill)" stroke="#7a5c17" strokeWidth="1.5" />
        <g stroke="#9c7018" strokeWidth="1.4" fill="none" opacity="0.75">
          <path d="M50 12 L38 22 L34 38 L50 48 L66 38 L62 22 Z" />
          <path d="M50 12 L50 3" />
          <path d="M34 38 L18 40" />
          <path d="M66 38 L82 40" />
          <path d="M50 48 L44 66" />
          <path d="M50 48 L56 66" />
        </g>
        <g clipPath="url(#lxi-ball-clip)">
          <rect className="trophy-shine" x="-40" y="0" width="26" height="90" fill="rgba(255,255,255,0.6)" transform="skewX(-18)" />
        </g>
      </g>
      <rect x="44" y="74" width="12" height="14" fill="#2a2a2a" />
      <rect x="32" y="88" width="36" height="9" rx="2" fill="#1c1c1c" stroke="#3a3a3a" strokeWidth="1" />
      <rect x="24" y="97" width="52" height="9" rx="2" fill="#1c1c1c" stroke="#3a3a3a" strokeWidth="1" />
    </svg>
  );
}

/** Winning the Ballon d'Or gets the same weight as a national-team title —
 * it's the individual equivalent of "biggest moment in the game." */
export function BallonDOrMoment({ year, onContinue }: { year: number; onContinue: () => void }) {
  const confetti = Array.from({ length: 26 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: (i * 97) % 24 / 10,
    duration: 2.4 + ((i * 61) % 14) / 10,
    color: STREAMER_COLORS[i % STREAMER_COLORS.length],
    rotate: (i * 41) % 180,
    streamer: i % 4 === 1,
  }));
  return (
    <div className="champion-overlay" onClick={onContinue} role="button" tabIndex={0}>
      <div className="confetti" aria-hidden="true">
        {confetti.map((c, i) => (
          <span
            key={i}
            className={c.streamer ? "confetti-piece confetti-streamer" : "confetti-piece"}
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
      <div className="champion-panel">
        <div className="champion-trophy-glow trophy-svg-pop">
          <AnimatedGoldenBall />
        </div>
        <div className="champion-eyebrow">Ballon d'Or</div>
        <h2 className="champion-title">World's Best Player</h2>
        <p className="champion-subtitle">{year} · the individual honor every player dreams of</p>
        <div className="champion-hint">tap to continue</div>
      </div>
    </div>
  );
}

/** The Legacy XI mark — a badge tile, not a club crest (deliberately
 * distinct from the generated club crests elsewhere in the app): a dark
 * beveled square with one cut corner carrying a single accent flash, bold
 * centered numerals. One shape, one accent — restraint over flourish. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="lxi-mark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b241d" />
          <stop offset="100%" stopColor="#10160f" />
        </linearGradient>
        <clipPath id="lxi-mark-clip">
          <path d="M13 3 H41 A4 4 0 0 1 45 7 V35 L35 45 H7 A4 4 0 0 1 3 41 V13 Z" />
        </clipPath>
      </defs>
      <path
        d="M13 3 H41 A4 4 0 0 1 45 7 V35 L35 45 H7 A4 4 0 0 1 3 41 V13 Z"
        fill="url(#lxi-mark-fill)"
        stroke="var(--line-strong)"
        strokeWidth="1.25"
      />
      <g clipPath="url(#lxi-mark-clip)">
        <path d="M45 30 L45 45 L30 45 Z" fill="var(--accent)" />
      </g>
      <text x="21" y="29" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="800" fontSize="19" fill="var(--ink)" letterSpacing="0.5">
        XI
      </text>
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

/** Persistent app chrome — sticky across every screen but the splash-style
 * intro, so the product reads as one app rather than a set of pages. */
export function AppBar({ right }: { right?: ReactNode }) {
  return (
    <div className="appbar">
      <div className="appbar-inner">
        <Logo size={24} />
        {right}
      </div>
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
