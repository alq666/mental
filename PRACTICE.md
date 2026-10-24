# Daily multiplication practice

Practice is the default screen; the original timed challenge and Roman game remain available. Use the same player name on the same browser/device to resume progress. Names are trimmed and case-insensitive. Progress is saved after each answer in versioned localStorage; no account or server is required.

The scheduler groups reversed operands into one fact family and alternates orientation across attempts. Reviews use intervals of 1, 3, 7, 14, 30, and 60 days. Wrong answers reset to tomorrow and become eligible after 3–5 intervening questions; slow correct answers use half the current interval and wait 6–8 questions. Successful corrections after an error remain due tomorrow. A fact advances at most once per local calendar day, only when due. No fact appears more than three times per session.

Selection targets 70% due reviews, 20% familiar facts, and 10% new facts, with fallback when pools are empty. Review weights favor overdue facts, errors, and the median of the last three valid correct response times. Introduce at most two new facts per session, and none through the new-fact selection slot when at least 20 eligible reviews await. Sessions stop after 20 answers, about five minutes (at the next question boundary), or when no eligible facts remain. First sessions can therefore be very short. Cooldowns are never shortened to fill a session.

Timing starts after the question commits to the screen and stops at the first submission. Pausing or hiding the tab invalidates timing for that attempt without discarding accuracy. Feedback time is excluded. Comfortable recall initially means six seconds; after 20 valid correct attempts it uses the median of up to 100 stored timings, bounded at 4–10 seconds. Each fact retains its latest 30 attempts, including orientation, accuracy, raw elapsed time, and whether timing was valid.

These intervals and thresholds are starting heuristics, not a validated optimum for every child. Accuracy and later-day retention matter more than speed. Hints support recall; unfamiliar concepts should also be taught using equal groups or arrays.

## Verification

- `npm test`: Node's built-in test runner compiles the pure TypeScript scheduler in a temporary directory and exercises spacing, progression, interruptions, persistence validation, thresholds, and pool exhaustion.
- `npm run build`
- `npm run lint` (the existing RomanGame hook dependency warning remains).
