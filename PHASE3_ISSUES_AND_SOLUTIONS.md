# Phase 3 — Critical Issues & Solutions

**Date:** March 6, 2026  
**Status:** In Progress  
**Priority:** CRITICAL

---

## 🔴 CRITICAL ISSUES (Must Fix Before Phase 3 Complete)

### 1. Damage Processing Too Slow

**Problem:**
- Damage applies only when projectile expires (1 second delay)
- Feels unresponsive and laggy
- Player doesn't get immediate feedback

**Current Implementation:**
```typescript
createProjectile(..., () => {
  // Damage applied AFTER 1 second
  damageBot(botId, damage);
});
```

**Solution: Instant Hit Detection**

**Option A: Hitscan + Visual Projectile (RECOMMENDED)**
```typescript
private performAttack() {
  const target = findNearestEnemy();
  if (!target) return;
  
  // 1. Apply damage INSTANTLY
  damageTarget(target, this.playerChampion.attack);
  
  // 2. Create visual projectile for feedback
  createVisualProjectile(target.x, target.y);
}
```

**Option B: Projectile Collision Detection**
```typescript
// In update() loop
this.physics.overlap(projectiles, targets, (projectile, target) => {
  // Damage on contact
  damageTarget(target, projectile.damage);
  projectile.destroy();
});
```

**Implementation Priority:** Option A (simpler, more responsive)

---

### 2. Spells Cannot Be Used

**Problem:**
- Pressing 1,2,3,4 doesn't cast abilities
- Abilities loaded from DB but not working

**Current Issues:**
1. Ability icons may not render correctly
2. Key binding might not trigger
3. Mana check might fail silently
4. No visual feedback when pressing keys

**Debug Steps:**
```typescript
private useAbility(key: string) {
  console.log(`[Ability] Key ${key} pressed`);
  
  const ability = this.playerChampion.abilities?.find(a => a.key === key);
  console.log(`[Ability] Found:`, ability);
  
  if (!ability) {
    console.warn('[Ability] No ability found for key:', key);
    return;
  }
  
  // ... rest of logic
}
```

**Solution:**
1. Add console logging to debug
2. Check if abilities array is populated
3. Verify key bindings are correct (1,2,3,4 not Q,W,E,R)
4. Add visual feedback when pressing ability keys
5. Show cooldown indicators on ability icons

**Fix Code:**
```typescript
// In create()
console.log('[GameScene] Champion abilities:', this.playerChampion.abilities);

// In useAbility()
if (!this.playerChampion.abilities || this.playerChampion.abilities.length === 0) {
  console.warn('[Ability] No abilities loaded!');
  return;
}
```

---

### 3. Minions/Creeps Issues

**Problem:**
- ❌ No HP system
- ❌ No collision
- ❌ Don't attack each other
- ❌ Don't attack heroes
- ❌ Don't attack towers
- ❌ Don't attack nexus

**Current State:**
Minions just move towards target without any combat logic.

**Solution: Complete Minion System**

```typescript
interface MinionData {
  id: string;
  team: number;
  hp: number;
  maxHp: number;
  attack: number;
  attackRange: number;
  attackSpeed: number;
  lastAttackTime: number;
  targetX: number;
  targetY: number;
}

// In createMinion()
(minion as any).minionData = {
  id: `minion-${Date.now()}`,
  team,
  hp: minionType.hp,
  maxHp: minionType.hp,
  attack: minionType.attack,
  attackRange: 100,
  attackSpeed: 1000,
  lastAttackTime: 0,
  targetX,
  targetY,
};

// Set collision
minion.body.setSize(16, 16);
minion.body.setOffset(-8, -8);
```

