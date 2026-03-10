# AI Bots Implementation Ideas

## Current State

Currently, bots:
- Spawn at fixed positions
- Move towards lane targets
- Attack nearest enemy when in range
- Have basic HP tracking

## Problems to Fix

1. **Bots spawn in center** - Need lane-specific spawn positions
2. **No last-hitting** - Bots don't prioritize killing minions
3. **No positioning** - Bots don't maintain safe distances
4. **No team coordination** - Bots act independently
5. **No objective focus** - Bots don't push towers

---

## Implementation Plan

### Phase 1: Fix Basic Movement (IMMEDIATE)

#### Problem
Bots spawn at same position and stack together.

#### Solution
```typescript
private setupBots() {
  const botConfigs = [
    // Blue team - spread across lanes
    { id: "bot1", team: BLUE, lane: "top", x: 400, y: MAP_SIZE - 400 },
    { id: "bot2", team: BLUE, lane: "mid", x: 500, y: MAP_SIZE - 600 },
    
    // Red team - spread across lanes
    { id: "bot3", team: RED, lane: "top", x: MAP_SIZE - 400, y: 400 },
    { id: "bot4", team: RED, lane: "mid", x: MAP_SIZE - 600, y: 500 },
    { id: "bot5", team: RED, lane: "bot", x: MAP_SIZE - 500, y: MAP_SIZE - 500 },
  ];
}
```

**Key Points:**
- Each bot has assigned lane
- Spawn positions are lane-specific
- Bots start in different areas

---

### Phase 2: State Machine Implementation

#### Bot States
```typescript
enum BotState {
  LANING = "laning",        // Farm minions in lane
  PUSHING = "pushing",      // Attack tower with minions
  RETREATING = "retreating", // Low HP, return to base
  ATTACKING = "attacking",   // Chase enemy champion
  RECALLING = "recalling",   // Return to base to heal
  ROTATING = "rotating",     // Move between lanes
}
```

#### State Transitions
```
LANING → ATTACKING (enemy in range)
LANING → RETREATING (HP < 30%)
LANING → PUSHING (no enemies, minion wave present)
ATTACKING → LANING (enemy died or escaped)
RETREATING → LANING (HP > 80%)
PUSHING → RETREATING (enemy appeared)
```

---

### Phase 3: Lane Assignment System

#### Lane Positions
```typescript
const LANE_POSITIONS = {
  top: {
    blue: { x: 300, y: MAP_SIZE - 300 },
    red: { x: MAP_SIZE - 300, y: 300 },
    midPoint: { x: MAP_SIZE / 2, y: 300 }
  },
  mid: {
    blue: { x: 300, y: MAP_SIZE / 2 },
    red: { x: MAP_SIZE - 300, y: MAP_SIZE / 2 },
    midPoint: { x: MAP_SIZE / 2, y: MAP_SIZE / 2 }
  },
  bot: {
    blue: { x: 300, y: 300 },
    red: { x: MAP_SIZE - 300, y: MAP_SIZE - 300 },
    midPoint: { x: MAP_SIZE / 2, y: MAP_SIZE - 300 }
  }
};
```

#### Bot Behavior by Lane
```typescript
updateBotLaneBehavior(bot) {
  switch (bot.lane) {
    case "top":
      // Aggressive, duel-focused
      bot.aggression = 0.8;
      break;
    case "mid":
      // Balanced, roam-capable
      bot.aggression = 0.5;
      break;
    case "bot":
      // Defensive, farm-focused
      bot.aggression = 0.3;
      break;
  }
}
```

---

### Phase 4: Minion Last-Hitting

#### Priority System
```typescript
findTarget(bot) {
  const enemies = this.getEnemiesInRange(bot, 400);
  const minions = this.getMinionsInRange(bot, 300);
  
  // Priority 1: Killable enemy champion
  const killableChamp = enemies.find(e => 
    e.isChampion && e.hp <= bot.damage
  );
  if (killableChamp) return killableChamp;
  
  // Priority 2: Last-hit minion (gold)
  const lastHitMinion = minions.find(m => 
    m.hp <= bot.damage && m.hp > 0
  );
  if (lastHitMinion) return lastHitMinion;
  
  // Priority 3: Nearest enemy
  return this.getNearestEnemy(bot);
}
```

