import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const TOP_N = 50;

interface CareerSubmission {
  name: string;
  flag: string;
  position: string;
  score: number;
  peakRating: number;
  trophies: number;
  seasons: number;
  caps: number;
}

function isValidSubmission(body: unknown): body is CareerSubmission {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    b.name.length > 0 &&
    b.name.length <= 60 &&
    typeof b.flag === "string" &&
    typeof b.position === "string" &&
    Number.isFinite(b.score) &&
    Number.isFinite(b.peakRating) &&
    Number.isFinite(b.trophies) &&
    Number.isFinite(b.seasons) &&
    Number.isFinite(b.caps)
  );
}

/** Submit a completed career. Persists it, then returns the submitter's
 * all-time rank plus a glimpse of the top of the board. */
app.post("/api/careers", async (req, res) => {
  const body = req.body;
  if (!isValidSubmission(body)) {
    res.status(400).json({ error: "Invalid career submission." });
    return;
  }

  const created = await prisma.careerEntry.create({
    data: {
      name: body.name.slice(0, 60),
      flag: body.flag.slice(0, 8),
      position: body.position,
      score: Math.max(0, Math.round(body.score)),
      peakRating: Math.round(body.peakRating),
      trophies: Math.round(body.trophies),
      seasons: Math.round(body.seasons),
      caps: Math.round(body.caps),
    },
  });

  const [total, rankAbove, top] = await Promise.all([
    prisma.careerEntry.count(),
    prisma.careerEntry.count({ where: { score: { gt: created.score } } }),
    prisma.careerEntry.findMany({ orderBy: { score: "desc" }, take: TOP_N }),
  ]);

  res.json({ rank: rankAbove + 1, total, top, entry: created });
});

/** Read-only view of the shared all-time leaderboard. */
app.get("/api/leaderboard", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || TOP_N, 100);
  const [total, top] = await Promise.all([
    prisma.careerEntry.count(),
    prisma.careerEntry.findMany({ orderBy: { score: "desc" }, take: limit }),
  ]);
  res.json({ total, top });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => {
  console.log(`Legacy XI API listening on :${port}`);
});
