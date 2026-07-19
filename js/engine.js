/* ==========================================================================
   "I Trigger You" Game Loop, Rendering, Camera & Particles Engine
   ========================================================================== */

class Particle {
    constructor(x, y, color, vx, vy, maxLife) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.maxLife = maxLife;
        this.life = maxLife;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        // Apply friction
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life--;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        const size = Math.max(0, (this.life / this.maxLife) * 6);
        ctx.beginPath();
        ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const Engine = {
    canvas: null,
    ctx: null,
    player: null,
    currentLevel: null,
    levelIndex: 1,
    
    // Core game state
    state: 'menu', // 'menu', 'playing', 'paused', 'gameover', 'fake-loading', 'fake-complete', 'fake-gameover'
    
    // Particle system
    particles: [],

    // Camera details
    camera: {
        x: 0,
        y: 0,
        zoom: 1,
        targetZoom: 1,
        shakeIntensity: 0,
        shakeTimer: 0,
        rotateAngle: 0,       // current camera rotation in radians
        targetRotateAngle: 0  // target rotation for troll screen spin
    },

    // Game stats
    deaths: 0,
    startTime: 0,
    elapsedTime: 0,
    isTimerRunning: false,
    
    // Rage tracking
    lastDeathTime: 0,
    rageValue: 0, // 0 to 100

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.player = new Player();
        Input.init();

        // Setup resize handling to scale responsively
        window.addEventListener('resize', () => this.resizeContainer());
        this.resizeContainer();

        // Start requestAnimationFrame loop
        this.lastFrameTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    resizeContainer() {
        const container = document.getElementById('game-container');
        const aspect = 16 / 9;
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        let scale = 1;
        if (w / h > aspect) {
            scale = h / 540;
        } else {
            scale = w / 960;
        }
        
        // Scale down container slightly to leave margins on desktops
        scale = Math.min(scale, 1.2) * 0.95;
        if (w < 600 || h < 400) scale = scale * 1.05; // maximize on small mobile screens

        container.style.transform = `scale(${scale})`;
    },

    startLevel(index, isRespawn = false) {
        this.levelIndex = index;
        if (!isRespawn) {
            this.level50Trolled = false;
        }
        
        // Retrieve level raw template
        const levelData = Levels.get(index);
        
        // Setup current active level structure
        this.currentLevel = {
            index: index,
            width: levelData.width * levelData.tileSize,
            height: levelData.height * levelData.tileSize,
            tileSize: levelData.tileSize,
            tileMap: levelData.tileMap,
            spawnX: levelData.spawnX,
            spawnY: levelData.spawnY,
            special: levelData.special || {},
            entities: [],
            isTileSolid(gx, gy) {
                if (gx < 0 || gx >= levelData.width || gy < 0 || gy >= levelData.height) {
                    return true; // Boundaries are solid
                }
                const tile = this.tileMap[gy][gx];
                return tile === 1 || tile === 2 || tile === 7 || tile === 8; // Solid blocks (1=normal, 2=fake-safe solid, 7=door block, 8=invisible block)
            }
        };

        // Initialize rising toxic sludge sludge height
        if (levelData.special && levelData.special.risingLava) {
            this.lavaY = levelData.height * levelData.tileSize;
        } else {
            this.lavaY = null;
        }

        // Initialize closing ceiling/floor crushers
        if (levelData.special && levelData.special.verticalCrush) {
            this.crushCeilingY = 0;
            this.crushFloorY = levelData.height * levelData.tileSize;
        } else {
            this.crushCeilingY = null;
            this.crushFloorY = null;
        }

        // Reset camera values
        this.camera.x = this.currentLevel.spawnX - 960 / 2;
        this.camera.y = this.currentLevel.spawnY - 540 / 2;
        this.camera.zoom = 1;
        this.camera.targetZoom = 1;
        this.camera.rotateAngle = 0;
        this.camera.targetRotateAngle = 0;
        this.camera.shakeIntensity = 0;
        this.camera.shakeTimer = 0;

        // Reset player state & position
        this.player.reset(this.currentLevel.spawnX, this.currentLevel.spawnY);

        // Populate Level Entities
        this.particles = [];
        levelData.entities.forEach(entDef => {
            const ent = Entities.create(entDef);
            this.currentLevel.entities.push(ent);
        });

        // Initialize Boss if level demands it
        if (levelData.bossName) {
            this.boss = Bosses.create(levelData.bossName, levelData.bossX, levelData.bossY);
            this.currentLevel.entities.push(this.boss);
            AudioSystem.playMusic('boss');
        } else {
            this.boss = null;
            AudioSystem.playMusic('main');
        }

        // Timer control
        if (index === 1 && !this.isTimerRunning) {
            this.startTime = performance.now();
            this.isTimerRunning = true;
        }

        this.state = 'playing';
        GameUI.updateHUD();
    },

    triggerScreenShake(intensity) {
        const settingsShake = document.getElementById('check-shake').checked;
        if (!settingsShake) return;

        this.camera.shakeIntensity = intensity;
        this.camera.shakeTimer = 15; // shakes for 15 frames
    },

    loop(timestamp) {
        const dt = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        // Caps logic updates to prevent giant steps on low FPS
        const steps = Math.min(Math.floor(dt / 16.66) + 1, 3);
        
        for (let i = 0; i < steps; i++) {
            this.update();
        }

        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    },

    update() {
        // Decrement Rage meter naturally over time
        if (this.rageValue > 0) {
            this.rageValue = Math.max(0, this.rageValue - 0.1);
            GameUI.updateRageMeter();
        }

        // Ticking rising toxic sludge height and handling player contact
        if (this.lavaY !== null && this.state === 'playing') {
            this.lavaY -= 0.65; // Sludge rises by 0.65px per frame
            
            if (this.player && !this.player.isDead && (this.player.y + this.player.height) > this.lavaY) {
                this.player.die("Dissolved in toxic sludge! 🧪");
            }
        }

        // Ticking closing ceiling/floor crushers and handling player contact
        if (this.crushCeilingY !== null && this.crushFloorY !== null && this.state === 'playing') {
            this.crushCeilingY += 0.35; // Ceiling closes down (slower: 0.35px per frame)
            this.crushFloorY = Math.max(480, this.crushFloorY - 0.25); // Floor closes up (slower: 0.25px per frame)
            
            if (this.player && !this.player.isDead) {
                if (this.player.y < this.crushCeilingY || (this.player.y + this.player.height) > this.crushFloorY) {
                    this.player.die("Squished by the closing walls! 💥");
                }
            }
        }

        if (this.state !== 'playing') {
            // Update UI/Background animations if needed
            return;
        }

        // Random Spikes activation timer
        const special = this.currentLevel.special || {};
        if (special.randomSpikes) {
            if (!this.randomSpikesTimer) this.randomSpikesTimer = 100;
            this.randomSpikesTimer--;
            if (this.randomSpikesTimer <= 0) {
                this.randomSpikesTimer = 100 + Math.random() * 50;
                this.currentLevel.entities.forEach(ent => {
                    if (ent instanceof HiddenSpike && !ent.triggered) {
                        ent.triggered = true;
                        ent.isHazard = true;
                        AudioSystem.playHurt();
                    }
                });
            }
        }

        // Update timer
        if (this.isTimerRunning) {
            this.elapsedTime = performance.now() - this.startTime;
            GameUI.updateHUDTimer();
        }

        // Update player
        this.player.update(this.currentLevel);

        // Level 1 elevator check: if player is near right edge (x > 780)
        if (this.levelIndex === 1 && this.player.x > 780) {
            const elevator = this.currentLevel.entities.find(e => e.type === 'moving_platform' && e.id === 'elevator');
            if (elevator && elevator.targetY === elevator.startY) {
                elevator.targetY = 250; // Move upward!
                elevator.speed = 2.5;
            }
        }

        // Handle Player Respawn transition
        if (this.player.isDead && this.player.respawnTimer <= 0) {
            this.respawnPlayer();
        }

        // Update level entities
        this.currentLevel.entities.forEach(ent => {
            if (ent.update) {
                ent.update(this.player, this.currentLevel);
            }
        });

        // Clean dead entities
        this.currentLevel.entities = this.currentLevel.entities.filter(ent => !ent.isDestroyed);

        // Update camera tracking
        let targetCamX = this.player.x + this.player.width / 2 - 960 / 2;
        let targetCamY = this.player.y + this.player.height / 2 - 540 / 2;

        // Zoom out during boss battles to see more arena
        if (this.boss) {
            this.camera.targetZoom = 0.85;
            // Center camera between boss and player
            targetCamX = (this.player.x + this.boss.x) / 2 - (960 / 2) / 0.85;
            targetCamY = (this.player.y + this.boss.y) / 2 - (540 / 2) / 0.85;
        } else {
            this.camera.targetZoom = special.zoom || 1.0;
        }

        // Lerp camera
        this.camera.x += (targetCamX - this.camera.x) * 0.08;
        this.camera.y += (targetCamY - this.camera.y) * 0.08;

        // Camera clamps (only if not boss level for dramatic dynamic scrolling, and not on mobile to prevent D-pad overlay)
        const isMobile = document.getElementById('mobile-controls') && !document.getElementById('mobile-controls').classList.contains('hidden');
        if (!this.boss && !isMobile) {
            const maxCamX = Math.max(0, this.currentLevel.width - 960);
            const maxCamY = Math.max(0, this.currentLevel.height - 540);
            this.camera.x = Math.max(0, Math.min(this.camera.x, maxCamX));
            this.camera.y = Math.max(0, Math.min(this.camera.y, maxCamY));
        }

        // Lerp camera rotation
        this.camera.rotateAngle += (this.camera.targetRotateAngle - this.camera.rotateAngle) * 0.08;

        // Update Particles
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);
    },

