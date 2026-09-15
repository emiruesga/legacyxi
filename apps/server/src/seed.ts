import { PrismaClient } from "@prisma/client";
import { SEED_LEGENDS } from "./seedData.js";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.careerEntry.count();
  if (count > 0) {
    console.log(`Leaderboard already has ${count} entries, skipping seed.`);
    return;
  }
  await prisma.careerEntry.createMany({ data: SEED_LEGENDS });
  console.log(`Seeded ${SEED_LEGENDS.length} legends.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
