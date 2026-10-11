/**
 * Wordtris Tower - Audio Synthesizer & Web Speech API TTS
 * Generates Web Audio API procedural SFX without requiring external audio assets,
 * and provides TTS voice pronunciation using SpeechSynthesis.
 */

class SoundSynth {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.ttsEnabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playTone(freq, type, duration, startVol = 0.15, endVol = 0.001) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(endVol, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn('Audio play error:', e);
        }
    }

    playMove() {
        this.playTone(320, 'sine', 0.06, 0.08);
    }

    playDrop() {
        this.playTone(140, 'triangle', 0.12, 0.2);
    }

    playReroll() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(now + 0.2);
    }

    playExplode() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 Major Chord

        chord.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'sine', 0.25, 0.12);
            }, idx * 40);
        });
    }

    playCombo(comboCount = 1) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const baseFreq = 523.25 * Math.min(2.0, 1.0 + (comboCount * 0.15));
        this.playTone(baseFreq, 'triangle', 0.35, 0.25);
    }

    playGameOver() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [400, 350, 300, 220];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'sawtooth', 0.3, 0.15);
            }, idx * 100);
        });
    }

    speakWord(word, lang = 'kr') {
        if (this.muted || !this.ttsEnabled) return;
        if (!('speechSynthesis' in window)) return;

        try {
            window.speechSynthesis.cancel(); // stop current speaking
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = (lang === 'kr') ? 'ko-KR' : 'en-US';
            utterance.rate = 0.95;
            utterance.pitch = 1.05;
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('TTS error:', e);
        }
    }
}
