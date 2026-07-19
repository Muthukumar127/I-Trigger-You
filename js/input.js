/* ==========================================================================
   "I Trigger You" Input Controller (Keyboard + Mobile Touch Support)
   ========================================================================== */

const Input = {
    // Current keyboard state
    keys: {},
    // Virtual button states for mobile controls
    virtualKeys: {
        left: false,
        right: false,
        jump: false,
        dash: false
    },
    
    // Troll states
    isReversed: false, // Inverts horizontal movement
    isLocked: false,   // Ignores all inputs

    // Pause toggle tracker
    pausePressed: false,

    init() {
        // Setup Keyboard Event Listeners
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Toggle pause single event to avoid rapid firing
            if (e.code === 'Escape' || e.code === 'KeyP') {
                if (!this.pausePressed) {
                    this.pausePressed = true;
                    if (window.GameUI) {
                        GameUI.togglePause();
                    }
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'Escape' || e.code === 'KeyP') {
                this.pausePressed = false;
            }
        });

        // Setup Mobile Touch Controllers if mobile device
        this.detectAndSetupMobile();
    },

    // Check if the user is holding Left
    get left() {
        if (this.isLocked) return false;
        const rawLeft = this.keys['ArrowLeft'] || this.keys['KeyA'] || this.virtualKeys.left;
        const rawRight = this.keys['ArrowRight'] || this.keys['KeyD'] || this.virtualKeys.right;
        return this.isReversed ? rawRight : rawLeft;
    },

    // Check if the user is holding Right
    get right() {
        if (this.isLocked) return false;
        const rawLeft = this.keys['ArrowLeft'] || this.keys['KeyA'] || this.virtualKeys.left;
        const rawRight = this.keys['ArrowRight'] || this.keys['KeyD'] || this.virtualKeys.right;
        return this.isReversed ? rawLeft : rawRight;
    },

    // Check if the user is holding Jump
    get jump() {
        if (this.isLocked) return false;
        return this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW'] || this.virtualKeys.jump;
    },

    // Check if the user is holding Dash
    get dash() {
        if (this.isLocked) return false;
        return this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyK'] || this.keys['KeyX'] || this.virtualKeys.dash;
    },

    detectAndSetupMobile() {
        const checkVisibility = () => {
            const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            const mobileControls = document.getElementById('mobile-controls');
            if (!mobileControls) return;

            if (isTouchDevice || window.innerWidth < 1024) {
                mobileControls.classList.remove('hidden');
            } else {
                mobileControls.classList.add('hidden');
            }
        };

        checkVisibility();
        window.addEventListener('resize', checkVisibility);

        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            // Helper to bind touch and mouse events to virtual key state
            const bindTouchBtn = (elementId, virtualKeyName) => {
                const btn = document.getElementById(elementId);
                if (!btn) return;

                const startHandler = (e) => {
                    e.preventDefault();
                    AudioSystem.resume(); // Ensure Audio Context resumes on mobile interaction
                    this.virtualKeys[virtualKeyName] = true;
                };

                const endHandler = (e) => {
                    e.preventDefault();
                    this.virtualKeys[virtualKeyName] = false;
                };

                btn.addEventListener('touchstart', startHandler, { passive: false });
                btn.addEventListener('touchend', endHandler, { passive: false });
                btn.addEventListener('touchcancel', endHandler, { passive: false });

                // Mouse events for desktop click testing
                btn.addEventListener('mousedown', (e) => {
                    AudioSystem.resume();
                    this.virtualKeys[virtualKeyName] = true;
                });
                const release = () => { this.virtualKeys[virtualKeyName] = false; };
                btn.addEventListener('mouseup', release);
                btn.addEventListener('mouseleave', release);
            };

            bindTouchBtn('btn-m-left', 'left');
            bindTouchBtn('btn-m-right', 'right');
            bindTouchBtn('btn-m-jump', 'jump');
            bindTouchBtn('btn-m-dash', 'dash');
        }
    },

    reset() {
        this.keys = {};
        this.virtualKeys = {
            left: false,
            right: false,
            jump: false,
            dash: false
        };
        this.isReversed = false;
        this.isLocked = false;
        this.pausePressed = false;
    }
};

window.Input = Input;
