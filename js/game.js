// game.js

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Game State Variables
    let sequence = [];
    let playerInput = [];
    let currentLevel = 1;
    let canInput = false;
    let playbackSpeed = 800; // Default to Medium
    let difficulty = 'Medium'; // Default difficulty

    // Selected Instrument
    let selectedInstrument = 'trumpet'; // Default instrument

    // Mode: 'survival' or 'free-play'
    let mode = 'survival'; // Default mode

    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameoverScreen = document.getElementById('gameover-screen');

    const survivalButton = document.getElementById('survival-button');
    const freePlayButton = document.getElementById('free-play-button');
    const beginButton = document.getElementById('begin-button');
    const restartButton = document.getElementById('restart-button');
    const homeButtons = document.querySelectorAll('#home-button'); // Both Home Buttons

    const modeTitle = document.getElementById('mode-title');
    const levelContainer = document.getElementById('level-container');
    const levelDisplay = document.getElementById('level');
    const finalLevelDisplay = document.getElementById('final-level');

    const tiles = document.querySelectorAll('.tile');
    const exitFullscreenButton = document.getElementById('exit-fullscreen-button');

    // Difficulty Selection Elements
    const difficultyButtons = document.querySelectorAll('.difficulty-button');

    // Instrument Selection
    const instrumentButtons = document.querySelectorAll('.instrument-button');

    /* 
    // Leaderboard Variables (Commented Out)
    // const dreamloPublicKey = '676cb7128f40bc11e0fedece'; // Public Code
    // const dreamloAddURL = 'http://dreamlo.com/lb/dqcv0UkALUqprzJiF-5T_Q7jTPx0v-gkSSlfF5we1C6g/add'; // Add URL
    // const dreamloRetrieveURL = `http://dreamlo.com/lb/${dreamloPublicKey}/json`; // Retrieve URL
    // const dreamloHighscores = document.getElementById('dreamlo-highscores');
    */

    // Sound Assets
    let sounds = {}; // Initialize as empty object

    // Function to Load Sounds Based on Selected Instrument
    function loadSounds(instrument) {
        // Pause and remove existing sounds
        for (let key in sounds) {
            if (sounds.hasOwnProperty(key)) {
                sounds[key].pause();
                delete sounds[key];
            }
        }

        // Define new sounds based on the selected instrument
        sounds = {
            'C': new Audio(`./assets/sounds/${instrument}/C.wav`),
            'D': new Audio(`./assets/sounds/${instrument}/D.wav`),
            'E': new Audio(`./assets/sounds/${instrument}/E.wav`),
            'F': new Audio(`./assets/sounds/${instrument}/F.wav`),
            'G': new Audio(`./assets/sounds/${instrument}/G.wav`),
            'A': new Audio(`./assets/sounds/${instrument}/A.wav`),
            'B': new Audio(`./assets/sounds/${instrument}/B.wav`),
            'success': new Audio('./assets/sounds/effects/success.wav'), // Assuming this is instrument-independent
            'failure': new Audio('./assets/sounds/effects/failure.wav')  // Assuming this is instrument-independent
        };

        // Preload sounds to ensure they are ready when needed
        Object.values(sounds).forEach(sound => {
            sound.load();
        });
    }

    // Initialize Game
    function initializeGame() {
        loadSounds(selectedInstrument); // Load sounds for the selected instrument

        if (mode === 'survival') {
            sequence = [];
            playerInput = [];
            currentLevel = 1;
            levelDisplay.textContent = currentLevel;
            finalLevelDisplay.textContent = currentLevel;
            generateSequence();
            playSequence();
            levelContainer.classList.remove('hidden');
        } else if (mode === 'free-play') {
            // In Free Play mode, no need to generate or play a sequence
            // Ensure level display is hidden
            levelContainer.classList.add('hidden');
        }
    }

    // Generate Random Sequence
    function generateSequence() {
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        // Start with three notes
        if (sequence.length === 0) {
            for (let i = 0; i < 3; i++) {
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                sequence.push(randomNote);
            }
        } else {
            // Add one more note for each level
            const randomNote = notes[Math.floor(Math.random() * notes.length)];
            sequence.push(randomNote);
        }
    }

    // Play the Sequence
    function playSequence() {
        canInput = false;
        let delay = 500; // Initial delay

        sequence.forEach((note, index) => {
            setTimeout(() => {
                playNote(note);
                highlightTile(note);
            }, delay);
            delay += playbackSpeed; // Time between notes based on difficulty
        });

        // Allow player input after sequence is played
        setTimeout(() => {
            canInput = true;
        }, delay);
    }

    // Play a Single Note
    function playNote(note) {
        if (sounds[note]) {
            sounds[note].currentTime = 0;
            sounds[note].play();
        }
    }

    // Highlight Tile
    function highlightTile(note) {
        const tile = document.getElementById(note);
        if (tile) {
            tile.classList.add('active');
            setTimeout(() => {
                tile.classList.remove('active');
            }, 300);
        }
    }

    // Handle Tile Click
    function handleTileClick(e) {
        const clickedNote = e.currentTarget.getAttribute('data-note');

        if (mode === 'survival') {
            if (!canInput) return;

            playerInput.push(clickedNote);
            playNote(clickedNote);
            highlightTile(clickedNote);

            // Check the player's input in real-time
            const currentStep = playerInput.length - 1;
            if (playerInput[currentStep] !== sequence[currentStep]) {
                // Incorrect input
                gameOver();
                return;
            }

            if (playerInput.length === sequence.length) {
                // Correct sequence entered
                canInput = false;
                const soundDelay = 500; // Delay before the success sound (adjust as needed)
                const nextLevelDelay = 800; // Delay after the success sound, before next level (adjust as needed)

                setTimeout(() => {
                    sounds['success'].play(); // Play success sound after soundDelay
                    setTimeout(() => {
                        nextLevel(); // Proceed to the next level after nextLevelDelay
                    }, nextLevelDelay);
                }, soundDelay);
            }
        } else if (mode === 'free-play') {
            // In Free Play mode, simply play the note
            playNote(clickedNote);
            highlightTile(clickedNote);
        }
    }

    // Proceed to Next Level
    function nextLevel() {
        currentLevel++;
        levelDisplay.textContent = currentLevel;
        generateSequence();
        playerInput = [];
        playSequence();
    }

    // Game Over
    function gameOver() {
        canInput = false;
        sounds['failure'].play(); // Play failure sound
        finalLevelDisplay.textContent = currentLevel;
        // Submit score to leaderboard (Commented Out)
        /*
        const playerName = prompt("Game Over! Enter your name for the leaderboard:");
        if (playerName !== null) { // Ensure the player didn't cancel the prompt
            submitScore(playerName.trim() === "" ? "Anonymous" : playerName.trim(), currentLevel, difficulty);
        }
        */
        showScreen(gameoverScreen);
    }

    // Show Specific Screen
    function showScreen(screen) {
        // Hide all screens
        startScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        gameoverScreen.classList.add('hidden');

        // Show the selected screen
        screen.classList.remove('hidden');

        // Initialize leaderboard if Game Over screen (Commented Out)
        /*
        if (screen === gameoverScreen) {
            initializeLeaderboard();
        }
        */
    }

    // Request Fullscreen
    function requestFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
            element.msRequestFullscreen();
        }
    }

    // Exit Fullscreen
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
    }

    // Handle Survival Button Click
    survivalButton.addEventListener('click', () => {
        mode = 'survival';
        // Update selected class
        survivalButton.classList.add('selected');
        freePlayButton.classList.remove('selected');
        // Show difficulty selection
        document.querySelector('.difficulty-selection').classList.remove('hidden');
    });

    // Handle Free Play Button Click
    freePlayButton.addEventListener('click', () => {
        mode = 'free-play';
        // Update selected class
        freePlayButton.classList.add('selected');
        survivalButton.classList.remove('selected');
        // Hide difficulty selection
        document.querySelector('.difficulty-selection').classList.add('hidden');
    });

    // Handle Difficulty Button Click
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'selected' class from all difficulty buttons
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            // Add 'selected' class to the clicked button
            button.classList.add('selected');
            // Set the selected difficulty
            difficulty = button.getAttribute('data-difficulty');
            // Update playback speed based on difficulty
            switch(difficulty) {
                case 'Easy':
                    playbackSpeed = 1000; // Slower
                    break;
                case 'Medium':
                    playbackSpeed = 800; // Default
                    break;
                case 'Hard':
                    playbackSpeed = 600; // Faster
                    break;
                default:
                    playbackSpeed = 800;
            }
        });
    });

    // Handle Begin Button Click
    beginButton.addEventListener('click', () => {
        if (mode === 'survival') {
            // Ensure a difficulty is selected
            const selectedDifficultyButton = document.querySelector('.difficulty-button.selected');
            if (selectedDifficultyButton) {
                difficulty = selectedDifficultyButton.getAttribute('data-difficulty');
            } else {
                difficulty = 'Medium'; // Default if none selected
                playbackSpeed = 800;
                // Optionally, highlight Medium difficulty
                const mediumButton = document.querySelector('.difficulty-button[data-difficulty="Medium"]');
                if (mediumButton) {
                    mediumButton.classList.add('selected');
                }
            }
        } else if (mode === 'free-play') {
            difficulty = ''; // No difficulty in free play
        }

        // Update mode title
        if (mode === 'survival') {
            modeTitle.textContent = 'Survival Mode';
            levelContainer.classList.remove('hidden');
        } else if (mode === 'free-play') {
            modeTitle.textContent = 'Free Play Mode';
            levelContainer.classList.add('hidden');
        }

        showScreen(gameScreen);
        initializeGame();
        requestFullscreen(document.documentElement); // Request full-screen for the entire page
    });

    // Handle Restart Game Button Click
    restartButton.addEventListener('click', () => {
        // Reset to Survival Mode
        mode = 'survival';
        survivalButton.classList.add('selected');
        freePlayButton.classList.remove('selected');
        document.querySelector('.difficulty-selection').classList.remove('hidden');

        // Reset difficulty to default (Medium)
        const mediumDifficulty = document.querySelector('.difficulty-button[data-difficulty="Medium"]');
        if (mediumDifficulty) {
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            mediumDifficulty.classList.add('selected');
            difficulty = 'Medium';
            playbackSpeed = 800;
        }

        // Reset instrument selection to default if desired
        // Optionally uncomment the following lines to reset to Piano
        /*
        instrumentButtons.forEach(btn => btn.classList.remove('selected'));
        const pianoButton = document.querySelector('.instrument-button[data-instrument="piano"]');
        if (pianoButton) {
            pianoButton.classList.add('selected');
            selectedInstrument = 'piano';
        }
        */

        modeTitle.textContent = 'Survival Mode';
        levelDisplay.textContent = currentLevel;

        showScreen(gameScreen);
        initializeGame();
        requestFullscreen(document.documentElement); // Request full-screen for the entire page
    });

    // Handle Home Button Click
    homeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Reset to Survival Mode by default
            mode = 'survival';
            survivalButton.classList.add('selected');
            freePlayButton.classList.remove('selected');
            // Show difficulty selection
            document.querySelector('.difficulty-selection').classList.remove('hidden');
            // Reset difficulty to default
            const mediumDifficulty = document.querySelector('.difficulty-button[data-difficulty="Medium"]');
            if (mediumDifficulty) {
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                mediumDifficulty.classList.add('selected');
                difficulty = 'Medium';
                playbackSpeed = 800;
            }
            // Reset instrument selection to default if desired
            // Optionally uncomment the following lines to reset to Piano
            /*
            instrumentButtons.forEach(btn => btn.classList.remove('selected'));
            const pianoButton = document.querySelector('.instrument-button[data-instrument="piano"]');
            if (pianoButton) {
                pianoButton.classList.add('selected');
                selectedInstrument = 'piano';
            }
            */

            showScreen(startScreen);
        });
    });

    // Handle Quit Button Click
    const quitButton = document.getElementById('quit-button');
    quitButton.addEventListener('click', () => {
        // Show Home screen
        mode = 'survival';
        survivalButton.classList.add('selected');
        freePlayButton.classList.remove('selected');
        // Show difficulty selection
        document.querySelector('.difficulty-selection').classList.remove('hidden');
        // Reset difficulty to default
        const mediumDifficulty = document.querySelector('.difficulty-button[data-difficulty="Medium"]');
        if (mediumDifficulty) {
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            mediumDifficulty.classList.add('selected');
            difficulty = 'Medium';
            playbackSpeed = 800;
        }
        // Reset instrument selection to default if desired
        // Optionally uncomment the following lines to reset to Piano
        /*
        instrumentButtons.forEach(btn => btn.classList.remove('selected'));
        const pianoButton = document.querySelector('.instrument-button[data-instrument="piano"]');
        if (pianoButton) {
            pianoButton.classList.add('selected');
            selectedInstrument = 'piano';
        }
        */

        showScreen(startScreen);
    });

    // Handle Difficulty Button Click (Already Covered Above)
    // No additional code needed here

    // Handle Instrument Selection
    instrumentButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'selected' class from all instrument buttons
            instrumentButtons.forEach(btn => btn.classList.remove('selected'));
            // Add 'selected' class to the clicked button
            button.classList.add('selected');
            // Set the selected instrument
            selectedInstrument = button.getAttribute('data-instrument');
        });
    });

    // Add Event Listeners to Tiles
    tiles.forEach(tile => {
        tile.addEventListener('click', handleTileClick);
    });

    // Listen for Fullscreen Change Events
    function handleFullscreenChange() {
        if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            // Add a class to the game screen to show the exit button
            gameScreen.classList.add('fullscreen');
        } else {
            gameScreen.classList.remove('fullscreen');
        }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    /* 
    // Leaderboard Functions (Commented Out)

    // Initialize Leaderboard
    function initializeLeaderboard() {
        fetch(dreamloRetrieveURL)
            .then(response => response.json())
            .then(data => {
                dreamloHighscores.innerHTML = '';
                if (!data || !data.success || !data.scores || data.scores.length === 0) {
                    dreamloHighscores.innerHTML = '<p>No scores yet.</p>';
                    return;
                }

                // Display the top scores
                const ul = document.createElement('ul');
                data.scores.forEach(entry => {
                    const li = document.createElement('li');
                    li.textContent = `${entry.name} - Level ${entry.level} (${entry.difficulty}) on ${entry.date}`;
                    ul.appendChild(li);
                });
                dreamloHighscores.appendChild(ul);
            })
            .catch(error => {
                console.error('Error retrieving leaderboard:', error);
                dreamloHighscores.innerHTML = '<p>Error loading leaderboard.</p>';
            });
    }

    // Submit Score to Leaderboard
    function submitScore(name, score, difficulty) {
        const payload = {
            name: name,
            level: score,
            difficulty: difficulty
        };

        fetch(googleAppsScriptPostURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.text())
            .then(result => {
                console.log(result); // Optional: Handle the response if needed
            })
            .catch(error => {
                console.error('Error submitting score:', error);
            });
    }
    */
    
    // Initially show the start screen
    showScreen(startScreen);
});