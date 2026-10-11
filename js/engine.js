/**
 * Wordtris Tower - Game Engine & Physics
 * Controls 6x12 matrix, block falling, Hangul composition, word matching, particle explosions, and chain combos.
 */

class WordtrisEngine {
    constructor(canvas, dictionary, audio, wordbook) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dictionary = dictionary;
        this.audio = audio;
        this.wordbook = wordbook;

        // Board dimensions
        this.COLS = 6;
        this.ROWS = 12;

        // Language & State
        this.langMode = 'kr'; // 'kr' or 'en'
        this.score = 0;
        this.highScore = 0;
        this.wordsFormed = 0;
        this.combo = 1;
        this.rerollsLeft = 3;
        this.isGameOver = false;
        this.isPaused = false;

        // Grid matrix [row][col]
        this.grid = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(null));

        // Active Falling Block & Next Block
        this.activeBlock = null;
        this.nextBlock = null;

        // Timing & Speed
        this.lastDropTime = 0;
        this.dropInterval = 800; // ms
        this.particles = [];

        // Hangul Jamo Maps
        this.KR_CONSONANTS = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
        this.KR_VOWELS = ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ'];
        this.EN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        this.EN_VOWELS = ['A','E','I','O','U'];

        this.initColors();
        this.loadHighScore();
    }

    initColors() {
        this.colors = {
            consonant: { bg: '#FF9800', border: '#FFB300', glow: 'rgba(255,179,0,0.6)', text: '#000' },
            vowel: { bg: '#00E5FF', border: '#80D8FF', glow: 'rgba(0,229,255,0.6)', text: '#000' },
            english: { bg: '#E91E63', border: '#FF4081', glow: 'rgba(255,64,129,0.6)', text: '#FFF' },
            englishVowel: { bg: '#00E676', border: '#69F0AE', glow: 'rgba(0,230,118,0.6)', text: '#000' },
            matched: { bg: '#F5C518', border: '#FFF', glow: 'rgba(245,197,24,0.9)', text: '#000' }
        };
    }

    loadHighScore() {
        try {
            const saved = localStorage.getItem('wordtris_highscore');
            if (saved) this.highScore = parseInt(saved, 10) || 0;
        } catch (e) {}
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            try {
                localStorage.setItem('wordtris_highscore', this.highScore.toString());
            } catch (e) {}
        }
    }

    setLanguageMode(mode) {
        this.langMode = mode;
        this.nextBlock = this.generateRandomBlock();
        this.updateNextPreview();
    }

    startNewGame() {
        this.grid = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(null));
        this.score = 0;
        this.wordsFormed = 0;
        this.combo = 1;
        this.rerollsLeft = 3;
        this.dropInterval = 800;
        this.isGameOver = false;
        this.isPaused = false;
        this.particles = [];

        this.nextBlock = this.generateRandomBlock();
        this.spawnBlock();
        this.updateUI();
    }

    generateRandomBlock() {
        if (this.langMode === 'kr') {
            const isVowel = Math.random() < 0.42;
            const pool = isVowel ? this.KR_VOWELS : this.KR_CONSONANTS;
            const char = pool[Math.floor(Math.random() * pool.length)];
            return {
                char: char,
                type: isVowel ? 'vowel' : 'consonant',
                style: isVowel ? this.colors.vowel : this.colors.consonant
            };
        } else {
            const isVowel = Math.random() < 0.38;
            const char = isVowel
                ? this.EN_VOWELS[Math.floor(Math.random() * this.EN_VOWELS.length)]
                : this.EN_LETTERS[Math.floor(Math.random() * this.EN_LETTERS.length)];
            return {
                char: char,
                type: isVowel ? 'englishVowel' : 'english',
                style: isVowel ? this.colors.englishVowel : this.colors.english
            };
        }
    }

    spawnBlock() {
        if (this.isGameOver) return;
        this.activeBlock = {
            col: 2, // Center col in 6-col grid
            row: 0,
            ...this.nextBlock
        };
        this.nextBlock = this.generateRandomBlock();
        this.updateNextPreview();

        // Check if spawn position is blocked (Game Over)
        if (this.grid[0][2] !== null) {
            this.triggerGameOver();
        }
    }

    updateNextPreview() {
        const previewEl = document.getElementById('next-letter-display');
        if (previewEl && this.nextBlock) {
            previewEl.textContent = this.nextBlock.char;
            previewEl.style.color = this.nextBlock.style.bg;
        }
    }

    moveLeft() {
        if (!this.canMove(this.activeBlock, -1, 0)) return;
        this.activeBlock.col -= 1;
        this.audio.playMove();
    }

    moveRight() {
        if (!this.canMove(this.activeBlock, 1, 0)) return;
        this.activeBlock.col += 1;
        this.audio.playMove();
    }

    softDrop() {
        if (this.canMove(this.activeBlock, 0, 1)) {
            this.activeBlock.row += 1;
            this.score += 1;
            this.updateUI();
            return true;
        } else {
            this.lockBlock();
            return false;
        }
    }

    hardDrop() {
        if (!this.activeBlock || this.isGameOver) return;
        let dropDistance = 0;
        while (this.canMove(this.activeBlock, 0, 1)) {
            this.activeBlock.row += 1;
            dropDistance++;
        }
        this.score += dropDistance * 2;
        this.audio.playDrop();
        this.lockBlock();
    }

    rerollBlock() {
        if (this.rerollsLeft <= 0 || !this.activeBlock || this.isGameOver) return;
        this.rerollsLeft--;
        this.activeBlock = {
            col: this.activeBlock.col,
            row: this.activeBlock.row,
            ...this.generateRandomBlock()
        };
        this.audio.playReroll();
        this.updateUI();
    }

    canMove(block, dc, dr) {
        if (!block) return false;
        const nc = block.col + dc;
        const nr = block.row + dr;

        if (nc < 0 || nc >= this.COLS || nr >= this.ROWS) return false;
        if (nr >= 0 && this.grid[nr][nc] !== null) return false;
        return true;
    }

    lockBlock() {
        const { row, col, char, type, style } = this.activeBlock;
        this.grid[row][col] = {
            char,
            type,
            style,
            glow: false
        };
        this.activeBlock = null;

        // Perform Hangul combination & word scan
        this.processGridState();
    }

    processGridState() {
        this.applyHangulCombinations();
        const foundWords = this.scanAndClearWords();

        if (foundWords.length > 0) {
            // Speed up slightly as score increases
            this.dropInterval = Math.max(300, 800 - Math.floor(this.score / 500) * 40);
        } else {
            this.combo = 1;
            this.updateUI();
            this.spawnBlock();
        }
    }

    /**
     * Combines adjacent consonant + vowel + optional consonant into valid Hangul Syllables.
     */
    applyHangulCombinations() {
        if (this.langMode !== 'kr') return;

        const choMap = { 'ㄱ':0,'ㄲ':1,'ㄴ':2,'ㄷ':3,'ㄸ':4,'ㄹ':5,'ㅁ':6,'ㅂ':7,'ㅃ':8,'ㅅ':9,'ㅆ':10,'ㅇ':11,'ㅈ':12,'ㅉ':13,'ㅊ':14,'ㅋ':15,'ㅌ':16,'ㅍ':17,'ㅎ':18 };
        const jungMap = { 'ㅏ':0,'ㅐ':1,'ㅑ':2,'ㅒ':3,'ㅓ':4,'ㅔ':5,'ㅕ':6,'ㅖ':7,'ㅗ':8,'ㅘ':9,'ㅙ':10,'ㅚ':11,'ㅛ':12,'ㅜ':13,'ㅝ':14,'ㅞ':15,'ㅟ':16,'ㅠ':17,'ㅡ':18,'ㅢ':19,'ㅣ':20 };
        const jongMap = { '':0,'ㄱ':1,'ㄲ':2,'ㄳ':3,'ㄴ':4,'ㄵ':5,'ㄶ':6,'ㄷ':7,'ㄹ':8,'ㄺ':9,'ㄻ':10,'ㄼ':11,'ㄽ':12,'ㄾ':13,'ㄿ':14,'ㅀ':15,'ㅁ':16,'ㅂ':17,'ㅄ':18,'ㅅ':19,'ㅆ':20,'ㅇ':21,'ㅈ':22,'ㅊ':23,'ㅋ':24,'ㅌ':25,'ㅍ':26,'ㅎ':27 };

        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS - 1; c++) {
                const cell1 = this.grid[r][c];
                const cell2 = this.grid[r][c+1];

                if (cell1 && cell2 && cell1.type === 'consonant' && cell2.type === 'vowel') {
                    const choIdx = choMap[cell1.char];
                    const jungIdx = jungMap[cell2.char];

                    if (choIdx !== undefined && jungIdx !== undefined) {
                        let jongIdx = 0;
                        let usedThird = false;

                        // Check 3rd cell for final consonant
                        if (c + 2 < this.COLS) {
                            const cell3 = this.grid[r][c+2];
                            if (cell3 && cell3.type === 'consonant' && jongMap[cell3.char] !== undefined) {
                                jongIdx = jongMap[cell3.char];
                                usedThird = true;
                            }
                        }

                        const unicodeVal = 0xAC00 + (choIdx * 21 + jungIdx) * 28 + jongIdx;
                        const syllable = String.fromCharCode(unicodeVal);

                        this.grid[r][c] = {
                            char: syllable,
                            type: 'syllable',
                            style: this.colors.matched,
                            glow: true
                        };
                        this.grid[r][c+1] = null;
                        if (usedThird) this.grid[r][c+2] = null;

                        this.applyGravity();
                    }
                }
            }
        }
    }

    scanAndClearWords() {
        const matchedCells = new Set();
        const foundWords = [];

        // 1. Scan horizontal rows
        for (let r = 0; r < this.ROWS; r++) {
            const rowChars = [];
            for (let c = 0; c < this.COLS; c++) {
                rowChars.push(this.grid[r][c] ? this.grid[r][c].char : '');
            }
            const matches = this.dictionary.scanContiguousWords(rowChars);
            matches.forEach(m => {
                foundWords.push(m);
                for (let c = m.startIndex; c <= m.endIndex; c++) {
                    matchedCells.add(`${r},${c}`);
                }
            });
        }

        // 2. Scan vertical columns
        for (let c = 0; c < this.COLS; c++) {
            const colChars = [];
            for (let r = 0; r < this.ROWS; r++) {
                colChars.push(this.grid[r][c] ? this.grid[r][c].char : '');
            }
            const matches = this.dictionary.scanContiguousWords(colChars);
            matches.forEach(m => {
                foundWords.push(m);
                for (let r = m.startIndex; r <= m.endIndex; r++) {
                    matchedCells.add(`${r},${c}`);
                }
            });
        }

        if (foundWords.length > 0) {
            // Process matched words
            foundWords.forEach(w => {
                this.wordsFormed++;
                this.wordbook.addWord(w.word, w.meaning, w.lang);
                this.audio.speakWord(w.word, w.lang);

                // Update recent match UI
                const textEl = document.querySelector('.recent-word-text');
                const meanEl = document.querySelector('.recent-word-meaning');
                if (textEl && meanEl) {
                    textEl.textContent = w.word;
                    meanEl.textContent = w.meaning;
                }
            });

            // Score calculation
            const points = matchedCells.size * 150 * this.combo;
            this.score += points;
            this.saveHighScore();

            // Audio & Particle FX
            this.audio.playExplode();
            if (this.combo > 1) this.audio.playCombo(this.combo);

            matchedCells.forEach(key => {
                const [r, c] = key.split(',').map(Number);
                this.createParticlesAtCell(r, c);
                this.grid[r][c] = null;
            });

            this.applyGravity();

            // Increment combo and check chain reactions
            this.combo++;
            this.updateUI();

            setTimeout(() => {
                this.scanAndClearWords();
            }, 350);

        }

        return foundWords;
    }

    applyGravity() {
        for (let c = 0; c < this.COLS; c++) {
            let writeRow = this.ROWS - 1;
            for (let r = this.ROWS - 1; r >= 0; r--) {
                if (this.grid[r][c] !== null) {
                    if (writeRow !== r) {
                        this.grid[writeRow][c] = this.grid[r][c];
                        this.grid[r][c] = null;
                    }
                    writeRow--;
                }
            }
        }
    }

    createParticlesAtCell(r, c) {
        const cellSize = this.canvas.height / this.ROWS;
        const centerX = c * cellSize + cellSize / 2;
        const centerY = r * cellSize + cellSize / 2;

        for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 3,
                color: (i % 2 === 0) ? '#F5C518' : '#00E5FF',
                alpha: 1.0,
                life: 1.0
            });
        }
    }

    triggerGameOver() {
        this.isGameOver = true;
        this.saveHighScore();
        this.audio.playGameOver();

        const gameOverModal = document.getElementById('game-over-modal');
        const finalScoreEl = document.getElementById('final-score');
        const finalWordsEl = document.getElementById('final-words-count');
        const finalComboEl = document.getElementById('final-max-combo');

        if (gameOverModal) gameOverModal.classList.remove('hidden');
        if (finalScoreEl) finalScoreEl.textContent = this.score.toLocaleString();
        if (finalWordsEl) finalWordsEl.textContent = `${this.wordsFormed}개`;
        if (finalComboEl) finalComboEl.textContent = `x${this.combo}`;
    }

    updateUI() {
        const scoreEl = document.getElementById('score-display');
        const highScoreEl = document.getElementById('high-score-display');
        const wordsEl = document.getElementById('words-count-display');
        const comboEl = document.getElementById('combo-display');
        const rerollEl = document.getElementById('reroll-count-display');

        if (scoreEl) scoreEl.textContent = this.score.toLocaleString();
        if (highScoreEl) highScoreEl.textContent = this.highScore.toLocaleString();
        if (wordsEl) wordsEl.textContent = this.wordsFormed;
        if (comboEl) comboEl.textContent = `x${this.combo}`;
        if (rerollEl) rerollEl.textContent = `남은 횟수: ${this.rerollsLeft}`;
    }

    update(timestamp) {
        if (this.isGameOver || this.isPaused) return;

        if (!this.lastDropTime) this.lastDropTime = timestamp;
        if (timestamp - this.lastDropTime > this.dropInterval) {
            this.softDrop();
            this.lastDropTime = timestamp;
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.03;
            p.size *= 0.96;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);

        const cellSize = height / this.ROWS;

        // Draw grid background lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let c = 0; c <= this.COLS; c++) {
            this.ctx.beginPath();
            this.ctx.moveTo(c * cellSize, 0);
            this.ctx.lineTo(c * cellSize, height);
            this.ctx.stroke();
        }
        for (let r = 0; r <= this.ROWS; r++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, r * cellSize);
            this.ctx.lineTo(width, r * cellSize);
            this.ctx.stroke();
        }

        // Draw settled blocks in grid
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const cell = this.grid[r][c];
                if (cell) {
                    this.drawBlock(c * cellSize, r * cellSize, cellSize, cell.char, cell.style, cell.glow);
                }
            }
        }

        // Draw active falling block
        if (this.activeBlock) {
            const { col, row, char, style } = this.activeBlock;
            this.drawBlock(col * cellSize, row * cellSize, cellSize, char, style, true);
        }

        // Draw particle explosion FX
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawBlock(x, y, size, char, style, glow = false) {
        const padding = 3;
        const bx = x + padding;
        const by = y + padding;
        const bSize = size - padding * 2;
        const radius = 8;

        this.ctx.save();

        if (glow) {
            this.ctx.shadowColor = style.glow || style.bg;
            this.ctx.shadowBlur = 12;
        }

        // Block background
        this.ctx.fillStyle = style.bg;
        this.ctx.beginPath();
        this.ctx.roundRect(bx, by, bSize, bSize, radius);
        this.ctx.fill();

        // Border highlight
        this.ctx.strokeStyle = style.border;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Text character
        this.ctx.fillStyle = style.text || '#000';
        this.ctx.font = `900 ${Math.floor(size * 0.55)}px "Outfit", "Noto Sans KR", sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(char, bx + bSize / 2, by + bSize / 2 + 2);

        this.ctx.restore();
    }
}
