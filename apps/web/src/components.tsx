import {
  Award,
  ChevronRight,
  Globe2,
  Medal,
  RotateCcw,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type {
  Club,
  CareerRecord,
  Country,
  DecisionEventInstance,
  DraftResult,
  PlayerState,
  PositionId,
} from "@legacyxi/sim";
import { LEAGUES, POSITIONS, TIER_LABEL, cardStats, computeNationalRank, computeWorldRank, formatMoney, ratingLabel } from "@legacyxi/sim";
import type { LeaderboardRow } from "./api.js";
import { Crest, Logo, LogoMark, NationLegacy, PlayerCard, PositionPicker, PotentialGauge } from "./cards.js";

function groupByName<T extends { name: string; year: number }>(items: T[]): { name: string; count: number; years: number[] }[] {
  const groups = new Map<string, number[]>();
  for (const item of items) {
    const years = groups.get(item.name) ?? [];
    years.push(item.year);
    groups.set(item.name, years);
  }
  return Array.from(groups.entries())
    .map(([name, years]) => ({ name, count: years.length, years: years.sort((a, b) => a - b) }))
    .sort((a, b) => b.count - a.count);
}

export function Bar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function RatingChart({ seasons }: { seasons: PlayerState["seasons"] }) {
  if (seasons.length < 2) return null;
  const width = 560;
  const height = 140;
  const minAge = seasons[0].age;
  const maxAge = seasons[seasons.length - 1].age;
  const ageSpan = Math.max(1, maxAge - minAge);
  const points = seasons.map((s) => {
    const x = ((s.age - minAge) / ageSpan) * width;
    const y = height - ((s.rating - 40) / (99 - 40)) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ display: "block" }}>
      <polyline points={points.join(" ")} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
    </svg>
  );
}

export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="wrap fade-in">
      <div className="intro-hero">
        <LogoMark size={52} />
        <div>
          <h1 className="hero-title">Legacy XI</h1>
          <p className="muted intro-tagline" style={{ marginTop: 10, fontSize: 15.5 }}>
            Live an entire football career in a few minutes — from an academy trial at
            sixteen to a place among the all-time greats.
          </p>
        </div>
      </div>
      <div className="grid3" style={{ marginTop: 28 }}>
        <div className="card" style={{ padding: 14, textAlign: "center" }}>
          <div className="num statbig" style={{ fontSize: 26 }}>
            {LEAGUES.length}
          </div>
          <div className="statlabel">Real leagues</div>
        </div>
        <div className="card" style={{ padding: 14, textAlign: "center" }}>
          <div className="num statbig" style={{ fontSize: 26 }}>
            99
          </div>
          <div className="statlabel">GOAT ceiling</div>
        </div>
        <div className="card" style={{ padding: 14, textAlign: "center" }}>
          <div className="num statbig" style={{ fontSize: 26 }}>
            1
          </div>
          <div className="statlabel">All-time board</div>
        </div>
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} onClick={onStart}>
        Start your career <ChevronRight size={18} />
      </button>
      <p className="muted" style={{ marginTop: 12, fontSize: 12.5, textAlign: "center" }}>
        No account needed. Every run tells a different story.
      </p>
    </div>
  );
}

export interface CreateFormState {
  name: string;
  nationality: Country;
  foot: "Left" | "Right";
  number: number;
  position: PositionId | null;
}

