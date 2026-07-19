/* ==========================================================================
   "I Trigger You" Interactive Entities and Troll Hazards
   ========================================================================== */

class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isDestroyed = false;
        this.isHazard = false;
    }

    update(player, level) {}
    draw(ctx) {}

    // AABB Collision utility
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

// 1. Spikes (Visible)
class Spike extends Entity {
    constructor(x, y, width = 32, height = 32, isFake = false) {
        super(x, y, width, height);
        this.isFake = isFake;
        this.isHazard = !isFake;
    }

    update(player, level) {
        if (!this.isFake && this.collidesWith(player)) {
            player.die("Prickly death!");
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#e74c3c';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        // 3 spikes per block
        const spikeCount = 3;
        const spikeW = this.width / spikeCount;
        for (let i = 0; i < spikeCount; i++) {
            const sx = this.x + i * spikeW;
            ctx.moveTo(sx, this.y + this.height);
            ctx.lineTo(sx + spikeW / 2, this.y);
            ctx.lineTo(sx + spikeW, this.y + this.height);
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// 2. Hidden Spikes (Spring up when player is near)
class HiddenSpike extends Entity {
    constructor(x, y, width = 32, height = 32) {
        super(x, y, width, height);
        this.triggered = false;
        this.currentHeight = 0;
        this.isHazard = false; // Becomes hazard only when sprung
    }

    update(player, level) {
        // Distance check
        const dist = Math.abs((player.x + player.width/2) - (this.x + this.width/2));
        if (!this.triggered && dist < 45 && Math.abs(player.y - this.y) < 64) {
            this.triggered = true;
            this.isHazard = true;
            AudioSystem.playHurt();
        }

        if (this.triggered && this.currentHeight < this.height) {
            this.currentHeight = Math.min(this.height, this.currentHeight + 4);
        }

        if (this.isHazard && this.collidesWith(player)) {
            player.die("Surprise spike!");
        }
    }

    draw(ctx) {
        if (!this.triggered) return; // Completely invisible until triggered

        ctx.save();
        ctx.fillStyle = '#ff7f50';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        const spikeCount = 3;
        const spikeW = this.width / spikeCount;
        
        // Draw rising spikes
        for (let i = 0; i < spikeCount; i++) {
            const sx = this.x + i * spikeW;
            ctx.moveTo(sx, this.y + this.height);
            ctx.lineTo(sx + spikeW / 2, this.y + this.height - this.currentHeight);
            ctx.lineTo(sx + spikeW, this.y + this.height);
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// 3. Disappearing Platform (Falls or vanishes after standing on it)
class DisappearingPlatform extends Entity {
    constructor(x, y, width = 64, height = 32) {
        super(x, y, width, height);
        this.timer = 20; // standing time limit (frames)
        this.triggered = false;
        this.opacity = 1;
        this.shakeOffset = 0;
    }

    update(player, level) {
        // Check if player stands on it
        const playerOnTop = player.gravityDir === 1 ?
            (player.x + player.width > this.x && player.x < this.x + this.width && Math.abs((player.y + player.height) - this.y) < 4) :
            (player.x + player.width > this.x && player.x < this.x + this.width && Math.abs(player.y - (this.y + this.height)) < 4);

        if (playerOnTop) {
            this.triggered = true;
        }

        if (this.triggered) {
            this.timer--;
            this.shakeOffset = (Math.random() - 0.5) * 4;
            
            if (this.timer <= 0) {
                this.opacity -= 0.1;
                if (this.opacity <= 0) {
                    this.isDestroyed = true;
                    // Spawn cloud particles
                    for (let i = 0; i < 5; i++) {
                        Engine.particles.push(new Particle(
                            this.x + Math.random() * this.width,
                            this.y + Math.random() * this.height,
                            '#fff',
                            (Math.random() - 0.5) * 2,
                            (Math.random() - 0.5) * 2,
                            15
                        ));
                    }
                }
            }
        }

        // Add platform to physics resolving loop dynamically by checking player interactions manually
        // Check if player collided with this platform as solid block
        if (!this.isDestroyed && this.opacity > 0.5) {
            this.resolveSolidBehavior(player);
        }
    }

    resolveSolidBehavior(player) {
        // Basic solid logic for this dynamic entity block
        const overlapX = player.x + player.width > this.x && player.x < this.x + this.width;
        const overlapY = player.y + player.height > this.y && player.y < this.y + this.height;

        if (overlapX && overlapY) {
            // Push player out based on velocity direction
            if (player.gravityDir === 1) {
                if (player.vy > 0 && player.y + player.height - this.y < 8) {
                    player.y = this.y - player.height;
                    player.vy = 0;
                    player.isGrounded = true;
                    player.canDoubleJump = true;
                }
            } else {
                if (player.vy < 0 && (this.y + this.height) - player.y < 8) {
                    player.y = this.y + this.height;
                    player.vy = 0;
                    player.isGrounded = true;
                    player.canDoubleJump = true;
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        ctx.fillStyle = '#eb4d4b';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        ctx.fillRect(this.x + this.shakeOffset, this.y, this.width, this.height);
        ctx.strokeRect(this.x + this.shakeOffset, this.y, this.width, this.height);
        
        // Cracks texture
        if (this.triggered) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.moveTo(this.x + this.width/3, this.y);
            ctx.lineTo(this.x + this.width/3 + 5, this.y + this.height/2);
            ctx.lineTo(this.x + this.width/4, this.y + this.height);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// 4. Moving Platform (Moves left-right or up-down)
class MovingPlatform extends Entity {
    constructor(x, y, width = 64, height = 24, targetX = 0, targetY = 0, speed = 2) {
        super(x, y, width, height);
        this.startX = x;
        this.startY = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = speed;
        this.progress = 0;
        this.direction = 1;
    }

    update(player, level) {
        // Calculate velocity
        let prevX = this.x;
        let prevY = this.y;

        // Path calculation
        const dx = this.targetX - this.startX;
        const dy = this.targetY - this.startY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance > 0.1) {
            this.progress += (this.speed / distance) * this.direction;
            if (this.progress >= 1) {
                this.progress = 1;
                this.direction = -1;
            } else if (this.progress <= 0) {
                this.progress = 0;
                this.direction = 1;
            }
            this.x = this.startX + dx * this.progress;
            this.y = this.startY + dy * this.progress;
        }

        const vx = this.x - prevX;
        const vy = this.y - prevY;

        // Carry player standing on top of moving platform
        const playerOnTop = player.gravityDir === 1 ?
            (player.x + player.width > this.x && player.x < this.x + this.width && Math.abs((player.y + player.height) - this.y) <= 8) :
            (player.x + player.width > this.x && player.x < this.x + this.width && Math.abs(player.y - (this.y + this.height)) <= 8);

        if (playerOnTop) {
            player.x += vx;
            player.y += vy;
            player.vy = 0;
            player.isGrounded = true;
            player.canDoubleJump = true;
            
            // Snap player vertically to the surface to prevent sliding or falling through
            if (player.gravityDir === 1) {
                player.y = this.y - player.height;
            } else {
                player.y = this.y + this.height;
            }
        }

        // Solid collision resolution for walls and sides
        const overlapX = player.x + player.width > this.x && player.x < this.x + this.width;
        const overlapY = player.y + player.height > this.y && player.y < this.y + this.height;

        if (overlapX && overlapY) {
            if (player.gravityDir === 1) {
                if (player.vy >= 0 && player.y + player.height - this.y < 12) {
                    player.y = this.y - player.height;
                    player.vy = 0;
                    player.isGrounded = true;
                    player.canDoubleJump = true;
                } else if (player.vy < 0 && (this.y + this.height) - player.y < 12) {
                    player.y = this.y + this.height;
                    player.vy = 0;
                }
            } else {
                if (player.vy <= 0 && (this.y + this.height) - player.y < 12) {
                    player.y = this.y + this.height;
                    player.vy = 0;
                    player.isGrounded = true;
                    player.canDoubleJump = true;
                } else if (player.vy > 0 && player.y + player.height - this.y < 12) {
                    player.y = this.y - player.height;
                    player.vy = 0;
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#f0932b';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Mech gears styling
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(this.x + 8, this.y + 4, 8, 16);
        ctx.fillRect(this.x + this.width - 16, this.y + 4, 8, 16);
        ctx.restore();
    }
}

// 5. Troll Sign (Gives wrong/funny directions)
class TrollSign extends Entity {
    constructor(x, y, text = "SAFE PATH ->") {
        super(x, y, 32, 40);
        this.text = text;
        this.showBubble = false;
    }

    update(player, level) {
        const dist = Math.abs((player.x + player.width/2) - (this.x + this.width/2));
        this.showBubble = dist < 70 && Math.abs(player.y - this.y) < 60;
    }

    draw(ctx) {
        ctx.save();
        // Draw post
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(this.x + 14, this.y + 20, 4, 20);
        // Draw board
        ctx.fillStyle = '#CD853F';
        ctx.strokeStyle = '#8B5A2B';
        ctx.lineWidth = 1.5;
        ctx.fillRect(this.x, this.y, 32, 20);
        ctx.strokeRect(this.x, this.y, 32, 20);

        // Troll face drawing on board
        ctx.fillStyle = '#000';
        ctx.font = '7px monospace';
        ctx.fillText("TROLL", this.x + 2, this.y + 12);

        // Dialogue bubble if player is near
        if (this.showBubble) {
            ctx.font = '700 11px Outfit';
            const textW = ctx.measureText(this.text).width;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.strokeStyle = '#33ccff';
            ctx.lineWidth = 1.5;
            
            const bx = this.x + 16 - textW / 2 - 8;
            const by = this.y - 30;
            const bw = textW + 16;
            const bh = 22;

            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeRect(bx, by, bw, bh);

            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(this.text, this.x + 16, this.y - 15);
        }
        ctx.restore();
    }
}

// 6. Fake Exit Door & Real Exit Door
class ExitDoor extends Entity {
    constructor(x, y, isFake = false, id = "", realExitX = null, realExitY = null) {
        super(x, y, 40, 60);
        this.isFake = isFake;
        this.id = id;
        this.escaped = false; // Is flying away troll active?
        this.isHazard = false;
        this.isLocked = false;
        
        // Target/real coordinates for teleporting
        this.realExitX = realExitX !== null ? realExitX : x;
        this.realExitY = realExitY !== null ? realExitY : y;
        
        // For shift/troll doors
        this.targetY = y;
        this.isShifting = false;
    }

    update(player, level) {
        if (this.isDestroyed) return;

        // Troll: Level 50 Fake End Door
        if (this.isFake && this.id === "l50_troll_door") {
            const dist = Math.abs((player.x + player.width/2) - (this.x + this.width/2));
            if (dist < 60 && Math.abs(player.y - this.y) < 120) {
                if (window.Engine) {
                    Engine.level50Trolled = true;
                }
                
                AudioSystem.playTrollLaugh();
                Engine.triggerScreenShake(25);
                
                // Explode particles
                for (let i = 0; i < 20; i++) {
                    Engine.particles.push(new Particle(this.x + 20, this.y + 30, '#ff3366', (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, 25));
                }
                
                player.die("I Trigger You Part 2: Coming Soon! 😂");
                this.isDestroyed = true;
                return;
            }
        }

        // General Fake Door Teleport Troll (Warps to the real exit location when approached)
        if (this.isFake && (this.realExitX !== this.x || this.realExitY !== this.y)) {
            const dist = Math.abs((player.x + player.width/2) - (this.x + this.width/2));
            if (dist < 60 && Math.abs(player.y - this.y) < 120) {
                const oldX = this.x;
                const oldY = this.y;
                
                // Warp itself to the real exit door location
                this.x = this.realExitX;
                this.y = this.realExitY;
                this.isFake = false; // Turn into the real door!
                this.id = ""; // Disable further triggers
                
                AudioSystem.playTrollLaugh();
                Engine.triggerScreenShake(15);
                
                // Teleport particles
                for (let i = 0; i < 12; i++) {
                    Engine.particles.push(new Particle(oldX + 20, oldY + 30, '#ff3366', (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, 20));
                    Engine.particles.push(new Particle(this.x + 20, this.y + 30, '#2ed573', (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, 20));
                }

                // Spawn spikes at the old door location (where the player is standing!)
                if (level) {
                    const spikeTrap = Entities.create({ type: 'spike', x: oldX, y: oldY + 28 });
                    level.entities.push(spikeTrap);
                }

                if (window.GameUI) {
                    GameUI.showFloatingText("DOOR WARPED! 😜", oldX - 40, oldY - 20);
                }
                return;
            }
        }

        // Troll 1: Flying away fake door
        if (this.isFake && this.id === "flying") {
            const dist = Math.abs((player.x + player.width/2) - (this.x + this.width/2));
            if (dist < 80 && Math.abs(player.y - this.y) < 120) {
                if (!this.escaped) {
                    this.escaped = true;
                    AudioSystem.playTrollLaugh();
                }
            }
            if (this.escaped) {
                this.y -= 5;
                if (this.y < -100) this.isDestroyed = true;
            }
        }

        // Troll 2: Spike door
        if (this.isFake && this.id === "spikestrap") {
            const dist = Math.abs((player.x + player.width/2) - (this.x + this.width/2));
            if (dist < 40 && Math.abs(player.y - this.y) < 120) {
                this.isHazard = true;
                player.die("The door bit you!");
            }
        }

        // Troll 3: Teleporting Door (one real exit door that shifts and spawns traps)
        if (!this.isFake && this.id === "teleporting") {
            const dist = Math.abs((player.x + player.width/2) - (this.x + this.width/2));
            if (dist < 70 && Math.abs(player.y - this.y) < 70) {
                const oldX = this.x;
                const oldY = this.y;
                
                // Teleport to starting platform (Template 1 step 1 surface is at y = 14*32 = 448, door sitting at 448-60 = 388)
                this.x = 80;
                this.y = 388;
                this.id = ""; // Disable further teleports
                
                AudioSystem.playTrollLaugh();
                Engine.triggerScreenShake(15);
                
                // Teleport particles
                for (let i = 0; i < 12; i++) {
                    Engine.particles.push(new Particle(oldX + 20, oldY + 30, '#ff3366', (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, 20));
                    Engine.particles.push(new Particle(this.x + 20, this.y + 30, '#2ed573', (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, 20));
                }

                // Spawn spikes at the old door location (where the player is standing!)
                if (level) {
                    const spikeTrap = Entities.create({ type: 'spike', x: oldX, y: oldY + 28 });
                    level.entities.push(spikeTrap);
                }

                if (window.GameUI) {
                    GameUI.showFloatingText("DOOR WARPED! 😜", oldX - 40, oldY - 20);
                }
            }
        }

        // Shifting Door Troll
        if (this.isShifting) {
            this.y += (this.targetY - this.y) * 0.1;
        }

        // Real Door overlap
        if (!this.isFake && !this.isLocked && this.collidesWith(player)) {
            // Next Level trigger
            if (window.GameUI) {
                GameUI.completeLevel();
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Door frame
        ctx.fillStyle = this.isFake ? '#6e1534' : (this.isLocked ? '#555f6b' : '#155e37');
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        
        // Draw arched door
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x, this.y + 15);
        ctx.arc(this.x + this.width/2, this.y + 15, this.width/2, Math.PI, 0);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Door knob
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(this.x + this.width - 8, this.y + this.height/2 + 5, 3, 0, Math.PI*2);
        ctx.fill();

        // If spike trap, show teeth subtly on warning
        if (this.isFake && this.id === "spikestrap" && this.isHazard) {
            ctx.fillStyle = '#ff3366';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + 15);
            ctx.lineTo(this.x + 10, this.y + 30);
            ctx.lineTo(this.x + 20, this.y + 15);
            ctx.lineTo(this.x + 30, this.y + 30);
            ctx.lineTo(this.x + this.width, this.y + 15);
            ctx.fill();
        }

        ctx.restore();
    }
}

// 7. Checkpoints (Real & Fake)
class Checkpoint extends Entity {
    constructor(x, y, isFake = false) {
        super(x, y, 32, 48);
        this.isFake = isFake;
        this.active = false;
        this.exploded = false;
    }

    update(player, level) {
        if (this.exploded) return;

        if (this.collidesWith(player) && !this.active) {
            this.active = true;
            
            if (this.isFake) {
                // Troll: Checkpoint is a bomb!
                this.exploded = true;
                AudioSystem.playBombTrigger();
                setTimeout(() => {
                    AudioSystem.playExplosion();
                    Engine.triggerScreenShake(20);
                    // Spawn explosion particles
                    for (let i = 0; i < 15; i++) {
                        Engine.particles.push(new Particle(
                            this.x + 16,
                            this.y + 16,
                            '#ff6600',
                            (Math.random() - 0.5) * 6,
                            (Math.random() - 0.5) * 6,
                            20
                        ));
                    }
                    if (this.collidesWith(player)) {
                        player.die("Fake checkpoint!");
                    }
                    this.isDestroyed = true;
                }, 400);
            } else {
                // Real checkpoint
                AudioSystem.playCheckpoint();
                level.spawnX = this.x + 4;
                level.spawnY = this.y + 10; // offset slightly so player stands
                
                // Show notification text
                GameUI.showFloatingText("CHECKPOINT SAVED!", this.x, this.y - 15);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Post
        ctx.fillStyle = '#ccc';
        ctx.fillRect(this.x + 6, this.y, 3, this.height);

        // Flag
        const flagColor = this.active ? (this.isFake ? '#ff3366' : '#2ed573') : '#8c96a8';
        ctx.fillStyle = flagColor;
        ctx.beginPath();
        ctx.moveTo(this.x + 9, this.y);
        ctx.lineTo(this.x + this.width, this.y + 10);
        ctx.lineTo(this.x + 9, this.y + 20);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// 8. Coins (Collecting them, some are bombs!)
class Coin extends Entity {
    constructor(x, y, isBomb = false) {
        super(x, y, 20, 20);
        this.isBomb = isBomb;
        this.triggered = false;
        this.bobOffset = Math.random() * Math.PI;
        this.timer = 30; // ticking fuse frames
    }

    update(player, level) {
        if (this.isDestroyed) return;

        if (this.isBomb) {
            const dist = Math.sqrt(Math.pow((player.x + player.width/2) - (this.x + 10), 2) + Math.pow((player.y + player.height/2) - (this.y + 10), 2));
            if (!this.triggered && dist < 45) {
                this.triggered = true;
                AudioSystem.playBombTrigger();
            }

            if (this.triggered) {
                this.timer--;
                if (this.timer <= 0) {
                    this.explode(player);
                }
            }
        }

        if (this.collidesWith(player)) {
            if (!this.isBomb) {
                this.isDestroyed = true;
                AudioSystem.playCoin();
                // Particle gold puff
                for (let i = 0; i < 6; i++) {
                    Engine.particles.push(new Particle(this.x + 10, this.y + 10, '#ffcc00', (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 15));
                }
                GameUI.showFloatingText("+1 Coin (Fake Wealth)", this.x - 20, this.y - 10);
            } else if (!this.triggered) {
                // Direct touch triggers instant explosion
                this.explode(player);
            }
        }
    }

    explode(player) {
        this.isDestroyed = true;
        AudioSystem.playExplosion();
        Engine.triggerScreenShake(20);
        
        for (let i = 0; i < 15; i++) {
            Engine.particles.push(new Particle(
                this.x + 10,
                this.y + 10,
                '#ff3366',
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                20
            ));
        }

        const dist = Math.sqrt(Math.pow((player.x + player.width/2) - (this.x + 10), 2) + Math.pow((player.y + player.height/2) - (this.y + 10), 2));
        if (dist < 55) {
            player.die("Money kills!");
        }
    }

    draw(ctx) {
        ctx.save();
        const bob = Math.sin(performance.now() / 150 + this.bobOffset) * 4;
        
        if (this.isBomb && this.triggered) {
            // Flash red bomb coin
            const flash = Math.floor(performance.now() / 80) % 2 === 0;
            ctx.fillStyle = flash ? '#ff0000' : '#ffcc00';
        } else {
            ctx.fillStyle = '#ffcc00';
        }

        // Draw spinning coin capsule
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 10 + bob, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw inner details
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 10 + bob, 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

// 9. Zone Triggers (Reverse Controls, Gravity Flip, Screen Rotate)
class ZoneTrigger extends Entity {
    constructor(x, y, width = 48, height = 48, type = "reverse", message = "") {
        super(x, y, width, height);
        this.type = type;
        this.message = message;
        this.active = true;
    }

    update(player, level) {
        if (!this.active) return;

        if (this.collidesWith(player)) {
            this.active = false;
            
            if (this.type === "reverse") {
                Input.isReversed = true;
                AudioSystem.playHurt();
                GameUI.showFloatingText(this.message || "Controls Inverted!", player.x - 20, player.y - 20);
            } else if (this.type === "gravity") {
                player.gravityDir = -player.gravityDir;
                AudioSystem.playHurt();
                GameUI.showFloatingText(this.message || "Gravity Flipped!", player.x - 20, player.y - 20);
            } else if (this.type === "rotate") {
                // Toggles 180 degrees screen rotation
                Engine.camera.targetRotateAngle = Engine.camera.targetRotateAngle === 0 ? Math.PI : 0;
                AudioSystem.playHurt();
                GameUI.showFloatingText(this.message || "Screen Rotated!", player.x - 20, player.y - 20);
            } else if (this.type === "fake-lc") {
                // Show fake level complete screen!
                GameUI.showFakeComplete();
            } else if (this.type === "fake-go") {
                // Show fake game over screen!
                GameUI.showFakeGameOver();
            }
        }
    }

    draw(ctx) {
        // Triggers are generally invisible troll zones, but we draw a very subtle glowing swirl to indicate mystery fields
        ctx.save();
        ctx.strokeStyle = this.type === 'gravity' ? 'rgba(51, 204, 255, 0.1)' : 'rgba(255, 51, 102, 0.1)';
        ctx.lineWidth = 1.5;
        
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Spin swirl
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/4, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.restore();
    }
}

// 10. Shifting Barrier Block (Blocks path, moves when approached)
class ShiftingBarrier extends Entity {
    constructor(x, y, targetX, targetY) {
        super(x, y, 32, 64);
        this.startX = x;
        this.startY = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.triggered = false;
    }

    update(player, level) {
        const dist = Math.abs((player.x + player.width/2) - (this.startX + this.width/2));
        if (!this.triggered && dist < 90 && Math.abs(player.y - this.startY) < 60) {
            this.triggered = true;
            AudioSystem.playTrollLaugh();
        }

        if (this.triggered) {
            // Slide barrier block to block player
            this.x += (this.targetX - this.x) * 0.12;
            this.y += (this.targetY - this.y) * 0.12;
        }

        // Solid behavior resolution
        const overlapX = player.x + player.width > this.x && player.x < this.x + this.width;
        const overlapY = player.y + player.height > this.y && player.y < this.y + this.height;

        if (overlapX && overlapY) {
            // Pushes player horizontally out
            if (player.vx > 0) {
                player.x = this.x - player.width;
            } else if (player.vx < 0) {
                player.x = this.x + this.width;
            }
            player.vx = 0;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#7f8c8d';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

class TeleportDoor extends Entity {
    constructor(x, y, targetX, targetY) {
        super(x, y, 40, 60);
        this.targetX = targetX;
        this.targetY = targetY;
        this.cooldown = 0;
    }

    update(player, level) {
        if (this.cooldown > 0) {
            this.cooldown--;
            return;
        }

        if (this.collidesWith(player)) {
            player.x = this.targetX;
            player.y = this.targetY;
            
            AudioSystem.playJump();
            AudioSystem.playHurt();
            
            for (let i = 0; i < 12; i++) {
                Engine.particles.push(new Particle(this.x + 20, this.y + 30, '#9b59b6', (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, 20));
                Engine.particles.push(new Particle(this.targetX + 11, this.targetY + 15, '#9b59b6', (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, 20));
            }

            this.cooldown = 60;
            
            if (window.GameUI) {
                GameUI.showFloatingText("TELEPORTED!", player.x, player.y - 20);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#4a148c';
        ctx.strokeStyle = '#e040fb';
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x, this.y + 15);
        ctx.arc(this.x + this.width/2, this.y + 15, this.width/2, Math.PI, 0);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ab47bc';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + 30, 8, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    }
}

class Key extends Entity {
    constructor(x, y) {
        super(x, y, 24, 24);
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update(player, level) {
        if (this.isDestroyed) return;

        // Collision with player
        if (this.collidesWith(player)) {
            this.isDestroyed = true;
            AudioSystem.playWin(); // sound cue
            
            // Unlock all lock tiles (7) in the level grid
            const map = level.tileMap;
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[y].length; x++) {
                    if (map[y][x] === 7) {
                        map[y][x] = 0; // unlock/vanish!
                    }
                }
            }

            // Unlock any locked door entities
            level.entities.forEach(ent => {
                if (ent instanceof ExitDoor) {
                    ent.isLocked = false;
                }
            });

            if (window.GameUI) {
                GameUI.showFloatingText("KEY COLLECTED! EXIT OPENED! 🔑", this.x - 60, this.y - 20);
            }
            
            // Collect key particles
            for (let i = 0; i < 15; i++) {
                Engine.particles.push(new Particle(this.x + 12, this.y + 12, '#ffcc00', (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, 30));
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Bobbing animation
        const bob = Math.sin(performance.now() / 150 + this.bobOffset) * 4;
        ctx.translate(this.x, this.y + bob);
        
        // Draw Golden Key
        ctx.fillStyle = '#ffcc00';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        
        // Ring
        ctx.beginPath();
        ctx.arc(6, 12, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Ring hole
        ctx.fillStyle = '#181b22'; // match background
        ctx.beginPath();
        ctx.arc(6, 12, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Shaft
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(12, 10, 10, 4);
        ctx.strokeRect(12, 10, 10, 4);
        
        // Teeth
        ctx.fillRect(18, 14, 2, 4);
        ctx.fillRect(20, 14, 2, 4);
        
        ctx.restore();
    }
}

// --- Factory Method ---
const Entities = {
    create(def) {
        switch (def.type) {
            case 'key':
                return new Key(def.x, def.y);
            case 'spike':
                return new Spike(def.x, def.y, 32, 32, def.isFake);
            case 'hidden_spike':
                return new HiddenSpike(def.x, def.y);
            case 'disappearing_platform':
                return new DisappearingPlatform(def.x, def.y);
            case 'moving_platform':
                const mp = new MovingPlatform(def.x, def.y, def.width, def.height, def.targetX, def.targetY, def.speed);
                if (def.id) mp.id = def.id;
                mp.type = 'moving_platform';
                return mp;
            case 'troll_sign':
                return new TrollSign(def.x, def.y, def.text);
            case 'exit_door':
                const door = new ExitDoor(def.x, def.y, def.isFake, def.id, def.realExitX, def.realExitY);
                if (def.isLocked) door.isLocked = true;
                return door;
            case 'teleport_door':
                return new TeleportDoor(def.x, def.y, def.targetX, def.targetY);
            case 'checkpoint':
                return new Checkpoint(def.x, def.y, def.isFake);
            case 'coin':
                return new Coin(def.x, def.y, def.isBomb);
            case 'zone_trigger':
                return new ZoneTrigger(def.x, def.y, def.width, def.height, def.triggerType, def.message);
            case 'shifting_barrier':
                return new ShiftingBarrier(def.x, def.y, def.targetX, def.targetY);
            default:
                console.warn("Unknown entity type:", def.type);
                return new Entity(def.x, def.y, 32, 32);
        }
    }
};

window.Entities = Entities;
