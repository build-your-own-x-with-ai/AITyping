const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const gameMenu = document.getElementById('game-menu');
const gameContainer = document.getElementById('game-container');
const gameTitle = document.getElementById('current-game-title');
const scoreDisplay = document.getElementById('game-score');
const levelDisplay = document.getElementById('game-level');
const livesDisplay = document.getElementById('game-lives');
const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');

let currentGame = null;
let gameLoopId = null;
let score = 0;
let level = 1;
let lives = 3;
let isGameOver = false;
let particles = []; // For game canvas effects

// Common Word List
const words = [
    "apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew",
    "kiwi", "lemon", "mango", "nectarine", "orange", "papaya", "quince", "raspberry",
    "strawberry", "tangerine", "ugli", "vanilla", "watermelon", "xigua", "yam", "zucchini",
    "cat", "dog", "elephant", "fish", "giraffe", "horse", "iguana", "jellyfish",
    "kangaroo", "lion", "monkey", "newt", "octopus", "penguin", "quail", "rabbit",
    "snake", "tiger", "unicorn", "vulture", "whale", "xenops", "yak", "zebra",
    "red", "blue", "green", "yellow", "purple", "orange", "black", "white",
    "run", "jump", "walk", "swim", "fly", "climb", "crawl", "dance", "sing"
];

// --- Game Engine ---

function startGame(gameId) {
    gameMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    overlay.classList.add('hidden');

    score = 0;
    level = 1;
    lives = 3;
    isGameOver = false;
    updateStats();

    window.removeEventListener('keydown', handleGameInput);
    window.addEventListener('keydown', handleGameInput);

    if (gameId === 'space-war') {
        currentGame = new SpaceWar();
    } else if (gameId === 'mole-hunt') {
        currentGame = new MoleHunt();
    } else if (gameId === 'police-thief') {
        currentGame = new PoliceThief();
    } else if (gameId === 'apple-catch') {
        currentGame = new AppleCatch();
    } else if (gameId === 'frog-cross') {
        currentGame = new FrogCross();
    }

    gameTitle.innerText = currentGame.title;

    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoop();
}

function exitGame() {
    isGameOver = true;
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameContainer.classList.add('hidden');
    gameMenu.classList.remove('hidden');
    window.removeEventListener('keydown', handleGameInput);
}

function restartGame() {
    if (currentGame) {
        startGame(currentGame.id);
    }
}

function gameOver(message) {
    isGameOver = true;
    overlayTitle.innerText = "Game Over";
    overlayMessage.innerText = message || `Final Score: ${score}`;
    overlay.classList.remove('hidden');
}

function updateStats() {
    scoreDisplay.innerText = `Score: ${score}`;
    levelDisplay.innerText = `Level: ${level}`;
    livesDisplay.innerText = `Lives: ${lives}`;
}

function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and Draw Particles
    updateParticles();

    currentGame.update();
    currentGame.draw();

    gameLoopId = requestAnimationFrame(gameLoop);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha -= 0.02;

        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life <= 0) particles.splice(i, 1);
    }
}

function spawnExplosion(x, y, color = '#ef4444') {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 30,
            alpha: 1,
            color: color,
            size: Math.random() * 3 + 1
        });
    }
}

function handleGameInput(e) {
    if (isGameOver) return;
    // Prevent default for game keys if needed, but usually we want to type
    if (e.key.length === 1) {
        currentGame.handleInput(e.key);
    }
}

// --- Game 1: Space War ---
class SpaceWar {
    constructor() {
        this.id = 'space-war';
        this.title = "Space War";
        this.enemies = [];
        this.spawnRate = 180; // Frames (3 seconds)
        this.frameCount = 0;
        this.activeWord = null; // The word currently being typed
    }

