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

    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameoverScreen = document.getElementById('gameover-screen');

    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const homeButton = document.getElementById('home-button'); // Home Button

    const levelDisplay = document.getElementById('level');
    const finalLevelDisplay = document.getElementById('final-level');

    const tiles = document.querySelectorAll('.tile');
    const exitFullscreenButton = document.getElementById('exit-fullscreen-button');

    // Difficulty Selection Elements
    const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');

    //Instrument Selection
    const instrumentButtons = document.querySelectorAll('.instrument-button');

    // Leaderboard Element
    const dreamloPublicKey = '676cb7128f40bc11e0fedece'; // Public Code
    const dreamloAddURL = 'http://dreamlo.com/lb/dqcv0UkALUqprzJiF-5T_Q7jTPx0v-gkSSlfF5we1C6g/add'; // Add URL
    const dreamloRetrieveURL = `http://dreamlo.com/lb/${dreamloPublicKey}/json`; // Retrieve URL
    const dreamloHighscores = document.getElementById('dreamlo-highscores');

    // Sound Assets
    const sounds = {
        'C': new Audio('./assets/sounds/piano/C.wav'),
        'D': new Audio('./assets/sounds/piano/D.wav'),
        'E': new Audio('./assets/sounds/piano/E.wav'),
        'F': new Audio('./assets/sounds/piano/F.wav'),
        'G': new Audio('./assets/sounds/piano/G.wav'),
        'A': new Audio('./assets/sounds/piano/A.wav'),
        'B': new Audio('./assets/sounds/piano/B.wav'),
        'success': new Audio('./assets/sounds/effects/success.wav'), // Success Sound
        'failure': new Audio('./assets/sounds/effects/failure.wav')  // Failure Sound
    };

    // Preload sounds to ensure they are ready when needed
    Object.values(sounds).forEach(sound => {
        sound.load();
    });

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
            const soundDelay = 500; // Delay before the success sound (adjust as needed)
            const nextLevelDelay = 800; // Delay after the success sound, before next level (adjust as needed)
    
            setTimeout(() => {
                sounds['success'].play(); // Play success sound after soundDelay
                setTimeout(() => {
                    nextLevel(); // Proceed to the next level after nextLevelDelay
                }, nextLevelDelay);
            }, soundDelay);
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
        // Submit score to Dreamlo
        const playerName = prompt("Game Over! Enter your name for the leaderboard:");
        submitScore(playerName, currentLevel, difficulty);
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

        // Initialize leaderboard if Game Over screen
        if (screen === gameoverScreen) {
            initializeLeaderboard();
        }
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

    // Handle Start Game Button Click
    startButton.addEventListener('click', () => {
        // Get selected difficulty
        difficultyRadios.forEach(radio => {
            if (radio.checked) {
                difficulty = radio.value;
                switch(difficulty) {
                    case 'Easy':
                        playbackSpeed = 800; // Slower
                        break;
                    case 'Medium':
                        playbackSpeed = 600; // Default
                        break;
                    case 'Hard':
                        playbackSpeed = 400; // Faster
                        break;
                    default:
                        playbackSpeed = 600;
                }
            }
        });

        showScreen(gameScreen);
        initializeGame();
        requestFullscreen(document.documentElement); // Request full-screen for the entire page
    });

    // Handle Restart Game Button Click
    restartButton.addEventListener('click', () => {
        showScreen(gameScreen);
        initializeGame();
        requestFullscreen(document.documentElement); // Request full-screen for the entire page
    });

    // Handle Home Button Click
    homeButton.addEventListener('click', () => {
        showScreen(startScreen);
    });

    // Handle Exit Fullscreen Button Click
    exitFullscreenButton.addEventListener('click', () => {
        exitFullscreen();
    });

    // Handle Difficulty Selection
    difficultyRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            difficulty = e.target.value;
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

    // Initialize Dreamlo Leaderboard
    function initializeLeaderboard() {
        fetch(dreamloRetrieveURL)
            .then(response => response.json())
            .then(data => {
                dreamloHighscores.innerHTML = '';
                if (!data || !data.dreamlo || !data.dreamlo.leaderboard || !data.dreamlo.leaderboard.entry || data.dreamlo.leaderboard.entry.length === 0) {
                    dreamloHighscores.innerHTML = '<p>No scores yet.</p>';
                    return;
                }
    
                // 1. Sort the entries by score in descending order
                const sortedEntries = data.dreamlo.leaderboard.entry.sort((a, b) => parseInt(b.score) - parseInt(a.score));
    
                // 2. Get the top 5 entries
                const top5Entries = sortedEntries.slice(0, 5);
    
                // 3. Display the top 5 entries
                const ul = document.createElement('ul');
                top5Entries.forEach(entry => {
                    const li = document.createElement('li');
                    li.textContent = `${entry.name} - Level ${entry.score} (${entry.text})`; // Display name, score, and difficulty
                    ul.appendChild(li);
                });
                dreamloHighscores.appendChild(ul);
            })
            .catch(error => {
                console.error('Error retrieving leaderboard:', error);
                dreamloHighscores.innerHTML = '<p>Error loading leaderboard.</p>';
            });
    }

    // Submit Score to Dreamlo
    function submitScore(name, score, difficulty) {
        if (!name) {
            name = 'Anonymous';
        }

        // Encode parameters to ensure the URL is correctly formatted
        const encodedName = encodeURIComponent(name);
        const encodedScore = encodeURIComponent(score);
        const encodedDifficulty = encodeURIComponent(difficulty);

        const submitURL = `${dreamloAddURL}/${encodedName}/${encodedScore}/0/${encodedDifficulty}`;

        // Send GET request to add the score
        fetch(submitURL)
            .then(response => {
                if (response.ok) {
                    console.log('Score submitted successfully.');
                } else {
                    console.error('Failed to submit score.');
                }
            })
            .catch(error => {
                console.error('Error submitting score:', error);
            });
    }

    // Initially show the start screen
    showScreen(startScreen);
});
