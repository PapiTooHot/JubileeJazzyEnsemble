// game.js

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Game State Variables
    let sequence = [];
    let playerInput = [];
    let currentLevel = 1;
    let canInput = false;

    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameoverScreen = document.getElementById('gameover-screen');

    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    const levelDisplay = document.getElementById('level');
    const finalLevelDisplay = document.getElementById('final-level');

    const tiles = document.querySelectorAll('.tile');

    // Sound Assets
    const sounds = {
        'C': new Audio('/assets/sounds/C.mp3'),
        'D': new Audio('/assets/sounds/D.mp3'),
        'E': new Audio('/assets/sounds/E.mp3'),
        'F': new Audio('/assets/sounds/F.mp3'),
        'G': new Audio('/assets/sounds/G.mp3'),
        'A': new Audio('/assets/sounds/A.mp3'),
        'B': new Audio('/assets/sounds/B.mp3')
    };

    // Initialize Game
    function initializeGame() {
        sequence = [];
        playerInput = [];
        currentLevel = 1;
        levelDisplay.textContent = currentLevel;
        finalLevelDisplay.textContent = currentLevel;
        generateSequence();
        playSequence();
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
            delay += 800; // Time between notes
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
        if (!canInput) return;

        const clickedNote = e.currentTarget.getAttribute('data-note');
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
            setTimeout(() => {
                nextLevel();
            }, 1000);
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
        finalLevelDisplay.textContent = currentLevel;
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
    }

    // Start Game Handler
    startButton.addEventListener('click', () => {
        showScreen(gameScreen);
        initializeGame();
    });

    // Restart Game Handler
    restartButton.addEventListener('click', () => {
        showScreen(gameScreen);
        initializeGame();
    });

    // Add Event Listeners to Tiles
    tiles.forEach(tile => {
        tile.addEventListener('click', handleTileClick);
    });

    // Initially show the start screen
    showScreen(startScreen);
});
