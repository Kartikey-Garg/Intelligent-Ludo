# 🤖 AI Companions & Decision Engine

Intelligent Ludo features AI agent companions designed to provide engaging, senior-friendly gameplay without feeling repetitive or robotic.

---

## 🧠 AI Personalities & Difficulty Levels

1. **Grandmaster (Yellow AI)**:
   - Evaluates full multi-step board threats, enemy distance matrices, and home finish opportunities.
   - Prioritizes enemy captures (+280 pts) and home stretch advancement (+350 pts).

2. **Strategic (Green & Red AI)**:
   - Balanced tactical play that balances Yard token releases (+170 pts) with safe star positioning (+140 pts).

3. **Friendly Companion (Blue AI)**:
   - Casual, relaxed AI personality that plays at a gentle pace, perfect for senior players looking for stress-free fun.

---

## 🗣️ Text-to-Speech Voice Banter

- Powered by native **Web Speech API** (`window.speechSynthesis`).
- AI agents cheer good rolls, react to captures, and greet players with friendly audio commentary.
- Speech audio can be toggled on/off at any time using the 🔊 voice button.

---

## 💡 Smart Move Hint Engine

- Human players can click the **💡 Hint** button in the header during their turn.
- Evaluates all legal moves and displays the optimal token choice with a clear explanation (e.g. *"Capture opponent token on cell #14"*).
