# Midday Brand Guide

## Brand Idea

Midday is a bright, minimal early-learning app for preschool children. It should feel like a calm game library: playful enough for children to want to tap, simple enough to avoid overstimulation, and polished enough for parents to trust.

The brand promise:

> Education, fun, and cute learning in a calm midday world.

Midday is not a noisy toddler arcade and not a plain school worksheet. It is a modern Duolingo-like library of short games, expressed through soft Microsoft Fluent-style illustration, clear sections, and warm sunshine cues.

## Audience

Primary users:

- Preschool children practicing letters, sounds, tracing, matching, rhythm, logic, and creative play.
- Parents and caregivers who want visible educational value without loud, overstimulating UI.
- Teachers or facilitators who need children to understand the screen quickly.

Child mode should be colorful, touch-friendly, and direct. Parent mode should be warmer than a business dashboard but calmer and more adult than the game library.

## Personality

Midday should feel:

- Bright, not loud.
- Minimal, not empty.
- Playful, not chaotic.
- Cute, not babyish.
- Educational, not academic.
- Functional, not decorative for decoration's sake.
- Polished, not clay-toy or template-like.

## Aesthetic Direction

### Bright Learning Library

The home screen is a library of games organized into real app sections. It should feel like a phone/iPad app, not a web landing page and not a wall of identical cards.

Use the structure of a modern learning game:

- A compact app header.
- A featured "continue" or recommended game.
- Sectioned game groups.
- Clear category filters.
- Adult-facing entry points that feel calmer.

Use restraint:

- Keep the base mostly cream, paper, and ink.
- Use color to identify categories and actions.
- Avoid large decorative ray fields behind everything.
- Avoid repeated floating cards with identical composition.
- Avoid heavy bevels, clay textures, glossy plastic, and deep shadows.

## Logo

Primary logo asset:

- `/public/midday-sun-logo-flat.png`

Legacy logo asset:

- `/public/midday-sun-logo.png`

The logo remains a friendly smiling sun, but the preferred version removes the bevelled app tile and heavy clay texture. The mark should feel closer to Microsoft Fluent illustration: rounded, softly dimensional, clean, and modern.

Logo rules:

- Use the flat logo in headers, app icons, brand guidelines, and install surfaces.
- Keep it on cream, paper, or white.
- Do not add extra facial expressions, objects, rays, stickers, or text.
- Do not place the mark inside additional bevelled containers.
- Keep clear space around the mark.

## Visual Language

Midday should visually align with the existing Fluent SVG icon style:

- Rounded shapes.
- Soft dimensional gradients.
- Friendly but clean expressions.
- Clear silhouettes.
- Minimal shadows.
- No custom animal SVG drawings; animal visuals must come from the existing Fluent emoji/SVG dictionary.

The app can mix sunshine, shapes, letters, and friendly Fluent-style characters, but the screen should never become a busy illustrated scene.

## Color System

Follow a 60/30/10 balance:

- 60% neutral base: cream, paper, soft white.
- 30% ink and supporting structure: text, outlines, section definition.
- 10% bright brand/category accents.

| Token | Hex | Role |
| --- | --- | --- |
| Ink | `#22313F` | Primary text, icons, high-contrast structure |
| Muted Ink | `rgba(34, 49, 63, 0.66)` | Secondary text |
| Cream | `#FFF8E7` | Main app background |
| Paper | `#FFFDF7` | Cards and panels |
| Warm Line | `rgba(34, 49, 63, 0.10)` | Borders and dividers |
| Sun | `#FFB51F` | Primary action, featured game, logo support |
| Deep Sun | `#F08A00` | Pressed states, small emphasis |
| Sky | `#42C7FF` | Sound games and helper accents |
| Teal | `#00A9A5` | Logic and correct states |
| Coral | `#FF6F4F` | Creative play and warm rewards |
| Violet | `#8D6BFF` | Nature/special discovery games |

