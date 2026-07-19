/* ==========================================================================
   "I Trigger You" Boss AI and Arena Battles
   ========================================================================== */

class Boss extends Entity {
    constructor(x, y, name) {
        super(x, y, 96, 96);
        this.name = name;
        this.health = 100;
        this.maxHealth = 100;
        
        // AI State
        this.state = 'intro'; // 'intro', 'fighting', 'defeated'
        this.stateTimer = 120; // 2 seconds intro
        this.attackCooldown = 0;
        this.attackCycle = 0;
        
        // Float/hover animations
        this.bobOffset = 0;
        
        // Trackers
        this.isHazard = true;
        this.shakeX = 0;
        this.shakeY = 0;
        
        // Spawn damage button
        this.spawnDamageButton();
    }

    spawnDamageButton() {
        // Destroy existing buttons first
        if (Engine.currentLevel) {
            Engine.currentLevel.entities = Engine.currentLevel.entities.filter(ent => !(ent instanceof BossButton));
        }

        // Spawn a button in the level arena
        // Arenas are generally bounded between x: 100 to 860, y: 150 to 450
        // Buttons must spawn low enough (y: 370-410) so player can reach them by jumping from the flat floor (y: 480)
        const bx = 150 + Math.random() * 660;
        const by = 370 + Math.random() * 40;
        
        const button = new BossButton(bx, by, this);
        if (Engine.currentLevel) {
            Engine.currentLevel.entities.push(button);
        }
    }

    takeDamage(amount) {
        if (this.state === 'defeated' || this.state === 'intro') return;
        
        this.health = Math.max(0, this.health - amount);
        this.shakeX = 15;
        this.shakeY = 15;
        Engine.triggerScreenShake(12);
        AudioSystem.playHurt();

        if (this.health <= 0) {
            this.state = 'defeated';
            this.stateTimer = 180; // 3 seconds explosion sequences
            this.isHazard = false;
            AudioSystem.stopMusic();
            AudioSystem.playWin();
            // Remove buttons
            Engine.currentLevel.entities = Engine.currentLevel.entities.filter(ent => !(ent instanceof BossButton));
        } else {
            // Respawn button in new spot
            this.spawnDamageButton();
        }
    }

    update(player, level) {
        // Handle boss shaking
        if (this.shakeX > 0) this.shakeX *= 0.9;
        if (this.shakeY > 0) this.shakeY *= 0.9;

        // Hover bobbing
        this.bobOffset = Math.sin(performance.now() / 250) * 12;

        if (this.state === 'intro') {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.state = 'fighting';
                this.stateTimer = 0;
            }
            return;
        }

        if (this.state === 'defeated') {
            this.stateTimer--;
            // Defeated explosion particles
            if (Math.random() < 0.3) {
                Engine.particles.push(new Particle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    '#ffcc00',
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5,
                    30
                ));
            }

            if (this.stateTimer <= 0) {
                this.isDestroyed = true;
                // Reveal level complete portal/exit door
                const exitDoor = level.entities.find(e => e instanceof ExitDoor);
                if (exitDoor) {
                    exitDoor.isFake = false; // Turn exit real!
                    exitDoor.y = exitDoor.targetY; // Settle it
                    exitDoor.isShifting = false;
                }
                
                // Remove door solid boundaries
                // Clear level solid boundary at door
                for (let gy = 0; gy < level.height/32; gy++) {
                    for (let gx = 0; gx < level.width/32; gx++) {
                        if (level.tileMap[gy][gx] === 7) {
                            level.tileMap[gy][gx] = 0; // Clear solid blocks
                        }
                    }
                }

                GameUI.showFloatingText("BOSS DEFEATED!", this.x, this.y);
            }
            return;
        }

        // --- Fight State AI ---
        if (this.collidesWith(player)) {
            player.die(`${this.name} crushed you!`);
        }

        this.attackCooldown--;
        if (this.attackCooldown <= 0) {
            this.performAttack(player, level);
        }
    }

    performAttack(player, level) {
        // Sub-bosses implement custom patterns
        this.attackCycle = (this.attackCycle + 1) % 3;
        this.attackCooldown = 150 + Math.random() * 100; // 3-4 seconds cooldown
    }

    draw(ctx) {
        // Draw health bar above boss
        ctx.save();
        const hbx = this.x + this.width/2 - 50;
        const hby = this.y - 20 + this.bobOffset;
        
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(hbx, hby, 100, 8);
        ctx.fillStyle = '#ff3366';
        ctx.fillRect(hbx, hby, this.health, 8);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(hbx, hby, 100, 8);
        ctx.restore();
    }
}

