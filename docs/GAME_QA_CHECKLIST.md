# Midday Game QA Checklist

Use this checklist before shipping a new game or a visual pass on an existing game.

## Shell

- One visible back control: the shared shell back button.
- Shell title matches the activity name in the game library.
- Shell instruction says what to do first in one short sentence.
- Replay audio, when present, repeats only the instruction and does not duplicate speech.
- No old in-game header, back button, or menu button competes with the shell.

## Layout

- Works at phone width, small tablet width, and desktop preview width.
- Primary play target stays visible without accidental page scroll.
- Text does not overlap icons, shadows, controls, or success panels.
- Tap targets are at least 44px high/wide.
- Game progress/status uses the sunshine brand rhythm: soft paper, warm yellow accent, calm blue/teal support.

## Phonics And Audio

- Speech uses phoneme cues, not letter names: `T` is `tuh`, not `tee`.
- One prompt plays per user action.
- Wrong-answer feedback says the target sound once and does not auto-loop.
- Correct-answer feedback names the object and sound once.
- Object pronunciation buttons say object names only.

## Visual Assets

- Animal icons come from `src/lib/svgDictionary.tsx` Fluent-style vocabulary, never new custom SVG drawings.
- Icons use the existing Fluent/SVG style and avoid mixed illustration systems.
- Cards and buttons avoid heavy bevels; use light shadows and clear depth.
- No decorative element blocks interaction or reduces readability.

## Success State

- Success state uses the shared Midday success treatment.
- CTA text is concrete: `Next Level`, `Play Again`, `Done Playing`.
- Confetti or celebration effects do not hide controls.
- Completion saves progress once.

## Regression Smoke Test

- Open every game from the library.
- Confirm one shared back button.
- Tap replay audio.
- Complete or simulate one correct and one wrong answer.
- Return to the library and open another game.
