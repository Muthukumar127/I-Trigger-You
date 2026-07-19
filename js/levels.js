/* ==========================================================================
   "I Trigger You" 101 Handcrafted Levels definition
   ========================================================================== */

const Levels = {
    tileSize: 32,

    // Core structural ASCII maps (17 rows x 30 columns)
    templates: [
        // 0: Flat Floor (Boss Arena)
        [
            "##############################",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "##############################"
        ],
        // 1: Easy Steps
        [
            "##############################",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                 ######     #",
            "#            ######          #",
            "#       ######               #",
            "#                            #",
            "#                            #",
            "#    #####                   #",
            "#                            #",
            "##############################"
        ],
        // 2: Pits of Doom
        [
            "##############################",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#       #####                #",
            "#                            #",
            "#                 #####      #",
            "#                            #",
            "#                            #",
            "#   ####      ####      #### #",
            "#   #  #      #  #      #  # #",
            "#   #  #      #  #      #  # #",
            "#####  ########  ########  ###"
        ],
        // 3: Column Climb
        [
            "##############################",
            "#                            #",
            "#                            #",
            "#        #          #        #",
            "#        #          #        #",
            "#        #   #####  #        #",
            "#        #          #        #",
            "#        #          #        #",
            "#     ####          ####     #",
            "#                            #",
            "#   ###                ###   #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#    ####              ####  #",
            "#                            #",
            "##############################"
        ],
        // 4: Zig-zag Gaps
        [
            "##############################",
            "#                            #",
            "#                            #",
            "#       ##############       #",
            "#       #            #       #",
            "#    ####            ####    #",
            "#                            #",
            "#                            #",
            "#    #       ####       #    #",
            "#    ####            ####    #",
            "#       #            #       #",
            "#       ##############       #",
            "#                            #",
            "#                            #",
            "#    ####            ####    #",
            "#                            #",
            "##############################"
        ],
        // 5: Central Ledge
        [
            "##############################",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#         ##########         #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#      ####        ####      #",
            "#                            #",
            "#                            #",
            "#    #                  #    #",
            "##############################"
        ],
        // 6: Under-Over Cavern
        [
            "##############################",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#     #                #     #",
            "#     #                #     #",
            "#     #     ######     #     #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#     ##################     #",
            "#                            #",
            "#                            #",
            "##############################"
        ],
        // 7: High Columns
        [
            "##############################",
            "#                            #",
            "#                            #",
            "#   #        #        #      #",
            "#   #        #        #      #",
            "#   #        #        #      #",
            "#   #   #    #    #   #      #",
            "#   #   #    #    #   #      #",
            "#   #   #    #    #   #      #",
            "#   #   #    #    #   #      #",
            "#       #         #          #",
            "#       #         #          #",
            "#       #         #          #",
            "#       #         #          #",
            "#                            #",
            "#                            #",
            "##############################"
        ],
        // 8: Floating Isles
        [
            "##############################",
            "#                            #",
            "#                            #",
            "#                            #",
            "#        ###       ###       #",
            "#                            #",
            "#                            #",
            "#    ###               ###   #",
            "#                            #",
            "#                            #",
            "#             ###            #",
            "#                            #",
            "#                            #",
            "#      ###           ###     #",
            "#                            #",
            "#                            #",
            "##############################"
        ],
        // 9: The Corridor Crawl
        [
            "##############################",
            "#                            #",
            "#                            #",
            "##############################",
            "#                            #",
            "#                            #",
            "#                            #",
            "##############################",
            "#                            #",
            "#                            #",
            "#                            #",
            "##############################",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "##############################"
        ],
        // 10: Glitch Grid
        [
            "##############################",
            "#                            #",
            "#   #    #    #    #    #    #",
            "#                            #",
            "#     #    #    #    #    #  #",
            "#                            #",
            "#   #    #    #    #    #    #",
            "#                            #",
            "#     #    #    #    #    #  #",
            "#                            #",
            "#   #    #    #    #    #    #",
            "#                            #",
            "#     #    #    #    #    #  #",
            "#                            #",
            "#   #    #    #    #    #    #",
            "#                            #",
            "##############################"
        ],
        // 11: Spike Pit Chamber
        [
            "##############################",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "#                            #",
            "##############################"
        ]
    ],

    // Generate handcrafted details programmatically to save tokens while keeping them original
    get(index) {
        const idx = Math.min(51, Math.max(1, index));
        
        // Mapped level name metadata
        let name = "The Path of Trust";
        let difficulty = "Easy";
        let templateIdx = 1;
        let spawnX = 80;
        let spawnY = 416;
        let entities = [];
        let special = {};
        
        let bossName = null;
        let bossX = 400;
        let bossY = 200;

        // Default finishes
        let defaultExitX = 860;
        let defaultExitY = 388;

        // Dynamic assignments based on pseudo-random hash (except for boss levels and glitch climax)
        const isBoss = (idx % 10 === 0 && idx <= 50);
        if (isBoss) {
            difficulty = "BOSS";
            templateIdx = 0; // Flat floor for Boss arenas
        } else if (idx === 51) {
            difficulty = "GLITCHED";
            templateIdx = 10;
        } else {
            // Pseudo-randomly assign difficulty and template indices to mix up levels chaoticly
            const seed = (idx * 23 + 7) % 101;
            const difficulties = ["Easy", "Normal", "Hard", "Very Hard", "Nightmare"];
            difficulty = difficulties[seed % 5];
            
            // Templates 1 to 11 are available
            templateIdx = 1 + (seed % 11);
        }

        // Adjust default exit position based on template index to fit platform surface
        if (templateIdx === 1) {
            defaultExitX = 20 * 32;
            defaultExitY = 9 * 32 - 60;
        } else if (templateIdx === 3) {
            defaultExitX = 21 * 32;
            defaultExitY = 8 * 32 - 60;
        } else if (templateIdx === 4) {
            defaultExitX = 21 * 32;
            defaultExitY = 14 * 32 - 60;
        } else if (templateIdx === 5) {
            defaultExitX = 21 * 32;
            defaultExitY = 12 * 32 - 60;
        } else if (templateIdx === 6) {
            defaultExitX = 21 * 32;
            defaultExitY = 13 * 32 - 60;
        } else if (templateIdx === 7) {
            defaultExitX = 26 * 32;
            defaultExitY = 10 * 32 - 60;
        } else if (templateIdx === 8) {
            defaultExitX = 24 * 32;
            defaultExitY = 7 * 32 - 60;
        } else if (templateIdx === 9) {
            defaultExitX = 26 * 32;
            defaultExitY = 12 * 32 - 60;
        } else if (templateIdx === 10) {
            defaultExitX = 26 * 32;
            defaultExitY = 14 * 32 - 60;
        }

        // Custom handcrafted names & mechanics for all 101 levels
        const levelNames = {
            1: "The Path of Trust",
            2: "Avoid the Spikes",
            3: "The Rise of Suspicion",
            4: "Flying Exits",
            5: "Slipping Ledges",
            6: "Checkpoint Troll",
            7: "Golden Deception",
            8: "Shifting Walls",
            9: "Mirrored Mind",
            10: "Fake Floor Fiasco",
            11: "Bomb Coin Frenzy",
            12: "The Ultimate Long Jump",
            13: "Upside Down Labyrinth",
            14: "The Flashlight Crawl",
            15: "Slippery Slope",
            16: "The Leap of Faith",
            17: "The Flying Gate",
            18: "Low Gravity Leap",
            19: "Troll Signs Everywhere",
            20: "Troll King's Castle",
            21: "Random Gravity Shift",
            22: "Teleport Trap Cavern",
            23: "The Double Fake Checkpoint",
            24: "Zoom Distort Arena",
            25: "Crush Ledge Jump",
            26: "The Flashlight Forest",
            27: "Mirror World Steps",
            28: "The Glitch Platform",
            29: "Falling Spike Rain",
            30: "Frictionless Frost",
            31: "Sticky Tar Pit",
            32: "Ceiling Run Crawl",
            33: "Reverse Gravity Dash",
            34: "Zoom In, Zoom Out",
            35: "High Gravity Heavy Jump",
            36: "Exploding Coin Run",
            37: "The Floating Isle Gaps",
            38: "Portal Paradox",
            39: "Compression Zone Run",
            40: "Quest for the Key",
            41: "Portal Paradox",
            42: "The Moving Spike Maze",
            43: "Sticky Gravity Warp",
            44: "Erase Beam Tunnel",
            45: "Fake Level Exit Combo",
            46: "Glitch Code Rainfall",
            47: "Dark Flashlight Jumps",
            48: "The Triple Door Trap",
            49: "Mirrored Low Gravity",
            50: "Gravity Flip Matrix",
            51: "Ice Spike Slide",
            52: "Conveyor Belt Crawl",
            53: "Exploding Gate Portal",
            54: "Double Gravity Oscillations",
            55: "Darkness and Shifting Walls",
            56: "Zoom Out Spike Gauntlet",
            57: "Mirror Ice Slide",
            58: "Trigger Master Run",
            59: "Fake BSOD Terminal",
            60: "Spike Monster's Den",
            61: "Ultimate Screen Rotation",
            62: "Nightmare Portal Jump",
            63: "Flipped Ice Ledge",
            64: "Flashlight Laser Path",
            65: "The Ticking Wealth Trap",
            66: "Sticky Mirror Walls",
            67: "Teleportation Void",
            68: "Low Gravity Spike Pit",
            69: "Fake Completes Everywhere",
            70: "Crushing Gate Maze",
            71: "Ice Gravity Flipper",
            72: "Flashlight Maze Run",
            73: "Infinite Spike Loop",
            74: "Dev Laser Gauntlet",
            75: "Mirrored Screen Spin",
            76: "Conveyor Gravity Shift",
            77: "Exploding Path Dash",
            78: "Low Gravity Glitch Maze",
            79: "The Fake Exit Spin",
            80: "Developer's Terminal",
            81: "Nightmare Gravity Jump",
            82: "Mirror Darkness Flashlight",
            83: "Ice Laser Sliders",
            84: "Random Spikes Ledge",
            85: "Hyper Gravity Dash",
            86: "The Teleport Spike Run",
            87: "Flipped Mirror Sticky Mud",
            88: "Erase Beam Matrix",
            89: "Dark Shifting Gaps",
            90: "Screen Spin Flashlight Flip",
            91: "Syntax Glitch Storm",
            92: "Mirrored Darkness Ice Floor",
            93: "Gravity Warp Speed Boost",
            94: "Infinite Door Lies",
            95: "Sticky Gravity Flip Crawl",
            96: "Nightmare Portal Vortex",
            97: "Laser Maze Rotation",
            98: "Mirrored Low Gravity Darkness",
            99: "The Penultimate Rage Gate",
            100: "The Game Itself",
            101: "I Triggered You Again"
        };

        if (levelNames[idx]) {
            name = levelNames[idx];
        }

        // --- SPECIFIC LEVEL CONFIGURATIONS ---

        // Level 1: Walk right.
        if (idx === 1) {
            entities.push({ type: 'coin', x: 450, y: 410, isBomb: false });
            entities.push({ type: 'troll_sign', x: 280, y: 416, text: "WALK RIGHT TO WIN!" });
            
            // Bottom fake spikes
            entities.push({ type: 'spike', x: 250, y: 480, isFake: true });
            entities.push({ type: 'spike', x: 380, y: 480, isFake: true });
            entities.push({ type: 'spike', x: 780, y: 480, isFake: true });
            
            // Bottom real spike (the real trap!)
            entities.push({ type: 'spike', x: 500, y: 480, isFake: false });
            
            // Moving platform (elevator) on the right edge that starts moving upward when player approaches
            entities.push({ type: 'moving_platform', x: 830, y: 480, width: 64, height: 24, targetX: 830, targetY: 480, speed: 2, id: 'elevator' });
        }

        // Level 2: Spikes introduction
        else if (idx === 2) {
            entities.push({ type: 'spike', x: 420, y: 480 });
            entities.push({ type: 'troll_sign', x: 260, y: 416, text: "JUMP OVER THE SPIKE!" });
        }

        // Level 3: Hidden Spikes introduction
        else if (idx === 3) {
            entities.push({ type: 'hidden_spike', x: 480, y: 480 });
            entities.push({ type: 'troll_sign', x: 300, y: 416, text: "SAFE FLOOR ahead..." });
        }

        // Level 4: Teleport Paradox
        else if (idx === 4) {
            entities.push({ type: 'exit_door', x: defaultExitX, y: defaultExitY, isFake: false, id: 'teleporting' });
            entities.push({ type: 'troll_sign', x: 320, y: 416, text: "THE GATEWAY AWAITS!" });
        }

        // Level 5: Disappearing Ledges
        else if (idx === 5) {
            entities.push({ type: 'disappearing_platform', x: 350, y: 416 });
            entities.push({ type: 'disappearing_platform', x: 500, y: 380 });
            entities.push({ type: 'spike', x: 440, y: 480 });
        }

        // Level 6: Checkpoint Troll
        else if (idx === 6) {
            entities.push({ type: 'checkpoint', x: 400, y: 400, isFake: true }); // Explodes!
            entities.push({ type: 'troll_sign', x: 250, y: 416, text: "SAVE POINT!" });
        }

        // Level 7: Golden Deception
        else if (idx === 7) {
            entities.push({ type: 'coin', x: 350, y: 400, isBomb: true }); // Bomb coin!
            entities.push({ type: 'coin', x: 500, y: 400, isBomb: false });
        }

        // Level 8: Shifting Walls
        else if (idx === 8) {
            entities.push({ type: 'shifting_barrier', x: 740, y: 352, targetX: 740, targetY: 384 });
            entities.push({ type: 'troll_sign', x: 500, y: 380, text: "RUN QUICKLY!" });
        }

        // Level 9: Mirrored Mind
        else if (idx === 9) {
            special.mirrorControls = true;
            entities.push({ type: 'troll_sign', x: 250, y: 416, text: "LEFT IS RIGHT!" });
        }



        // Level 10: BOSS Troll King
        else if (idx === 10) {
            templateIdx = 0; // Flat Floor
            bossName = 'troll_king';
            bossX = 400; bossY = 280;
            spawnX = 120; spawnY = 380;
            entities.push({ type: 'exit_door', x: defaultExitX, y: defaultExitY, isFake: false });
        }

        // Level 11: Low Gravity Leap
        else if (idx === 11) {
            special.lowGravity = true;
            entities.push({ type: 'spike', x: 450, y: 480 });
        }

        // Level 12: The Ultimate Long Jump
        else if (idx === 12) {
            templateIdx = 2; // Pits of Doom
            spawnX = 80; spawnY = 380; // start on the left step
            special.lowGravity = true;
            
            // Spike pit across the entire middle
            for (let x = 160; x <= 704; x += 32) {
                entities.push({ type: 'spike', x: x, y: 480 });
            }
            
            // Hanging ceiling spikes that you have to steer around in mid-air
            entities.push({ type: 'spike', x: 380, y: 32 });
            entities.push({ type: 'spike', x: 480, y: 32 });
            
            // Floating real checkpoint in the middle of the sky (funny respawn fall trap!)
            entities.push({ type: 'checkpoint', x: 400, y: 220, isFake: false });
            
            // Signs
            entities.push({ type: 'troll_sign', x: 80, y: 350, text: "☁️ TIME YOUR LONG JUMP! ☁️" });
            entities.push({ type: 'troll_sign', x: 420, y: 448, text: "HAHA, YOU FELL! 😜" });
        }

        // Level 14: Zoom Distort Arena
        else if (idx === 14) {
            special.zoom = 0.65; // zoomed out
            entities.push({ type: 'spike', x: 450, y: 480 });
        }

        // Level 15: Frictionless Frost (Ice + Spikes)
        else if (idx === 15) {
            special.iceFloor = true;
            special.mirrorControls = true;
            entities.push({ type: 'spike', x: 450, y: 480 });
        }

        // Level 16: The Leap of Faith (Invisible Bridge)
        else if (idx === 16) {
            templateIdx = 2; // Pits of Doom
            spawnX = 80; spawnY = 380; // spawn on left ledge
            
            // Spike pit across the entire middle
            for (let x = 160; x <= 704; x += 32) {
                entities.push({ type: 'spike', x: x, y: 480 });
            }
            
            // Create invisible platforms in the middle of the pit (row 13)
            // We use setTimeout to modify the map after it is initialized/loaded!
            setTimeout(() => {
                const map = Engine.currentLevel.tileMap;
                if (!map) return;
                
                // Invisible platform 1: columns 9-10
                map[13][9] = 8; map[13][10] = 8;
                
                // Invisible platform 2: columns 14-15
                map[13][14] = 8; map[13][15] = 8;
                
                // Invisible platform 3: columns 19-20
                map[13][19] = 8; map[13][20] = 8;
            }, 0);
            
            // Place guide coins floating right above the invisible platforms
            entities.push({ type: 'coin', x: 9.5 * 32, y: 360, isBomb: false });
            entities.push({ type: 'coin', x: 14.5 * 32, y: 360, isBomb: false });
            entities.push({ type: 'coin', x: 19.5 * 32, y: 360, isBomb: false });
            
            // Signs
            entities.push({ type: 'troll_sign', x: 80, y: 350, text: "✨ TRUST THE COINS! ✨" });
            entities.push({ type: 'troll_sign', x: 420, y: 448, text: "LEAP OF FAITH!" });
        }

        // Level 18: High Gravity Heavy Jump
        else if (idx === 18) {
            special.highGravity = true;
            entities.push({ type: 'spike', x: 400, y: 480 });
        }

        // Level 20: BOSS Evil Door
        else if (idx === 20) {
            templateIdx = 0; // Flat Floor
            bossName = 'evil_door';
            bossX = 430; bossY = 280;
            spawnX = 120; spawnY = 380;
            entities.push({ type: 'exit_door', x: defaultExitX, y: defaultExitY, isFake: false });
        }

        // Level 21: Screen Flip Dash (Rotation)
        else if (idx === 21) {
            entities.push({ type: 'zone_trigger', x: 300, y: 350, width: 48, height: 100, triggerType: 'rotate', message: 'SCREEN FLIP!' });
            entities.push({ type: 'spike', x: 500, y: 480 });
        }

        // Level 22: Teleport Paradox Maze (Custom Hard Level)
        else if (idx === 22) {
            templateIdx = 4; // Zig-zag Gaps
            special.mirrorControls = true;
            special.lowGravity = true;
            special.zoom = 0.7;
            
            // Real exit door placed at the bottom left (behind starting ledge, initially hidden/safe)
            entities.push({ type: 'exit_door', x: 40, y: 416, isFake: false });
            // Fake exit door at top right (defaultExitX, defaultExitY)
            entities.push({ type: 'exit_door', x: defaultExitX, y: defaultExitY, isFake: true, id: 'flying' });
            
            // Portals that loop the player around
            entities.push({ type: 'teleport_door', x: 200, y: 416, targetX: 600, targetY: 250 });
            entities.push({ type: 'teleport_door', x: 600, y: 288, targetX: 320, targetY: 250 });
            
            // Spikes right next to the portals to trigger immediate deaths if player is not careful!
            entities.push({ type: 'spike', x: 240, y: 416 });
            entities.push({ type: 'spike', x: 640, y: 288 });
            entities.push({ type: 'spike', x: 360, y: 288 });
            
            // Bomb coins to bait the player
            entities.push({ type: 'coin', x: 400, y: 400, isBomb: true });
            entities.push({ type: 'coin', x: 500, y: 200, isBomb: true });
            
            entities.push({ type: 'troll_sign', x: 300, y: 416, text: "PORTALS ARE TRAPS!" });
        }

        // Level 25: Gravity Flip Matrix
        else if (idx === 25) {
            entities.push({ type: 'zone_trigger', x: 280, y: 350, width: 64, height: 100, triggerType: 'gravity', message: 'UP IS DOWN!' });
            entities.push({ type: 'zone_trigger', x: 580, y: 150, width: 64, height: 100, triggerType: 'gravity', message: 'DOWN IS UP!' });
            entities.push({ type: 'spike', x: 450, y: 480 });
            entities.push({ type: 'spike', x: 450, y: 32 });
        }

        // Level 26: The Flashlight Forest (Custom Hard Level)
        else if (idx === 26) {
            templateIdx = 8; // Floating Isles
            special.darkness = true;
            special.zoom = 0.75;
            
            // Exit door on right (at x = 24*32 = 768, y = 7*32 - 60 = 164)
            entities.push({ type: 'exit_door', x: 768, y: 164, isFake: false });
            
            // Hidden spikes in the dark path
            entities.push({ type: 'hidden_spike', x: 150, y: 224 });
            entities.push({ type: 'hidden_spike', x: 280, y: 320 });
            entities.push({ type: 'hidden_spike', x: 400, y: 416 });
            entities.push({ type: 'hidden_spike', x: 520, y: 320 });
            entities.push({ type: 'hidden_spike', x: 650, y: 224 });
            entities.push({ type: 'hidden_spike', x: 780, y: 320 });
            
            // Add some real spikes on the floor gaps to punish falling blindly
            entities.push({ type: 'spike', x: 300, y: 480 });
            entities.push({ type: 'spike', x: 450, y: 480 });
            entities.push({ type: 'spike', x: 600, y: 480 });
            
            // Disappearing platforms over the bottom spikes
            entities.push({ type: 'disappearing_platform', x: 320, y: 400 });
            entities.push({ type: 'disappearing_platform', x: 580, y: 400 });
            
            // A fake checkpoint that explodes
            entities.push({ type: 'checkpoint', x: 480, y: 280, isFake: true });
            
            // A sign hidden in the shadows
            entities.push({ type: 'troll_sign', x: 180, y: 224, text: "JUMP BLINDLY!" });
        }

        // Level 29: Fake BSOD Terminal
        else if (idx === 29) {
            entities.push({ type: 'zone_trigger', x: 400, y: 380, width: 64, height: 100, triggerType: 'fake-go' }); // Trigger fake Game Over
        }

        // Level 30: BOSS Spike Monster
        else if (idx === 30) {
            templateIdx = 0; // Flat Floor
            bossName = 'spike_monster';
            bossX = 400; bossY = 250;
            spawnX = 120; spawnY = 380;
            entities.push({ type: 'exit_door', x: defaultExitX, y: defaultExitY, isFake: false });
        }

        // Level 35: Crushing Gate Maze (Multiple Shifting barriers)
        else if (idx === 35) {
            entities.push({ type: 'shifting_barrier', x: 350, y: 352, targetX: 350, targetY: 384 });
            entities.push({ type: 'shifting_barrier', x: 600, y: 352, targetX: 600, targetY: 384 });
        }

        // Level 39: Compression Zone Run
        else if (idx === 39) {
            templateIdx = 0; // Flat Floor
            spawnX = 80; spawnY = 416; // spawn on flat ground
            special.verticalCrush = true; // Activate closing crush walls!
            
            // Exit door at bottom right
            entities.push({ type: 'exit_door', x: 860, y: 388, isFake: false });
            
            // Speedrun obstacles (spikes to hop over quickly!)
            entities.push({ type: 'spike', x: 260, y: 480 });
            entities.push({ type: 'spike', x: 440, y: 480 });
            entities.push({ type: 'spike', x: 640, y: 480 });
            
            // Low ceiling spikes to discourage high jumping (descending ceiling makes high jumping dangerous!)
            entities.push({ type: 'spike', x: 350, y: 320 });
            entities.push({ type: 'spike', x: 550, y: 320 });
            
            // Real checkpoint in the middle
            entities.push({ type: 'checkpoint', x: 480, y: 380, isFake: false });
            
            // Signs
            entities.push({ type: 'troll_sign', x: 80, y: 350, text: "⚠️ CLOSING WALLS! RUN FAST! ⚠️" });
            entities.push({ type: 'troll_sign', x: 380, y: 350, text: "DON'T JUMP TOO HIGH! ⚡" });
        }

        // Level 40: Quest for the Key
        else if (idx === 40) {
            templateIdx = 7; // High Columns
            spawnX = 80; spawnY = 416; // bottom left
            
            // Locked exit door at bottom right (x = 800, y = 388)
            entities.push({ type: 'exit_door', x: 800, y: 388, isFake: false, isLocked: true });
            
            // The Key: placed at the top of the middle column (x = 400, y = 160)
            entities.push({ type: 'key', x: 400, y: 160 });
            
            // Handcrafted traps in the level:
            // Spikes on the floor of the middle-left section
            entities.push({ type: 'spike', x: 250, y: 416 });
            entities.push({ type: 'spike', x: 290, y: 416 });
            
            // Spikes on the floor of the middle-right section
            entities.push({ type: 'spike', x: 550, y: 416 });
            entities.push({ type: 'spike', x: 590, y: 416 });
            
            // Disappearing platforms to help climb up to the key
            entities.push({ type: 'disappearing_platform', x: 180, y: 320 });
            entities.push({ type: 'disappearing_platform', x: 620, y: 320 });
            
            // Shifting barriers
            entities.push({ type: 'shifting_barrier', x: 300, y: 300, targetX: 300, targetY: 332 });
            entities.push({ type: 'shifting_barrier', x: 500, y: 300, targetX: 500, targetY: 332 });
            
            // Checkpoint: real checkpoint in the center columns area
            entities.push({ type: 'checkpoint', x: 480, y: 280, isFake: false });
            
            // Sign at spawn
            entities.push({ type: 'troll_sign', x: 100, y: 416, text: "🔑 FIND KEY TO OPEN DOOR!" });
        }

        // Level 41: Portal Paradox
        else if (idx === 41) {
            templateIdx = 8; // Floating Isles
            spawnX = 80; spawnY = 380; // Left isle
            
            // Build high center platform dynamically (row 4, columns 12-18)
            setTimeout(() => {
                const map = Engine.currentLevel.tileMap;
                if (!map) return;
                for (let x = 12; x <= 18; x++) {
                    map[4][x] = 1;
                }
            }, 0);
            
            // Portals:
            // Portal 1 (Left Isle): warps you to Middle Isle
            entities.push({ type: 'teleport_door', x: 180, y: 356, targetX: 480, targetY: 256 });
            
            // Portal 2 (Middle Isle): warps you to Right Isle
            entities.push({ type: 'teleport_door', x: 500, y: 260, targetX: 800, targetY: 356 });
            
            // Portal 3 (Right Isle): warps you up to the High Center Platform!
            entities.push({ type: 'teleport_door', x: 800, y: 356, targetX: 480, targetY: 96 });
            
            // Exit Doors:
            // 1. Fake Exit Door on the right isle (default location, flies away!)
            entities.push({ type: 'exit_door', x: defaultExitX, y: defaultExitY, isFake: true, id: 'flying' });
            
            // 2. Real Exit Door on the High Center Platform (x = 480, y = 68)
            entities.push({ type: 'exit_door', x: 480, y: 68, isFake: false });
            
            // Checkpoint: on the Middle Isle
            entities.push({ type: 'checkpoint', x: 440, y: 280, isFake: false });
            
            // Spikes in the pits between islands
            for (let x = 256; x <= 352; x += 32) {
                entities.push({ type: 'spike', x: x, y: 480 });
            }
            for (let x = 608; x <= 704; x += 32) {
                entities.push({ type: 'spike', x: x, y: 480 });
            }
            
            // Signs
            entities.push({ type: 'troll_sign', x: 80, y: 350, text: "🔮 ENTER THE PORTALS! 🔮" });
        }

        // Level 42: Random Spikes Ledge
        else if (idx === 42) {
            special.randomSpikes = true;
            entities.push({ type: 'hidden_spike', x: 300, y: 480 });
            entities.push({ type: 'hidden_spike', x: 500, y: 480 });
        }

        // Level 45: Screen Spin Flashlight Flip
        else if (idx === 45) {
            special.darkness = true;
            entities.push({ type: 'zone_trigger', x: 300, y: 350, width: 48, height: 100, triggerType: 'rotate', message: 'ROTATED MIND!' });
            entities.push({ type: 'spike', x: 500, y: 480 });
        }

        // Level 50: BOSS The Game Itself
        else if (idx === 50) {
            templateIdx = 0; // Flat Floor
            
            // Check if player has been trolled by the fake ending first
            if (window.Engine && Engine.level50Trolled) {
                bossName = 'game_itself';
                bossX = 400; bossY = 220;
                spawnX = 120; spawnY = 380;
                entities.push({ type: 'exit_door', x: defaultExitX, y: defaultExitY, isFake: false });
                entities.push({ type: 'troll_sign', x: 200, y: 380, text: "I TRIGGER YOU PART 2: THE BOSS FIGHT!" });
            } else {
                // Safe-looking arena with NO boss at the start!
                bossName = null;
                spawnX = 120; spawnY = 380;
                // Fake exit door that traps and kills the player
                entities.push({ type: 'exit_door', x: defaultExitX, y: defaultExitY, isFake: true, id: 'l50_troll_door' });
                entities.push({ type: 'troll_sign', x: 200, y: 380, text: "WALK TO EXIT TO CLEAR THE GAME!" });
            }
        }

        // Level 51: "I Triggered You Again" (The Secret Final Challenge)
        else if (idx === 51) {
            templateIdx = 0; // Flat Floor
            spawnX = 100; spawnY = 200;
            special.darkness = true;
            special.randomGravity = true;
            special.mirrorControls = true;
            special.zoom = 0.75;
            
            // Plaster hazard fields and layout
            for (let x = 180; x < 850; x += 100) {
                entities.push({ type: 'spike', x: x, y: 480 });
                entities.push({ type: 'spike', x: x + 50, y: 32 });
            }
            entities.push({ type: 'exit_door', x: defaultExitX, y: defaultExitY, isFake: true, id: 'flying' });
            entities.push({ type: 'troll_sign', x: 500, y: 380, text: "WELCOME TO THE FINAL RAGE!" });
        }

        // Dynamic Trap Generator - places 8 to 20 traps per level based on the selected template structure
        // Boss levels have fewer traps to keep them beatable.
        let trapCount = 8 + (idx * 7 + 3) % 13; // 8 to 20 traps
        if (idx === 1 || idx === 12 || idx === 16 || idx === 22 || idx === 26 || idx === 39 || idx === 40 || idx === 41) {
            trapCount = 0; // Handcrafted entirely
        } else if (idx % 10 === 0) {
            trapCount = 4; // Boss levels have 4 hazards
        }
        
        let slots = [];
        switch (templateIdx) {
            case 0: // Boss Arena (Flat)
                slots = [
                    { x: 180, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 300, y: 480, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 500, y: 480, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 620, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 740, y: 480, types: ['spike', 'zone_reverse'] },
                    { x: 150, y: 220, types: ['disappearing_platform', 'coin_real'] },
                    { x: 750, y: 220, types: ['disappearing_platform', 'coin_real'] }
                ];
                break;
            case 1: // Easy Steps
                slots = [
                    { x: 160, y: 416, types: ['spike', 'hidden_spike'] },
                    { x: 220, y: 416, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 280, y: 320, types: ['spike', 'disappearing_platform'] },
                    { x: 340, y: 320, types: ['coin_bomb', 'hidden_spike'] },
                    { x: 420, y: 288, types: ['spike', 'shifting_barrier', 'fake_door_spike'] },
                    { x: 480, y: 288, types: ['hidden_spike', 'checkpoint_fake'] },
                    { x: 600, y: 256, types: ['spike', 'disappearing_platform'] },
                    { x: 660, y: 256, types: ['hidden_spike', 'coin_bomb', 'fake_door_flying'] },
                    { x: 720, y: 256, types: ['spike', 'shifting_barrier'] },
                    { x: 250, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 380, y: 480, types: ['hidden_spike', 'spike'] },
                    { x: 500, y: 480, types: ['spike', 'zone_reverse'] },
                    { x: 620, y: 480, types: ['hidden_spike', 'zone_gravity'] },
                    { x: 780, y: 480, types: ['spike', 'zone_rotate'] },
                    { x: 300, y: 200, types: ['coin_bomb', 'coin_real'] },
                    { x: 520, y: 160, types: ['coin_bomb', 'coin_real'] },
                    { x: 700, y: 120, types: ['coin_bomb', 'coin_real'] },
                    { x: 450, y: 256, types: ['checkpoint_fake', 'checkpoint_real'] }
                ];
                break;
            case 2: // Pits of Doom
                slots = [
                    { x: 150, y: 384, types: ['spike', 'hidden_spike'] },
                    { x: 240, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 280, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 340, y: 320, types: ['spike', 'disappearing_platform', 'fake_door_flying'] },
                    { x: 400, y: 320, types: ['hidden_spike', 'checkpoint_fake'] },
                    { x: 520, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 560, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 620, y: 352, types: ['spike', 'shifting_barrier'] },
                    { x: 700, y: 352, types: ['hidden_spike', 'coin_bomb', 'fake_door_spike'] },
                    { x: 760, y: 352, types: ['spike', 'zone_reverse'] },
                    { x: 200, y: 220, types: ['disappearing_platform', 'coin_bomb'] },
                    { x: 480, y: 200, types: ['disappearing_platform', 'coin_real'] },
                    { x: 650, y: 180, types: ['disappearing_platform', 'coin_bomb'] },
                    { x: 300, y: 320, types: ['zone_gravity', 'zone_rotate'] }
                ];
                break;
            case 3: // Column Climb
                slots = [
                    { x: 120, y: 416, types: ['spike', 'hidden_spike'] },
                    { x: 200, y: 416, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 280, y: 224, types: ['spike', 'disappearing_platform'] },
                    { x: 280, y: 160, types: ['spike', 'hidden_spike'] },
                    { x: 420, y: 320, types: ['spike', 'shifting_barrier', 'fake_door_spike'] },
                    { x: 460, y: 320, types: ['hidden_spike', 'checkpoint_fake'] },
                    { x: 580, y: 224, types: ['spike', 'disappearing_platform', 'fake_door_flying'] },
                    { x: 580, y: 160, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 720, y: 416, types: ['spike', 'zone_reverse'] },
                    { x: 800, y: 416, types: ['hidden_spike', 'zone_gravity'] },
                    { x: 320, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 520, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 450, y: 200, types: ['coin_bomb', 'coin_real'] }
                ];
                break;
            case 4: // Zig-zag Gaps
                slots = [
                    { x: 120, y: 416, types: ['spike', 'hidden_spike'] },
                    { x: 240, y: 416, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 160, y: 288, types: ['spike', 'disappearing_platform', 'fake_door_flying'] },
                    { x: 280, y: 288, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 400, y: 256, types: ['spike', 'shifting_barrier', 'fake_door_spike'] },
                    { x: 480, y: 256, types: ['hidden_spike', 'checkpoint_fake'] },
                    { x: 600, y: 288, types: ['spike', 'disappearing_platform'] },
                    { x: 660, y: 288, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 740, y: 416, types: ['spike', 'zone_reverse'] },
                    { x: 800, y: 416, types: ['hidden_spike', 'zone_gravity'] },
                    { x: 450, y: 160, types: ['coin_bomb', 'coin_real'] }
                ];
                break;
            case 5: // Central Ledge
                slots = [
                    { x: 150, y: 416, types: ['spike', 'hidden_spike'] },
                    { x: 250, y: 416, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 350, y: 192, types: ['spike', 'disappearing_platform', 'fake_door_flying'] },
                    { x: 450, y: 192, types: ['hidden_spike', 'checkpoint_fake'] },
                    { x: 550, y: 192, types: ['spike', 'shifting_barrier'] },
                    { x: 650, y: 416, types: ['hidden_spike', 'coin_bomb', 'fake_door_spike'] },
                    { x: 750, y: 416, types: ['spike', 'zone_reverse'] },
                    { x: 200, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 400, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 560, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 700, y: 480, types: ['spike', 'zone_rotate'] }
                ];
                break;
            case 6: // Under-Over Cavern
                slots = [
                    // Traps inside the spacious cavern chamber (high ceiling)
                    { x: 250, y: 416, types: ['spike', 'hidden_spike'] },
                    { x: 380, y: 416, types: ['hidden_spike', 'disappearing_platform'] },
                    { x: 450, y: 256, types: ['spike', 'shifting_barrier', 'fake_door_spike'] },
                    { x: 500, y: 256, types: ['hidden_spike', 'checkpoint_fake'] },
                    { x: 580, y: 416, types: ['spike', 'disappearing_platform'] },
                    { x: 700, y: 416, types: ['hidden_spike', 'fake_door_flying'] },
                    
                    // Non-blocking traps in the low bottom corridor
                    { x: 300, y: 480, types: ['coin_bomb', 'checkpoint_fake', 'zone_reverse'] },
                    { x: 600, y: 480, types: ['coin_bomb', 'checkpoint_fake', 'zone_gravity'] }
                ];
                break;
            case 7: // High Columns
                slots = [
                    { x: 80, y: 416, types: ['coin_bomb', 'checkpoint_fake'] },
                    { x: 250, y: 416, types: ['spike', 'hidden_spike'] },
                    { x: 300, y: 300, types: ['spike', 'disappearing_platform', 'fake_door_flying'] },
                    { x: 400, y: 300, types: ['hidden_spike', 'checkpoint_fake'] },
                    { x: 500, y: 300, types: ['spike', 'shifting_barrier', 'fake_door_spike'] },
                    { x: 550, y: 416, types: ['spike', 'hidden_spike'] },
                    { x: 700, y: 416, types: ['coin_bomb', 'zone_reverse'] },
                    { x: 800, y: 416, types: ['hidden_spike', 'zone_gravity'] }
                ];
                break;
            case 8: // Floating Isles
                slots = [
                    { x: 150, y: 224, types: ['spike', 'hidden_spike', 'fake_door_flying'] },
                    { x: 280, y: 320, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 400, y: 416, types: ['spike', 'disappearing_platform'] },
                    { x: 520, y: 320, types: ['spike', 'shifting_barrier', 'fake_door_spike'] },
                    { x: 650, y: 224, types: ['hidden_spike', 'checkpoint_fake'] },
                    { x: 780, y: 320, types: ['spike', 'coin_bomb'] },
                    { x: 300, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 600, y: 480, types: ['spike', 'hidden_spike'] }
                ];
                break;
            case 9: // Corridor Crawl
                slots = [
                    { x: 120, y: 416, types: ['spike', 'hidden_spike'] },
                    { x: 200, y: 416, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 300, y: 416, types: ['spike', 'disappearing_platform', 'fake_door_flying'] },
                    { x: 400, y: 416, types: ['spike', 'shifting_barrier', 'fake_door_spike'] },
                    { x: 500, y: 416, types: ['hidden_spike', 'checkpoint_fake'] },
                    { x: 600, y: 416, types: ['spike', 'disappearing_platform'] },
                    { x: 700, y: 416, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 800, y: 416, types: ['spike', 'zone_reverse'] }
                ];
                break;
            case 10: // Glitch Grid
                slots = [
                    { x: 100, y: 96, types: ['spike', 'hidden_spike'] },
                    { x: 200, y: 160, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 300, y: 96, types: ['spike', 'disappearing_platform', 'fake_door_flying'] },
                    { x: 400, y: 160, types: ['spike', 'shifting_barrier', 'fake_door_spike'] },
                    { x: 500, y: 96, types: ['hidden_spike', 'checkpoint_fake'] },
                    { x: 600, y: 160, types: ['spike', 'disappearing_platform'] },
                    { x: 700, y: 96, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 800, y: 160, types: ['spike', 'zone_reverse'] }
                ];
                break;
            case 11: // Spike Pit Chamber
                slots = [
                    { x: 150, y: 480, types: ['spike', 'hidden_spike'] },
                    { x: 250, y: 480, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 350, y: 480, types: ['spike', 'disappearing_platform', 'fake_door_flying'] },
                    { x: 450, y: 480, types: ['spike', 'shifting_barrier', 'fake_door_spike'] },
                    { x: 550, y: 480, types: ['hidden_spike', 'checkpoint_fake'] },
                    { x: 650, y: 480, types: ['spike', 'disappearing_platform'] },
                    { x: 750, y: 480, types: ['hidden_spike', 'coin_bomb'] },
                    { x: 850, y: 480, types: ['spike', 'zone_reverse'] }
                ];
                break;
        }
        
        // Spawn active traps
        if (slots.length > 0) {
            const activeSlots = [];
            const count = Math.min(slots.length, trapCount);
            
            for (let i = 0; i < count; i++) {
                const sIdx = (i * 7 + idx * 13) % slots.length;
                if (!activeSlots.includes(sIdx)) {
                    activeSlots.push(sIdx);
                } else {
                    for (let j = 0; j < slots.length; j++) {
                        const nextIdx = (sIdx + j) % slots.length;
                        if (!activeSlots.includes(nextIdx)) {
                            activeSlots.push(nextIdx);
                            break;
                        }
                    }
                }
            }
            
            activeSlots.forEach(sIdx => {
                const slot = slots[sIdx];
                const typeChoices = slot.types;
                let type = typeChoices[(idx + sIdx) % typeChoices.length];
                
                // Restrict dynamic fake doors to only 5 specific scattered levels (non-consecutive)
                const allowedFakeDoorLevels = [15, 27, 36, 44, 48];
                if ((type === 'fake_door_flying' || type === 'fake_door_spike') && !allowedFakeDoorLevels.includes(idx)) {
                    type = (idx % 2 === 0) ? 'spike' : 'hidden_spike'; // fallback to standard spikes
                }
                
                if (type === 'spike') {
                    entities.push({ type: 'spike', x: slot.x, y: slot.y });
                } else if (type === 'hidden_spike') {
                    entities.push({ type: 'hidden_spike', x: slot.x, y: slot.y });
                } else if (type === 'coin_bomb') {
                    entities.push({ type: 'coin', x: slot.x, y: slot.y, isBomb: true });
                } else if (type === 'coin_real') {
                    entities.push({ type: 'coin', x: slot.x, y: slot.y, isBomb: false });
                } else if (type === 'disappearing_platform') {
                    entities.push({ type: 'disappearing_platform', x: slot.x, y: slot.y });
                } else if (type === 'shifting_barrier') {
                    entities.push({ type: 'shifting_barrier', x: slot.x, y: slot.y - 32, targetX: slot.x, targetY: slot.y + 32 });
                } else if (type === 'checkpoint_fake') {
                    entities.push({ type: 'checkpoint', x: slot.x, y: slot.y - 16, isFake: true });
                } else if (type === 'checkpoint_real') {
                    entities.push({ type: 'checkpoint', x: slot.x, y: slot.y - 16, isFake: false });
                } else if (type === 'zone_reverse') {
                    entities.push({ type: 'zone_trigger', x: slot.x, y: slot.y - 32, width: 32, height: 64, triggerType: 'reverse', message: 'REVERSED!' });
                } else if (type === 'zone_gravity') {
                    entities.push({ type: 'zone_trigger', x: slot.x, y: slot.y - 32, width: 32, height: 64, triggerType: 'gravity', message: 'GRAVITY!' });
                } else if (type === 'zone_rotate') {
                    entities.push({ type: 'zone_trigger', x: slot.x, y: slot.y - 32, width: 32, height: 64, triggerType: 'rotate', message: 'SCREEN SPIN!' });
                } else if (type === 'fake_door_flying') {
                    entities.push({ type: 'exit_door', x: slot.x, y: slot.y - 28, isFake: true, id: 'flying', realExitX: defaultExitX, realExitY: defaultExitY });
                } else if (type === 'fake_door_spike') {
                    entities.push({ type: 'exit_door', x: slot.x, y: slot.y - 28, isFake: true, id: 'spikestrap', realExitX: defaultExitX, realExitY: defaultExitY });
                }
            });
        }

        // Auto-spawn default exit door if not present and not a boss level
        const hasExitDoor = entities.some(e => e.type === 'exit_door');
        if (idx % 10 !== 0 && !hasExitDoor) {
            entities.push({ type: 'exit_door', x: defaultExitX, y: defaultExitY, isFake: false });
            
            // Add a final surprise troll trigger right in front of the door!
            // This is placed 32px to the left of the exit door.
            const triggerX = defaultExitX - 32;
            const triggerY = defaultExitY + 28; // align with door floor
            
            if (idx % 7 === 1) {
                // Reverse controls zone in front of the door!
                entities.push({ type: 'zone_trigger', x: triggerX, y: triggerY, width: 32, height: 32, triggerType: 'reverse', message: 'TROLLED!' });
            } else if (idx % 7 === 3) {
                // Screen spin zone in front of the door!
                entities.push({ type: 'zone_trigger', x: triggerX, y: triggerY, width: 32, height: 32, triggerType: 'rotate', message: 'SCREEN FLIP!' });
            } else if (idx % 7 === 5) {
                // Fake Game Over zone in front of the door!
                entities.push({ type: 'zone_trigger', x: triggerX, y: triggerY, width: 32, height: 32, triggerType: 'fake-go' });
            }
        }

        // Copy layout grid from templates
        const rawMap = this.templates[templateIdx];
        const height = rawMap.length;
        const width = rawMap[0].length;

        let tileMap = [];
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                const char = rawMap[y][x];
                row.push(char === '#' ? 1 : 0);
            }
            tileMap.push(row);
        }

        // Apply programmatic layout mutations based on level index to make every level's platform design unique
        if (idx !== 1 && idx % 10 !== 0 && idx !== 51) {
            const variant = idx % 3;
            if (variant === 1) {
                // Variant 1: Place a vertical wall jumping column in the middle of the room with a walk-through gap
                for (let y = 4; y < 11; y++) {
                    if (y !== 7 && y !== 8) { // Leave gap at y=7,8 to prevent blocking corridors
                        tileMap[y][15] = 1; 
                    }
                }
            } else if (variant === 2) {
                // Variant 2: Add horizontal hanging platforms
                tileMap[6][8] = 1; tileMap[6][9] = 1; tileMap[6][10] = 1;
                tileMap[6][18] = 1; tileMap[6][19] = 1; tileMap[6][20] = 1;
            }
        }

        // Adjust solid block lock at door for boss levels specifically
        if (idx % 10 === 0) {
            tileMap[13][27] = 7; tileMap[14][27] = 7; tileMap[15][27] = 7;
        }

        return {
            width: width,
            height: height,
            tileSize: this.tileSize,
            tileMap: tileMap,
            spawnX: spawnX,
            spawnY: spawnY,
            entities: entities,
            bossName: bossName,
            bossX: bossX,
            bossY: bossY,
            special: special
        };
    }
};

window.Levels = Levels;