// 1. Level 20 Boss: Troll King
class TrollKing extends Boss {
    constructor(x, y) {
        super(x, y, "Troll King");
    }

    performAttack(player, level) {
        super.performAttack(player, level);
        
        // Attack Pattern Selection
        if (this.attackCycle === 0) {
            // Throw Bouncing Crown Spikes
            AudioSystem.playHurt();
            for (let i = -2; i <= 2; i++) {
                if (i === 0) continue;
                level.entities.push(new BouncingProjectile(
                    this.x + this.width/2,
                    this.y + this.height - 10,
                    i * 2.5,
                    -4,
                    '#ffcc00'
                ));
            }
        } else if (this.attackCycle === 1) {
            // Trigger Temp Controls Reverse!
            Input.isReversed = true;
            AudioSystem.playTrollLaugh();
            GameUI.showFloatingText("TROLL KING REVERSED YOUR MIND!", player.x - 30, player.y - 20);
            
            // Revert after 3.5 seconds
            setTimeout(() => {
                Input.isReversed = false;
            }, 3500);
        } else {
            // Drop Falling Spike Hazard on top of Player
            AudioSystem.playHurt();
            level.entities.push(new FallingProjectile(
                player.x + player.width/2 - 16,
                50, // drop from ceiling
                '#ff3366'
            ));
        }
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.save();
        
        const bx = this.x + (Math.random() - 0.5) * this.shakeX;
        const by = this.y + this.bobOffset + (Math.random() - 0.5) * this.shakeY;

        // Draw Gold Crown Blob
        ctx.fillStyle = '#ffcc00';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        
        // Rounded bottom blob
        ctx.beginPath();
        ctx.arc(bx + 48, by + 58, 36, 0, Math.PI, false);
        ctx.lineTo(bx + 12, by + 58);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Crown peaks
        ctx.beginPath();
        ctx.moveTo(bx + 12, by + 58);
        ctx.lineTo(bx + 20, by + 30);
        ctx.lineTo(bx + 36, by + 45);
        ctx.lineTo(bx + 48, by + 20); // main peak
        ctx.lineTo(bx + 60, by + 45);
        ctx.lineTo(bx + 76, by + 30);
        ctx.lineTo(bx + 84, by + 58);
        ctx.stroke();
        ctx.fill();

        // Face
        ctx.fillStyle = '#000';
        // Troll grinning eyes
        ctx.font = '900 16px Outfit';
        ctx.fillText("v   v", bx + 34, by + 66);
        // Smile curve
        ctx.beginPath();
        ctx.arc(bx + 48, by + 74, 8, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
    }
}

// 2. Level 40 Boss: Evil Door
class EvilDoor extends Boss {
    constructor(x, y) {
        super(x, y, "Evil Door");
    }

