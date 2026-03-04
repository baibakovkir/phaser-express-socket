import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding heroes...");

  const heroes = [
    {
      id: "warrior",
      name: "Warrior",
      role: "TANK",
      baseHp: 600,
      baseMana: 40,
      baseAttack: 55,
      baseArmor: 35,
      baseSpeed: 340,
    },
    {
      id: "assassin",
      name: "Shadow Assassin",
      role: "ASSASSIN",
      baseHp: 400,
      baseMana: 60,
      baseAttack: 65,
      baseArmor: 25,
      baseSpeed: 360,
    },
    {
      id: "mage",
      name: "Arcane Mage",
      role: "MAGE",
      baseHp: 350,
      baseMana: 100,
      baseAttack: 45,
      baseArmor: 20,
      baseSpeed: 330,
    },
    {
      id: "support",
      name: "Holy Priest",
      role: "SUPPORT",
      baseHp: 380,
      baseMana: 90,
      baseAttack: 40,
      baseArmor: 22,
      baseSpeed: 335,
    },
    {
      id: "marksman",
      name: "Ranger",
      role: "MARKSMAN",
      baseHp: 420,
      baseMana: 50,
      baseAttack: 60,
      baseArmor: 23,
      baseSpeed: 350,
    },
    {
      id: "fighter",
      name: "Berserker",
      role: "ASSASSIN",
      baseHp: 500,
      baseMana: 45,
      baseAttack: 58,
      baseArmor: 30,
      baseSpeed: 345,
    },
  ];

  for (const hero of heroes) {
    await prisma.hero.upsert({
      where: { id: hero.id },
      update: {},
      create: hero,
    });
    console.log(`  - ${hero.name}`);
  }

  console.log("Hero seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
