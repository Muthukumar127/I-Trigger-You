/* ==========================================================================
   "I Trigger You" Player Physics and Collisions Engine
   ========================================================================== */

class Player {
    constructor() {
        this.reset(100, 300);
        
        // Dimensions
        this.width = 22;
        this.height = 30;

        // Constants
        this.walkSpeed = 4;
        this.jumpForce = 8.5;
        this.doubleJumpForce = 7.5;
        this.wallSlideSpeed = 1.2;
        this.maxFallSpeed = 12;
        this.gravity = 0.45;
        this.dashSpeed = 11;
        this.dashDuration = 10; // frames
        this.dashCooldown = 25; // frames

        // Face & styling
        this.color = '#33ccff';
        this.faceState = 'idle'; // 'idle', 'jump', 'dash', 'scared', 'dead'
        this.lookDir = 1; // 1 = right, -1 = left
        this.scaleY = 1;  // For squishing/stretching animation
        this.scaleX = 1;
    }

    reset(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.vx = 0;
        this.vy = 0;

        // States
        this.isGrounded = false;
        this.canDoubleJump = true;
        this.wallSlideDir = 0; // -1 = left wall, 1 = right wall, 0 = none
        
        // Dash variables
        this.dashTimer = 0;
        this.dashCooldownTimer = 0;
        this.isDashing = false;
        this.dashDir = 1;

        // Gravity flip mechanic
        this.gravityDir = 1; // 1 = normal, -1 = inverted

        // Controls lock
        this.isDead = false;
        this.respawnTimer = 0;

        // Visual effects
        this.scaleX = 1;
        this.scaleY = 1;
        this.faceState = 'idle';
    }

    update(level) {
        if (this.isDead) {
            this.faceState = 'dead';
            this.respawnTimer--;
            return;
        }

        // Read special level conditions
        const special = level.special || {};
        const friction = special.iceFloor ? 0.025 : 0.2;
        let speedMult = 1.0;
        if (special.stickyFloor) {
            speedMult = 0.35;
        }

        // Gravity overrides
        if (special.lowGravity) {
            this.gravity = 0.15;
            this.jumpForce = 5.2;
            this.doubleJumpForce = 4.8;
        } else if (special.highGravity) {
            this.gravity = 0.85;
            this.jumpForce = 11.5;
            this.doubleJumpForce = 10.0;
        } else {
            this.gravity = 0.45;
            this.jumpForce = 8.5;
            this.doubleJumpForce = 7.5;
        }

        // Mirrored controls toggle
        const oldReversed = Input.isReversed;
        if (special.mirrorControls) {
            Input.isReversed = true;
        }

        // Random gravity flip timer
        if (special.randomGravity) {
            if (!this.randomGravityTimer) this.randomGravityTimer = 180;
            this.randomGravityTimer--;
            if (this.randomGravityTimer <= 0) {
                this.randomGravityTimer = 180;
                this.gravityDir = -this.gravityDir;
                AudioSystem.playHurt();
                if (window.GameUI) {
                    GameUI.showFloatingText("GRAVITY WARP!", this.x, this.y - 20);
                }
            }
        }

        // --- 1. Handle Timers ---
        if (this.dashCooldownTimer > 0) this.dashCooldownTimer--;
        
        if (this.isDashing) {
            this.dashTimer--;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.vx = 0;
            }
            // Spawn trail particles
            if (window.Engine && Math.random() < 0.6) {
                Engine.particles.push(new Particle(
                    this.x + this.width / 2, 
                    this.y + this.height / 2, 
                    'rgba(51, 204, 255, 0.4)', 
                    -this.dashDir * 2, 
                    (Math.random() - 0.5) * 2,
                    15
                ));
            }
        }

        // --- 2. Horizontal Movement ---
        if (!this.isDashing) {
            let targetVx = 0;
            const currentSpeed = this.walkSpeed * speedMult;
            if (Input.left) {
                targetVx = -currentSpeed;
                this.lookDir = -1;
            } else if (Input.right) {
                targetVx = currentSpeed;
                this.lookDir = 1;
            }
            // Linear interpolation for smooth stopping/starting (slippery on ice)
            this.vx += (targetVx - this.vx) * friction;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }

