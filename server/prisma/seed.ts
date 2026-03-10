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
      baseMana: 100,
      baseAttack: 55,
      baseArmor: 35,
      baseSpeed: 340,
      hpRegen: 5,
      manaRegen: 3,
    },
    {
      id: "assassin",
      name: "Shadow Assassin",
      role: "ASSASSIN",
      baseHp: 400,
      baseMana: 120,
      baseAttack: 65,
      baseArmor: 25,
      baseSpeed: 360,
      hpRegen: 3,
      manaRegen: 4,
    },
    {
      id: "mage",
      name: "Arcane Mage",
      role: "MAGE",
      baseHp: 350,
      baseMana: 150,
      baseAttack: 45,
      baseArmor: 20,
      baseSpeed: 330,
      hpRegen: 2,
      manaRegen: 6,
    },
    {
      id: "support",
      name: "Holy Priest",
      role: "SUPPORT",
      baseHp: 380,
      baseMana: 130,
      baseAttack: 40,
      baseArmor: 22,
      baseSpeed: 335,
      hpRegen: 3,
      manaRegen: 5,
    },
    {
      id: "marksman",
      name: "Ranger",
      role: "MARKSMAN",
      baseHp: 420,
      baseMana: 100,
      baseAttack: 60,
      baseArmor: 23,
      baseSpeed: 350,
      hpRegen: 3,
      manaRegen: 3.5,
    },
    {
      id: "fighter",
      name: "Berserker",
      role: "FIGHTER",
      baseHp: 500,
      baseMana: 100,
      baseAttack: 58,
      baseArmor: 30,
      baseSpeed: 345,
      hpRegen: 4,
      manaRegen: 3,
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

  console.log("Seeding abilities...");

  // Delete existing abilities to avoid duplicates
  await prisma.ability.deleteMany({});

  const abilities = [
    // Warrior abilities
    { heroId: "warrior", key: "Q", name: "Dash", description: "Dash forward", cooldown: 3000, manaCost: 10, damage: 0, range: 200 },
    { heroId: "warrior", key: "1", name: "Shield Bash", description: "Stun enemy with shield", cooldown: 5000, manaCost: 15, damage: 60, range: 120 },
    { heroId: "warrior", key: "2", name: "War Cry", description: "Boost attack power", cooldown: 8000, manaCost: 20, damage: 0, range: 0 },
    { heroId: "warrior", key: "3", name: "Heroic Leap", description: "Leap and slam enemies", cooldown: 12000, manaCost: 30, damage: 150, range: 200 },
    // Assassin abilities
    { heroId: "assassin", key: "Q", name: "Dash", description: "Dash forward", cooldown: 2500, manaCost: 15, damage: 0, range: 250 },
    { heroId: "assassin", key: "1", name: "Poison Blade", description: "Poison enemy", cooldown: 4000, manaCost: 20, damage: 70, range: 150 },
    { heroId: "assassin", key: "2", name: "Smoke Bomb", description: "Become invisible", cooldown: 10000, manaCost: 25, damage: 0, range: 0 },
    { heroId: "assassin", key: "3", name: "Death Mark", description: "Mark for death", cooldown: 15000, manaCost: 40, damage: 200, range: 200 },
    // Mage abilities
    { heroId: "mage", key: "Q", name: "Dash", description: "Dash forward", cooldown: 3000, manaCost: 20, damage: 0, range: 200 },
    { heroId: "mage", key: "1", name: "Ice Nova", description: "Freeze enemies", cooldown: 5000, manaCost: 30, damage: 80, range: 200 },
    { heroId: "mage", key: "2", name: "Arcane Shield", description: "Magic shield", cooldown: 8000, manaCost: 35, damage: 0, range: 0 },
    { heroId: "mage", key: "3", name: "Meteor", description: "Call meteor", cooldown: 18000, manaCost: 50, damage: 250, range: 300 },
    // Support abilities
    { heroId: "support", key: "Q", name: "Dash", description: "Dash forward", cooldown: 3000, manaCost: 15, damage: 0, range: 200 },
    { heroId: "support", key: "1", name: "Smite", description: "Holy damage", cooldown: 4000, manaCost: 20, damage: 90, range: 180 },
    { heroId: "support", key: "2", name: "Blessing", description: "Buff ally", cooldown: 10000, manaCost: 30, damage: 0, range: 0 },
    { heroId: "support", key: "3", name: "Resurrection", description: "Revive ally", cooldown: 30000, manaCost: 60, damage: 0, range: 0 },
    // Marksman abilities
    { heroId: "marksman", key: "Q", name: "Dash", description: "Dash forward", cooldown: 2500, manaCost: 15, damage: 0, range: 220 },
    { heroId: "marksman", key: "1", name: "Multi Shot", description: "Hit multiple", cooldown: 5000, manaCost: 25, damage: 60, range: 250 },
    { heroId: "marksman", key: "2", name: "Escape", description: "Dash backward", cooldown: 8000, manaCost: 15, damage: 0, range: 0 },
    { heroId: "marksman", key: "3", name: "Rain of Arrows", description: "Arrow barrage", cooldown: 15000, manaCost: 45, damage: 180, range: 280 },
    // Fighter abilities
    { heroId: "fighter", key: "Q", name: "Dash", description: "Dash forward", cooldown: 2800, manaCost: 12, damage: 0, range: 220 },
    { heroId: "fighter", key: "1", name: "Bloodlust", description: "Attack speed boost", cooldown: 6000, manaCost: 20, damage: 0, range: 0 },
    { heroId: "fighter", key: "2", name: "Rage", description: "Damage boost", cooldown: 10000, manaCost: 25, damage: 0, range: 0 },
    { heroId: "fighter", key: "3", name: "Execute", description: "Finish enemy", cooldown: 12000, manaCost: 35, damage: 200, range: 130 },
  ];

  for (const ability of abilities) {
    await prisma.ability.create({
      data: ability,
    });
    console.log(`  - ${ability.name} (${ability.heroId})`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
