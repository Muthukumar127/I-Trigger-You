/* ==========================================================================
   "I Trigger You" UI Management, Save States, & Achievements System
   ========================================================================== */

const GameUI = {
    // Achievements List Definition
    achievements: [
        { id: 'die_10', title: 'Novice Rager', desc: 'Die 10 times.', icon: '💀' },
        { id: 'die_100', title: 'Unstoppable Rage', desc: 'Die 100 times.', icon: '🌋' },
        { id: 'trust_nobody', title: 'Trust Nobody', desc: 'Trigger a fake block or fake checkpoint.', icon: '🤡' },
        { id: 'speedrun', title: 'Speed Runner', desc: 'Complete the game in under 10 minutes.', icon: '🏃' },
        { id: 'rage_max', title: 'Trigger Master', desc: 'Max out the Rage Meter.', icon: '🔥' },
        { id: 'fake_winner', title: 'Fake Winner', desc: 'Fall for the fake Level Complete trap.', icon: '🏆' },
        { id: 'never_give_up', title: 'Never Give Up', desc: 'Reach the forbidden Level 101.', icon: '🦁' }
    ],

    deathMessages: [
        "Nice Try!", "Got You!", "Again?", "Too Slow!", "Trust Nobody!",
        "I Triggered You!", "Almost!", "Better Luck Next Time!"
    ],

    unlockedAchievements: [],
    maxUnlockedLevel: 1,

    init() {
        this.loadSaveData();
        this.setupEventListeners();
        this.generateLevelGrid();
        this.renderAchievementsList();

        // Listen for document fullscreen state changes to synchronize HUD button and Settings checkbox
        document.addEventListener('fullscreenchange', () => {
            const isFS = !!document.fullscreenElement;
            const check = document.getElementById('check-fullscreen');
            if (check) check.checked = isFS;
            const btn = document.getElementById('hud-fullscreen-btn');
            if (btn) {
                btn.textContent = isFS ? '🗗' : '⛶';
            }
        });
    },

    setupEventListeners() {
        // --- Main Menu Buttons ---
        document.getElementById('btn-play').addEventListener('click', () => {
            AudioSystem.resume();
            this.showScreen('hud');
            Engine.startLevel(this.maxUnlockedLevel);
            this.toggleFullscreen(true); // Auto Fullscreen
        });

        document.getElementById('btn-level-select').addEventListener('click', () => {
            AudioSystem.resume();
            this.generateLevelGrid(); // update completed states
            this.showScreen('level-select-menu');
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            AudioSystem.resume();
            this.showScreen('settings-menu');
        });

        document.getElementById('btn-achievements').addEventListener('click', () => {
            AudioSystem.resume();
            this.renderAchievementsList();
            this.showScreen('achievements-menu');
        });

        document.getElementById('btn-credits').addEventListener('click', () => {
            AudioSystem.resume();
            this.showScreen('credits-menu');
        });

        // --- Back Buttons ---
        document.getElementById('btn-level-back').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('btn-settings-back').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('btn-achievements-back').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('btn-credits-back').addEventListener('click', () => this.showScreen('main-menu'));

        // --- Pause Screen ---
        document.getElementById('hud-pause-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePause();
        });
        document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
        document.getElementById('btn-pause-restart').addEventListener('click', () => {
            this.togglePause();
            Engine.respawnPlayer();
        });
        document.getElementById('btn-pause-quit').addEventListener('click', () => {
            this.togglePause();
            AudioSystem.stopMusic();
            this.showScreen('main-menu');
        });
        document.getElementById('btn-pause-settings').addEventListener('click', () => {
            document.getElementById('pause-screen').classList.add('hidden');
            this.showScreen('settings-menu');
            // Hack: override back button to go back to pause screen instead of main menu
            const backBtn = document.getElementById('btn-settings-back');
            const restoreBack = () => {
                this.showScreen('hud');
                document.getElementById('pause-screen').classList.remove('hidden');
                backBtn.removeEventListener('click', restoreBack);
                backBtn.addEventListener('click', () => this.showScreen('main-menu'));
            };
            backBtn.removeEventListener('click', () => this.showScreen('main-menu'));
            backBtn.addEventListener('click', restoreBack);
        });

        // --- Settings Event Bindings ---
        const sliderMusic = document.getElementById('slider-music');
        sliderMusic.addEventListener('input', (e) => {
            AudioSystem.setMusicVolume(e.target.value / 100);
            this.saveSettings();
        });

        const sliderSfx = document.getElementById('slider-sfx');
        sliderSfx.addEventListener('input', (e) => {
            AudioSystem.setSfxVolume(e.target.value / 100);
            this.saveSettings();
        });

        document.getElementById('check-shake').addEventListener('change', () => this.saveSettings());

        const fullscreenCheck = document.getElementById('check-fullscreen');
        fullscreenCheck.addEventListener('change', (e) => {
            this.toggleFullscreen(e.target.checked);
        });

        const hudFsBtn = document.getElementById('hud-fullscreen-btn');
        if (hudFsBtn) {
            hudFsBtn.addEventListener('click', () => {
                const isFS = !!document.fullscreenElement;
                this.toggleFullscreen(!isFS);
            });
        }

        document.getElementById('btn-reset-data').addEventListener('click', () => {
            if (confirm("Are you sure you want to clear your rage and level progress?")) {
                localStorage.clear();
                this.unlockedAchievements = [];
                this.maxUnlockedLevel = 1;
                Engine.deaths = 0;
                this.loadSaveData();
                this.generateLevelGrid();
                this.renderAchievementsList();
                alert("Data Reset! Back to square one.");
            }
        });

        // --- Fake Screens Event Bindings ---
        // Fake Game Over Screen Button
        document.getElementById('btn-fake-go-respawn').addEventListener('click', () => {
            document.getElementById('fake-game-over-screen').classList.add('hidden');
            Engine.state = 'playing';
            Engine.respawnPlayer();
        });

        // Fake Level Complete Screen Button
        document.getElementById('btn-fake-lc-continue').addEventListener('click', () => {
            document.getElementById('fake-level-complete-screen').classList.add('hidden');
            AudioSystem.playTrollLaugh();
            // Splat player or kill them
            Engine.state = 'playing';
            Engine.player.die("Tricked by the complete button!");
        });
    },

    showScreen(screenId) {
        // Hide all screens
        const screens = ['main-menu', 'level-select-menu', 'settings-menu', 'achievements-menu', 'credits-menu', 'hud', 'pause-screen'];
        screens.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.classList.add('hidden');
        });

        // Show targets
        if (screenId === 'hud') {
            document.getElementById('hud').classList.remove('hidden');
            Engine.state = 'playing';
        } else if (screenId === 'pause-screen') {
            document.getElementById('hud').classList.remove('hidden'); // keep HUD visible under pause overlay
            document.getElementById('pause-screen').classList.remove('hidden');
            Engine.state = 'paused';
        } else {
            document.getElementById(screenId).classList.remove('hidden');
            Engine.state = 'menu';
        }
    },

    togglePause() {
        if (Engine.state === 'playing') {
            this.showScreen('pause-screen');
        } else if (Engine.state === 'paused') {
            this.showScreen('hud');
        }
    },

    toggleFullscreen(enable) {
        const container = document.getElementById('game-container');
        if (enable) {
            const requestFS = container.requestFullscreen || container.webkitRequestFullscreen || container.msRequestFullscreen;
            if (requestFS) {
                requestFS.call(container).then(() => {
                    // Try to lock orientation to landscape on mobile
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock('landscape').catch((err) => {
                            console.warn("Screen orientation lock failed:", err);
                        });
                    }
                }).catch((err) => {
                    console.error("Fullscreen request failed:", err);
                });
            }
        } else {
            const exitFS = document.exitFullscreen || document.webkitExitFullscreen;
            if (exitFS) {
                exitFS.call(document);
                if (screen.orientation && screen.orientation.unlock) {
                    try {
                        screen.orientation.unlock();
                    } catch(e) {}
                }
            }
        }
    },

    generateLevelGrid() {
        const grid = document.getElementById('level-grid');
        if (!grid) return;
        grid.innerHTML = '';

        // Generate 1 to 50 levels
        for (let i = 1; i <= 50; i++) {
            const item = document.createElement('div');
            item.classList.add('level-item');
            
            // Text contents
            item.textContent = i;

            // Boss level styles (every 10 levels)
            if (i % 10 === 0) {
                item.classList.add('boss-level');
                item.textContent = `B${i/10}`;
            }

            // Lock / Unlock logic
            if (i <= this.maxUnlockedLevel) {
                if (i < this.maxUnlockedLevel) {
                    item.classList.add('completed');
                }
                item.addEventListener('click', () => {
                    this.showScreen('hud');
                    Engine.startLevel(i);
                    this.toggleFullscreen(true); // Auto Fullscreen
                });
            } else {
                item.classList.add('locked');
            }

            grid.appendChild(item);
        }
    },

    renderAchievementsList() {
        const list = document.getElementById('achievements-list');
        if (!list) return;
        list.innerHTML = '';

        this.achievements.forEach(ach => {
            const card = document.createElement('div');
            card.classList.add('achievement-card');
            
            const isUnlocked = this.unlockedAchievements.includes(ach.id);
            if (isUnlocked) {
                card.classList.add('unlocked');
            }

            card.innerHTML = `
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${ach.title}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                </div>
                <div class="achievement-status">${isUnlocked ? 'UNLOCKED' : 'LOCKED'}</div>
            `;
            list.appendChild(card);
        });
    },

    unlockAchievement(id) {
        if (this.unlockedAchievements.includes(id)) return;
        
        this.unlockedAchievements.push(id);
        this.saveState();

        // Find achievement details
        const ach = this.achievements.find(a => a.id === id);
        if (!ach) return;

        // Visual Slider Notification Card
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: absolute;
            top: 20px;
            right: -320px;
            width: 280px;
            background: rgba(11,13,25,0.9);
            border: 2px solid #ffcc00;
            box-shadow: 0 0 15px rgba(255,204,0,0.5);
            border-radius: 8px;
            display: flex;
            align-items: center;
            padding: 12px;
            gap: 12px;
            z-index: 1000;
            transition: right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2);
            backdrop-filter: blur(5px);
        `;

        notification.innerHTML = `
            <div style="font-size: 24px;">${ach.icon}</div>
            <div>
                <div style="font-family: 'Press Start 2P', monospace; font-size: 8px; color: #ffcc00; margin-bottom: 4px;">ACHIEVEMENT UNLOCKED!</div>
                <div style="font-weight: bold; font-size: 13px; color: #fff;">${ach.title}</div>
            </div>
        `;

        document.getElementById('game-container').appendChild(notification);
        
        // Slide in
        setTimeout(() => { notification.style.right = '20px'; }, 100);
        // Slide out
        setTimeout(() => { notification.style.right = '-320px'; }, 3500);
        // Clean up
        setTimeout(() => { notification.remove(); }, 4000);
    },

    // --- HUD Updating ---
    updateHUD() {
        document.getElementById('hud-level').textContent = Engine.levelIndex === 101 ? "101 💀" : Engine.levelIndex;
        document.getElementById('hud-deaths').textContent = Engine.deaths;
        this.updateRageMeter();
    },

    updateHUDTimer() {
        const timer = document.getElementById('hud-timer');
        if (!timer) return;

        const ms = Engine.elapsedTime;
        const totalSecs = Math.floor(ms / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        const hundredths = Math.floor((ms % 1000) / 10);

        const pad = (num) => String(num).padStart(2, '0');
        timer.textContent = `${pad(mins)}:${pad(secs)}.${pad(hundredths)}`;
    },

    updateRageMeter() {
        const rageBar = document.getElementById('rage-bar-inner');
        if (rageBar) {
            rageBar.style.width = `${Engine.rageValue}%`;
        }
    },

    incrementDeaths(reason) {
        Engine.deaths++;
        this.saveState();

        // Increment Rage Meter
        Engine.rageValue = Math.min(100, Engine.rageValue + 18);
        if (Engine.rageValue >= 100) {
            this.unlockAchievement('rage_max');
        }

        // Achievements check
        if (Engine.deaths >= 10) this.unlockAchievement('die_10');
        if (Engine.deaths >= 100) this.unlockAchievement('die_100');

        this.updateHUD();

        // Screen Death Messages
        const randomMsg = this.deathMessages[Math.floor(Math.random() * this.deathMessages.length)];
        
        // Trigger Trust Nobody if death was due to troll traps
        if (reason && (reason.includes("Fake") || reason.includes("surprise") || reason.includes("Money") || reason.includes("bit"))) {
            this.unlockAchievement('trust_nobody');
        }

        // Display Wasted Overlay
        const overlay = document.getElementById('death-overlay');
        const overlayMsg = document.getElementById('death-msg');
        
        overlayMsg.textContent = `"${randomMsg}"`;
        overlay.classList.remove('hidden');
        
        // Keep screen red for brief comic delay, then fade out
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 600);
    },

    completeLevel() {
        if (Engine.levelIndex === 51) {
            // Completed the secret final level! Show final victory screen
            Engine.isTimerRunning = false;
            
            const credits = document.getElementById('credits-menu');
            credits.classList.remove('hidden');
            credits.style.zIndex = "1000";
            
            const heading = credits.querySelector('h2');
            heading.innerHTML = "🏆 ULTIMATE VICTORY! 🏆";
            
            const content = credits.querySelector('.credits-content');
            if (content) {
                content.innerHTML = `
                    <p class="credits-header" style="color: #4cd137;">YOU BEAT THE GAME!</p>
                    <p class="credits-name" style="font-size: 14px; margin-bottom: 20px;">Deaths: ${Engine.deaths} | Time: ${document.getElementById('hud-timer').textContent}</p>
                    <p class="credits-header">Congratulations!</p>
                    <p class="credits-name">You survived all 50 levels of traps, trolls, and fakeouts, and cleared the secret glitched final challenge!</p>
                    <br>
                    <p class="credits-header">Credits</p>
                    <p class="credits-name">Antigravity AI & Google Deepmind</p>
                    <br>
                    <button class="menu-btn primary-btn" onclick="window.location.reload()" style="margin: 20px auto; display: block; width: 200px;">PLAY AGAIN</button>
                `;
            }
            
            AudioSystem.stopMusic();
            AudioSystem.playWin();
            Engine.state = 'paused';
            return;
        }

        // Unlock next level
        if (Engine.levelIndex === 50) {
            // Defeated Level 50 Boss! Final twist trigger
            this.triggerFinalTwistSequence();
            return;
        }

        // Normal Level progression
        const nextLvl = Engine.levelIndex + 1;
        if (nextLvl > this.maxUnlockedLevel) {
            this.maxUnlockedLevel = nextLvl;
            this.saveState();
        }

        // Show floating message
        this.showFloatingText("LEVEL CLEARED!", Engine.player.x, Engine.player.y - 30);

        // Load level index
        setTimeout(() => {
            Engine.startLevel(nextLvl);
        }, 400);
    },

    triggerFinalTwistSequence() {
        Engine.isTimerRunning = false;
        
        // Check speedrun speed
        if (Engine.elapsedTime < 600000) { // 10 minutes = 600,000 ms
            this.unlockAchievement('speedrun');
        }

        // Show Real Congratulations layout overlay (Credits scroll)
        const credits = document.getElementById('credits-menu');
        credits.classList.remove('hidden');
        credits.style.zIndex = "1000"; // display over everything
        
        const heading = credits.querySelector('h2');
        heading.innerHTML = "🏆 Congratulations! You Escaped! 🏆";

        AudioSystem.stopMusic();
        AudioSystem.playWin();

        // 1. Credits roll for 5 seconds, then screen glitches
        setTimeout(() => {
            // Glitch sound/effects
            AudioSystem.playDeath(); // Buzz/sawtooth sound
            Engine.triggerScreenShake(20);
            
            // Screen elements flash black/red
            credits.style.backgroundColor = "rgba(180, 0, 40, 0.9)";
            heading.innerHTML = "Wait...";
            heading.style.color = "#ffcc00";
            
            // Hide the details paragraph list of credits
            const creditsContent = credits.querySelector('.credits-content');
            if (creditsContent) creditsContent.style.opacity = "0";

            // 2. Wait 2 seconds, then collapse floor and transition
            setTimeout(() => {
                AudioSystem.playExplosion();
                Engine.triggerScreenShake(35);
                
                heading.innerHTML = "I TRIGGERED YOU AGAIN.";
                heading.style.color = "#ff3366";
                
                // Collapses screen out of view
                credits.style.transition = "transform 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045)";
                credits.style.transform = "translateY(600px)";

                setTimeout(() => {
                    credits.classList.add('hidden');
                    credits.style.transform = "none";
                    credits.style.zIndex = "";
                    if (creditsContent) creditsContent.style.opacity = "1";
                    credits.style.backgroundColor = ""; // reset background
                    
                    // Unlock Never Give Up achievement
                    this.unlockAchievement('never_give_up');
                    
                    // Load level 51
                    Engine.startLevel(51);
                }, 800);

            }, 2000);

        }, 5000);
    },

    // --- Fake Screens ---
    showFakeComplete() {
        this.unlockAchievement('fake_winner');
        const screen = document.getElementById('fake-level-complete-screen');
        screen.classList.remove('hidden');
        Engine.state = 'fake-complete';
        AudioSystem.stopMusic();
        AudioSystem.playWin();
    },

    showFakeGameOver() {
        const screen = document.getElementById('fake-game-over-screen');
        screen.classList.remove('hidden');
        Engine.state = 'fake-gameover';
        AudioSystem.stopMusic();
        AudioSystem.playDeath();
    },

    showFakeBSOD() {
        Engine.state = 'paused';
        const bsod = document.createElement('div');
        bsod.style.cssText = `
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: #0000aa;
            color: #ffffff;
            font-family: Courier, monospace;
            padding: 40px;
            font-size: 13px;
            text-align: left;
            z-index: 10000;
        `;
        bsod.innerHTML = `
            <h2>A problem has been detected and Windows has been shut down to prevent damage to your computer.</h2>
            <br>
            <p>I_TRIGGER_YOU_EXCEPTION_NOT_HANDLED</p>
            <br>
            <p>If this is the first time you've seen this Stop error screen, restart your computer. If this screen appears again, follow these steps:</p>
            <br>
            <p>Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or software manufacturer for any Windows updates you might need.</p>
            <br>
            <p>Technical information:</p>
            <p>*** STOP: 0x000000D1 (0x0000000C, 0x00000002, 0x00000000, 0xF86B5A89)</p>
            <br>
            <p>*** troll.sys - Address F86B5A89 base at F86B2000, DateStamp 36b072a3</p>
            <br>
            <p>Restarting in 3 seconds... Just kidding. Troll face incoming.</p>
        `;
        document.getElementById('game-container').appendChild(bsod);

        setTimeout(() => {
            // Draw a big text pop
            bsod.innerHTML = `<h1 style="font-size: 72px; text-align: center; margin-top: 150px; color: #ff3366;">GOT YOU! 😂</h1>`;
            AudioSystem.playTrollLaugh();
            
            setTimeout(() => {
                bsod.remove();
                Engine.state = 'playing';
            }, 1200);

        }, 2200);
    },

    // --- Floating Texts ---
    showFloatingText(text, x, y) {
        const floatText = document.createElement('div');
        floatText.style.cssText = `
            position: absolute;
            font-family: 'Press Start 2P', monospace;
            font-size: 9px;
            color: #ffcc00;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
            pointer-events: none;
            z-index: 99;
            white-space: nowrap;
            transition: transform 0.8s ease-out, opacity 0.8s ease-out;
        `;
        
        // Convert game coordinates to viewport CSS pixels relative to camera scroll
        const screenX = x - Engine.camera.x;
        const screenY = y - Engine.camera.y;

        floatText.style.left = `${screenX}px`;
        floatText.style.top = `${screenY}px`;
        floatText.textContent = text;

        document.getElementById('game-container').appendChild(floatText);

        setTimeout(() => {
            floatText.style.transform = 'translateY(-40px)';
            floatText.style.opacity = '0';
        }, 50);

        setTimeout(() => { floatText.remove(); }, 900);
    },

    // --- Saving & Loading states ---
    saveState() {
        localStorage.setItem('I_TRIGGER_YOU_SAVE_LEVEL', this.maxUnlockedLevel);
        localStorage.setItem('I_TRIGGER_YOU_SAVE_DEATHS', Engine.deaths);
        localStorage.setItem('I_TRIGGER_YOU_SAVE_ACHIEVEMENTS', JSON.stringify(this.unlockedAchievements));
    },

    saveSettings() {
        const settings = {
            music: document.getElementById('slider-music').value,
            sfx: document.getElementById('slider-sfx').value,
            shake: document.getElementById('check-shake').checked
        };
        localStorage.setItem('I_TRIGGER_YOU_SAVE_SETTINGS', JSON.stringify(settings));
    },

    loadSaveData() {
        const lvl = localStorage.getItem('I_TRIGGER_YOU_SAVE_LEVEL');
        if (lvl) this.maxUnlockedLevel = parseInt(lvl);

        const dths = localStorage.getItem('I_TRIGGER_YOU_SAVE_DEATHS');
        if (dths) Engine.deaths = parseInt(dths);

        const achs = localStorage.getItem('I_TRIGGER_YOU_SAVE_ACHIEVEMENTS');
        if (achs) {
            try {
                this.unlockedAchievements = JSON.parse(achs);
            } catch(e) {}
        }

        const settingsStr = localStorage.getItem('I_TRIGGER_YOU_SAVE_SETTINGS');
        if (settingsStr) {
            try {
                const settings = JSON.parse(settingsStr);
                document.getElementById('slider-music').value = settings.music;
                document.getElementById('slider-sfx').value = settings.sfx;
                document.getElementById('check-shake').checked = settings.shake;
                
                AudioSystem.setMusicVolume(settings.music / 100);
                AudioSystem.setSfxVolume(settings.sfx / 100);
            } catch(e) {}
        } else {
            // Default volumes
            AudioSystem.setMusicVolume(0.7);
            AudioSystem.setSfxVolume(0.8);
        }
    }
};

window.GameUI = GameUI;

// Start UI handling
window.addEventListener('load', () => {
    GameUI.init();
});
