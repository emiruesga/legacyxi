import type { Club, Confederation, Country, CrestColors, League, PositionDef, PositionId, PositionProfile, Region } from "./types.js";
import type { RNG } from "./rng.js";

export const COUNTRIES: Country[] = [
  { name: "Brazil", flag: "🇧🇷", tier: 1, region: "latam", leagueId: "BRA1" },
  { name: "Argentina", flag: "🇦🇷", tier: 1, region: "latam", leagueId: "ARG1" },
  { name: "France", flag: "🇫🇷", tier: 1, region: "europe", leagueId: "FRA1" },
  { name: "Spain", flag: "🇪🇸", tier: 1, region: "europe", leagueId: "ESP1" },
  { name: "Germany", flag: "🇩🇪", tier: 1, region: "europe", leagueId: "GER1" },
  { name: "England", flag: "🏴", tier: 1, region: "europe", leagueId: "ENG1" },
  { name: "Portugal", flag: "🇵🇹", tier: 1, region: "europe", leagueId: "POR1" },
  { name: "Italy", flag: "🇮🇹", tier: 1, region: "europe", leagueId: "ITA1" },
  { name: "Netherlands", flag: "🇳🇱", tier: 1, region: "europe", leagueId: "NED1" },
  { name: "Belgium", flag: "🇧🇪", tier: 1, region: "europe", leagueId: "BEL1" },
  { name: "Croatia", flag: "🇭🇷", tier: 2, region: "europe", leagueId: "CRO1" },
  { name: "Uruguay", flag: "🇺🇾", tier: 2, region: "latam", leagueId: "URU1" },
  { name: "Colombia", flag: "🇨🇴", tier: 2, region: "latam", leagueId: "COL1" },
  { name: "Morocco", flag: "🇲🇦", tier: 2, region: "africa", leagueId: "MAR1" },
  { name: "Japan", flag: "🇯🇵", tier: 2, region: "asia", leagueId: "JPN1" },
  { name: "United States", flag: "🇺🇸", tier: 2, region: "northam", leagueId: "USA1" },
  { name: "Mexico", flag: "🇲🇽", tier: 2, region: "latam", leagueId: "MEX1" },
  { name: "Senegal", flag: "🇸🇳", tier: 2, region: "africa", leagueId: "SEN1" },
  { name: "Denmark", flag: "🇩🇰", tier: 2, region: "europe", leagueId: "DEN1" },
  { name: "Switzerland", flag: "🇨🇭", tier: 2, region: "europe", leagueId: "SUI1" },
  { name: "South Korea", flag: "🇰🇷", tier: 3, region: "asia", leagueId: "KOR1" },
  { name: "Nigeria", flag: "🇳🇬", tier: 3, region: "africa", leagueId: "NGA1" },
  { name: "Australia", flag: "🇦🇺", tier: 3, region: "asia", leagueId: "AUS1" },
  { name: "Poland", flag: "🇵🇱", tier: 3, region: "europe", leagueId: "POL1" },
  { name: "Ecuador", flag: "🇪🇨", tier: 3, region: "latam", leagueId: "ECU1" },
  { name: "Ghana", flag: "🇬🇭", tier: 3, region: "africa", leagueId: "GHA1" },
  { name: "Sweden", flag: "🇸🇪", tier: 3, region: "europe", leagueId: "SWE1" },
  { name: "Serbia", flag: "🇷🇸", tier: 3, region: "europe", leagueId: "SRB1" },
  { name: "Canada", flag: "🇨🇦", tier: 4, region: "northam", leagueId: "CAN1" },
  { name: "Iceland", flag: "🇮🇸", tier: 4, region: "europe", leagueId: "ISL1" },
  { name: "Qatar", flag: "🇶🇦", tier: 4, region: "asia", leagueId: "QAT1" },
  { name: "Jamaica", flag: "🇯🇲", tier: 4, region: "latam", leagueId: "JAM1" },
];

export const POSITIONS: PositionDef[] = [
  { id: "GK", label: "Goalkeeper", row: "GK" },
  { id: "CB", label: "Centre-Back", row: "DEF" },
  { id: "FB", label: "Full-Back", row: "DEF" },
  { id: "DM", label: "Defensive Mid", row: "MID" },
  { id: "CM", label: "Central Mid", row: "MID" },
  { id: "AM", label: "Attacking Mid", row: "MID" },
  { id: "W", label: "Winger", row: "ATT" },
  { id: "ST", label: "Striker", row: "ATT" },
];