#### Attack Timing
```typescript
shouldAttack(bot, target) {
  // Wait for last-hit moment
  if (target.isMinion) {
    const damage = bot.attackDamage;
    const hpPercent = target.hp / target.maxHp;
    
    // Attack when minion is below execute threshold
    return hpPercent < (damage / target.maxHp) * 1.2;
  }
  
  // Always attack champions
  return true;
}
```

---

### Phase 5: Positioning System

#### Safe Distance Maintenance
```typescript
updatePosition(bot) {
  const nearestEnemy = this.getNearestEnemy(bot);
  const nearestAlly = this.getNearestAlly(bot);
  
  if (nearestEnemy) {
    const dist = getDistance(bot, nearestEnemy);
    
    // Ranged bots keep distance
    if (bot.isRanged && dist < 300) {
      this.moveAwayFrom(bot, nearestEnemy);
    }
    
    // Melee bots stay in range
    if (!bot.isRanged && dist > 150) {
      this.moveTo(bot, nearestEnemy);
    }
  }
  
  // Stay near allies for team fights
  if (nearestAlly && getDistance(bot, nearestAlly) > 400) {
    this.moveTo(bot, nearestAlly);
  }
}
```

#### Orb Walking (Kiting)
```typescript
orbWalk(bot, target) {
  // Attack
  this.attack(bot, target);
  
  // Move towards target
  this.moveTowards(bot, target, bot.attackRange * 0.7);
  
  // Wait for attack cooldown
  wait(bot.attackCooldown);
  
  // Repeat
}
```

---

### Phase 6: Ability Usage AI

#### Smart Ability Casting
```typescript
useAbilityAI(bot) {
  const enemies = getEnemiesInRange(bot, 500);
  const allies = getAlliesInRange(bot, 400);
  
  for (const ability of bot.abilities) {
    if (!ability.isReady()) continue;
    
    // Healing abilities
    if (ability.isHeal) {
      const lowHPAlly = allies.find(a => a.hpPercent < 0.4);
      if (lowHPAlly) this.cast(ability, lowHPAlly);
    }
    
    // Damage abilities
    if (ability.isDamage) {
      const groupedEnemies = enemies.filter(e => 
        getDistance(bot, e) < ability.range
      );
      if (groupedEnemies.length >= 2) {
        this.cast(ability, groupedEnemies[0]);
      }
    }
    
    // CC abilities
    if (ability.isCC) {
      const priorityTarget = enemies.find(e => e.isCarry);
      if (priorityTarget && getDistance(bot, priorityTarget) < ability.range) {
        this.cast(ability, priorityTarget);
      }
    }
  }
}
```

---

### Phase 7: Objective Focus

#### Target Priority
```typescript
enum TargetPriority {
  NEXUS = 10,      // Highest priority
  TOWER = 8,
  DRAGON = 7,
  MINION = 5,
  CHAMPION = 6,
  JUNGLE_CAMP = 3,
}

selectTarget(bot) {
  const targets = getAllTargets();
  
  // Score each target
  const scored = targets.map(target => {
    let score = TargetPriority[target.type];
    
    // Bonus for killable targets
    if (target.hp <= bot.damage) score += 5;
    
    // Bonus for proximity
    const dist = getDistance(bot, target);
    score += (1000 - dist) / 100;
    
    // Penalty for dangerous targets
    if (target.isChampion && target.items > bot.items) {
      score -= 3;
    }
    
    return { target, score };
  });
  
  // Return highest scored target
  return scored.sort((a, b) => b.score - a.score)[0].target;
}
```

---

### Phase 8: Team Fight AI

#### Engagement Logic
```typescript
shouldTeamFight(bot) {
  const allies = getAlliesInRange(bot, 600);
  const enemies = getEnemiesInRange(bot, 600);
  
  // Count advantage
  const allyCount = allies.length;
  const enemyCount = enemies.length;
  
  // Check HP advantage
  const allyHP = allies.reduce((sum, a) => sum + a.hpPercent, 0);
  const enemyHP = enemies.reduce((sum, e) => sum + e.hpPercent, 0);
  
  const allyAvgHP = allyHP / allyCount;
  const enemyAvgHP = enemyHP / enemyCount;
  
  // Engage if:
  // - More allies than enemies
  // - OR higher average HP
  // - OR all ultimates ready
  return (
    allyCount > enemyCount ||
    allyAvgHP > enemyAvgHP ||
    allies.every(a => a.ultimate.isReady())
  );
}
```