        // --- 3. Gravity and Vertical Movement ---
        if (!this.isDashing) {
            // Apply gravity
            const currentGravity = this.gravity * this.gravityDir;
            this.vy += currentGravity;
            
            // Limit fall speed
            if (this.gravityDir === 1) {
                if (this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;
            } else {
                if (this.vy < -this.maxFallSpeed) this.vy = -this.maxFallSpeed;
            }
        }

        // --- 4. Jumping Mechanics ---
        const jumpPressed = Input.jump;
        const jumpKeyClicked = Input.keys['Space'] || Input.keys['ArrowUp'] || Input.keys['KeyW'] || Input.virtualKeys.jump;

        // Reset jump click latch to prevent continuous jumping if held
        if (!this.lastJumpKeyClicked && jumpKeyClicked) {
            this.handleJumpTrigger(level);
        }
        this.lastJumpKeyClicked = jumpKeyClicked;

        // --- 5. Dashing Mechanic ---
        const dashKeyClicked = Input.dash;
        if (dashKeyClicked && this.dashCooldownTimer <= 0 && !this.isDashing) {
            this.triggerDash();
        }

        // --- 6. Wall Slide Check ---
        this.checkWallSlide(level);

        // --- 7. Resolve Collisions ---
        this.resolveCollisions(level);

        // --- 8. Face State and Animations ---
        this.updateAnimationState(level);

        // Restore mirrored controls flag
        if (special.mirrorControls) {
            Input.isReversed = oldReversed;
        }
    }

    handleJumpTrigger(level) {
        // Wall Jump
        if (this.wallSlideDir !== 0) {
            AudioSystem.playJump();
            // Jump away from wall
            this.vx = -this.wallSlideDir * this.walkSpeed * 1.35;
            this.vy = -this.jumpForce * 0.9 * this.gravityDir;
            
            this.scaleX = 0.7;
            this.scaleY = 1.3;
            
            // Particle burst at wall
            for (let i = 0; i < 6; i++) {
                Engine.particles.push(new Particle(
                    this.x + (this.wallSlideDir > 0 ? this.width : 0),
                    this.y + this.height / 2,
                    '#fff',
                    -this.wallSlideDir * (Math.random() * 2),
                    (Math.random() - 0.5) * 3,
                    10
                ));
            }
            return;
        }

        // Regular Jump
        if (this.isGrounded) {
            if (level.special && level.special.stickyFloor) {
                if (window.GameUI) {
                    GameUI.showFloatingText("TOO STICKY TO JUMP!", this.x, this.y - 20);
                }
                return;
            }
            AudioSystem.playJump();
            this.vy = -this.jumpForce * this.gravityDir;
            this.isGrounded = false;
            this.scaleX = 0.75;
            this.scaleY = 1.25;
            return;
        }

        // Double Jump
        if (this.canDoubleJump) {
            AudioSystem.playJump();
            this.vy = -this.doubleJumpForce * this.gravityDir;
            this.canDoubleJump = false;
            this.scaleX = 0.8;
            this.scaleY = 1.2;
            
            // Double jump rings/particles
            for (let i = 0; i < 8; i++) {
                Engine.particles.push(new Particle(
                    this.x + this.width / 2,
                    this.gravityDir === 1 ? this.y + this.height : this.y,
                    'rgba(255, 255, 255, 0.6)',
                    (Math.random() - 0.5) * 4,
                    this.gravityDir * (Math.random() * 2),
                    12
                ));
            }
        }
    }