    performAttack(player, level) {
        super.performAttack(player, level);

        if (this.attackCycle === 0) {
            // Spawn black hole suction center
            AudioSystem.playTrollLaugh();
            GameUI.showFloatingText("DOOR GRAVITY PULL!", this.x, this.y);
            
            let pullFrames = 90; // Pull player for 1.5 seconds
            const pullInterval = setInterval(() => {
                if (Engine.state !== 'playing' || this.health <= 0 || pullFrames-- <= 0) {
                    clearInterval(pullInterval);
                    return;
                }
                const dx = (this.x + this.width/2) - (player.x + player.width/2);
                player.vx += Math.sign(dx) * 0.45; // drag player towards door
            }, 16.66);
        } else if (this.attackCycle === 1) {
            // Fire target arrows directly towards Player
            AudioSystem.playHurt();
            const angle = Math.atan2(
                (player.y + player.height/2) - (this.y + this.height/2),
                (player.x + player.width/2) - (this.x + this.width/2)
            );
            level.entities.push(new TargetArrow(
                this.x + this.width/2,
                this.y + this.height/2,
                angle,
                5.5
            ));
        } else {
            // Spawns 2 exploding fake door hazards in random floor locations
            AudioSystem.playHurt();
            const tx1 = 150 + Math.random() * 200;
            const tx2 = 500 + Math.random() * 250;
            level.entities.push(new ExplodingDoorHazard(tx1, 380));
            level.entities.push(new ExplodingDoorHazard(tx2, 380));
        }
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.save();
        
        const bx = this.x + (Math.random() - 0.5) * this.shakeX;
        const by = this.y + this.bobOffset + (Math.random() - 0.5) * this.shakeY;

        ctx.fillStyle = '#6e1534';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3.5;
        
        // Draw evil archway door
        ctx.beginPath();
        ctx.moveTo(bx + 15, by + this.height);
        ctx.lineTo(bx + 15, by + 30);
        ctx.arc(bx + 48, by + 30, 33, Math.PI, 0);
        ctx.lineTo(bx + 81, by + this.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Evil eyes inside door
        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.arc(bx + 38, by + 40, 5, 0, Math.PI*2);
        ctx.arc(bx + 58, by + 40, 5, 0, Math.PI*2);
        ctx.fill();

        // Teeth below eyes
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx + 35, by + 55);
        ctx.lineTo(bx + 40, by + 62);
        ctx.lineTo(bx + 45, by + 55);
        ctx.lineTo(bx + 48, by + 62);
        ctx.lineTo(bx + 52, by + 55);
        ctx.lineTo(bx + 57, by + 62);
        ctx.lineTo(bx + 61, by + 55);
        ctx.stroke();

        ctx.restore();
    }
}

// 3. Level 60 Boss: Giant Spike Monster
class SpikeMonster extends Boss {
    constructor(x, y) {
        super(x, y, "Spike Monster");
        this.width = 112;
        this.height = 112;
    }