    respawnPlayer() {
        // Re-start level to clean up hazards and trigger states
        this.startLevel(this.levelIndex, true);
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw static scrolling backdrop (Vibrant cartoon blue sky or red hell based on level index)
        this.drawBackground();

        this.ctx.save();

        // Apply Screen Shake
        let shakeX = 0, shakeY = 0;
        if (this.camera.shakeTimer > 0) {
            shakeX = (Math.random() - 0.5) * this.camera.shakeIntensity;
            shakeY = (Math.random() - 0.5) * this.camera.shakeIntensity;
            this.camera.shakeTimer--;
        }
        this.ctx.translate(shakeX, shakeY);

        // Apply Zoom around Center
        this.ctx.translate(960 / 2, 540 / 2);
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.1;
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        
        // Apply Camera Rotation (Screen Flip/Rotate Traps)
        this.ctx.rotate(this.camera.rotateAngle);
        
        // Restore translation relative to camera scroll
        this.ctx.translate(-960 / 2 - this.camera.x, -540 / 2 - this.camera.y);

        if (this.currentLevel) {
            // Draw Level Tiles
            this.drawLevelTiles();

            // Draw rising toxic sludge if active (drawn inside camera coordinates)
            if (this.lavaY !== null) {
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(46, 213, 115, 0.45)'; // translucent green
                this.ctx.fillRect(0, this.lavaY, this.currentLevel.width, 2000);
                
                // Bubbling surface line
                this.ctx.strokeStyle = '#2ed573';
                this.ctx.lineWidth = 4;
                this.ctx.shadowColor = '#2ed573';
                this.ctx.shadowBlur = 10;
                this.ctx.beginPath();
                this.ctx.moveTo(0, this.lavaY);
                this.ctx.lineTo(this.currentLevel.width, this.lavaY);
                this.ctx.stroke();
                this.ctx.restore();
            }

            // Draw closing ceiling/floor crushers if active (drawn inside camera coordinates)
            if (this.crushCeilingY !== null && this.crushFloorY !== null) {
                this.ctx.save();
                
                // Solid crusher plates
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.fillRect(0, 0, this.currentLevel.width, this.crushCeilingY);
                this.ctx.fillRect(0, this.crushFloorY, this.currentLevel.width, this.currentLevel.height - this.crushFloorY);
                
                // Warning stripes (black & yellow) at the boundaries
                const stripeW = 20;
                
                // Ceiling warning bar
                this.ctx.fillStyle = '#f1c40f'; // Yellow
                this.ctx.fillRect(0, this.crushCeilingY - 8, this.currentLevel.width, 8);
                this.ctx.fillStyle = '#000'; // Black stripes
                for (let x = 0; x < this.currentLevel.width; x += stripeW * 2) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, this.crushCeilingY);
                    this.ctx.lineTo(x + stripeW, this.crushCeilingY);
                    this.ctx.lineTo(x + stripeW - 8, this.crushCeilingY - 8);
                    this.ctx.lineTo(x - 8, this.crushCeilingY - 8);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
                
                // Floor warning bar
                this.ctx.fillStyle = '#f1c40f'; // Yellow
                this.ctx.fillRect(0, this.crushFloorY, this.currentLevel.width, 8);
                this.ctx.fillStyle = '#000'; // Black stripes
                for (let x = 0; x < this.currentLevel.width; x += stripeW * 2) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, this.crushFloorY);
                    this.ctx.lineTo(x + stripeW, this.crushFloorY);
                    this.ctx.lineTo(x + stripeW + 8, this.crushFloorY + 8);
                    this.ctx.lineTo(x + 8, this.crushFloorY + 8);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
                
                this.ctx.restore();
            }

