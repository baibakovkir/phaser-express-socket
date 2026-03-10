import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /heroes - List all heroes
router.get("/", async (_req, res) => {
  try {
    const heroes = await prisma.hero.findMany({
      orderBy: { name: "asc" },
      include: {
        abilities: {
          orderBy: { key: "asc" },
        },
      },
    });
    
    // Transform to client-friendly format
    const heroList = heroes.map((hero) => ({
      id: hero.id,
      name: hero.name,
      role: hero.role.toLowerCase(),
      hp: hero.baseHp,
      mana: hero.baseMana,
      attack: hero.baseAttack,
      armor: hero.baseArmor,
      speed: hero.baseSpeed,
      // Client-side defaults
      color: getHeroColor(hero.role),
      attackRange: hero.role === "MAGE" || hero.role === "MARKSMAN" ? 180 : 150,
      attackSpeed: 1000,
      maxHp: hero.baseHp,
      maxMana: hero.baseMana,
      abilities: hero.abilities.map((a) => ({
        key: a.key,
        name: a.name,
        description: a.description,
        cooldown: a.cooldown,
        manaCost: a.manaCost,
        damage: a.damage,
        range: a.range,
      })),
    }));
    
    res.json({ heroes: heroList });
  } catch (error) {
    console.error("[heroes] error:", error);
    res.status(500).json({ error: "Failed to fetch heroes" });
  }
});

// GET /heroes/:id - Get single hero
router.get("/:id", async (req, res) => {
  try {
    const hero = await prisma.hero.findUnique({
      where: { id: req.params.id },
    });
    
    if (!hero) {
      return res.status(404).json({ error: "Hero not found" });
    }
    
    res.json({
      hero: {
        id: hero.id,
        name: hero.name,
        role: hero.role.toLowerCase(),
        hp: hero.baseHp,
        mana: hero.baseMana,
        attack: hero.baseAttack,
        armor: hero.baseArmor,
        speed: hero.baseSpeed,
        color: getHeroColor(hero.role),
        attackRange: hero.role === "MAGE" || hero.role === "MARKSMAN" ? 180 : 150,
        attackSpeed: 1000,
        maxHp: hero.baseHp,
        maxMana: hero.baseMana,
      },
    });
  } catch (error) {
    console.error("[heroes] error:", error);
    res.status(500).json({ error: "Failed to fetch hero" });
  }
});

function getHeroColor(role: string): number {
  const colors: Record<string, number> = {
    TANK: 0x4488ff,
    ASSASSIN: 0x00ff88,
    MAGE: 0xaa44ff,
    SUPPORT: 0x00ffaa,
    MARKSMAN: 0xff8800,
    FIGHTER: 0xff4444,
  };
  return colors[role] || 0xffffff;
}

export { router as heroesRoutes };