**Minion Combat Logic:**
```typescript
private updateMinions(time: number) {
  const now = Date.now();
  
  this.minions.forEach((minion) => {
    const data = (minion as any).minionData;
    if (!data || data.hp <= 0) return;
    
    // Find target (enemy minion, hero, tower, nexus)
    const target = this.findMinionTarget(minion);
    
    if (target && Phaser.Math.Distance.Between(
      minion.x, minion.y, target.x, target.y
    ) <= data.attackRange) {
      // Attack if in range
      if (now - data.lastAttackTime > data.attackSpeed) {
        data.lastAttackTime = now;
        this.minionAttack(minion, target);
      }
    } else {
      // Move towards target
      this.moveMinionTowards(minion, data.targetX, data.targetY);
    }
  });
}

private findMinionTarget(minion: Phaser.GameObjects.Container): any {
  const data = (minion as any).minionData;
  
  // Priority 1: Enemy minions
  const enemyMinion = this.minions.find(m => {
    const mData = (m as any).minionData;
    return mData && mData.team !== data.team && mData.hp > 0 &&
           Phaser.Math.Distance.Between(minion.x, minion.y, m.x, m.y) < 300;
  });
  if (enemyMinion) return enemyMinion;
  
  // Priority 2: Enemy heroes
  if (this.playerSprite) {
    const heroTeam = this.playerTeam;
    if (heroTeam !== data.team) {
      return this.playerSprite;
    }
  }
  
  // Priority 3: Enemy towers
  const enemyTower = this.towers.find(t => {
    const tData = (t as any).towerData;
    return tData && tData.team !== data.team && tData.hp > 0;
  });
  if (enemyTower) return enemyTower;
  
  // Priority 4: Enemy nexus
  const enemyNexus = this.nexuses.find(n => {
    const nData = (n as any).nexusData;
    return nData && nData.team !== data.team && nData.hp > 0;
  });
  
  return enemyNexus;
}
```

---

### 4. Hero Grid Layout is a Mess

**Problem:**
- Champions overlap each other
- Cards not properly aligned
- Some cards blocked by preview/confirm button
- Team selection sometimes hidden

**Current Issues:**
- Grid calculation doesn't account for card sizes properly
- Positions calculated from center but cards have width/height
- Preview area overlaps cards

**Solution: Fixed Grid Positions**

```typescript
private createChampionGrid(centerX: number, startY: number) {
  const cardWidth = 170;
  const cardHeight = 200;
  const spacingX = 25;
  const spacingY = 25;
  const cols = 3;
  const rows = 2;
  
  // Calculate total grid size
  const totalWidth = cols * cardWidth + (cols - 1) * spacingX;
  const totalHeight = rows * cardHeight + (rows - 1) * spacingY;
  
  // Start position (centered)
  const startX = centerX - totalWidth / 2 + cardWidth / 2;
  const gridStartY = startY;
  
  this.champions.forEach((champion, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    const x = startX + col * (cardWidth + spacingX);
    const y = gridStartY + row * (cardHeight + spacingY);
    
    console.log(`[Grid] Card ${index}: (${x}, ${y})`);
    this.createChampionCard(x, y, cardWidth, cardHeight, champion);
  });
}
```

**Layout Verification:**
- Title: y=30
- Team Select: y=82
- Grid Row 1: y=125 (cards at y=125, 125, 125)
- Grid Row 2: y=350 (cards at y=350, 350, 350)
- Preview: y=height-120
- Confirm: y=height-40

**Should be:**
```
┌────────────────────────────────────┐
│    CHAMPION SELECT (y:30)          │
│   [BLUE] [RED] (y:82)              │
│                                    │
│ [W] [A] [M] (y:125)                │
│ [S] [R] [F] (y:350)                │
│                                    │
│ [Preview] (y:height-120)           │
│ [CONFIRM] (y:height-40)            │
└────────────────────────────────────┘
```

---

### 5. Remove Fog of War & Minimap

**Problem:**
- Fog of war not implemented correctly
- Minimap shows everything (defeats purpose)
- Both are low priority for Phase 3

**Solution: Remove Completely**

**Files to Modify:**
- `GameScenePhase3.ts` - Remove minimap code
- `GameScenePhase3.ts` - Remove fog of war references

**Code to Remove:**
```typescript
// DELETE these methods:
- setupMinimap()
- updateMinimap()
- createMinimapContainer
```

**Saves Performance:**
- Less rendering
- Simpler code
- Focus on core gameplay

---

## 🟡 MEDIUM PRIORITY (Should Fix)

### 6. Bot AI Too Simple