            // Draw level entities (Exits, Signs, Spikes, Coins, etc.)
            this.currentLevel.entities.forEach(ent => {
                if (ent.draw) ent.draw(this.ctx);
            });

            // Draw Player
            this.player.draw(this.ctx);

            // Draw Particles
            this.particles.forEach(p => p.draw(this.ctx));

            // Draw flashlight/darkness overlay for night mode (inside camera context so it rotates/zooms with the camera)
            this.ctx.save();
            const px = this.player.x + this.player.width/2;
            const py = this.player.y + this.player.height/2;
            
            // Expand light range during boss battles to keep them readable and playable
            const innerRadius = this.boss ? 160 : 60;
            const outerRadius = this.boss ? 320 : 150;
            
            const grad = this.ctx.createRadialGradient(px, py, innerRadius, px, py, outerRadius);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.96)');
            
            this.ctx.fillStyle = grad;
            // Draw a giant rectangle centered on player to cover viewport regardless of rotation/zoom
            this.ctx.fillRect(px - 1500, py - 1500, 3000, 3000);
            this.ctx.restore();
        }

        this.ctx.restore();

        // Draw Vignette or Screen Effects (e.g. Reverse Control screen alerts)
        this.drawForegroundEffects();
    },

    drawBackground() {
        let bgColor = '#181b22'; // Default
        const idx = this.levelIndex;
        
        if (this.boss) {
            bgColor = '#230b15'; // Dark flat red-black for boss arenas
        } else if (idx === 51) {
            bgColor = '#06120b'; // Glitch green backdrop
        } else {
            if (idx <= 10) {
                bgColor = '#12141a'; // Easy dark blue-grey
            } else if (idx <= 20) {
                bgColor = '#0e1713'; // Normal dark green-grey
            } else if (idx <= 30) {
                bgColor = '#1c120e'; // Hard dark brown-orange
            } else if (idx <= 40) {
                bgColor = '#140e1a'; // Very Hard dark purple
            } else {
                bgColor = '#1c070c'; // Nightmare dark crimson
            }
        }
        
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, 960, 540);
    },

    drawLevelTiles() {
        if (!this.currentLevel) return;
        const map = this.currentLevel.tileMap;
        const tSize = this.currentLevel.tileSize;
        
        const startX = Math.max(0, Math.floor(this.camera.x / tSize));
        const endX = Math.min(map[0].length, Math.ceil((this.camera.x + 960) / tSize));
        const startY = Math.max(0, Math.floor(this.camera.y / tSize));
        const endY = Math.min(map.length, Math.ceil((this.camera.y + 540) / tSize));

        for (let gy = startY; gy < endY; gy++) {
            for (let gx = startX; gx < endX; gx++) {
                const tile = map[gy][gx];
                if (tile === 0) continue;

                const tx = gx * tSize;
                const ty = gy * tSize;

                this.ctx.save();
                
                // Color tiles flat (no gradients) like Level Devil, changing theme by difficulty tier
                if (tile === 1 || tile === 2) {
                    const idx = this.levelIndex;
                    let fill = '#343a40';
                    let stroke = '#495057';
                    
                    if (idx === 51) {
                        fill = '#0d2115'; // Glitch green-black
                        stroke = '#1da15f';
                    } else if (idx <= 10) {
                        fill = '#2c3540'; // Slate blue
                        stroke = '#3b4756';
                    } else if (idx <= 20) {
                        fill = '#1d352b'; // Dark forest green
                        stroke = '#27473a';
                    } else if (idx <= 30) {
                        fill = '#452b20'; // Terracotta clay
                        stroke = '#5c3a2b';
                    } else if (idx <= 40) {
                        fill = '#351d42'; // Amethyst purple
                        stroke = '#472759';
                    } else {
                        fill = '#4a0e1b'; // Crimson obsidian
                        stroke = '#631324';
                    }

                    this.ctx.fillStyle = fill;
                    this.ctx.strokeStyle = stroke;
                    this.ctx.fillRect(tx, ty, tSize, tSize);
                    
                    // Borders
                    this.ctx.lineWidth = 1.5;
                    this.ctx.strokeRect(tx, ty, tSize, tSize);
                } else if (tile === 7) {
                    // Door solid block (troll barrier)
                    this.ctx.fillStyle = '#b33939';
                    this.ctx.fillRect(tx, ty, tSize, tSize);
                    this.ctx.strokeStyle = '#ff5252';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.strokeRect(tx, ty, tSize, tSize);
                    
                    // Lock icon on barrier
                    this.ctx.fillStyle = '#fff';
                    this.ctx.fillRect(tx + tSize/2 - 4, ty + tSize/2 - 2, 8, 8);
                    this.ctx.beginPath();
                    this.ctx.arc(tx + tSize/2, ty + tSize/2 - 2, 4, Math.PI, 0);
                    this.ctx.strokeStyle = '#fff';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();
                }

                this.ctx.restore();
            }
        }
    },

    drawForegroundEffects() {
        // Red vignetting when rage meter is high
        if (this.rageValue > 25) {
            this.ctx.save();
            const intensity = (this.rageValue / 100) * 0.45;
            const grad = this.ctx.createRadialGradient(960/2, 540/2, 200, 960/2, 540/2, 700);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, `rgba(255, 51, 102, ${intensity})`);
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, 960, 540);
            this.ctx.restore();
        }

        // Draw 'REVERSED CONTROLS' screen flashing indicator
        if (Input.isReversed) {
            this.ctx.save();
            this.ctx.font = '900 16px Outfit';
            this.ctx.fillStyle = (Math.floor(performance.now() / 200) % 2 === 0) ? '#ff3366' : '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⚠ WARNING: CONTROLS REVERSED! ⚠', 960 / 2, 100);
            this.ctx.restore();
        }

        // Draw Gravity Flipped alert
        if (this.player && this.player.gravityDir === -1) {
            this.ctx.save();
            this.ctx.font = '900 16px Outfit';
            this.ctx.fillStyle = (Math.floor(performance.now() / 250) % 2 === 0) ? '#33ccff' : '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⚡ GRAVITY FLIPPED ⚡', 960 / 2, 125);
            this.ctx.restore();
        }

    }
};

window.Engine = Engine;

// Auto-run engine on page load
window.addEventListener('load', () => {
    Engine.init();
});
