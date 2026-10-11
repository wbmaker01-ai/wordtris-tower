# Wordtris Tower (워드트리스 타워) Design Specification

## 1. Overview
Wordtris Tower is an educational word-building puzzle web application fusing Tetris physics with vocabulary creation. Falling letter blocks (Korean Jamo or English Alphabets) are stacked in a 6x12 grid tower. Formed words trigger particle explosions, score multipliers, Web Speech API TTS audio pronunciations, and automatic archiving in a personal Wordbook modal.

---

## 2. Core Architecture & Modules

### 2.1 File Structure
`d:\Antigravity\wordtris-tower\`
- [`index.html`](file:///d:/Antigravity/wordtris-tower/index.html): Semantic HTML5 layout, canvas element, glassmorphic HUD overlay, Wordbook modal, control buttons.
- [`style.css`](file:///d:/Antigravity/wordtris-tower/style.css): Glassmorphic Library design system, CSS custom properties, responsive canvas container, animations, typography.
- [`js/trie.js`](file:///d:/Antigravity/wordtris-tower/js/trie.js): `TrieNode` & `TrieDictionary` data structures containing ~3,000 Korean elementary words and ~1,500 English elementary words with fast prefix and exact match capabilities.
- [`js/audio.js`](file:///d:/Antigravity/wordtris-tower/js/audio.js): `SoundSynth` utilizing Web Audio API for synthesized retro/modern game SFX (place, move, pop, fanfare) & Web Speech API (`SpeechSynthesis`) for TTS pronunciation.
- [`js/wordbook.js`](file:///d:/Antigravity/wordtris-tower/js/wordbook.js): `Wordbook` manager maintaining discovered vocabulary, definitions, search filtering, and `localStorage` state.
- [`js/engine.js`](file:///d:/Antigravity/wordtris-tower/js/engine.js): `WordtrisEngine` managing 6x12 grid physics, Hangul Jamo composition engine (`0xAC00 + (initial * 21 + medial) * 28 + final`), word scanner algorithm, particle system, and gravity chain combos.
- [`js/main.js`](file:///d:/Antigravity/wordtris-tower/js/main.js): App bootstrap, `requestAnimationFrame` game loop, event listeners, language mode toggle (`KR` / `EN`).

---

## 3. Detailed Components & Logic Specs

### 3.1 Hangul & English Letter Generator
- **Korean Mode**: Randomly drops Consonants (ㄱ..ㅎ) and Vowels (ㅏ..ㅣ). Weights tuned so vowels appear ~42% of the time to ensure word formation possibility. Adjacent consonant-vowel combinations in grid dynamically compose printable Korean syllables (e.g., ㄱ + ㅏ = 가, 가 + ㄴ = 간).
- **English Mode**: Drops letter tiles A-Z. Vowels (A, E, I, O, U) spawn at ~40% frequency.

### 3.2 Dictionary & Trie Search Engine
- Built-in comprehensive elementary dictionary dataset.
- Supports substring/contiguous word matching across rows (Left-to-Right) and columns (Top-to-Bottom).
- Scans contiguous sequences of length 2 to 6. Matches of length 3+ award bonus score multipliers.

### 3.3 Word Explosion & Gravity Chain Combo
- When a valid word is found:
  1. Highlight cells with glowing gold borders and neon flash.
  2. Spawn particle sparkles radiating outward from word center.
  3. Play synthesized explosion audio + TTS voice reading the word.
  4. Clear matched cells and drop upper blocks vertically (Gravity step).
  5. Check if newly dropped arrangement creates new words (Chain Combo x2, x3...).

### 3.4 User Interface & Glassmorphic Aesthetic
- **Theme**: Sleek Dark Library (`#0A0E1A` background, `#161E2E` glass panels, `#FFC107` gold accents).
- **HUD Elements**: Score display, High Score, Current Combo Counter, Language Switcher (한글 🇰🇷 / 영어 🇺🇸), Wordbook Trigger Button, Reroll Skill Button.
- **Controls**: Arrow keys / On-screen D-pad (`←` Left, `→` Right, `↓` Soft Drop, `Space` Hard Drop, `R` Reroll Block).

---

## 4. Verification & Testing Plan

### 4.1 Functional Testing
- **Trie Match Accuracy**: Verify words like "사과", "학교", "APPLE", "BOOK" trigger instant explosions when letters align.
- **Hangul Composition**: Test consonant + vowel joining logic (e.g., ㄱ + ㅏ + ㄴ = 간, ㄱ + ㅗ + ㄷ + ㅏ + ㅇ + ㄱ + ㅣ = 고양이).
- **Chain Combo Verification**: Set up test blocks to confirm gravity drops trigger consecutive combos correctly.
- **TTS Audio & Wordbook**: Test Web Speech API voice playback in both Korean (`ko-KR`) and English (`en-US`). Verify Wordbook saves state across browser refreshes.

### 4.2 Visual & Responsive Testing
- Verify Canvas scales crisply on desktop monitors and mobile screen widths.
- Ensure glassmorphic panels render smoothly without lag during high-particle explosions.