**Current Issues:**
- Bots don't last-hit minions
- Bots don't position properly
- Bots don't use abilities
- Bots stack together

**Solution:** See `AI_BOTS_IMPLEMENTATION.md`

**Quick Fixes:**
1. Spread bot spawn positions
2. Add lane assignment
3. Basic last-hit logic
4. Ability usage AI

---

### 7. Tower Range Indicators

**Problem:**
- Can't see tower attack range
- Don't know when safe

**Solution:**
```typescript
// Draw range circle when near tower
const rangeIndicator = this.add.graphics();
rangeIndicator.lineStyle(2, 0xff0000, 0.3);
rangeIndicator.strokeCircle(tower.x, tower.y, towerData.range);
```

---

## 🟢 LOW PRIORITY (Nice to Have)

### 8. Visual Improvements

- [ ] Champion select animations
- [ ] Better ability effects
- [ ] Death recap screen
- [ ] Scoreboard UI
- [ ] Item icons

---

## 📋 IMPLEMENTATION ORDER

### Session 1: Critical Combat (2-3 hours)
1. ✅ Fix damage processing (instant hitscan)
2. ✅ Fix spell casting
3. ✅ Fix minion HP and collision

### Session 2: Minion Combat (2-3 hours)
4. ✅ Minion vs minion combat
5. ✅ Minion vs hero combat
6. ✅ Minion vs tower combat
7. ✅ Minion vs nexus combat

### Session 3: Layout & Polish (1-2 hours)
8. ✅ Fix champion grid layout
9. ✅ Remove minimap
10. ✅ Remove fog of war

### Session 4: Bot AI (3-4 hours)
11. Bot lane assignment
12. Bot last-hitting
13. Bot ability usage
14. Bot positioning

---

## 💭 Developer Thoughts

### Damage System Architecture

**Current:** Projectile flies → waits 1 second → deals damage  
**Should Be:** Deal damage → show projectile for feedback

**Why?**
- MOBA games use hitscan for melee attacks
- Projectile is visual only
- Server authoritative anyway
- Client prediction needs instant feedback

**Implementation:**
```typescript
// Server sends damage event
socket.on('damage', (data) => {
  // Apply immediately
  target.hp -= data.damage;
  
  // Show visual
  showDamageNumber(target.x, target.y, data.damage);
});
```

### Spell System Architecture

**Issue:** Spells have cooldowns, mana costs, ranges  
**Solution:** State machine per ability

```typescript
interface AbilityState {
  key: string;
  cooldown: number;
  lastUsed: number;
  manaCost: number;
  range: number;
  isReady: () => boolean;
  canCast: () => boolean;
}
```

### Minion Wave Management

**Issue:** Too many minions = performance drop  
**Solution:** Object pooling

```typescript
class MinionPool {
  private pool: Phaser.GameObjects.Container[] = [];
  
  getMinion(): Phaser.GameObjects.Container {
    return this.pool.pop() || this.createMinion();
  }
  
  returnMinion(minion: Phaser.GameObjects.Container) {
    minion.setVisible(false);
    this.pool.push(minion);
  }
}
```

---

## 🎯 Phase 3 Definition of Done

- [x] Map with lanes, jungle, bases
- [x] Champion selection
- [x] Movement (WASD + click)
- [x] Basic attack system
- [x] Health, mana, death/respawn
- [x] Minion waves
- [x] Towers
- [x] Minimap (REMOVE)
- [x] Scoreboard
- [ ] **Minions have HP and collision** ⚠️
- [ ] **Minions attack everything** ⚠️
- [ ] **Damage is instant** ⚠️
- [ ] **Spells work** ⚠️
- [ ] **Champion grid fixed** ⚠️
- [ ] Fog of war (removed)
- [ ] Chat

---

## 📝 Next Session Checklist

1. Open browser console
2. Check for errors
3. Test damage (should be instant)
4. Test abilities (1,2,3,4 keys)
5. Check minion HP bars
6. Watch minions fight each other
7. Verify champion grid layout
8. Confirm minimap removed

---

**Last Updated:** March 6, 2026  
**Next Session:** TBD
