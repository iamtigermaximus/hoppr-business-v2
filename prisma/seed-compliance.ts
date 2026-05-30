import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const rules = [
    {
      ruleName: "No all-you-can-drink",
      ruleCategory: "ALCOHOL",
      description: "Blocks 'bottomless', 'unlimited drinks'",
      detectionKeywords: [
        "bottomless",
        "unlimited drinks",
        "all-you-can-drink",
        "open bar unlimited",
      ],
      severity: "BLOCK",
    },
    {
      ruleName: "No driving references",
      ruleCategory: "SAFETY",
      description: "Blocks 'drive home', 'drink and drive'",
      detectionKeywords: [
        "drive home",
        "drink and drive",
        "designated driver discount",
      ],
      severity: "FLAG",
    },
    {
      ruleName: "No health claims",
      ruleCategory: "HEALTH",
      description: "Blocks 'healthy', 'fitness', 'detox'",
      detectionKeywords: [
        "healthy",
        "fitness",
        "detox",
        "health benefits",
        "cures",
      ],
      severity: "WARN",
    },
    {
      ruleName: "Age restriction",
      ruleCategory: "AGE",
      description: "Must include 18+ warning",
      detectionKeywords: ["all ages", "family friendly", "under 18"],
      severity: "FLAG",
    },
  ];
  for (const r of rules) {
    await prisma.complianceRule.upsert({
      where: { id: r.ruleName },
      update: r,
      create: { id: r.ruleName, ...r },
    });
  }
  console.log("Compliance rules seeded");
}
main().finally(() => prisma.$disconnect());
