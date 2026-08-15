# 🎲 Intelligent Ludo

An end-to-end, high-performance Ludo web application designed specifically for seniors and families to play local multiplayer matches or games with intelligent AI companions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Vitest](https://img.shields.io/badge/Vitest-1-green.svg)
![Capacitor](https://img.shields.io/badge/Capacitor-6-blue.svg)

---

## ✨ Features

- **Smart AI Companions**: Play against 1, 2, or 3 intelligent AI agents featuring 3 difficulty levels (*Grandmaster*, *Strategic*, *Friendly Companion*) and live text-to-speech banter.
- **Pass-and-Play Multiplayer**: Play with 0 AI agents in 2, 3, or 4 player manual local mode.
- **Senior-Friendly UI**: High-contrast typography, readable fonts, 60 FPS hardware-accelerated Canvas board, and 3D GPU dice transforms.
- **Audio Synthesizer**: Programmatic sound effects powered by native Web Audio API (0 disk storage / zero asset downloads).
- **Rule Flexibility**: Toggleable house rules like "1 behaves like 6" (opens token & grants extra turn).
- **Automated Android APK Build**: GitHub Actions workflow pre-configured to build downloadable `.apk` files automatically on push.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Run Unit Tests
```bash
npm test
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 📱 Android APK Cloud Build

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/build-apk.yml`).

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/Intelligent-Ludo.git
   git push -u origin main
   ```
2. Navigate to the **Actions** tab on your GitHub repository.
3. Download the compiled `Intelligent-Ludo-APK.apk` under **Artifacts** once the build finishes (~2 mins).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Graphics**: HTML5 2D Canvas (GPU Accelerated), CSS 3D Transforms
- **Audio**: Native Web Audio API & Web Speech API
- **Testing**: Vitest (13/13 automated test suite)
- **Mobile**: Ionic Capacitor (Android)

---

## 📄 License

MIT License. Free for personal and open-source use.
