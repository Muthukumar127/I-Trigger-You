/* ==========================================================================
   "I Trigger You" Synthetic Audio Engine (Web Audio API)
   ========================================================================== */

const AudioSystem = {
    ctx: null,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    musicNode: null,
    sfxNode: null,
    masterNode: null,
    
    // Music loops state
    sequencerId: null,
    isMusicPlaying: false,
    currentTheme: null, // 'main' or 'boss'
    seqStep: 0,

    init() {
        if (this.ctx) return;
        try {
            // Setup Audio Context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            
            // Master gain node
            this.masterNode = this.ctx.createGain();
            this.masterNode.connect(this.ctx.destination);
            
            // Music gain node
            this.musicNode = this.ctx.createGain();
            this.musicNode.gain.value = this.musicVolume;
            this.musicNode.connect(this.masterNode);

            // SFX gain node
            this.sfxNode = this.ctx.createGain();
            this.sfxNode.gain.value = this.sfxVolume;
            this.sfxNode.connect(this.masterNode);
            
        } catch (e) {
            console.warn("Web Audio API not supported in this browser", e);
        }
    },

    resume() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    setMusicVolume(val) {
        this.musicVolume = val;
        if (this.musicNode) {
            this.musicNode.gain.value = this.musicVolume;
        }
    },

    setSfxVolume(val) {
        this.sfxVolume = val;
        if (this.sfxNode) {
            this.sfxNode.gain.value = this.sfxVolume;
        }
    },

    // --- SFX Generators ---

    playJump() {
        this.resume();
        if (!this.ctx) return;

        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        // Sweep frequency up for jump
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(600, time + 0.15);

        gain.gain.setValueAtTime(this.sfxVolume * 0.4, time);
        gain.gain.linearRampToValueAtTime(0.01, time + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination); // Direct destination to bypass master settings if needed, or connect to sfxNode
        gain.connect(this.sfxNode);

        osc.start(time);
        osc.stop(time + 0.16);
    },

    playDash() {
        this.resume();
        if (!this.ctx) return;

        const time = this.ctx.currentTime;
        const duration = 0.15;
        
        // Generate white noise for dash whoosh
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, time);
        filter.frequency.exponentialRampToValueAtTime(3000, time + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxNode);

        noise.start(time);
        noise.stop(time + duration);
    },

    playDeath() {
        this.resume();
        if (!this.ctx) return;

        const time = this.ctx.currentTime;
        
        // 1. Comic sliding note down
        const osc = this.ctx.createOscillator();
        const gainOsc = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, time);
        osc.frequency.linearRampToValueAtTime(40, time + 0.4);
        
        gainOsc.gain.setValueAtTime(this.sfxVolume * 0.3, time);
        gainOsc.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        
        osc.connect(gainOsc);
        gainOsc.connect(this.sfxNode);
        osc.start(time);
        osc.stop(time + 0.4);

        // 2. Comic crash noise
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(300, time);

        const gainNoise = this.ctx.createGain();
        gainNoise.gain.setValueAtTime(this.sfxVolume * 0.6, time);
        gainNoise.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

        noise.connect(noiseFilter);
        noiseFilter.connect(gainNoise);
        gainNoise.connect(this.sfxNode);

        noise.start(time);
        noise.stop(time + 0.3);
    },

    playCoin() {
        this.resume();
        if (!this.ctx) return;

        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Double tone coin sound (retro style)
        osc.frequency.setValueAtTime(987.77, time); // B5
        osc.frequency.setValueAtTime(1318.51, time + 0.08); // E6

        gain.gain.setValueAtTime(this.sfxVolume * 0.3, time);
        gain.gain.setValueAtTime(0.3 * this.sfxVolume, time + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxNode);

        osc.start(time);
        osc.stop(time + 0.35);
    },

    playBombTrigger() {
        this.resume();
        if (!this.ctx) return;
        
        // Fast alarm beeps
        const time = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const beepTime = time + i * 0.12;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, beepTime);
            
            gain.gain.setValueAtTime(this.sfxVolume * 0.25, beepTime);
            gain.gain.linearRampToValueAtTime(0.01, beepTime + 0.08);
            
            osc.connect(gain);
            gain.connect(this.sfxNode);
            osc.start(beepTime);
            osc.stop(beepTime + 0.09);
        }
    },

    playExplosion() {
        this.resume();
        if (!this.ctx) return;

        const time = this.ctx.currentTime;
        const duration = 0.6;
        
        // White noise base
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);
        filter.frequency.exponentialRampToValueAtTime(10, time + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxNode);

        noise.start(time);
        noise.stop(time + duration);
    },

    playTrollLaugh() {
        this.resume();
        if (!this.ctx) return;

        const time = this.ctx.currentTime;
        // Synthesize a silly laughing sound by wobbling pitch
        const pitches = [180, 240, 180, 260, 180, 280, 150];
        const step = 0.08;

        pitches.forEach((freq, idx) => {
            const beepTime = time + idx * step;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, beepTime);
            osc.frequency.linearRampToValueAtTime(freq - 40, beepTime + step);

            gain.gain.setValueAtTime(this.sfxVolume * 0.3, beepTime);
            gain.gain.linearRampToValueAtTime(0.01, beepTime + step);

            osc.connect(gain);
            gain.connect(this.sfxNode);

            osc.start(beepTime);
            osc.stop(beepTime + step);
        });
    },

    playCheckpoint() {
        this.resume();
        if (!this.ctx) return;

        const time = this.ctx.currentTime;
        // Uplifting retro ding
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((note, index) => {
            const noteTime = time + index * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(note, noteTime);

            gain.gain.setValueAtTime(this.sfxVolume * 0.25, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);

            osc.connect(gain);
            gain.connect(this.sfxNode);

            osc.start(noteTime);
            osc.stop(noteTime + 0.22);
        });
    },

    playWin() {
        this.resume();
        if (!this.ctx) return;

        this.stopMusic();

        const time = this.ctx.currentTime;
        // Retro win fanfare
        const notes = [
            { f: 523.25, d: 0.1 },  // C5
            { f: 523.25, d: 0.1 },  // C5
            { f: 523.25, d: 0.1 },  // C5
            { f: 523.25, d: 0.2 },  // C5
            { f: 415.30, d: 0.2 },  // Ab4
            { f: 466.16, d: 0.2 },  // Bb4
            { f: 523.25, d: 0.4 }   // C5
        ];

        let curTime = time;
        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(note.f, curTime);

            gain.gain.setValueAtTime(this.sfxVolume * 0.35, curTime);
            gain.gain.setValueAtTime(this.sfxVolume * 0.35, curTime + note.d - 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, curTime + note.d);

            osc.connect(gain);
            gain.connect(this.sfxNode);

            osc.start(curTime);
            osc.stop(curTime + note.d);
            curTime += note.d;
        });
    },

    playHurt() {
        this.resume();
        if (!this.ctx) return;

        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.linearRampToValueAtTime(60, time + 0.12);

        gain.gain.setValueAtTime(this.sfxVolume * 0.4, time);
        gain.gain.linearRampToValueAtTime(0.01, time + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxNode);

        osc.start(time);
        osc.stop(time + 0.13);
    },

    // --- Procedural Chiptune Music Loops ---

    playMusic(themeName) {
        this.resume();
        if (!this.ctx) return;
        
        if (this.isMusicPlaying && this.currentTheme === themeName) return;

        this.stopMusic();

        this.isMusicPlaying = true;
        this.currentTheme = themeName;
        this.seqStep = 0;

        const tempo = themeName === 'boss' ? 120 : 135; // Steps per minute
        const stepTime = 60 / tempo / 2; // 8th notes

        // Main scheduler loop
        const scheduleNextSteps = () => {
            if (!this.isMusicPlaying) return;
            const lookAhead = 0.2; // schedule 200ms in advance
            const now = this.ctx.currentTime;
            
            // Loop steps
            this.playSequenceStep(themeName, now);
            
            this.sequencerId = setTimeout(() => {
                this.seqStep = (this.seqStep + 1) % 32;
                scheduleNextSteps();
            }, stepTime * 1000);
        };

        scheduleNextSteps();
    },

    stopMusic() {
        this.isMusicPlaying = false;
        if (this.sequencerId) {
            clearTimeout(this.sequencerId);
            this.sequencerId = null;
        }
        this.currentTheme = null;
    },

    playSequenceStep(theme, time) {
        if (!this.ctx || this.musicVolume < 0.01) return;

        // Frequencies mapped to note names (approximate)
        const C3 = 130.81, E3 = 164.81, Eb3 = 155.56, F3 = 174.61, G3 = 196.00, Bb3 = 233.08;
        const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25;
        const G2 = 98.00, Ab2 = 103.83, A2 = 110.00, Bb2 = 116.54;

        if (theme === 'main') {
            // Cheerful, silly chiptune theme
            // Chord progression: C - Am - F - G
            const bassline = [
                C3, C3, G3, C3,  A2, A2, E3, A2,
                F3, F3, C4, F3,  G3, G3, D4, G3
            ];

            const melody = [
                C5,  null, E4,   G4,   C5,  D5,  E5,  null,
                A4,  null, C4,   E4,   A4,  B4,  C5,  null,
                F4,  A4,   C5,   null, A4,  F4,  G4,  B4,
                D5,  null, B4,   G4,   D5,  E5,  C5,  null
            ];

            const step = this.seqStep % 32;
            const bassStep = this.seqStep % 16;

            // 1. Play Bass note on every odd step
            if (step % 2 === 0) {
                this.playSynthNote('sawtooth', bassline[bassStep], 0.2, this.musicVolume * 0.18, time);
            }

            // 2. Play Melody note
            const melFreq = melody[step];
            if (melFreq) {
                // Alternates triangle and pulse-like square waves for retro style
                const type = step % 4 < 2 ? 'triangle' : 'sine';
                this.playSynthNote(type, melFreq, 0.15, this.musicVolume * 0.25, time);
            }

            // 3. Simple drum beat (Hi-hat/Kick)
            if (step % 4 === 0) {
                // Kick drum (pitch drop)
                this.playSynthNote('sine', 120, 0.08, this.musicVolume * 0.35, time, 40);
            } else if (step % 4 === 2) {
                // Snare/Hat noise burst
                this.playSynthNoise(0.04, this.musicVolume * 0.15, time);
            }

        } else if (theme === 'boss') {
            // Aggressive, tense minor key theme
            const Eb5 = 622.25, D5 = 587.33, F5 = 698.46, G5 = 783.99, Bb4 = 466.16, Ab5 = 830.61, B4 = 493.88;

            const bassline = [
                C3, C3, C3, Eb3, F3, F3, F3, Bb3,
                C3, C3, C3, Eb3, F3, F3, G3, G3
            ];

            const melody = [
                C5,  C5,  null, Eb5, D5,  C5,  null, Bb4,
                C5,  null, Eb5, F5,  G5,  null, null, null,
                F5,  F5,  null, Ab5, G5,  F5,  null, Eb5,
                D5,  D5,  Eb5,  D5,  C5,  B4,   C5,  null
            ];

            const step = this.seqStep % 32;
            const bassStep = this.seqStep % 16;

            // Fast heavy bass
            this.playSynthNote('sawtooth', bassline[bassStep], 0.12, this.musicVolume * 0.22, time);

            // Melody
            const melFreq = melody[step];
            if (melFreq) {
                this.playSynthNote('square', melFreq, 0.1, this.musicVolume * 0.25, time);
            }

            // Heavy drum loop
            if (step % 8 === 0 || step % 8 === 3) {
                // Double kick
                this.playSynthNote('sine', 150, 0.08, this.musicVolume * 0.4, time, 30);
            } else if (step % 8 === 4) {
                // Snare noise
                this.playSynthNoise(0.08, this.musicVolume * 0.3, time);
            }
        }
    },

    playSynthNote(type, freq, duration, vol, time, endFreq = null) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        
        if (endFreq) {
            osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);
        }

        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.musicNode);

        osc.start(time);
        osc.stop(time + duration);
    },

    playSynthNoise(duration, vol, time) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicNode);

        noise.start(time);
        noise.stop(time + duration);
    }
};

window.AudioSystem = AudioSystem;
