# Wheels: Game Rules (Rebalanced)

## Overview

Wheels is a 1v1 turn-based game played on a set of 5 spinning reels. Players spin reels to generate resources (energy, defense, XP), then use those resources to power figurine attacks against their opponent's Crown.

---

## Win Condition

Each player starts with **10 Crown HP**. Reduce your opponent's Crown HP to **0** to win. The 0 HP check happens simultaneously at the end of each round. If both players hit 0 in the same round, the game is a **Tie**. Crown HP can be healed by the Priest figurine up to a maximum of **12 HP**.

---

## Setup

Each player selects **2 Hero figurines** from the available pool. One is assigned to the **Squares** slot (left) and the other to the **Diamonds** slot (right). Both players can see each other's figurine selections before the match begins.

---

## The Wheels (Reels)

There are **5 spinning wheels**, each **8-sided**. All 5 wheels are fixed and identical for both players.

---

## Wheel Panel Distributions

S = Square, D = Diamond, H = Hammer. A "+" suffix means the panel has a starry background (grants XP). Multiple letters (e.g., SS, DD, HH) mean that single panel shows 2 of that symbol at once.

Each of wheels 1-4 contains 3 Square panels, 3 Diamond panels, 2 Hammer panels, and 2 XP-granting panels (one per symbol type).

**Wheel 1:** S, D, S, S+, D, H, DD+, H

**Wheel 2:** S+, D, SS, D+, S, H, DD, HH

**Wheel 3:** S+, D, D+, S, D, HH, SS, HH

**Wheel 4:** S, D, S+, D, HH, S, D+, HH

**Wheel 5:** S, DD+, HH, SS, DD, SS+, D, HH

Wheel 5 has no blanks. It contains 2 Square panels, 3 Diamond panels, 2 Hammer panels, and 2 XP-granting panels (one per symbol type), plus multi-symbol panels.

---

## Turn Structure

Each turn consists of two phases: **Bulwark Decay**, then **Spinning**.

### Bulwark Decay

At the start of your turn, before spinning, your Bulwark loses **1 height/HP**. If your Bulwark is already at 0, nothing happens.

### Spinning

The player performs up to **3 spins**:

1. **First spin**: All 5 wheels must be spun.
2. **Second spin**: The player may **lock** any wheels showing desirable results. Unlocked wheels are re-spun.
3. **Third spin**: Same as above. Results are finalized after the third spin.

A player can end their turn early by **locking all 5 wheels** after the 1st or 2nd spin. After resolving the final roll, the opponent takes their turn.

---

## Panel Symbols

### Squares (Yellow)

Generate energy for the **left Hero** (Squares slot). Need 3+ to generate any energy.

### Diamonds (Blue)

Generate energy for the **right Hero** (Diamonds slot). Same rules as Squares.

### Hammers

Build **Bulwark** (defensive wall). Same 3+ threshold.

### Starry-Background Panels (XP Panels)

Some Square/Diamond panels have a starry background. These grant **1 XP** to the corresponding Hero in addition to counting as a normal symbol. A multi-symbol XP panel (e.g., DD+) counts as 2 Diamonds and grants 1 XP.

---

## Energy System

Energy determines when a Hero activates. The formula:

> **Energy gained = (matching symbols shown) - 2**

A single panel can contribute multiple symbols (e.g., SS = 2 Squares). You need at least **3 matching symbols** in one turn to generate any energy (3 - 2 = 1). Each Hero has an **energy threshold** that varies by figurine and rank. When accumulated energy meets or exceeds the threshold, the Hero activates, performs its action, and the energy meter resets.

**Excess energy does not carry over.** If a Hero needs 1 energy and you generate 3, the activation happens but the extra 2 is lost.

Heroes can also gain energy from the **Priest** and lose energy from the opponent's **Assassin**.

---

## Bulwark (Defense)

Bulwark is built the same way as energy: **3+ Hammers**, applying the same "minus 2" formula. It can also be built by the Engineer (+2 per activation).

- **Height and HP are always equal** (Bulwark at 3 = height 3, HP 3).
- **Maximum: 5.**
- **Decays by 1 at the start of your turn** (before spinning).
- When attacked, Bulwark HP/height decreases by the attack's Bulwark damage value.

### Attack Height vs. Bulwark Height

Most Hero attacks have an **attack height**:

- **Attack height > Bulwark height**: Attack hits the **Crown** (Crown damage applied).
- **Attack height <= Bulwark height**: Attack hits the **Bulwark** (Bulwark damage applied).

Three exceptions bypass this system entirely (see "Bypassing Bulwark" below).

---

## Hero XP and Leveling

Heroes gain XP from two sources:

1. **Starry-background panels**: 1 XP per matching starry panel.
2. **Activation**: 2 XP each time a Hero acts. This XP is granted at the **very end** of the turn, after all other effects.

**XP carries over.** Excess XP beyond the 10 needed for a level-up or bomb is not lost. For example, a Hero with 9/10 XP that receives 3 XP will level up and retain 2 XP toward the next threshold.

### Rank Progression

Heroes start at **Bronze**. The XP bar fills at **10 XP**:

- **First 10 XP**: Upgrade to **Silver** (improved stats, sometimes reduced energy cost).
- **Second 10 XP**: Upgrade to **Gold** (further improved stats).
- **Every 10 XP after Gold**: Launch a **Bomb** (2 damage to opponent's Crown, bypasses Bulwark).

---

## Resolution Order

Once the roll is finalized, effects resolve in this exact sequence. Each step only occurs if applicable. Within each step, the **Squares Hero (left) acts before the Diamonds Hero (right)**.

1. **Panel XP**: Starry panels grant XP. Level-ups trigger immediately if threshold reached.
2. **Hammer panels**: Bulwark built from Hammer results.
3. **Energy panels**: Energy from Squares/Diamonds added to Heroes.
4. **Assassin acts** (if enough energy). Gains 2 XP.
5. **Priest acts**: Heals Crown, then grants energy to the other friendly Hero. Gains 2 XP.
6. **Engineer acts**. Gains 2 XP.
7. **Bombs** triggered by steps 4-6 resolve.
8. **Remaining Heroes act** (Warrior, Mage, Archer with sufficient energy, including any Hero pushed past threshold by Priest energy). Each gains 2 XP.
9. **Bombs** triggered by step 8 resolve.
10. **0 HP Crown check** (simultaneous for both players).

---

## Figurines

Six figurines total. Each has a Crown damage value, Bulwark damage value (or equivalent special stat), an energy-to-act cost, and an attack height where relevant.

### Warrior

Ground-level attack. High damage to both Crown and Bulwark, but always hits the Bulwark if one exists (attack height is at ground level).


| Rank   | Energy | Crown Dmg | Bulwark Dmg |
| ------ | ------ | --------- | ----------- |
| Bronze | 3      | 3         | 3           |
| Silver | 3      | 5         | 5           |
| Gold   | 3      | 7         | 5           |


### Mage

Attacks **twice** per activation. First fireball: ground level (blocked by any Bulwark). Second fireball: **height 6** (always hits Crown, since max Bulwark is 5). The two fireballs have **different damage values**: the ground-level fireball hits harder, rewarding players who strip the opponent's Bulwark first.


| Rank   | Energy | Ground Fireball (Crown/Bulwark) | High Fireball (Crown only) |
| ------ | ------ | ------------------------------- | -------------------------- |
| Bronze | 5      | 2 / 2                           | 1                          |
| Silver | 4      | 4 / 3                           | 2                          |
| Gold   | 4      | 6 / 4                           | 3                          |


### Archer

Arrow flies at **height 3**. Hits Crown when Bulwark is 2 or less; otherwise hits Bulwark. Strong Crown damage, weak Bulwark damage.


| Rank   | Energy | Crown Dmg | Bulwark Dmg |
| ------ | ------ | --------- | ----------- |
| Bronze | 4      | 3         | 1           |
| Silver | 3      | 4         | 2           |
| Gold   | 3      | 6         | 3           |


### Engineer

Attacks the opponent AND raises own Bulwark by **2** on each activation. Weak Crown damage, strong Bulwark damage.


| Rank   | Energy | Crown Dmg | Bulwark Dmg |
| ------ | ------ | --------- | ----------- |
| Bronze | 4      | 1         | 3           |
| Silver | 4      | 2         | 5           |
| Gold   | 3      | 4         | 5           |


### Assassin

**Ignores Bulwark entirely.** Deals direct Crown damage, **delays** the opponent's Hero closest to activating (removes energy from it), and **strips 1 Bulwark** from the opponent. Low damage, high disruption and wall-breaking utility.


| Rank   | Energy | Crown Dmg | Delay (energy removed) | Bulwark Stripped |
| ------ | ------ | --------- | ---------------------- | ---------------- |
| Bronze | 3      | 1         | 1                      | 1                |
| Silver | 3      | 2         | 1                      | 1                |
| Gold   | 3      | 2         | 2                      | 1                |


### Priest

**Does not attack.** Heals own Crown and grants energy to the other friendly Hero.


| Rank   | Energy | Healing | Energy Granted |
| ------ | ------ | ------- | -------------- |
| Bronze | 4      | 1       | 1              |
| Silver | 3      | 1       | 1              |
| Gold   | 3      | 2       | 2              |


Crown HP cannot be healed above **12**.

---

## Bypassing Bulwark

Three methods deal Crown damage regardless of Bulwark:

1. **Assassin**: All attacks hit Crown directly (and strip 1 Bulwark).
2. **Mage (high fireball)**: Height 6 always exceeds max Bulwark (5), but deals reduced damage compared to the ground fireball.
3. **Bombs**: Gold-rank Heroes that reach 10 XP launch a bomb for 2 Crown damage.

---

## Summary of Changes from Original

This is a rebalanced version of the Wheels minigame from *Sea of Stars*. Key changes:

- **Wheel tiers removed.** Both players use the same 5th wheel (equivalent to the original Diamond tier). No blanks, no asymmetric advantage.
- **Mage rebalanced.** The guaranteed height-6 fireball now deals exactly half the damage of the blockable ground fireball. Bulwark is now meaningful against Mages.
- **Assassin gains Bulwark stripping.** Each activation removes 1 Bulwark from the opponent, creating synergy with Warrior and Archer who need walls down to hit the Crown.
- **Priest energy grant reduced.** From 2/2/3 to 1/1/2. The Priest still accelerates its partner, but no longer functions as a full engine that triggers the partner every other turn.
- **Priest resolution simplified.** Priest always grants energy at step 5, before other Heroes act. No conditional timing split.
- **XP carries over.** Excess XP beyond the threshold is retained. Eliminates the "wasted XP" feel and reduces the leveling speed gap between fast-cycling and slow-cycling Heroes.
- **XP threshold raised from 6 to 10.** Slows down rank progression and bomb frequency. Heroes spend more time at each rank, giving the stat differences between Bronze/Silver/Gold more room to matter. Bombs are a late-game payoff rather than a mid-game inevitability.
- **Bulwark decays.** Loses 1 height/HP at the start of your turn. Prevents permanent walls from Engineer spam; defense is now a resource that requires active upkeep.