export const POS_PROFILE: Record<PositionId, PositionProfile> = {
  GK: { goal: 0.0, assist: 0.01, clean: 1.0, goalWeight: 0, assistWeight: 0 },
  CB: { goal: 0.03, assist: 0.05, clean: 0.8, goalWeight: 55, assistWeight: 30 },
  FB: { goal: 0.05, assist: 0.14, clean: 0.5, goalWeight: 45, assistWeight: 22 },
  DM: { goal: 0.08, assist: 0.12, clean: 0.4, goalWeight: 32, assistWeight: 20 },
  CM: { goal: 0.14, assist: 0.2, clean: 0.15, goalWeight: 22, assistWeight: 16 },
  AM: { goal: 0.28, assist: 0.28, clean: 0, goalWeight: 14, assistWeight: 12 },
  W: { goal: 0.32, assist: 0.24, clean: 0, goalWeight: 12, assistWeight: 13 },
  ST: { goal: 0.48, assist: 0.14, clean: 0, goalWeight: 9, assistWeight: 16 },
};

/** Estimated size of the global talent pool at each position — used for world-rank math. */
export const WORLD_POOL_SIZE: Record<PositionId, number> = {
  GK: 600, CB: 1300, FB: 1200, DM: 1000, CM: 1500, AM: 1200, W: 1400, ST: 1600,
};

export const CLUB_LEVEL: Record<number, number> = { 1: 90, 2: 80, 3: 70, 4: 60, 5: 50 };
export const TIER_LABEL: Record<number, string> = { 1: "Elite Giant", 2: "Continental Power", 3: "Established Club", 4: "Rising Club", 5: "Lower Division" };
export const TIER_MULT: Record<number, number> = { 1: 1.3, 2: 1.1, 3: 0.9, 4: 0.7, 5: 0.5 };
export const LEVEL_BASE = { league: 60, cup: 35, continental: 100, international: 210 };
export const MILESTONE_TIERS = [1, 5, 10, 25, 50, 100, 250, 500];

/** Real name, so it's the flavor of the real thing — no crest, no branding,
 * just the competition's actual name. See LEAGUES for domestic cup/continental names. */
export const WORLD_CUP_NAME = "World Cup";

const CONTINENTAL_NAME: Record<Confederation, string> = {
  UEFA: "Champions League",
  CONMEBOL: "Copa Libertadores",
  CONCACAF: "CONCACAF Champions Cup",
  CAF: "CAF Champions League",
  AFC: "AFC Champions League Elite",
};

/** A nation's confederation follows its region — this drives which
 * international tournament (besides the World Cup) its national team plays in. */
export const REGION_CONFEDERATION: Record<Region, Confederation> = {
  europe: "UEFA",
  latam: "CONMEBOL",
  africa: "CAF",
  asia: "AFC",
  northam: "CONCACAF",
};

/** Real international tournament names, one per confederation. */
export const CONTINENTAL_INTL_CUP: Record<Confederation, string> = {
  UEFA: "European Championship",
  CONMEBOL: "Copa América",
  CAF: "Africa Cup of Nations",
  AFC: "AFC Asian Cup",
  CONCACAF: "Gold Cup",
};

/** Every trophy name a national team (as opposed to a club) can lift —
 * the World Cup plus each confederation's championship. Used to give a
 * win with your country a distinct, bigger celebration than a club trophy. */
export const INTERNATIONAL_TROPHY_NAMES: ReadonlySet<string> = new Set([WORLD_CUP_NAME, ...Object.values(CONTINENTAL_INTL_CUP)]);

export function isInternationalTrophy(name: string): boolean {
  return INTERNATIONAL_TROPHY_NAMES.has(name);
}

function league(id: string, name: string, country: string, tier: 1 | 2 | 3 | 4 | 5, confederation: Confederation, cupName: string): League {
  return { id, name, country, tier, confederation, cupName, continentalName: CONTINENTAL_NAME[confederation] };
}