    performAttack(player, level) {
        super.performAttack(player, level);

        if (this.attackCycle === 0) {
            // Ceiling Slam + shockwaves
            AudioSystem.playHurt();
            GameUI.showFloatingText("SPIKE MONSTER SLAM!", this.x, this.y);
            
            // Rise up then slam down
            this.y -= 40;
            setTimeout(() => {
                this.y += 120;
                Engine.triggerScreenShake(25);
                AudioSystem.playExplosion();
                
                // Spawn left & right rolling shockwave spikes
                level.entities.push(new ShockwaveSpike(this.x, 416, -4));
                level.entities.push(new ShockwaveSpike(this.x + this.width, 416, 4));
            }, 300);
            
        } else if (this.attackCycle === 1) {
            // Spin Screen 180 degrees trap!
            Engine.camera.targetRotateAngle = Engine.camera.targetRotateAngle === 0 ? Math.PI : 0;
            AudioSystem.playTrollLaugh();
            GameUI.showFloatingText("GRAVITY WORLD SPIN!", player.x - 30, player.y - 20);
        } else {
            // Rain of falling spikes from above
            AudioSystem.playHurt();
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    if (this.health <= 0 || Engine.state !== 'playing') return;
                    level.entities.push(new FallingProjectile(
                        100 + Math.random() * 700,
                        50,
                        '#ff3366'
                    ));
                }, i * 250);
            }
        }
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.save();
        
        const bx = this.x + (Math.random() - 0.5) * this.shakeX;
        const by = this.y + this.bobOffset + (Math.random() - 0.5) * this.shakeY;

        ctx.fillStyle = '#2c3e50';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        
        // Draw spike ball body
        ctx.beginPath();
        ctx.arc(bx + 56, by + 56, 38, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();

        // Draw spikes shooting outwards
        ctx.fillStyle = '#ff3366';
        const numSpikes = 8;
        for (let i = 0; i < numSpikes; i++) {
            const angle = (i / numSpikes) * Math.PI * 2 + performance.now()/600;
            const sx = bx + 56 + Math.cos(angle) * 38;
            const sy = by + 56 + Math.sin(angle) * 38;
            
            const px = bx + 56 + Math.cos(angle) * 58;
            const py = by + 56 + Math.sin(angle) * 58;
            
            ctx.beginPath();
            ctx.moveTo(sx - Math.sin(angle)*10, sy + Math.cos(angle)*10);
            ctx.lineTo(px, py);
            ctx.lineTo(sx + Math.sin(angle)*10, sy - Math.cos(angle)*10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Angry facial expressions
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Outfit';
        ctx.fillText(">_<", bx + 36, by + 62);

        ctx.restore();
    }
}

// 4. Level 80 Boss: Fake Developer
class FakeDeveloper extends Boss {
    constructor(x, y) {
        super(x, y, "Developer.exe");
    }

    performAttack(player, level) {
        super.performAttack(player, level);

        if (this.attackCycle === 0) {
            // Draw red erase blocks that kill on touch
            AudioSystem.playHurt();
            GameUI.showFloatingText("CODE COMPILER ERASE!", this.x, this.y);
            // Spawn 3 red erasing horizontal beams
            level.entities.push(new EraseBeam(100, player.y - 10, 800, 20));
        } else if (this.attackCycle === 1) {
            // Scale Player! Makes player tiny (hard to jump gaps) or giant (easy hit target)
            AudioSystem.playTrollLaugh();
            const modes = ['tiny', 'giant'];
            const chosen = modes[Math.floor(Math.random() * 2)];
            
            if (chosen === 'tiny') {
                player.width = 11;
                player.height = 15;
                player.walkSpeed = 2.5;
                player.jumpForce = 6.0;
                GameUI.showFloatingText("DEVELOPER CRUSHED YOUR SCALE!", player.x - 30, player.y - 20);
            } else {
                player.width = 44;
                player.height = 60;
                player.walkSpeed = 5.0;
                player.jumpForce = 10.0;
                GameUI.showFloatingText("DEVELOPER EXPANDED YOUR SCALE!", player.x - 30, player.y - 20);
            }

            // Revert scale back in 4 seconds
            setTimeout(() => {
                player.width = 22;
                player.height = 30;
                player.walkSpeed = 4;
                player.jumpForce = 8.5;
            }, 4000);

        } else {
            // Inverts the gravity of player!
            player.gravityDir = -player.gravityDir;
            AudioSystem.playHurt();
            GameUI.showFloatingText("DEVELOPER TOGGLED GRAVITY!", player.x - 30, player.y - 20);
        }
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.save();
        
        const bx = this.x + (Math.random() - 0.5) * this.shakeX;
        const by = this.y + this.bobOffset + (Math.random() - 0.5) * this.shakeY;

        // Draw giant floaty desktop monitor or code cursor
        ctx.fillStyle = '#33ccff';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        
        // Monitor box
        ctx.fillRect(bx + 10, by + 10, 76, 56);
        ctx.strokeRect(bx + 10, by + 10, 76, 56);
        // Stand
        ctx.fillStyle = '#8c96a8';
        ctx.fillRect(bx + 40, by + 66, 16, 16);
        ctx.fillRect(bx + 28, by + 82, 40, 6);

        // Screen code lines
        ctx.fillStyle = '#05060b';
        ctx.fillRect(bx + 16, by + 16, 64, 44);
        
        ctx.fillStyle = '#00ffcc';
        ctx.font = 'bold 8px monospace';
        ctx.fillText("while(true) {", bx + 20, by + 28);
        ctx.fillText("  troll();", bx + 20, by + 38);
        ctx.fillText("}", bx + 20, by + 48);

        ctx.restore();
    }
}

// 5. Level 100 Boss: The Game Itself
class TheGameItself extends Boss {
    constructor(x, y) {
        super(x, y, "I Trigger You");
        this.width = 128;
        this.height = 128;
    }

    performAttack(player, level) {
        super.performAttack(player, level);

        if (this.attackCycle === 0) {
            // Rain of Glitch Syntax Errors
            AudioSystem.playHurt();
            GameUI.showFloatingText("SYNTAX ERROR RAIN!", this.x, this.y);
            
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    if (this.health <= 0 || Engine.state !== 'playing') return;
                    level.entities.push(new SyntaxProjectile(
                        100 + Math.random() * 700,
                        30
                    ));
                }, i * 200);
            }
        } else if (this.attackCycle === 1) {
            // Fake Crash screen BSOD troll!
            AudioSystem.playTrollLaugh();
            GameUI.showFakeBSOD();
        } else {
            // Glitch screen spin rotations + reverse controls
            AudioSystem.playHurt();
            Input.isReversed = true;
            Engine.camera.targetRotateAngle = Math.PI / 2; // spin 90 degrees
            
            setTimeout(() => {
                Input.isReversed = false;
                Engine.camera.targetRotateAngle = 0;
            }, 3000);
        }
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.save();
        
        const bx = this.x + (Math.random() - 0.5) * this.shakeX;
        const by = this.y + this.bobOffset + (Math.random() - 0.5) * this.shakeY;

        // Glowing, flashing glitch cube
        const grad = ctx.createLinearGradient(bx, by, bx + this.width, by + this.height);
        const colorSel = Math.floor(performance.now() / 100) % 3;
        
        if (colorSel === 0) {
            grad.addColorStop(0, '#ff3366');
            grad.addColorStop(1, '#ff00ff');
        } else if (colorSel === 1) {
            grad.addColorStop(0, '#33ccff');
            grad.addColorStop(1, '#00ffcc');
        } else {
            grad.addColorStop(0, '#ffcc00');
            grad.addColorStop(1, '#ff6600');
        }

        ctx.fillStyle = grad;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        
        ctx.fillRect(bx + 16, by + 16, this.width - 32, this.height - 32);
        ctx.strokeRect(bx + 16, by + 16, this.width - 32, this.height - 32);

        // Core Glitch face
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px Courier';
        ctx.fillText("404", bx + 42, by + 74);

        ctx.restore();
    }
}