Rules:

- Yellow is a signal, not a wallpaper.
- Category colors should appear in chips, icon tiles, small dots, and progress accents.
- Large backgrounds should stay calm.
- Do not rotate random colors by card index.
- Do not use purple/blue gradients as the main look.
- Do not use muddy brown shadows.

## Typography

Keep type simple and app-like:

- One primary body family and one rounded display family are enough.
- Use no more than four practical sizes per screen.
- Use weight and opacity for hierarchy before adding more sizes.
- Keep labels short.
- Avoid oversized hero typography on compact app screens.

Current implementation:

- Display: Baloo 2 for the Midday wordmark and child-facing labels.
- Body: Nunito for readable app UI.

## Layout Rules

Midday is mobile-first, with iPad expansion.

Use:

- 8-point spacing rhythm: `8`, `12`, `16`, `24`, `32`, `48`.
- Sections instead of one giant grid.
- Primary actions in easy thumb reach.
- Horizontally calm composition: no dense decorative background competing with content.
- Touch targets at least `44px`.
- Single-column cards on small phones when text needs room.
- Two or three columns only when the viewport can support comfortable spacing.

Avoid:

- Card inside card layouts.
- Large identical card grids as the only structure.
- Instruction panels that repeat what the user can already see.
- Decorative rays behind every tile.
- Buttons and badges that all have the same weight.

## Home Screen Model

The home screen is a library of games.

Recommended order:

1. Header with logo, app name, and parent-safe affordance.
2. Featured "Continue" game.
3. Category filter row.
4. Game sections:
   - Letters & Sounds
   - Logic & Patterns
   - Create & Draw
   - Nature Discovery
5. Bottom navigation for Play, Trophies, and Parent Dashboard.

The screen should answer three questions quickly:

- What can my child play now?
- What kind of learning is this?
- Where do I go as an adult?

## Component Rules

### Game Cards

Game cards should be compact, readable, and section-aware.

Required anatomy:

- Fluent-style icon tile.
- Game name.
- Short subtitle.
- Category or benefit chip.
- Clear tap affordance.

Do not require every card to be the same size. Featured cards can be wider or richer; library cards can be compact.

### Category Chips

Use category chips to filter and label, not as decoration.

Use stable category colors:

| Category | Color | Use |
| --- | --- | --- |
| Literacy | Sun | Letters, tracing, rhyme, phonics matching |
| Sound | Sky | Listening, beginning sounds, syllables |
| Logic | Teal | Sorting, patterns, mazes |
| Creative | Coral | Drawing, mark making, symmetry |
| Nature | Violet | Animals, plants, discovery |

### Parent Areas

Parent-facing screens should be more adult:

- Cleaner panels.
- More restrained color.
- Data and recommendations over characters.
- Same logo, same palette, calmer density.

## Motion

Motion should reduce friction and create small rewards.

Use:

- Short transitions.
- Soft transform and opacity changes.
- Gentle icon float only where it helps.
- Clear success feedback after completing a game.

Avoid:

- Constant bouncing.
- Large background animation.
- Multiple competing animations on the same screen.
- Motion that makes the library feel unstable.

## Voice

Child-facing copy:

- "Pick a game."
- "Try this next."
- "Nice listening."
- "You found the pattern."

Parent-facing copy:

- "Learning snapshot"
- "Recommended focus"
- "Session history"
- "Practice time"

Avoid sugary or exaggerated copy:

- "Mega genius"
- "Epic magic adventure"
- "Super unbelievable"

## Production Checklist

Before shipping a screen:

- The first action is obvious in two seconds.
- Category colors have a job.
- No more than one decorative system is active.
- Text fits on small phones.
- Tap targets are at least `44px`.
- Parent surfaces feel calmer than child game surfaces.
- Animal icons come from the existing Fluent SVG dictionary.
- The screen works at phone and iPad widths.
- It looks like a real app, not a webpage or UI kit sample.