export const LEAGUES: League[] = [
  league("ENG1", "Premier League", "England", 1, "UEFA", "FA Cup"),
  league("ESP1", "La Liga", "Spain", 1, "UEFA", "Copa del Rey"),
  league("GER1", "Bundesliga", "Germany", 1, "UEFA", "DFB-Pokal"),
  league("ITA1", "Serie A", "Italy", 1, "UEFA", "Coppa Italia"),
  league("FRA1", "Ligue 1", "France", 1, "UEFA", "Coupe de France"),
  league("NED1", "Eredivisie", "Netherlands", 2, "UEFA", "KNVB Cup"),
  league("POR1", "Primeira Liga", "Portugal", 2, "UEFA", "Taça de Portugal"),
  league("BEL1", "Belgian Pro League", "Belgium", 2, "UEFA", "Belgian Cup"),
  league("BRA1", "Brasileirão Série A", "Brazil", 2, "CONMEBOL", "Copa do Brasil"),
  league("ARG1", "Liga Profesional", "Argentina", 2, "CONMEBOL", "Copa Argentina"),
  league("USA1", "MLS", "United States", 3, "CONCACAF", "U.S. Open Cup"),
  league("MEX1", "Liga MX", "Mexico", 3, "CONCACAF", "Copa MX"),
  league("JPN1", "J1 League", "Japan", 3, "AFC", "Emperor's Cup"),
  league("CRO1", "HNL", "Croatia", 3, "UEFA", "Croatian Cup"),
  league("URU1", "Primera División", "Uruguay", 3, "CONMEBOL", "Copa Uruguay"),
  league("COL1", "Categoría Primera A", "Colombia", 3, "CONMEBOL", "Copa Colombia"),
  league("MAR1", "Botola Pro", "Morocco", 3, "CAF", "Throne Cup"),
  league("DEN1", "Danish Superliga", "Denmark", 3, "UEFA", "Danish Cup"),
  league("SUI1", "Swiss Super League", "Switzerland", 3, "UEFA", "Swiss Cup"),
  league("KOR1", "K League 1", "South Korea", 4, "AFC", "Korean FA Cup"),
  league("AUS1", "A-League", "Australia", 4, "AFC", "Australia Cup"),
  league("POL1", "Ekstraklasa", "Poland", 4, "UEFA", "Polish Cup"),
  league("ECU1", "LigaPro", "Ecuador", 4, "CONMEBOL", "Copa Ecuador"),
  league("SWE1", "Allsvenskan", "Sweden", 4, "UEFA", "Svenska Cupen"),
  league("SRB1", "Super liga Srbije", "Serbia", 4, "UEFA", "Serbian Cup"),
  league("SEN1", "Senegal Premier League", "Senegal", 4, "CAF", "Senegal Cup"),
  league("NGA1", "Nigeria Premier Football League", "Nigeria", 5, "CAF", "Federation Cup"),
  league("GHA1", "Ghana Premier League", "Ghana", 5, "CAF", "Ghana FA Cup"),
  league("CAN1", "Canadian Premier League", "Canada", 5, "CONCACAF", "Canadian Championship"),
  league("ISL1", "Besta deild karla", "Iceland", 5, "UEFA", "Icelandic Cup"),
  league("QAT1", "Qatar Stars League", "Qatar", 4, "AFC", "Emir Cup"),
  league("JAM1", "Jamaica Premier League", "Jamaica", 5, "CONCACAF", "Jamaica FA Cup"),
];

const LEAGUE_BY_ID: Record<string, League> = Object.fromEntries(LEAGUES.map((l) => [l.id, l]));

export function leagueById(id: string): League {
  const l = LEAGUE_BY_ID[id];
  if (!l) throw new Error(`Unknown league id: ${id}`);
  return l;
}

function clubs(leagueId: string, entries: [name: string, tier: 1 | 2 | 3 | 4 | 5, ambition: number][]): Club[] {
  return entries.map(([name, tier, ambition]) => ({ name, leagueId, tier, ambition }));
}