export function CreateScreen({
  form,
  setForm,
  countries,
  onNext,
}: {
  form: CreateFormState;
  setForm: (f: CreateFormState) => void;
  countries: Country[];
  onNext: () => void;
}) {
  return (
    <div className="wrap fade-in">
      <div className="eyebrow">Step 1 of 2</div>
      <h2 style={{ fontSize: 28, marginTop: 6 }}>Define your identity</h2>
      <div className="divider" />

      <label className="label">Name</label>
      <input
        type="text"
        placeholder="Your player's name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <div className="grid2" style={{ marginTop: 14 }}>
        <div>
          <label className="label">Nationality</label>
          <select
            value={form.nationality.name}
            onChange={(e) => {
              const nat = countries.find((c) => c.name === e.target.value)!;
              setForm({ ...form, nationality: nat });
            }}
          >
            {countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Shirt number</label>
          <select value={form.number} onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}>
            {[7, 9, 10, 11, 4, 8, 5, 1, 17, 23].map((n) => (
              <option key={n} value={n}>
                #{n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="label" style={{ marginTop: 14 }}>
        Preferred foot
      </label>
      <div className="row gap8">
        {(["Left", "Right"] as const).map((f) => (
          <button key={f} className={`chip ${form.foot === f ? "active" : ""}`} onClick={() => setForm({ ...form, foot: f })}>
            {f}
          </button>
        ))}
      </div>

      <label className="label" style={{ marginTop: 18 }}>
        Position — tap where you play
      </label>
      <PositionPicker value={form.position} onChange={(position) => setForm({ ...form, position })} />

      <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} disabled={!form.position} onClick={onNext}>
        Find an academy <ChevronRight size={18} />
      </button>
    </div>
  );
}

export function AcademyScreen({
  form,
  offers,
  draft,
  onPick,
}: {
  form: CreateFormState;
  offers: Club[];
  draft: DraftResult;
  onPick: (club: Club) => void;
}) {
  const posLabel = POSITIONS.find((p) => p.id === form.position)?.label ?? "";
  return (
    <div className="wrap fade-in">
      <div className="eyebrow">Step 2 of 2</div>
      <h2 style={{ fontSize: 28, marginTop: 6 }}>Choose your first club</h2>
      <p className="muted" style={{ marginTop: 6 }}>
        {form.name || "Your player"}, age 16 · {form.nationality.flag} {form.nationality.name} · {posLabel}
      </p>
      <div className="badge" style={{ marginTop: 10 }}>
        <Sparkles size={13} /> Scouts say: {draft.potentialLabel}
      </div>

      <div className="col gap12" style={{ marginTop: 18 }}>
        {offers.map((o, i) => {
          const league = LEAGUES.find((l) => l.id === o.leagueId);
          return (
            <button key={i} className="card btn-ghost" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => onPick(o)}>
              <div className="row gap12">
                <Crest clubName={o.name} size={34} />
                <div style={{ flex: 1 }}>
                  <div className="row between">
                    <h3 style={{ fontSize: 18 }}>{o.name}</h3>
                    <span className="badge">{TIER_LABEL[o.tier]}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                    {league?.name}
                  </div>
                </div>
              </div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>
                Academy ambition
              </div>
              <div style={{ marginTop: 5 }}>
                <Bar value={o.ambition} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PlayerHeader({ player }: { player: PlayerState }) {
  const lastSeason = player.seasons[player.seasons.length - 1];
  const rank = lastSeason ? lastSeason.worldRank : computeWorldRank(player.rating, player.position);
  return (
    <div className="card">
      <div className="row gap16" style={{ alignItems: "flex-start" }}>
        <PlayerCard
          rating={player.rating}
          position={player.position}
          name={player.name}
          flag={player.nationality.flag}
          clubName={player.club.name}
          stats={cardStats(player)}
          size="sm"
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 19 }}>{player.name}</h3>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
            #{player.number} · {ratingLabel(player.rating)}
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
            {player.club.name}
          </div>
          <div className="divider" style={{ margin: "10px 0" }} />
          <div className="grid2">
            <div>
              <div className="statlabel">Age</div>
              <div className="num" style={{ fontSize: 18 }}>
                {player.age}
              </div>
            </div>
            <div>
              <div className="statlabel">Value</div>
              <div className="num" style={{ fontSize: 18 }}>
                {formatMoney(player.marketValue)}
              </div>
            </div>
            <div>
              <div className="statlabel">World rank</div>
              <div className="num" style={{ fontSize: 18 }}>
                {rank ? `#${rank}` : "—"}
              </div>
            </div>
            <div>
              <div className="statlabel">Fitness</div>
              <div className="num" style={{ fontSize: 18 }}>
                {Math.round(player.fitness)}%
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Bar value={player.fitness} />
      </div>
      <div className="divider" />
      <PotentialGauge current={player.rating} potential={player.potential} />
    </div>
  );
}

export function DecisionOverlay({ evt, onChoose }: { evt: DecisionEventInstance; onChoose: (idx: number) => void }) {
  return (
    <div className="overlay">
      <div className="sheet fade-in">
        <div className="badge">
          <Zap size={13} /> Decision
        </div>
        <h3 style={{ fontSize: 22, marginTop: 10 }}>{evt.title}</h3>
        <p className="muted" style={{ marginTop: 8 }}>
          {evt.text}
        </p>
        <div className="col gap12" style={{ marginTop: 18 }}>
          {evt.choices.map((c, i) => (
            <button key={i} className="btn btn-block" style={{ flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "14px 18px" }} onClick={() => onChoose(i)}>
              <span style={{ fontSize: 15 }}>{c.label}</span>
              <span className="muted" style={{ fontSize: 12.5, fontWeight: 500 }}>
                {c.hint}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RecapCard({ records, retired, onContinue }: { records: CareerRecord[]; retired: boolean; onContinue: () => void }) {
  const real = records.filter((r): r is Extract<CareerRecord, { decisionOnly?: never }> => !("decisionOnly" in r));
  return (
    <div className="card fade-in">
      <div className="badge">
        <TrendingUp size={13} /> {real.length > 1 ? "Seasons recap" : "Season recap"}
      </div>
      <div className="col gap12" style={{ marginTop: 14 }}>
        {records.map((r, i) =>
          "decisionOnly" in r ? (
            <p key={i} style={{ fontSize: 14 }}>
              {r.note}
            </p>
          ) : (
            <div key={i}>
              <div className="row between">
                <span style={{ fontWeight: 700 }}>
                  {r.year} · Age {r.age} · {r.club}
                </span>
                <span className="row gap8" style={{ fontSize: 13 }}>
                  {r.rating > r.prevRating ? <TrendingUp size={14} color="var(--accent)" /> : r.rating < r.prevRating ? <TrendingDown size={14} color="var(--danger)" /> : null}
                  <span className="num" style={{ fontSize: 17 }}>
                    {r.rating}
                  </span>
                </span>
              </div>
              <div className="row gap16" style={{ marginTop: 4, fontSize: 13 }}>
                <span className="muted">{r.apps} apps</span>
                <span className="muted">{r.goals} goals</span>
                <span className="muted">{r.assists} assists</span>
                {r.cleanSheets > 0 && <span className="muted">{r.cleanSheets} clean sheets</span>}
              </div>
              {r.trophies.map((t, ti) => (
                <div key={ti} className="row gap8" style={{ marginTop: 6, fontSize: 13.5 }}>
                  <Trophy size={14} color="var(--gold)" /> {t.name}
                </div>
              ))}
              {r.awardsWon.map((a, ai) => (
                <div key={ai} className="row gap8" style={{ marginTop: 6, fontSize: 13.5 }}>
                  <Star size={14} color="var(--accent)" /> {a.name}
                </div>
              ))}
              {r.lines.map((l, li) => (
                <p key={li} className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                  {l}
                </p>
              ))}
              {r.milestoneText && (
                <div className="milestone" style={{ marginTop: 8 }}>
                  <Globe2 size={14} style={{ marginRight: 6 }} /> {r.milestoneText}
                </div>
              )}
            </div>
          ),
        )}
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={onContinue}>
        {retired ? "See the final career card" : "Continue"} <ChevronRight size={18} />
      </button>
    </div>
  );
}

export function Timeline({ seasons }: { seasons: PlayerState["seasons"] }) {
  if (!seasons.length) return null;
  const recent = seasons.slice(-6).reverse();
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="statlabel" style={{ marginBottom: 8 }}>
        Recent seasons
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="stat-table">
          <thead>
            <tr>
              <th>Yr</th>
              <th>Age</th>
              <th>Club</th>
              <th className="num">Ovr</th>
              <th className="num">Apps</th>
              <th className="num">G</th>
              <th className="num">A</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((s, i) => (
              <tr key={i}>
                <td>{s.year}</td>
                <td>{s.age}</td>
                <td>{s.club}</td>
                <td className="num">{s.rating}</td>
                <td className="num">{s.apps}</td>
                <td className="num">{s.goals}</td>
                <td className="num">{s.assists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface LeaderboardView {
  rank: number | null;
  total: number;
  board: (LeaderboardRow & { isYou?: boolean })[];
  nationalRank: number | null;
  nationalTotal: number;
}

export function RetiredScreen({
  player,
  verdict,
  score,
  leaderboard,
  onRestart,
}: {
  player: PlayerState;
  verdict: string;
  score: number;
  leaderboard: LeaderboardView;
  onRestart: () => void;
}) {
  const posLabel = POSITIONS.find((p) => p.id === player.position)?.label ?? "";

  const copySummary = () => {
    const txt = `${player.name} — ${verdict}\n${player.nationality.flag} ${player.nationality.name} · ${posLabel}\nPeak rating ${player.peakRating} · ${player.apps} apps · ${player.goals}G ${player.assists}A · ${player.trophies.length} trophies · ${player.caps} caps\nCareer score: ${score}${leaderboard.rank ? ` · #${leaderboard.rank} all-time` : ""}\nBuilt in Legacy XI.`;
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
  };

  return (
    <div className="wrap fade-in">
      <div className="row between" style={{ marginBottom: 4 }}>
        <Logo size={26} />
        <div className="eyebrow">Career complete</div>
      </div>
      <div className="card" style={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24, paddingBottom: 24, gap: 14 }}>
        <div className="badge">
          <Medal size={13} /> {verdict}
        </div>
        <PlayerCard rating={player.peakRating} position={player.position} name={player.name} flag={player.nationality.flag} clubName={player.club.name} stats={cardStats({ ...player, rating: player.peakRating })} />
        <div className="statlabel">Peak rating · {player.peakYear}</div>
        {player.peakWorldRank && (
          <div className="badge">
            <Globe2 size={13} /> Peaked #{player.peakWorldRank} in the world
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="statlabel" style={{ marginBottom: 2 }}>
          Scouted ceiling
        </div>
        <PotentialGauge current={player.peakRating} potential={player.potential} currentLabel="Peak" />
      </div>

      <div className="grid3" style={{ marginTop: 14 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="num statbig">{player.apps}</div>
          <div className="statlabel">Appearances</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="num statbig">{player.goals}</div>
          <div className="statlabel">Goals</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="num statbig">{player.assists}</div>
          <div className="statlabel">Assists</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="num statbig">{player.trophies.length}</div>
          <div className="statlabel">Trophies</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="num statbig">{player.caps}</div>
          <div className="statlabel">Caps</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="num statbig">{player.seasons.length}</div>
          <div className="statlabel">Seasons</div>
        </div>
      </div>

      {player.seasons.length > 1 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="statlabel" style={{ marginBottom: 6 }}>
            Rating over time
          </div>
          <RatingChart seasons={player.seasons} />
        </div>
      )}

      {player.trophies.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="statlabel" style={{ marginBottom: 8 }}>
            Honours cabinet
          </div>
          <div className="col gap8">
            {groupByName(player.trophies).map((g, i) => (
              <div key={i} className="row between" style={{ fontSize: 14 }}>
                <span className="row gap8">
                  <Trophy size={15} color="var(--gold)" /> {g.name}
                </span>
                <span className="muted">{g.count > 1 ? `×${g.count}` : g.years[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {player.awards.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="statlabel" style={{ marginBottom: 8 }}>
            Individual awards
          </div>
          <div className="col gap8">
            {groupByName(player.awards).map((g, i) => (
              <div key={i} className="row between" style={{ fontSize: 14 }}>
                <span className="row gap8">
                  <Star size={15} color="var(--accent)" /> {g.name}
                </span>
                <span className="muted">{g.count > 1 ? `×${g.count}` : g.years[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row between">
          <div className="statlabel">Career score</div>
          <div className="num" style={{ fontSize: 20 }}>
            {score}
          </div>
        </div>
        <div className="divider" />
        <div className="badge">
          <Globe2 size={13} /> All-time ranking
        </div>
        {leaderboard.rank ? (
          <p style={{ marginTop: 10, fontSize: 15 }}>
            You retire as the{" "}
            <strong className="num" style={{ fontSize: 18 }}>
              #{leaderboard.rank}
            </strong>{" "}
            greatest career ever recorded in Legacy XI, out of {leaderboard.total} legends.
          </p>
        ) : (
          <p className="muted" style={{ marginTop: 10, fontSize: 14 }}>
            Couldn't reach the shared leaderboard this time — here's how you compare to the all-time greats anyway.
          </p>
        )}
        <div className="col gap8" style={{ marginTop: 12 }}>
          {leaderboard.board.slice(0, 5).map((b, i) => (
            <div key={i} className="row between" style={{ fontSize: 13.5, opacity: b.isYou ? 1 : 0.75 }}>
              <span>
                {i + 1}. {b.flag} {b.name} {b.isYou ? "(you)" : ""}
              </span>
              <span className="num">{b.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <NationLegacy
          flag={player.nationality.flag}
          countryName={player.nationality.name}
          rows={[
            ...(leaderboard.nationalRank
              ? [{ label: `Best-ever ${player.nationality.name} career recorded`, rank: leaderboard.nationalRank, total: leaderboard.nationalTotal }]
              : []),
            ...(player.peakWorldRank
              ? [{ label: `Best ${posLabel.toLowerCase()} from ${player.nationality.name} at your peak`, rank: computeNationalRank(player.peakWorldRank, player.nationality.tier) }]
              : []),
          ]}
        />
      </div>

      <div className="row gap12" style={{ marginTop: 18 }}>
        <button className="btn btn-block" onClick={copySummary}>
          <Award size={16} /> Copy recap
        </button>
        <button className="btn btn-primary btn-block" onClick={onRestart}>
          <RotateCcw size={16} /> New career
        </button>
      </div>
    </div>
  );
}

export function SubmittingOverlay() {
  return (
    <div className="overlay">
      <div className="sheet" style={{ textAlign: "center" }}>
        <Users size={20} />
        <p style={{ marginTop: 10 }}>Filing your career into the all-time record book…</p>
      </div>
    </div>
  );
}