    update() {
        this.frameCount++;

        // Spawn enemies
        if (this.frameCount % Math.max(60, this.spawnRate - (level * 5)) === 0) {
            this.spawnEnemy();
        }

        // Move enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let enemy = this.enemies[i];
            enemy.y += 0.3 + (level * 0.05); // Slower speed

            if (enemy.y > canvas.height) {
                this.enemies.splice(i, 1);
                lives--;
                updateStats();
                if (lives <= 0) gameOver();
                if (this.activeWord === enemy.word) this.activeWord = null;
            }
        }
    }

    draw() {
        // Draw Stars
        ctx.fillStyle = 'white';
        for (let i = 0; i < 10; i++) {
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
        }

        // Draw Laser (if active typing)
        if (this.activeWord) {
            const target = this.enemies.find(e => e.word === this.activeWord);
            if (target) {
                ctx.strokeStyle = '#3b82f6'; // Laser color
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height); // From bottom center
                ctx.lineTo(target.x + ctx.measureText(target.word).width / 2, target.y);
                ctx.stroke();

                // Laser glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#3b82f6';
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }

        // Draw Enemies
        this.enemies.forEach(enemy => {
            // Draw Text (White)
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px "Roboto Mono"';
            ctx.fillText(enemy.word, enemy.x, enemy.y);

            // Draw ship body (Colored)
            ctx.fillStyle = enemy.word === this.activeWord ? '#ef4444' : enemy.color;
            ctx.beginPath();
            // Move ship up: Bottom at y-10, Top at y-40
            ctx.moveTo(enemy.x + ctx.measureText(enemy.word).width / 2, enemy.y - 10);
            ctx.lineTo(enemy.x + ctx.measureText(enemy.word).width / 2 - 10, enemy.y - 40);
            ctx.lineTo(enemy.x + ctx.measureText(enemy.word).width / 2 + 10, enemy.y - 40);
            ctx.fill();

            // Highlight typed part
            if (enemy.word === this.activeWord) {
                ctx.fillStyle = '#22c55e';
                ctx.fillText(enemy.word.substring(0, enemy.typedIndex), enemy.x, enemy.y);
            }
        });
    }

    spawnEnemy() {
        const word = words[Math.floor(Math.random() * words.length)];
        const x = Math.random() * (canvas.width - 100) + 20;
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
        this.enemies.push({
            word: word,
            x: x,
            y: -20,
            typedIndex: 0,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    handleInput(key) {
        if (!this.activeWord) {
            // Find an enemy starting with this key
            // Prioritize enemies closer to bottom? Or just first found.
            const target = this.enemies.find(e => e.word.startsWith(key));
            if (target) {
                this.activeWord = target.word;
                target.typedIndex = 1;
                if (target.typedIndex === target.word.length) {
                    this.destroyEnemy(target);
                }
            }
        } else {
            // Continue typing active word
            const target = this.enemies.find(e => e.word === this.activeWord);
            if (target) {
                if (target.word[target.typedIndex] === key) {
                    target.typedIndex++;
                    if (target.typedIndex === target.word.length) {
                        this.destroyEnemy(target);
                    }
                }
            } else {
                // Active word enemy might have died or gone off screen
                this.activeWord = null;
                // Try to start a new one immediately?
                this.handleInput(key);
            }
        }
    }

    destroyEnemy(enemy) {
        spawnExplosion(enemy.x + 20, enemy.y, '#f59e0b'); // Explosion at enemy pos
        this.enemies = this.enemies.filter(e => e !== enemy);
        this.activeWord = null;
        score += 10;
        if (score % 50 === 0) level++;
        updateStats();
    }
}

// --- Game 2: Mole Hunt ---
class MoleHunt {
    constructor() {
        this.id = 'mole-hunt';
        this.title = "Mole Hunt";
        this.gridSize = 3; // 3x3 grid
        this.moles = []; // {row, col, char, timer}
        this.spawnTimer = 0;
        this.cellSize = 100;
        this.offsetX = (canvas.width - (this.gridSize * this.cellSize)) / 2;
        this.offsetY = (canvas.height - (this.gridSize * this.cellSize)) / 2;
    }

    update() {
        this.spawnTimer++;
        if (this.spawnTimer > Math.max(30, 100 - (level * 5))) {
            this.spawnMole();
            this.spawnTimer = 0;
        }

        // Update moles
        for (let i = this.moles.length - 1; i >= 0; i--) {
            this.moles[i].timer--;
            if (this.moles[i].timer <= 0) {
                this.moles.splice(i, 1);
                lives--;
                updateStats();
                if (lives <= 0) gameOver();
            }
        }
    }

    draw() {
        // Draw Grid
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                ctx.strokeRect(this.offsetX + c * this.cellSize, this.offsetY + r * this.cellSize, this.cellSize, this.cellSize);
            }
        }

        // Draw Moles
        this.moles.forEach(mole => {
            const x = this.offsetX + mole.col * this.cellSize + this.cellSize / 2;
            const y = this.offsetY + mole.row * this.cellSize + this.cellSize / 2;

            ctx.fillStyle = '#a16207'; // Brown
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 30px "Roboto Mono"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(mole.char.toUpperCase(), x, y);
        });
        ctx.textAlign = 'start'; // Reset
        ctx.textBaseline = 'alphabetic';
    }

    spawnMole() {
        if (this.moles.length >= 5) return; // Max moles

        let row, col;
        do {
            row = Math.floor(Math.random() * this.gridSize);
            col = Math.floor(Math.random() * this.gridSize);
        } while (this.moles.some(m => m.row === row && m.col === col));



        const char = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // a-z
        this.moles.push({
            row, col, char,
            timer: 300 - (level * 10) // Frames to live (5 seconds)
        });
    }

    handleInput(key) {
        const index = this.moles.findIndex(m => m.char === key);
        if (index !== -1) {
            const mole = this.moles[index];
            // Hammer Effect
            const x = this.offsetX + mole.col * this.cellSize + this.cellSize / 2;
            const y = this.offsetY + mole.row * this.cellSize + this.cellSize / 2;
            spawnExplosion(x, y, '#fff'); // Simple puff

            this.moles.splice(index, 1);
            score += 5;
            if (score % 50 === 0) level++;
            updateStats();
        } else {
            // Optional: Penalty for wrong key?
        }
    }
}

