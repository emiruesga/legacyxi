import { useState } from "react";
import {
  COUNTRIES,
  careerScore,
  continueBatch,
  createRng,
  homeClubsFor,
  newPlayer,
  randomSeed,
  resolveDecision,
  rollDraft,
  verdictFor,
  type BatchResult,
  type CareerRecord,
  type Club,
  type DecisionEventInstance,
  type DraftResult,
  type PlayerState,
  type RNG,
} from "@legacyxi/sim";
import {
  AcademyScreen,
  CreateScreen,
  DecisionOverlay,
  IntroScreen,
  PlayerHeader,
  RecapCard,
  RetiredScreen,
  SubmittingOverlay,
  Timeline,
  type CreateFormState,
  type LeaderboardView,
} from "./components.js";
import { DebutCelebration, TrophyCelebration } from "./cards.js";
import { fetchLeaderboard, submitCareer } from "./api.js";

type Moment = { kind: "trophy"; name: string; year: number } | { kind: "debut"; country: string };

/** Walk a batch's season records in order and surface every celebratory
 * moment (international debut, each trophy) in the order it happened. */
function extractMoments(records: CareerRecord[], countryName: string): Moment[] {
  const moments: Moment[] = [];
  for (const r of records) {
    if ("decisionOnly" in r) continue;
    if (r.capDebut) moments.push({ kind: "debut", country: countryName });
    for (const t of r.trophies) moments.push({ kind: "trophy", name: t.name, year: t.year });
  }
  return moments;
}

type Screen = "intro" | "create" | "academy" | "career" | "retired";
type Pace = 1 | 3;

interface Pending {
  evt: DecisionEventInstance;
  seasonsLeft: number;
  priorRecords: CareerRecord[];
}

interface Recap {
  records: CareerRecord[];
  retired: boolean;
}

const DEFAULT_FORM: CreateFormState = {
  name: "",
  nationality: COUNTRIES[0],
  foot: "Right",
  number: 10,
  position: null,
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [form, setForm] = useState<CreateFormState>(DEFAULT_FORM);
  const [academyOffers, setAcademyOffers] = useState<Club[]>([]);
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [pace, setPace] = useState<Pace>(1);
  const [leaderboard, setLeaderboard] = useState<LeaderboardView | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [rng, setRng] = useState<RNG>(() => createRng(randomSeed()));
  const [celebrations, setCelebrations] = useState<Moment[]>([]);

  function goToCreate() {
    setScreen("create");
  }

  function goToAcademy() {
    const offers = homeClubsFor(form.nationality, rng, 3);
    setAcademyOffers(offers);
    setDraft(rollDraft(rng));
    setScreen("academy");
  }

  function pickClub(club: Club) {
    const position = form.position;
    if (!position || !draft) return;
    const startYear = new Date().getFullYear();
    const p = newPlayer({ ...form, position, club }, draft, startYear);
    setPlayer(p);
    setScreen("career");
    runBatch(p, 1);
  }

  function applyBatchResult(result: BatchResult) {
    const moments = extractMoments(result.records, result.player.nationality.name);
    if (moments.length) setCelebrations((prev) => [...prev, ...moments]);
    if (result.status === "awaiting") {
      setPending({ evt: result.pendingDecision, seasonsLeft: result.seasonsLeft, priorRecords: result.records });
      setPlayer(result.player);
      setRecap(null);
    } else {
      setPlayer(result.player);
      setPending(null);
      setRecap({ records: result.records, retired: result.player.retired });
    }
  }

  function runBatch(startPlayer: PlayerState, count: number) {
    applyBatchResult(continueBatch(startPlayer, count, [], rng));
  }

  function handleChoice(idx: number) {
    if (!pending || !player) return;
    applyBatchResult(resolveDecision(pending.evt, idx, player, pending.seasonsLeft, pending.priorRecords, rng));
  }

  async function handleContinue() {
    if (!recap || !player) return;
    if (recap.retired) {
      const score = careerScore(player);
      setFinalScore(score);
      setSubmitting(true);
      const result = await submitCareer({
        name: player.name,
        flag: player.nationality.flag,
        position: player.position,
        score,
        peakRating: player.peakRating,
        trophies: player.trophies.length,
        seasons: player.seasons.length,
        caps: player.caps,
      });
      if (result) {
        const board = result.top.map((row) => ({ ...row, isYou: row.score === score && row.name === player.name }));
        setLeaderboard({ rank: result.rank, total: result.total, board, nationalRank: result.nationalRank, nationalTotal: result.nationalTotal });
      } else {
        // Server unreachable — fall back to a read-only view so the run still ends cleanly.
        const fallback = await fetchLeaderboard(5);
        setLeaderboard({
          rank: null,
          total: fallback?.total ?? 0,
          board: fallback?.top ?? [],
          nationalRank: null,
          nationalTotal: 0,
        });
      }
      setSubmitting(false);
      setScreen("retired");
      return;
    }
    runBatch(player, pace);
  }

  function restart() {
    setScreen("intro");
    setForm(DEFAULT_FORM);
    setPlayer(null);
    setPending(null);
    setRecap(null);
    setLeaderboard(null);
    setDraft(null);
    setRng(createRng(randomSeed()));
    setCelebrations([]);
  }

  return (
    <div className="lxi">
      {screen === "intro" && <IntroScreen onStart={goToCreate} />}
      {screen === "create" && <CreateScreen form={form} setForm={setForm} countries={COUNTRIES} onNext={goToAcademy} />}
      {screen === "academy" && draft && <AcademyScreen form={form} offers={academyOffers} draft={draft} onPick={pickClub} />}

      {screen === "career" && player && (
        <div className="wrap">
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="eyebrow">CAREER MODE</div>
            <div className="row gap8">
              {([
                { id: 1, label: "Normal" },
                { id: 3, label: "Express" },
              ] as const).map((m) => (
                <button
                  key={m.id}
                  className={`chip ${pace === m.id ? "active" : ""}`}
                  style={{ padding: "5px 11px", fontSize: 12.5 }}
                  onClick={() => setPace(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <PlayerHeader player={player} />
          <div style={{ marginTop: 16 }}>{recap && <RecapCard records={recap.records} retired={recap.retired} onContinue={handleContinue} />}</div>
          <Timeline seasons={player.seasons} />
          {pending && <DecisionOverlay evt={pending.evt} onChoose={handleChoice} />}
          {submitting && <SubmittingOverlay />}
        </div>
      )}

      {screen === "retired" && player && leaderboard && <RetiredScreen player={player} verdict={verdictFor(player, finalScore)} score={finalScore} leaderboard={leaderboard} onRestart={restart} />}

      {celebrations.length > 0 &&
        (celebrations[0].kind === "trophy" ? (
          <TrophyCelebration trophyName={celebrations[0].name} year={celebrations[0].year} onContinue={() => setCelebrations((prev) => prev.slice(1))} />
        ) : (
          <DebutCelebration countryName={celebrations[0].country} onContinue={() => setCelebrations((prev) => prev.slice(1))} />
        ))}
    </div>
  );
}
