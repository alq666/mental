# Mental Math Challenge 🧮

A fun and interactive mental calculation game built with React, TypeScript, and Vite.

## About

Mental Math Challenge is a web-based game that helps you practice multiplication skills. The game generates random multiplication problems and tracks your performance over 20 rounds.

## Features

- 🎲 Random multiplication problems (numbers 1-20)
- 📊 Real-time score tracking
- 🎯 20 rounds per game session
- ✅ Instant feedback on answers
- 📈 Final score with percentage
- 🎨 Beautiful, responsive UI with smooth animations
- ♻️ Play again option at the end

## How to Play

1. The game will show you a multiplication problem (e.g., 7 × 13 = ?)
2. Type your answer in the input field
3. Click "Submit" or press Enter
4. You'll see immediate feedback (correct/incorrect with the right answer)
5. The game automatically moves to the next round
6. After 20 rounds, view your final score and play again!

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository or download the files
2. Navigate to the project directory:
   ```bash
   cd mental
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will open in your browser at `http://localhost:5173`

### Building for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **CSS3** - Styling with animations

## Project Structure

```
mental/
├── src/
│   ├── App.tsx       # Main game component
│   ├── App.css       # Game styles
│   ├── main.tsx      # Application entry point
│   └── index.css     # Global styles
├── public/           # Static assets
├── index.html        # HTML template
└── package.json      # Dependencies and scripts
```

## Game Rules

- Each round presents a multiplication of two random numbers (1-20)
- You have unlimited time to answer each question
- Correct answers add 1 point to your score
- Incorrect answers show the correct solution
- After 20 rounds, the game ends and displays your final score

## Customization

You can easily customize the game by modifying the constants in `App.tsx`:

```typescript
const TOTAL_ROUNDS = 20;    // Change number of rounds
const MIN_NUMBER = 1;        // Change minimum number
const MAX_NUMBER = 20;       // Change maximum number
```

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to fork this project and make your own improvements!

---

Made with ❤️ using React + TypeScript + Vite