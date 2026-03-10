import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding abilities...");

  const abilities = [
    // Assassin abilities
    { heroId: "assassin", key: "1", name: "Shadow Strike", description: "Dash forward and strike enemies", cooldown: 8000, manaCost: 40, damage: 80, range: 250 },
    { heroId: "assassin", key: "2", name: "Smoke Bomb", description: "Become invisible briefly", cooldown: 15000, manaCost: 60, damage: 0, range: 100 },
    { heroId: "assassin", key: "3", name: "Blade Fury", description: "Rapid strikes in area", cooldown: 12000, manaCost: 50, damage: 60, range: 150 },
    { heroId: "assassin", key: "4", name: "Death Mark", description: "Mark target for execution", cooldown: 90000, manaCost: 100, damage: 200, range: 300 },

    // Warrior abilities
    { heroId: "warrior", key: "1", name: "Shield Bash", description: "Stun enemy with shield", cooldown: 10000, manaCost: 35, damage: 50, range: 120 },
    { heroId: "warrior", key: "2", name: "War Cry", description: "Boost armor temporarily", cooldown: 18000, manaCost: 45, damage: 0, range: 200 },
    { heroId: "warrior", key: "3", name: "Cleave", description: "Strike all nearby enemies", cooldown: 9000, manaCost: 40, damage: 70, range: 180 },
    { heroId: "warrior", key: "4", name: "Last Stand", description: "Gain massive HP boost", cooldown: 120000, manaCost: 80, damage: 0, range: 0 },

    // Mage abilities
    { heroId: "mage", key: "1", name: "Arcane Bolt", description: "Fire a magic projectile", cooldown: 5000, manaCost: 30, damage: 90, range: 400 },
    { heroId: "mage", key: "2", name: "Fire Nova", description: "Explosion around you", cooldown: 11000, manaCost: 55, damage: 100, range: 200 },
    { heroId: "mage", key: "3", name: "Blink", description: "Teleport short distance", cooldown: 14000, manaCost: 50, damage: 0, range: 350 },
    { heroId: "mage", key: "4", name: "Meteor", description: "Call down devastating meteor", cooldown: 100000, manaCost: 120, damage: 300, range: 500 },

    // Support abilities
    { heroId: "support", key: "1", name: "Heal", description: "Restore HP to target", cooldown: 8000, manaCost: 45, damage: -50, range: 300 },
    { heroId: "support", key: "2", name: "Shield", description: "Grant protective barrier", cooldown: 12000, manaCost: 50, damage: 0, range: 250 },
    { heroId: "support", key: "3", name: "Purify", description: "Remove debuffs", cooldown: 15000, manaCost: 40, damage: 0, range: 300 },
    { heroId: "support", key: "4", name: "Divine Blessing", description: "Heal all allies", cooldown: 90000, manaCost: 100, damage: -100, range: 500 },

    // Marksman abilities
    { heroId: "marksman", key: "1", name: "Piercing Shot", description: "Arrow pierces through enemies", cooldown: 7000, manaCost: 35, damage: 85, range: 450 },
    { heroId: "marksman", key: "2", name: "Explosive Arrow", description: "Arrow explodes on impact", cooldown: 10000, manaCost: 45, damage: 95, range: 400 },
    { heroId: "marksman", key: "3", name: "Roll", description: "Roll backward quickly", cooldown: 8000, manaCost: 30, damage: 0, range: 200 },
    { heroId: "marksman", key: "4", name: "Rain of Arrows", description: "Arrow storm over area", cooldown: 80000, manaCost: 90, damage: 180, range: 500 },

    // Fighter abilities
    { heroId: "fighter", key: "1", name: "Uppercut", description: "Launch enemy into air", cooldown: 9000, manaCost: 40, damage: 75, range: 100 },
    { heroId: "fighter", key: "2", name: "Bloodlust", description: "Gain attack speed", cooldown: 16000, manaCost: 50, damage: 0, range: 0 },
    { heroId: "fighter", key: "3", name: "Whirlwind", description: "Spin dealing damage", cooldown: 11000, manaCost: 45, damage: 65, range: 150 },
    { heroId: "fighter", key: "4", name: "Unstoppable", description: "Become immune to CC", cooldown: 100000, manaCost: 85, damage: 0, range: 0 },
  ];

  for (const ability of abilities) {
    await prisma.ability.create({
      data: ability,
    });
    console.log(`  - ${ability.name} (${ability.heroId})`);
  }

  console.log("Ability seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