    triggerDash() {
        AudioSystem.playDash();
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldownTimer = this.dashCooldown;
        this.dashDir = this.lookDir;
        
        this.vx = this.dashSpeed * this.dashDir;
        this.vy = 0; // Lock gravity vertical movement
        this.scaleX = 1.4;
        this.scaleY = 0.6;

        // Particle dash puff
        for (let i = 0; i < 8; i++) {
            Engine.particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                '#33ccff',
                -this.dashDir * (Math.random() * 3 + 1),
                (Math.random() - 0.5) * 3,
                15
            ));
        }
    }

    checkWallSlide(level) {
        this.wallSlideDir = 0;
        
        // Cannot wall slide on ground or during dash
        if (this.isGrounded || this.isDashing) return;

        // Check if moving towards a wall
        const checkDist = 2;
        let leftWall = this.checkSolidAt(this.x - checkDist, this.y, level) || 
                       this.checkSolidAt(this.x - checkDist, this.y + this.height - 2, level);
        let rightWall = this.checkSolidAt(this.x + this.width + checkDist, this.y, level) || 
                        this.checkSolidAt(this.x + this.width + checkDist, this.y + this.height - 2, level);

        // Can only slide when falling in gravity direction
        const falling = this.gravityDir === 1 ? (this.vy > 0) : (this.vy < 0);

        if (falling) {
            if (leftWall && Input.left) {
                this.wallSlideDir = -1;
                this.vy = this.wallSlideSpeed * this.gravityDir;
            } else if (rightWall && Input.right) {
                this.wallSlideDir = 1;
                this.vy = this.wallSlideSpeed * this.gravityDir;
            }
        }
    }

    resolveCollisions(level) {
        // --- Move X and check X-collisions ---
        this.x += this.vx;
        
        // X Boundaries
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        } else if (this.x + this.width > level.width) {
            this.x = level.width - this.width;
            this.vx = 0;
        }

        let xCollides = this.resolveXCollisions(level);

        // --- Move Y and check Y-collisions ---
        this.y += this.vy;
        
        // Y Boundaries (falling out of bounds kills the player)
        if (this.gravityDir === 1 && this.y > level.height + 100) {
            this.die("Gravity was too strong!");
        } else if (this.gravityDir === -1 && this.y < -100) {
            this.die("Fell into the sky!");
        }

        this.resolveYCollisions(level);
    }

    resolveXCollisions(level) {
        let collides = false;
        
        // Check solid blocks in the physics layer
        const gridXStart = Math.floor(this.x / level.tileSize);
        const gridXEnd = Math.ceil((this.x + this.width) / level.tileSize);
        const gridYStart = Math.floor(this.y / level.tileSize);
        const gridYEnd = Math.ceil((this.y + this.height) / level.tileSize);

        for (let gy = gridYStart; gy < gridYEnd; gy++) {
            for (let gx = gridXStart; gx < gridXEnd; gx++) {
                if (level.isTileSolid(gx, gy)) {
                    // Overlap check
                    const tileX = gx * level.tileSize;
                    const tileY = gy * level.tileSize;
                    
                    if (this.x + this.width > tileX && this.x < tileX + level.tileSize &&
                        this.y + this.height > tileY && this.y < tileY + level.tileSize) {
                        
                        collides = true;
                        if (this.vx > 0) {
                            this.x = tileX - this.width;
                        } else if (this.vx < 0) {
                            this.x = tileX + level.tileSize;
                        }
                        this.vx = 0;
                        break;
                    }
                }
            }
        }
        return collides;
    }

    resolveYCollisions(level) {
        let collides = false;
        
        const gridXStart = Math.floor(this.x / level.tileSize);
        const gridXEnd = Math.ceil((this.x + this.width) / level.tileSize);
        const gridYStart = Math.floor(this.y / level.tileSize);
        const gridYEnd = Math.ceil((this.y + this.height) / level.tileSize);

        // Ground/ceiling reset
        let groundedThisFrame = false;
        let hitCeilingThisFrame = false;

        for (let gy = gridYStart; gy < gridYEnd; gy++) {
            for (let gx = gridXStart; gx < gridXEnd; gx++) {
                if (level.isTileSolid(gx, gy)) {
                    const tileX = gx * level.tileSize;
                    const tileY = gy * level.tileSize;

                    if (this.x + this.width > tileX && this.x < tileX + level.tileSize &&
                        this.y + this.height > tileY && this.y < tileY + level.tileSize) {
                        
                        collides = true;
                        
                        if (this.vy > 0) { // Moving Down
                            if (this.gravityDir === 1) {
                                this.y = tileY - this.height;
                                groundedThisFrame = true;
                            } else {
                                this.y = tileY + level.tileSize;
                                hitCeilingThisFrame = true;
                            }
                        } else if (this.vy < 0) { // Moving Up
                            if (this.gravityDir === 1) {
                                this.y = tileY + level.tileSize;
                                hitCeilingThisFrame = true;
                            } else {
                                this.y = tileY - this.height;
                                groundedThisFrame = true;
                            }
                        }
                        this.vy = 0;
                        break;
                    }
                }
            }
        }

        if (this.gravityDir === 1) {
            this.isGrounded = groundedThisFrame;
            if (this.isGrounded) this.canDoubleJump = true;
        } else {
            this.isGrounded = groundedThisFrame; // Ceilings act as ground
            if (this.isGrounded) this.canDoubleJump = true;
        }
    }

    checkSolidAt(px, py, level) {
        const gx = Math.floor(px / level.tileSize);
        const gy = Math.floor(py / level.tileSize);
        return level.isTileSolid(gx, gy);
    }

    updateAnimationState(level) {
        // Face State Transitions
        if (this.isDead) {
            this.faceState = 'dead';
        } else if (this.isDashing) {
            this.faceState = 'dash';
        } else if (Math.abs(this.vy) > 0.5) {
            this.faceState = 'jump';
        } else {
            this.faceState = 'idle';
        }

        // Stretch / Squish logic
        // Squish when landing
        if (this.isGrounded && this.vy === 0 && this.scaleY < 0.99) {
            this.scaleY += (1 - this.scaleY) * 0.2;
            this.scaleX += (1 - this.scaleX) * 0.2;
        } else {
            // Revert back to 1 over time
            this.scaleX += (1 - this.scaleX) * 0.1;
            this.scaleY += (1 - this.scaleY) * 0.1;
        }

        // Scared near spikes check
        if (!this.isDead && this.faceState === 'idle') {
            let nearHazard = false;
            level.entities.forEach(ent => {
                if (ent.isHazard) {
                    const dx = (ent.x + ent.width / 2) - (this.x + this.width / 2);
                    const dy = (ent.y + ent.height / 2) - (this.y + this.height / 2);
                    if (Math.sqrt(dx*dx + dy*dy) < 55) {
                        nearHazard = true;
                    }
                }
            });
            if (nearHazard) {
                this.faceState = 'scared';
            }
        }
    }

    die(reason) {
        if (this.isDead) return;
        this.isDead = true;
        this.faceState = 'dead';
        this.respawnTimer = 40; // 40 frames animation delay
        this.vx = 0;
        this.vy = 0;

        AudioSystem.playDeath();
        
        if (window.Engine) {
            Engine.triggerScreenShake(15);
            // Spawn death particles (red splatter/blood)
            for (let i = 0; i < 20; i++) {
                Engine.particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    '#ff3366',
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8,
                    25
                ));
            }
            // Trigger ui death event
            if (window.GameUI) {
                GameUI.incrementDeaths(reason);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Translate to player center to squish/stretch
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // Gravity flip inversion
        ctx.scale(1, this.gravityDir);
        ctx.scale(this.scaleX, this.scaleY);

        // Body color & styling
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Draw Cartoon Eyes & Mouth based on state
        ctx.fillStyle = '#000';
        const eyeOffset = this.lookDir * 3;
        
        switch (this.faceState) {
            case 'dead':
                // X Eyes
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1.5;
                // Left X
                ctx.beginPath();
                ctx.moveTo(-7 + eyeOffset, -6); ctx.lineTo(-3 + eyeOffset, -2);
                ctx.moveTo(-3 + eyeOffset, -6); ctx.lineTo(-7 + eyeOffset, -2);
                // Right X
                ctx.moveTo(3 + eyeOffset, -6); ctx.lineTo(7 + eyeOffset, -2);
                ctx.moveTo(7 + eyeOffset, -6); ctx.lineTo(3 + eyeOffset, -2);
                ctx.stroke();
                
                // Straight line mouth
                ctx.beginPath();
                ctx.moveTo(-4 + eyeOffset, 4);
                ctx.lineTo(4 + eyeOffset, 4);
                ctx.stroke();
                break;

            case 'dash':
                // Angry slant eyes, screaming mouth
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                // Left brow/eye
                ctx.moveTo(-8 + eyeOffset, -6); ctx.lineTo(-3 + eyeOffset, -3);
                // Right brow/eye
                ctx.moveTo(8 + eyeOffset, -6); ctx.lineTo(3 + eyeOffset, -3);
                ctx.stroke();

                // Mouth
                ctx.fillStyle = '#600';
                ctx.beginPath();
                ctx.arc(eyeOffset, 4, 3, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'scared':
                // Huge wide round white eyes, tiny pupils
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-5 + eyeOffset, -5, 4, 0, Math.PI * 2);
                ctx.arc(5 + eyeOffset, -5, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-5 + eyeOffset, -5, 1.2, 0, Math.PI * 2);
                ctx.arc(5 + eyeOffset, -5, 1.2, 0, Math.PI * 2);
                ctx.fill();

                // Open mouth
                ctx.fillStyle = '#ff3366';
                ctx.beginPath();
                ctx.arc(eyeOffset, 4, 3, 0, Math.PI);
                ctx.fill();
                break;

            case 'jump':
                // Small squint/joy eyes
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                // Left arc
                ctx.arc(-5 + eyeOffset, -4, 2.5, Math.PI, 0);
                // Right arc
                ctx.arc(5 + eyeOffset, -4, 2.5, Math.PI, 0);
                ctx.stroke();

                // Cute open mouth
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(eyeOffset, 3, 2.5, 0, Math.PI);
                ctx.fill();
                break;

            case 'idle':
            default:
                // Normal round eyes looking towards lookDir
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-5 + eyeOffset, -4, 3.5, 0, Math.PI * 2);
                ctx.arc(5 + eyeOffset, -4, 3.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-5 + eyeOffset + this.lookDir, -4, 1.5, 0, Math.PI * 2);
                ctx.arc(5 + eyeOffset + this.lookDir, -4, 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Normal smiling line
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(eyeOffset, 2, 2.5, 0.1, Math.PI - 0.1);
                ctx.stroke();
                break;
        }

        ctx.restore();
    }
}

window.Player = Player;
