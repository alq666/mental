# Mental Math Challenge 🧮

A fun and interactive mental calculation game built with React, TypeScript, and Vite — one classic game plus a series of themed variants of the same 20-round multiplication challenge.

**Play it live: <https://mental-virid.vercel.app>**

## About

Mental Math Challenge is a web-based game that helps you practice multiplication skills. Each game runs 20 rounds of randomly generated problems, tracks your score and streak, and — in the themed variants — awards period-appropriate ranks as you improve. Every variant shares one game loop; only the theme and language change.

## The Games

| Route | Game | Theme |
| ----- | ---- | ----- |
| `/` | Classic | The original challenge — a name, a highest multiplicand, 20 rounds, and a best-sessions leaderboard |
| `/roman` | 🏛️ Roman challenge | Latin in the shadow of the Forum; insignia from *Prima Scintilla* to *Corona Caesaris* |
| `/france` | ⚜️ Le défi du royaume de France | 15th-century French; rise from *Page* to the *Sacre de Reims* |
| `/tang` | 🏯 大唐算學館 | Classical Chinese in the spirit of the imperial exams, from 算籌 to 金榜題名 |
| `/soccer` | ⚽ Penalty shootout | Every answer is a penalty kick; trophies from a hat-trick to the World Cup |
| `/muromachi` | ⛩️ 室町算術道場 | Muromachi-period Kyoto; train from 初陣 to 天下無双 |

## Features

- 🎲 Random multiplication problems — operands from 2 up to a maximum you choose (2–99 in the themed games)
- 📊 Real-time score, streak, and best-streak tracking
- 🏅 Streak ranks at 3 / 5 / 10 / 20 correct answers in a row, earned per player and saved in localStorage
- ⚔️ A short pixel-art duel (or penalty kick) plays after every answer, on a shared scene clock that respects reduced-motion preferences
- ⏱️ Optional countdown in the themed games (default two minutes) — the clock pauses while the scene plays
- 🏆 The classic game keeps a top-10 best-sessions leaderboard, ranked by score then time
- ✅ Instant feedback on every answer
- 🎨 Period typography and hand-made SVG skylines, clouds, and mist
- ♻️ Play again at the end

## How to Play

1. Pick a variant on the setup screen (or play the classic game at `/`)
2. Enter your name and choose the highest multiplicand
3. Type your answer to each problem (e.g. 7 × 13 = ?) and press Enter
4. Watch the duel (or the penalty kick) — a correct answer advances you, a miss resets your streak
5. After 20 rounds — or when the clock runs out — see your result and ranks, then play again

## Getting Started

### Prerequisites

- Node.js 20.19+ (the Vite 7 minimum)
- npm

### Installation

```bash
git clone https://github.com/alq666/mental.git
cd mental
npm install
```

### Running the Application

```bash
npm run dev
```

Vite prints the local URL (commonly port 5173); the variant routes (`/roman`, `/france`, `/tang`, `/soccer`, `/muromachi`) work there too.

### Lint, Build, Preview

```bash
npm run lint      # ESLint
npm run build     # tsc -b && vite build
npm run preview   # serve the production build locally
```

## Tech Stack

- **React 19** — UI framework
- **TypeScript 5** — type-safe components
- **Vite 7** — dev server and build
- **ESLint 9** — flat config
- **CSS3** — hand-written styles, one stylesheet per variant, no UI framework
- **Vercel** — hosting, analytics, and Speed Insights; `vercel.json` rewrites the variant routes to the SPA

## Project Structure

```
mental/
├── src/
│   ├── main.tsx                # Entry point (mounts App + Vercel instrumentation)
│   ├── App.tsx                 # Route dispatch + the classic game (ClassicApp)
│   ├── App.css                 # Classic game styles
│   ├── useStreakGame.ts        # Shared variant loop: rounds, streak, timer, badges
│   ├── sceneTimeline.ts        # Shared clock for the post-answer scenes
│   ├── PixelSprite.tsx         # Tiny pixel-art sprite renderer
│   ├── Duel.tsx / Duel.css     # The duel scene shared by the themed variants
│   ├── RomanGame.tsx/.css      # 🏛️ Roman challenge
│   ├── FrenchGame.tsx/.css     # ⚜️ 15th-century France
│   ├── TangGame.tsx/.css       # 🏯 Tang dynasty
│   ├── Penalty.tsx             # ⚽ The penalty-kick scene
│   ├── SoccerGame.tsx/.css     # ⚽ Penalty shootout
│   └── MuromachiGame.tsx/.css  # ⛩️ Muromachi Kyoto
├── public/                     # SVG skylines, clouds, and mist per theme
├── index.html                  # HTML template
├── vercel.json                 # SPA rewrites for the variant routes
└── package.json                # Dependencies and scripts
```

## Game Rules

- Each game is 20 rounds; every round multiplies two random operands between 2 and your chosen maximum
- A correct answer scores a point and extends your streak; a miss resets the streak
- Streaks of 3, 5, 10, and 20 unlock rank badges, saved per player in localStorage
- The themed games can run against a countdown (default 2 minutes); the clock pauses while a scene plays
- The classic game measures your total time and keeps the ten best sessions

## Customization

- Rounds and the operand floor live in `src/useStreakGame.ts` (`TOTAL_ROUNDS`, `MIN_NUMBER`)
- Each variant's ranks and streak thresholds are the `badges` array at the top of its component (`RomanGame.tsx`, `TangGame.tsx`, …)
- Duel palettes and verdict glyphs come from the `DuelTheme` each variant passes to `Duel.tsx`, styled in `Duel.css`

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to fork this project and make your own improvements — or add a new themed variant of your own!

---

Made with ❤️ using React + TypeScript + Vite