// --- Supporting Projectiles for Boss Attacks ---

class BouncingProjectile extends Entity {
    constructor(x, y, vx, vy, color) {
        super(x - 8, y - 8, 16, 16);
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.bounces = 3;
        this.isHazard = true;
    }

    update(player, level) {
        this.x += this.vx;
        this.vy += 0.2; // gravity
        this.y += this.vy;

        // Bounce on floor (floor level is ~416 px)
        if (this.y + this.height > 416) {
            this.y = 416 - this.height;
            this.vy = -this.vy * 0.85;
            this.bounces--;
            if (this.bounces <= 0) this.isDestroyed = true;
        }

        // Boundary bounce
        if (this.x < 100 || this.x + this.width > 860) {
            this.vx = -this.vx;
        }

        if (this.collidesWith(player)) {
            player.die("Slammed by projectile!");
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

class FallingProjectile extends Entity {
    constructor(x, y, color) {
        super(x, y, 24, 32);
        this.color = color;
        this.isHazard = true;
    }

    update(player, level) {
        this.y += 6.5; // falls down fast
        if (this.y > 450) {
            this.isDestroyed = true;
            // spawn dirt puffs
            for(let i=0; i<4; i++) Engine.particles.push(new Particle(this.x+12, 416, '#fff', (Math.random()-0.5)*3, -Math.random()*2, 10));
        }

        if (this.collidesWith(player)) {
            player.die("Ceiling spike crushed you!");
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 12, this.y + 32);
        ctx.lineTo(this.x + 24, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

class TargetArrow extends Entity {
    constructor(x, y, angle, speed) {
        super(x - 12, y - 6, 24, 12);
        this.angle = angle;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.isHazard = true;
    }

    update(player, level) {
        this.x += this.vx;
        this.y += this.vy;

        // Clean out of bounds
        if (this.x < 50 || this.x > 910 || this.y < 30 || this.y > 500) {
            this.isDestroyed = true;
        }

        if (this.collidesWith(player)) {
            player.die("Shot by arrow!");
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + 12, this.y + 6);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = '#ff6b6b';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        
        // Arrow shapes
        ctx.beginPath();
        ctx.moveTo(-12, -3);
        ctx.lineTo(4, -3);
        ctx.lineTo(4, -8);
        ctx.lineTo(12, 0);
        ctx.lineTo(4, 8);
        ctx.lineTo(4, 3);
        ctx.lineTo(-12, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
}

class ExplodingDoorHazard extends Entity {
    constructor(x, y) {
        super(x, y, 32, 48);
        this.fuse = 90; // Explodes in 1.5 seconds
        this.isHazard = false;
    }

    update(player, level) {
        this.fuse--;
        if (this.fuse <= 0) {
            this.isDestroyed = true;
            AudioSystem.playExplosion();
            Engine.triggerScreenShake(18);
            
            // Particles
            for (let i = 0; i < 12; i++) {
                Engine.particles.push(new Particle(this.x + 16, this.y + 24, '#ff3366', (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, 20));
            }

            // Explosion radius contact check
            const dx = (player.x + player.width/2) - (this.x + 16);
            const dy = (player.y + player.height/2) - (this.y + 24);
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 64) {
                player.die("Caught in door explosion!");
            }
        }
    }

    draw(ctx) {
        ctx.save();
        const flash = Math.floor(performance.now() / 100) % 2 === 0;
        ctx.fillStyle = flash ? '#6e1534' : '#ff3366';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

class ShockwaveSpike extends Entity {
    constructor(x, y, vx) {
        super(x, y - 32, 24, 32);
        this.vx = vx;
        this.isHazard = true;
    }

    update(player, level) {
        this.x += this.vx;
        if (this.x < 100 || this.x > 860) {
            this.isDestroyed = true;
        }

        if (this.collidesWith(player)) {
            player.die("Shockwave spiked!");
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#ff6600';
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 32);
        ctx.lineTo(this.x + 12, this.y);
        ctx.lineTo(this.x + 24, this.y + 32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

class EraseBeam extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.warningTimer = 45; // warning lines flash first
        this.life = 30; // active beam lasts 30 frames
        this.isHazard = false;
    }

    update(player, level) {
        if (this.warningTimer > 0) {
            this.warningTimer--;
            if (this.warningTimer <= 0) {
                this.isHazard = true;
                AudioSystem.playHurt();
            }
        } else {
            this.life--;
            if (this.life <= 0) this.isDestroyed = true;
            if (this.collidesWith(player)) {
                player.die("Erased by dev beam!");
            }
        }
    }

    draw(ctx) {
        ctx.save();
        if (this.warningTimer > 0) {
            // Flash dotted warning line
            ctx.strokeStyle = 'rgba(255, 51, 102, 0.4)';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        } else {
            // Bright solid red beams
            ctx.fillStyle = '#ff3366';
            ctx.shadowColor = '#ff3366';
            ctx.shadowBlur = 15;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }
}

class SyntaxProjectile extends Entity {
    constructor(x, y) {
        super(x, y, 20, 20);
        this.isHazard = true;
        this.symbol = ["{", "}", ";", "NULL", "ERROR", "NaN"][Math.floor(Math.random()*6)];
        this.rotSpeed = (Math.random() - 0.5) * 0.1;
        this.angle = 0;
    }

    update(player, level) {
        this.y += 4.5;
        this.angle += this.rotSpeed;
        if (this.y > 450) this.isDestroyed = true;

        if (this.collidesWith(player)) {
            player.die(`Compile Error: ${this.symbol}!`);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + 10, this.y + 10);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = '#ff3366';
        ctx.font = '900 12px Courier';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);
        
        ctx.restore();
    }
}

// 11. Boss Button Trigger (Player headbutts or stands on this to deal damage)
class BossButton extends Entity {
    constructor(x, y, bossInstance) {
        super(x - 20, y - 20, 40, 40);
        this.boss = bossInstance;
        this.active = true;
        this.floatOffset = Math.random() * Math.PI;
    }

    update(player, level) {
        if (!this.active) return;
        
        if (this.collidesWith(player)) {
            this.active = false;
            this.isDestroyed = true;
            
            // Deal damage to boss
            this.boss.takeDamage(20);
            AudioSystem.playCoin(); // Ding sound
            
            // Burst sparks
            for (let i = 0; i < 10; i++) {
                Engine.particles.push(new Particle(
                    this.x + 20,
                    this.y + 20,
                    '#00ffcc',
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5,
                    20
                ));
            }
        }
    }

    draw(ctx) {
        ctx.save();
        const f = Math.sin(performance.now() / 200 + this.floatOffset) * 6;
        
        // Shiny cyan circle button
        ctx.fillStyle = '#00ffcc';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 20 + f, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 11px Outfit';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("HIT", this.x + 20, this.y + 20 + f);

        ctx.restore();
    }
}

// --- Factory Method extension ---
const Bosses = {
    create(name, x, y) {
        switch (name) {
            case 'troll_king':
                return new TrollKing(x, y);
            case 'evil_door':
                return new EvilDoor(x, y);
            case 'spike_monster':
                return new SpikeMonster(x, y);
            case 'fake_developer':
                return new FakeDeveloper(x, y);
            case 'game_itself':
                return new TheGameItself(x, y);
            default:
                console.warn("Unknown boss name:", name);
                return new TrollKing(x, y);
        }
    }
};

window.Bosses = Bosses;
