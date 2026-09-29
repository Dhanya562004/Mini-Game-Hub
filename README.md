# Mini Game Hub 🎮

A production-quality, responsive web application featuring 3 classic arcade games (**Tic Tac Toe**, **Memory Card Match**, and **RGB Color Master**) built with **pure HTML5, CSS3, and modern JavaScript (ES6+)**, wrapped and deployed using **Streamlit**.

![Mini Game Hub](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JS-blue)
![Deployment wrapper](https://img.shields.io/badge/Container-Streamlit-ff4b4b)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Key Features

### 1. ❌ Tic Tac Toe
- **Game Modes**: 2 Player Local (PvP), Easy AI 🤖, and **Unbeatable Minimax AI** ⚡.
- **Winning Logic**: Detects row, column, and diagonal wins; highlights winning combinations with glowing animations.
- **Scoreboard**: Tracks Player X wins, Player O wins, and Draws with instant reset options.

### 2. 🎴 Memory Card Match
- **Difficulty Levels**: Easy (4x3 / 6 pairs), Medium (4x4 / 8 pairs), and Hard (6x4 / 12 pairs).
- **Themes**: Gaming Icons 👾, Emojis 🦄, and Food 🍕.
- **3D Card Flip**: Built using CSS 3D perspective transforms (`preserve-3d`).
- **Performance Metrics**: Real-time timer, move counter, and star rating system stored in `localStorage`.

### 3. 🎨 RGB Color Master
- **Game Modes**: Easy (3 Color Boxes) and Hard (6 Color Boxes).
- **Color Engine**: Generates precise RGB targets (`rgb(r, g, b)`) alongside closely matched distractor shades.
- **Streak Tracker**: Real-time win streak tracking and high-score memory persistence.

---

## 🚀 Sound & Visual Highlights
- **Web Audio API Synthesizer**: Pure JavaScript audio synthesizer generating retro sound effects (click, flip, match, win, wrong) with **zero external audio asset dependencies**.
- **Canvas Confetti Engine**: Custom particle physics confetti burst trigger on game victories.
- **Glassmorphism Theme**: Cyberpunk dark mode featuring sleek translucent cards, neon glow accents, and responsive layout math for mobile, tablet, and desktop devices.

---

## 🛠️ Project Structure

```
Mini-Game-Hub/
├── app.py              # Streamlit container & wrapper
├── index.html          # Core HTML structure & semantic layout
├── style.css           # Glassmorphism styling, CSS variables & animations
├── script.js           # Game logic, Minimax AI, Audio Synthesizer & Confetti
├── requirements.txt    # Python dependencies (Streamlit)
├── assets/             # Optional asset storage
└── README.md           # Project documentation
```

---

## ⚡ Quick Start & Deployment

### Running via Streamlit (Wrapper Container)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dhanya562004/Mini-Game-Hub.git
   cd Mini-Game-Hub
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Launch the Streamlit app:**
   ```bash
   streamlit run app.py
   ```

### Running Directly in Browser (Standalone Frontend)
Simply double click `index.html` or open it in any modern browser!

---

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