// --- Game 3: Police vs Thief ---
class PoliceThief {
    constructor() {
        this.id = 'police-thief';
        this.title = "Police vs Thief";
        this.policeX = 50;
        this.thiefX = 300;
        this.targetWord = "";
        this.typedIndex = 0;
        this.distance = 250; // Initial distance
        this.nextWord();
    }

    nextWord() {
        this.targetWord = words[Math.floor(Math.random() * words.length)];
        this.typedIndex = 0;
    }

    update() {
        // Thief runs away constantly
        const thiefSpeed = 0.5 + (level * 0.1);
        this.thiefX += thiefSpeed;
        this.policeX += thiefSpeed * 0.8; // Police is slower unless typing

        this.distance = this.thiefX - this.policeX;

        if (this.distance > 600) {
            gameOver("The thief got away!");
        } else if (this.distance <= 40) { // Caught (visual overlap)
            // Actually, we want to catch him by typing.
            // Let's say if we type enough words we catch him?
            // Or maybe distance decreases when we type?
        }

        // Let's make it: Typing boosts police speed temporarily
        // Actually, let's make it simpler:
        // Typing a word moves police closer by a chunk.
        // Thief moves constantly.
        // If distance > max, lose. If distance <= 0, win level.

        if (this.distance <= 30) {
            score += 100;
            level++;
            this.policeX = 50;
            this.thiefX = 300 + (level * 20); // Thief starts further away next level
            updateStats();
        }
    }

    draw() {
        // Road
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 300, canvas.width, 100);
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(0, 350);
        ctx.lineTo(canvas.width, 350);
        ctx.stroke();
        ctx.setLineDash([]);

        // Police Car
        ctx.fillStyle = '#2563eb';
        // Draw relative to canvas, keeping police somewhat centered but moving
        // Let's keep police fixed at 100, move thief relative? No, let's scroll.
        // Simple view:
        const camX = this.policeX - 100;

        this.drawCar(this.policeX - camX, 320, '#2563eb', 'Police');
        this.drawCar(this.thiefX - camX, 320, '#ef4444', 'Thief');

        // Word to type
        ctx.fillStyle = '#fff';
        ctx.font = '30px "Roboto Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(this.targetWord, canvas.width / 2, 100);

        // Highlight typed
        ctx.fillStyle = '#22c55e';
        const width = ctx.measureText(this.targetWord).width;
        const startX = (canvas.width / 2) - (width / 2);
        const typedPart = this.targetWord.substring(0, this.typedIndex);
        ctx.textAlign = 'left';
        ctx.fillText(typedPart, startX, 100);

        // Distance bar
        ctx.fillStyle = '#fff';
        ctx.font = '16px "Inter"';
        ctx.fillText(`Distance: ${Math.round(this.distance)}m`, 20, 50);
    }

    drawCar(x, y, color, label) {
        if (x > canvas.width + 50 || x < -50) return;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 60, 30);
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(label, x, y - 5);
    }

    handleInput(key) {
        if (this.targetWord[this.typedIndex] === key) {
            this.typedIndex++;
            // Boost police
            this.policeX += 15;
            if (this.typedIndex === this.targetWord.length) {
                this.policeX += 30; // Bonus boost for finishing word
                score += 10;
                updateStats();
                this.nextWord();
            }
        }
    }
}

// --- Game 4: Apple Catching ---
class AppleCatch {
    constructor() {
        this.id = 'apple-catch';
        this.title = "Apple Catching";
        this.apples = [];
        this.basketX = canvas.width / 2;
        this.frameCount = 0;
    }

    update() {
        this.frameCount++;
        if (this.frameCount % Math.max(30, 80 - (level * 5)) === 0) {
            this.spawnApple();
        }

        for (let i = this.apples.length - 1; i >= 0; i--) {
            let apple = this.apples[i];
            apple.y += 1 + (level * 0.2);

            if (apple.y > canvas.height - 50) {
                // Missed apple
                this.apples.splice(i, 1);
                lives--;
                updateStats();
                if (lives <= 0) gameOver();
            }
        }
    }