---

## Implementation Code Structure

### Bot Controller Class
```typescript
class BotController {
  private bot: Bot;
  private state: BotState;
  private target: any = null;
  private lastDecisionTime: number = 0;
  private decisionInterval: number = 500; // Decide every 500ms
  
  update(deltaTime: number) {
    // Don't update too frequently
    if (Date.now() - this.lastDecisionTime < this.decisionInterval) {
      return;
    }
    
    this.lastDecisionTime = Date.now();
    
    // Update state
    this.updateState();
    
    // Find target
    this.target = this.findTarget();
    
    // Execute behavior
    this.executeBehavior();
  }
  
  private updateState() {
    const hpPercent = this.bot.hp / this.bot.maxHp;
    
    if (hpPercent < 0.3) {
      this.state = BotState.RETREATING;
    } else if (this.target && this.target.isChampion) {
      this.state = BotState.ATTACKING;
    } else if (this.hasMinionWave()) {
      this.state = BotState.PUSHING;
    } else {
      this.state = BotState.LANING;
    }
  }
  
  private executeBehavior() {
    switch (this.state) {
      case BotState.LANING:
        this.laneBehavior();
        break;
      case BotState.ATTACKING:
        this.attackBehavior();
        break;
      case BotState.RETREATING:
        this.retreatBehavior();
        break;
      case BotState.PUSHING:
        this.pushBehavior();
        break;
    }
  }
}
```

---

## Debugging Tools

### Visual Debugging
```typescript
drawBotDebug(bot) {
  // Draw state above bot
  this.add.text(bot.x, bot.y - 50, bot.state, {
    fontSize: "12px",
    color: "#ffffff",
    backgroundColor: "#000000"
  });
  
  // Draw target line
  if (bot.target) {
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xff0000);
    graphics.lineBetween(bot.x, bot.y, bot.target.x, bot.target.y);
  }
  
  // Draw HP bar
  this.drawHPBar(bot.x, bot.y - 40, bot.hp, bot.maxHp);
}
```

### Console Logging
```typescript
logBotDecision(bot, action: string) {
  if (this.debugMode) {
    console.log(`[Bot ${bot.id}] ${action}`);
  }
}
```

---

## Testing Scenarios

### 1. Lane Test
- Spawn one bot per lane
- Verify they stay in lane
- Check they attack enemy minions

### 2. Combat Test
- Spawn player and bot facing each other
- Verify bot attacks when in range
- Verify bot retreats when low HP

### 3. Push Test
- Spawn bot with minion wave
- Verify bot attacks tower
- Verify bot prioritizes tower over minions

### 4. Team Fight Test
- Spawn 3v3
- Verify bots focus same targets
- Verify bots use abilities

---

## Performance Optimization

### Spatial Partitioning
```typescript
class SpatialGrid {
  private cells: Map<string, GameObject[]>;
  private cellSize: number = 200;
  
  addObject(obj: GameObject) {
    const cellKey = this.getCellKey(obj.x, obj.y);
    if (!this.cells.has(cellKey)) {
      this.cells.set(cellKey, []);
    }
    this.cells.get(cellKey)!.push(obj);
  }
  
  getNearbyObjects(x: number, y: number, radius: number): GameObject[] {
    const cells = this.getCellsInRadius(x, y, radius);
    return cells.flat();
  }
}
```

### Decision Throttling
```typescript
// Only make decisions every 500ms
if (Date.now() - this.lastDecision < 500) return;
this.lastDecision = Date.now();
```

---

## Next Steps

1. **Fix spawn positions** (DONE in this update)
2. **Implement state machine**
3. **Add lane-specific behavior**
4. **Implement last-hitting logic**
5. **Add positioning system**
6. **Implement ability AI**
7. **Add objective focus**
8. **Create team fight logic**
9. **Add debugging visualization**
10. **Optimize performance**

---

## Resources

- [Behavior Trees in Games](https://www.gamedeveloper.com/programming/behavior-trees-for-ai-how-they-work)
- [MOBA AI Patterns](https://www.gamasutra.com/blogs/ChrisSimpson/20140717/221339/Behavior_Trees_for_AI_in_Games.php)
- [League of Legends Bot AI Analysis](https://www.reddit.com/r/leagueoflegends/comments/bot_ai_analysis/)