/** Real club names, real leagues. No crests are sourced — see crestFor(). */
export const CLUBS: Club[] = [
  ...clubs("ENG1", [
    ["Manchester City", 1, 95], ["Arsenal", 1, 90], ["Liverpool", 1, 92], ["Manchester United", 1, 88],
    ["Chelsea", 1, 86], ["Tottenham Hotspur", 2, 80], ["Newcastle United", 2, 78], ["Aston Villa", 2, 76],
    ["Brighton & Hove Albion", 3, 68], ["West Ham United", 3, 66], ["Everton", 3, 62], ["Fulham", 4, 58],
  ]),
  ...clubs("ESP1", [
    ["Real Madrid", 1, 96], ["Barcelona", 1, 93], ["Atlético Madrid", 1, 85], ["Real Sociedad", 2, 74],
    ["Athletic Bilbao", 2, 72], ["Villarreal", 3, 68], ["Real Betis", 3, 66], ["Sevilla", 3, 64],
    ["Valencia", 3, 60], ["Girona", 4, 58],
  ]),
  ...clubs("GER1", [
    ["Bayern Munich", 1, 95], ["Borussia Dortmund", 1, 84], ["RB Leipzig", 2, 80], ["Bayer Leverkusen", 2, 82],
    ["Eintracht Frankfurt", 3, 68], ["VfB Stuttgart", 3, 66], ["Borussia Mönchengladbach", 3, 62], ["Union Berlin", 4, 58],
  ]),
  ...clubs("ITA1", [
    ["Inter Milan", 1, 88], ["AC Milan", 1, 86], ["Juventus", 1, 87], ["Napoli", 2, 82], ["Roma", 2, 76],
    ["Atalanta", 2, 74], ["Lazio", 3, 68], ["Fiorentina", 3, 64],
  ]),
  ...clubs("FRA1", [
    ["Paris Saint-Germain", 1, 92], ["Monaco", 2, 78], ["Marseille", 2, 74], ["Lyon", 3, 68],
    ["Lille", 3, 64], ["Lens", 3, 62], ["Nice", 4, 58],
  ]),
  ...clubs("NED1", [
    ["Ajax", 2, 76], ["PSV Eindhoven", 2, 78], ["Feyenoord", 2, 74], ["AZ Alkmaar", 3, 62],
  ]),
  ...clubs("POR1", [
    ["Benfica", 2, 78], ["Porto", 2, 76], ["Sporting CP", 2, 74], ["Braga", 3, 62],
  ]),
  ...clubs("BEL1", [
    ["Club Brugge", 3, 68], ["Anderlecht", 3, 64], ["Union Saint-Gilloise", 3, 62], ["Genk", 4, 58],
  ]),
  ...clubs("BRA1", [
    ["Flamengo", 1, 84], ["Palmeiras", 1, 82], ["São Paulo", 2, 74], ["Corinthians", 2, 76],
    ["Fluminense", 2, 70], ["Grêmio", 3, 66], ["Internacional", 3, 66], ["Santos", 3, 62],
  ]),
  ...clubs("ARG1", [
    ["Boca Juniors", 1, 84], ["River Plate", 1, 84], ["Racing Club", 2, 68], ["Independiente", 2, 64],
    ["San Lorenzo", 3, 60],
  ]),
  ...clubs("USA1", [
    ["Inter Miami", 2, 74], ["LAFC", 2, 70], ["LA Galaxy", 3, 66], ["Seattle Sounders", 3, 64],
    ["New York City FC", 3, 62], ["Atlanta United", 3, 62],
  ]),
  ...clubs("MEX1", [
    ["Club América", 2, 72], ["Chivas Guadalajara", 2, 66], ["Cruz Azul", 3, 62], ["Monterrey", 2, 68],
  ]),
  ...clubs("JPN1", [
    ["Yokohama F. Marinos", 3, 64], ["Vissel Kobe", 3, 64], ["Kawasaki Frontale", 3, 66], ["Urawa Red Diamonds", 3, 62],
  ]),
  ...clubs("CRO1", [
    ["Dinamo Zagreb", 3, 66], ["Hajduk Split", 4, 58], ["Rijeka", 4, 54],
  ]),
  ...clubs("URU1", [
    ["Peñarol", 3, 62], ["Nacional", 3, 62], ["Defensor Sporting", 4, 52],
  ]),
  ...clubs("COL1", [
    ["Atlético Nacional", 3, 62], ["Millonarios", 3, 58], ["América de Cali", 4, 54],
  ]),
  ...clubs("MAR1", [
    ["Raja Casablanca", 3, 58], ["Wydad Casablanca", 3, 58], ["FAR Rabat", 4, 50],
  ]),
  ...clubs("DEN1", [
    ["FC Copenhagen", 3, 62], ["Brøndby", 4, 54], ["Midtjylland", 3, 58],
  ]),
  ...clubs("SUI1", [
    ["Young Boys", 3, 60], ["Basel", 3, 60], ["Servette", 4, 52],
  ]),
  ...clubs("KOR1", [
    ["Ulsan HD", 4, 56], ["Jeonbuk Hyundai Motors", 4, 58], ["FC Seoul", 4, 52],
  ]),
  ...clubs("AUS1", [
    ["Melbourne City", 4, 54], ["Sydney FC", 4, 54], ["Melbourne Victory", 4, 52],
  ]),
  ...clubs("POL1", [
    ["Legia Warsaw", 4, 56], ["Lech Poznań", 4, 54], ["Raków Częstochowa", 4, 52],
  ]),
  ...clubs("ECU1", [
    ["Barcelona SC", 4, 54], ["LDU Quito", 4, 54], ["Independiente del Valle", 4, 52],
  ]),
  ...clubs("SWE1", [
    ["Malmö FF", 4, 56], ["AIK", 4, 50], ["Djurgårdens IF", 4, 50],
  ]),
  ...clubs("SRB1", [
    ["Red Star Belgrade", 3, 60], ["Partizan", 4, 54],
  ]),
  ...clubs("SEN1", [
    ["Casa Sports", 5, 44], ["Génération Foot", 5, 44],
  ]),
  ...clubs("NGA1", [
    ["Enyimba", 5, 44], ["Rivers United", 5, 42],
  ]),
  ...clubs("GHA1", [
    ["Asante Kotoko", 5, 44], ["Hearts of Oak", 5, 42],
  ]),
  ...clubs("CAN1", [
    ["Forge FC", 5, 44], ["Cavalry FC", 5, 42],
  ]),
  ...clubs("ISL1", [
    ["Valur", 5, 42], ["KR Reykjavík", 5, 42],
  ]),
  ...clubs("QAT1", [
    ["Al Sadd", 4, 54], ["Al Duhail", 4, 52],
  ]),
  ...clubs("JAM1", [
    ["Waterhouse FC", 5, 40], ["Cavalier FC", 5, 40],
  ]),
];