    draw() {
        // Tree canopy hint
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(canvas.width / 2, 100, canvas.width, 0);
        ctx.fill();

        // Basket
        ctx.fillStyle = '#78350f';
        ctx.fillRect(this.basketX - 30, canvas.height - 40, 60, 40);

        // Apples
        this.apples.forEach(apple => {
            ctx.fillStyle = apple.color;
            ctx.beginPath();
            ctx.arc(apple.x, apple.y, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px "Roboto Mono"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(apple.char.toUpperCase(), apple.x, apple.y);
        });
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }

    spawnApple() {
        const char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        const colors = ['#ef4444', '#22c55e', '#eab308']; // Red, Green, Yellow
        this.apples.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: 20,
            char: char,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    handleInput(key) {
        // Find lowest apple with this char? Or any?
        // Let's pick the one closest to ground (highest y)
        const matches = this.apples.filter(a => a.char === key);
        if (matches.length > 0) {
            // Sort by Y descending
            matches.sort((a, b) => b.y - a.y);
            const target = matches[0];

            // Move basket to apple x (visual effect)
            this.basketX = target.x;

            // Remove apple
            this.apples = this.apples.filter(a => a !== target);
            score += 5;
            if (score % 50 === 0) level++;
            updateStats();
        }
    }
}

// --- Game 5: Frog Crossing ---
class FrogCross {
    constructor() {
        this.id = 'frog-cross';
        this.title = "Frog Crossing";
        this.frogY = canvas.height - 50;
        this.platforms = []; // {y, word, typedIndex}
        this.initPlatforms();
    }

    initPlatforms() {
        for (let i = 1; i <= 5; i++) {
            this.spawnPlatform(canvas.height - 50 - (i * 80));
        }
    }

    spawnPlatform(y) {
        const word = words[Math.floor(Math.random() * words.length)];
        this.platforms.push({
            y: y,
            word: word,
            typedIndex: 0,
            x: Math.random() * (canvas.width - 200) + 50
        });
    }

    update() {
        // Water rises? Or timer?
        // Let's make platforms sink slowly
        const sinkSpeed = 0.2 + (level * 0.05);

        this.platforms.forEach(p => p.y += sinkSpeed);
        this.frogY += sinkSpeed;

        if (this.frogY > canvas.height) {
            gameOver("The frog drowned!");
        }

        // Add new platforms at top
        if (this.platforms[this.platforms.length - 1].y > 80) {
            this.spawnPlatform(-20);
        }

        // Remove old platforms
        this.platforms = this.platforms.filter(p => p.y < canvas.height + 50);
    }

    draw() {
        // Water
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Platforms (Logs)
        this.platforms.forEach(p => {
            ctx.fillStyle = '#78350f';
            const width = ctx.measureText(p.word).width + 40;
            ctx.fillRect(p.x, p.y, width, 30);

            ctx.fillStyle = 'white';
            ctx.font = '20px "Roboto Mono"';
            ctx.fillText(p.word, p.x + 20, p.y + 22);

            // Highlight typed
            if (p.typedIndex > 0) {
                ctx.fillStyle = '#22c55e';
                ctx.fillText(p.word.substring(0, p.typedIndex), p.x + 20, p.y + 22);
            }
        });

        // Frog
        ctx.font = '30px Arial';
        ctx.fillText('🐸', canvas.width / 2, this.frogY);
    }

    handleInput(key) {
        // Target is the next platform (lowest y that is above frog?)
        // Actually, let's just target the platform immediately above the frog.
        // Sort platforms by Y. Frog is at frogY.
        // We want the platform with Y < frogY but closest to frogY.

        const sorted = [...this.platforms].sort((a, b) => b.y - a.y);
        // Find the one we are currently on?
        // Let's simplify: You are always on the bottom-most valid platform.
        // You need to type the word of the platform ABOVE you to jump to it.

        // Let's just say: Type the word of the lowest platform to jump to it?
        // No, you start at bottom.

        // Let's find the target platform.
        // It's the one with the lowest Y that is > frogY? No.
        // Let's say we just type the words of the platforms from bottom to top.

        // Find the lowest platform that hasn't been fully typed yet.
        // Actually, let's just make the frog jump to the platform if you finish the word.

        // Let's target the platform with the largest Y (lowest on screen) that is NOT the one we are standing on?
        // Let's assume we are standing on a base.
        // The target is the lowest platform in the list?

        // Let's try: The target is always the platform with the highest Y (closest to bottom).
        // Once typed, frog jumps there, and that platform is removed/passed?

        const target = sorted.find(p => p.y < this.frogY - 10); // Platform above frog

        if (target) {
            if (target.word[target.typedIndex] === key) {
                target.typedIndex++;
                if (target.typedIndex === target.word.length) {
                    // Jump!
                    this.frogY = target.y;
                    score += 20;
                    if (score % 100 === 0) level++;
                    updateStats();
                    // Remove platform to prevent re-typing? Or just leave it.
                    // If we leave it, we need to know we passed it.
                    // Let's just move the frog.
                }
            }
        }
    }
}
