/**
 * Wordtris Tower - Main Bootstrap & Application Controller
 * Wires DOM events, canvas rendering loop, controls, tutorial steps, and guide modals.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Core Component Instances
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    // Adjust canvas inner resolution for Crisp rendering
    function resizeCanvas() {
        const wrapper = canvas.parentElement;
        if (wrapper) {
            const rect = wrapper.getBoundingClientRect();
            canvas.width = rect.width * (window.devicePixelRatio || 1);
            canvas.height = rect.height * (window.devicePixelRatio || 1);
        }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const dictionary = new TrieDictionary();
    const audio = new SoundSynth();
    const wordbook = new Wordbook();
    const engine = new WordtrisEngine(canvas, dictionary, audio, wordbook);

    // 2. Initialize Game State
    engine.startNewGame();
    wordbook.updateBadge();

    // 3. Tutorial Manager
    let currentTutorialStep = 1;
    const totalTutorialSteps = 4;
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const stepDots = document.querySelectorAll('.step-dot');
    const stepContents = document.querySelectorAll('.tutorial-step-content');
    const btnTutorialNext = document.getElementById('btn-tutorial-next');
    const btnTutorialSkip = document.getElementById('btn-tutorial-skip');

    function showTutorialStep(step) {
        currentTutorialStep = step;
        stepDots.forEach(dot => {
            if (parseInt(dot.dataset.step, 10) === step) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        stepContents.forEach(content => {
            if (parseInt(content.dataset.step, 10) === step) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });

        if (btnTutorialNext) {
            btnTutorialNext.textContent = (step === totalTutorialSteps) ? '🚀 게임 시작!' : '다음 ▶';
        }
    }

    function openTutorial() {
        engine.isPaused = true;
        showTutorialStep(1);
        if (tutorialOverlay) tutorialOverlay.classList.remove('hidden');
    }

    function closeTutorial() {
        if (tutorialOverlay) tutorialOverlay.classList.add('hidden');
        engine.isPaused = false;
        try {
            localStorage.setItem('wordtris_tutorial_seen', 'true');
        } catch (e) {}
    }

    // First time visitor check
    const seenTutorial = localStorage.getItem('wordtris_tutorial_seen');
    if (!seenTutorial) {
        openTutorial();
    }

    if (btnTutorialNext) {
        btnTutorialNext.addEventListener('click', () => {
            audio.init();
            if (currentTutorialStep < totalTutorialSteps) {
                showTutorialStep(currentTutorialStep + 1);
            } else {
                closeTutorial();
            }
        });
    }

    if (btnTutorialSkip) {
        btnTutorialSkip.addEventListener('click', () => {
            audio.init();
            closeTutorial();
        });
    }

    // 4. Guide Modal (❓ 게임 방법)
    const btnGuide = document.getElementById('btn-guide');
    const guideModal = document.getElementById('guide-modal');
    const btnCloseGuide = document.getElementById('btn-close-guide');
    const btnCloseGuideConfirm = document.getElementById('btn-close-guide-confirm');
    const btnRestartTutorial = document.getElementById('btn-restart-tutorial');

    if (btnGuide && guideModal) {
        btnGuide.addEventListener('click', () => {
            audio.init();
            engine.isPaused = true;
            guideModal.classList.remove('hidden');
        });
    }

    function closeGuideModal() {
        if (guideModal) guideModal.classList.add('hidden');
        engine.isPaused = false;
    }

    if (btnCloseGuide) btnCloseGuide.addEventListener('click', closeGuideModal);
    if (btnCloseGuideConfirm) btnCloseGuideConfirm.addEventListener('click', closeGuideModal);

    if (btnRestartTutorial) {
        btnRestartTutorial.addEventListener('click', () => {
            closeGuideModal();
            openTutorial();
        });
    }

    // 5. Game Animation Loop
    function gameLoop(timestamp) {
        engine.update(timestamp);
        engine.render();
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);

    // 6. Keyboard Controls
    window.addEventListener('keydown', (e) => {
        audio.init();

        if (engine.isGameOver) return;

        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                engine.moveLeft();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                engine.moveRight();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                engine.softDrop();
                break;
            case ' ':
                e.preventDefault();
                engine.hardDrop();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                engine.rerollBlock();
                break;
            case 'p':
            case 'P':
            case 'Escape':
                e.preventDefault();
                togglePause();
                break;
        }
    });

    function togglePause() {
        engine.isPaused = !engine.isPaused;
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            if (engine.isPaused) {
                pauseOverlay.classList.remove('hidden');
            } else {
                pauseOverlay.classList.add('hidden');
            }
        }
    }

    // 7. Header Control Buttons
    const btnLangToggle = document.getElementById('btn-lang-toggle');
    const langFlag = document.getElementById('lang-flag');
    const langLabel = document.getElementById('lang-label');

    if (btnLangToggle) {
        btnLangToggle.addEventListener('click', () => {
            audio.init();
            const newMode = (engine.langMode === 'kr') ? 'en' : 'kr';
            engine.setLanguageMode(newMode);

            if (newMode === 'kr') {
                if (langFlag) langFlag.textContent = '🇰🇷';
                if (langLabel) langLabel.textContent = '한글 모드';
            } else {
                if (langFlag) langFlag.textContent = '🇺🇸';
                if (langLabel) langLabel.textContent = '영어 모드';
            }
            engine.startNewGame();
        });
    }

    const btnSoundToggle = document.getElementById('btn-sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    if (btnSoundToggle) {
        btnSoundToggle.addEventListener('click', () => {
            const isMuted = audio.toggleMute();
            if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
        });
    }

    const btnReroll = document.getElementById('btn-reroll');
    if (btnReroll) {
        btnReroll.addEventListener('click', () => {
            audio.init();
            engine.rerollBlock();
        });
    }

    // 8. Wordbook Modal Handlers
    const btnWordbook = document.getElementById('btn-wordbook');
    const wordbookModal = document.getElementById('wordbook-modal');
    const btnCloseWordbook = document.getElementById('btn-close-wordbook');
    const wordbookSearchInput = document.getElementById('wordbook-search');
    const filterTabBtns = document.querySelectorAll('.tab-btn');

    let currentFilter = 'all';

    if (btnWordbook && wordbookModal) {
        btnWordbook.addEventListener('click', () => {
            engine.isPaused = true;
            wordbookModal.classList.remove('hidden');
            wordbook.renderModal(audio, wordbookSearchInput ? wordbookSearchInput.value : '', currentFilter);
        });
    }

    if (btnCloseWordbook && wordbookModal) {
        btnCloseWordbook.addEventListener('click', () => {
            wordbookModal.classList.add('hidden');
            engine.isPaused = false;
        });
    }

    if (wordbookSearchInput) {
        wordbookSearchInput.addEventListener('input', (e) => {
            wordbook.renderModal(audio, e.target.value, currentFilter);
        });
    }

    filterTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter || 'all';
            wordbook.renderModal(audio, wordbookSearchInput ? wordbookSearchInput.value : '', currentFilter);
        });
    });

    // 9. Restart Game Over Button
    const btnRestart = document.getElementById('btn-restart');
    const gameOverModal = document.getElementById('game-over-modal');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            if (gameOverModal) gameOverModal.classList.add('hidden');
            engine.startNewGame();
        });
    }

    // 10. Mobile Touch Pad Controls
    const btnTouchLeft = document.getElementById('btn-touch-left');
    const btnTouchRight = document.getElementById('btn-touch-right');
    const btnTouchDown = document.getElementById('btn-touch-down');
    const btnTouchDrop = document.getElementById('btn-touch-drop');
    const btnTouchReroll = document.getElementById('btn-touch-reroll');

    if (btnTouchLeft) btnTouchLeft.addEventListener('click', () => { audio.init(); engine.moveLeft(); });
    if (btnTouchRight) btnTouchRight.addEventListener('click', () => { audio.init(); engine.moveRight(); });
    if (btnTouchDown) btnTouchDown.addEventListener('click', () => { audio.init(); engine.softDrop(); });
    if (btnTouchDrop) btnTouchDrop.addEventListener('click', () => { audio.init(); engine.hardDrop(); });
    if (btnTouchReroll) btnTouchReroll.addEventListener('click', () => { audio.init(); engine.rerollBlock(); });
});