export function clubsInLeague(leagueId: string): Club[] {
  return CLUBS.filter((c) => c.leagueId === leagueId);
}

/** Pool of tasteful two-tone combinations for generated crests — never a
 * real club's actual colors, just a consistent, good-looking pair. */
const CREST_PALETTE: [string, string][] = [
  ["#8c1c27", "#f2c14e"], ["#173f6b", "#e7e7e7"], ["#0e4d3c", "#d9b44a"], ["#5b1a35", "#e0a458"],
  ["#1b1b1b", "#c9a24b"], ["#0b3d91", "#f4f4f4"], ["#7a1f2b", "#1b1b1b"], ["#1e5631", "#f0e6d2"],
  ["#3b2f78", "#e8b74a"], ["#0f5c5c", "#f2e9d8"], ["#8a2b2b", "#2c2c54"], ["#264d59", "#e4b363"],
];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function initialsFor(name: string): string {
  const words = name.split(/[\s.]+/).filter(Boolean);
  const stop = new Set(["de", "del", "the", "of", "fc", "cf", "sc", "cd"]);
  const significant = words.filter((w) => !stop.has(w.toLowerCase()));
  const source = significant.length ? significant : words;
  if (source.length === 1) return source[0].slice(0, 3).toUpperCase();
  return source.slice(0, 3).map((w) => w[0]).join("").toUpperCase();
}

/** A stylized crest for a real club name — deterministic per name, drawn
 * from a curated color palette. Never reproduces the club's actual logo. */
export function crestFor(clubName: string): CrestColors {
  const idx = hashString(clubName) % CREST_PALETTE.length;
  const [primary, secondary] = CREST_PALETTE[idx];
  return { primary, secondary, initials: initialsFor(clubName) };
}

export function pickClubsByTier(targetTier: number, rng: RNG, count: number, exclude?: string): Club[] {
  const lo = Math.max(1, targetTier - 1);
  const hi = Math.min(5, targetTier + 1);
  const pool = CLUBS.filter((c) => c.tier >= lo && c.tier <= hi && c.name !== exclude);
  const chosen: Club[] = [];
  const used = new Set<string>();
  let guard = 0;
  while (chosen.length < count && guard < 200) {
    guard += 1;
    const candidate = rng.choice(pool.length ? pool : CLUBS);
    if (!used.has(candidate.name)) {
      used.add(candidate.name);
      chosen.push(candidate);
    }
  }
  return chosen;
}

export function homeClubsFor(country: Country, rng: RNG, count: number): Club[] {
  const inHomeLeague = country.leagueId ? clubsInLeague(country.leagueId) : [];
  const pool = inHomeLeague.length ? inHomeLeague : CLUBS;
  const chosen: Club[] = [];
  const used = new Set<string>();
  let guard = 0;
  while (chosen.length < count && guard < 200) {
    guard += 1;
    const candidate = rng.choice(pool);
    if (!used.has(candidate.name)) {
      used.add(candidate.name);
      chosen.push(candidate);
    }
  }
  return chosen;
}
