# 📜 Game Rules & House Rules

Intelligent Ludo enforces standard official Ludo rules alongside customizable house rules for maximum flexibility and accessibility.

---

## 🎯 Official Game Rules

1. **Releasing Tokens from Yard**:
   - Rolling a **6** opens a token from your Yard onto your color's Start square (Step 1).
   - In standard mode, numbers 1..5 cannot open a Yard token.

2. **Sequential Roll & Move Flow**:
   - Each die roll requires moving an active coin on the board before any subsequent extra roll occurs.
   - If a player rolls a **6**, captures an enemy token, or lands a token in Home (Step 57), an **extra turn** is granted immediately after the coin move completes.

3. **Safe Star Cells (⭐)**:
   - There are 8 designated Safe Star cells on the board (`[0, 8, 13, 21, 26, 34, 39, 47]`).
   - Tokens resting on a Safe Star cell **cannot be captured** by enemy tokens.

4. **Enemy Token Captures (⚔️)**:
   - Landing on a non-safe cell occupied by an opponent's token captures that enemy token.
   - Captured tokens are sent back to the opponent's Yard (`stepCount = 0`), and the capturing player receives an extra roll.

5. **3 Consecutive 6s Rule**:
   - Rolling 3 consecutive 6s in a single turn triggers a turn skip to maintain match balance.

6. **Home Finish (🏆)**:
   - Moving a token to Step 57 finishes that token in Home.
   - The first player to finish all 4 tokens wins the match!

---

## 🏠 Customizable House Rules

- **1=6 House Rule**: When enabled in match setup, rolling a **1** behaves like a **6** (opens tokens from Yard and grants extra turns). Ideal for fast-paced or casual games for seniors.
