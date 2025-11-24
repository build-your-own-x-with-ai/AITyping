const textDisplay = document.getElementById('text-display');
const inputField = document.getElementById('input-field');
const timeDisplay = document.getElementById('time');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const progressDisplay = document.getElementById('progress');

const keys = document.querySelectorAll('.key');
const uploadBtn = document.getElementById('upload-btn');
const fileUpload = document.getElementById('file-upload');

// Sample texts for practice
const practiceTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump!",
    "Sphinx of black quartz, judge my vow.",
    "To be or not to be, that is the question."
];

let currentText = "";
let currentIndex = 0;
let startTime = null;
let errors = 0;
let timerInterval = null;
let isTyping = false;

function init() {
    // Load a random text
    currentText = practiceTexts[Math.floor(Math.random() * practiceTexts.length)];
    renderText();
    resetStats();

    // Focus input on click anywhere in typing area
    document.querySelector('.typing-area').addEventListener('click', () => {
        inputField.focus();
    });

    // Initial focus
    inputField.focus();

    // File Upload Handlers
    uploadBtn.addEventListener('click', () => fileUpload.click());
    fileUpload.addEventListener('change', handleFileUpload);

    // Initialize Finger Zones
    initFingerZones();
}

function initFingerZones() {
    const fingerMap = {
        '1': 'finger-1', 'q': 'finger-1', 'a': 'finger-1', 'z': 'finger-1', '`': 'finger-1', '~': 'finger-1', '!': 'finger-1', 'Q': 'finger-1', 'A': 'finger-1', 'Z': 'finger-1',
        '2': 'finger-2', 'w': 'finger-2', 's': 'finger-2', 'x': 'finger-2', '@': 'finger-2', 'W': 'finger-2', 'S': 'finger-2', 'X': 'finger-2',
        '3': 'finger-3', 'e': 'finger-3', 'd': 'finger-3', 'c': 'finger-3', '#': 'finger-3', 'E': 'finger-3', 'D': 'finger-3', 'C': 'finger-3',
        '4': 'finger-4', 'r': 'finger-4', 'f': 'finger-4', 'v': 'finger-4', '$': 'finger-4', 'R': 'finger-4', 'F': 'finger-4', 'V': 'finger-4',
        '5': 'finger-4', 't': 'finger-4', 'g': 'finger-4', 'b': 'finger-4', '%': 'finger-4', 'T': 'finger-4', 'G': 'finger-4', 'B': 'finger-4',
        '6': 'finger-6', 'y': 'finger-6', 'h': 'finger-6', 'n': 'finger-6', '^': 'finger-6', 'Y': 'finger-6', 'H': 'finger-6', 'N': 'finger-6',
        '7': 'finger-6', 'u': 'finger-6', 'j': 'finger-6', 'm': 'finger-6', '&': 'finger-6', 'U': 'finger-6', 'J': 'finger-6', 'M': 'finger-6',
        '8': 'finger-7', 'i': 'finger-7', 'k': 'finger-7', ',': 'finger-7', '*': 'finger-7', 'I': 'finger-7', 'K': 'finger-7', '<': 'finger-7',
        '9': 'finger-8', 'o': 'finger-8', 'l': 'finger-8', '.': 'finger-8', '(': 'finger-8', 'O': 'finger-8', 'L': 'finger-8', '>': 'finger-8',
        '0': 'finger-9', 'p': 'finger-9', ';': 'finger-9', '/': 'finger-9', ')': 'finger-9', 'P': 'finger-9', ':': 'finger-9', '?': 'finger-9',
        '-': 'finger-9', '=': 'finger-9', '[': 'finger-9', ']': 'finger-9', "'": 'finger-9', '\\': 'finger-9',
        '_': 'finger-9', '+': 'finger-9', '{': 'finger-9', '}': 'finger-9', '"': 'finger-9', '|': 'finger-9',
        ' ': 'finger-5' // Thumbs
    };

    keys.forEach(key => {
        const char = key.getAttribute('data-key').toLowerCase();
        if (fingerMap[char]) {
            key.classList.add(fingerMap[char]);
        }
    });
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result.trim();
        if (text.length > 0) {
            // Replace practice texts with uploaded text (or just set current)
            // Let's set it as the current text
            // Normalize whitespace and quotes
            currentText = text.replace(/\s+/g, ' ')
                .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
                .replace(/[\u201C\u201D]/g, '"'); // Smart double quotes
            renderText();
            resetStats();
            alert("Custom text loaded!");
        }
    };
    reader.readAsText(file);
}

function renderText() {
    textDisplay.innerHTML = '';
    currentText.split('').forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.innerText = char;
        charSpan.classList.add('char');
        if (index === 0) charSpan.classList.add('current');
        textDisplay.appendChild(charSpan);
    });
}

function resetStats() {
    currentIndex = 0;
    startTime = null;
    errors = 0;
    isTyping = false;
    clearInterval(timerInterval);
    timeDisplay.innerText = "00:00";
    wpmDisplay.innerText = "0 WPM";
    accuracyDisplay.innerText = "100%";
    progressDisplay.innerText = "0%";
    inputField.value = '';
}

function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(() => {
        const elapsedTime = new Date() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        timeDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        updateWPM();
    }, 1000);
}

function updateWPM() {
    if (!startTime) return;
    const elapsedTime = (new Date() - startTime) / 60000; // in minutes
    if (elapsedTime === 0) return;

    // Standard word length is 5 characters
    const wpm = Math.round((currentIndex / 5) / elapsedTime);
    wpmDisplay.innerText = `${wpm} WPM`;
}

function updateAccuracy() {
    const totalTyped = currentIndex + errors;
    if (totalTyped === 0) return;
    const accuracy = Math.round((currentIndex / totalTyped) * 100);
    accuracyDisplay.innerText = `${accuracy}%`;
}

function updateProgress() {
    const progress = Math.round((currentIndex / currentText.length) * 100);
    progressDisplay.innerText = `${progress}%`;
}

function handleInput(e) {
    const typedChar = e.data;
    const inputType = e.inputType;

    if (!isTyping && typedChar) {
        isTyping = true;
        startTimer();
    }

    // Handle backspace (though standard behavior is usually disabled in strict typing apps, we'll allow simple correction logic or just ignore for now to keep it strict like AIDevLog often is, but let's implement strict forward typing for now)
    // Actually, let's stick to the input event for character entry.

    // We need to handle this manually to support the specific UX
}

inputField.addEventListener('keydown', (e) => {
    // Prevent default behavior for some keys to control the experience
    // e.preventDefault(); // We might need this if we want full control, but let's try to use the input value for now or just capture keys.

    // Highlight key on virtual keyboard
    let keySelector = `.key[data-key="${e.key}"]`;

    // Handle shifted keys mapping
    const shiftMap = {
        '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
        '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
    };

    if (shiftMap[e.key]) {
        keySelector = `.key[data-key="${shiftMap[e.key]}"]`;
    }

    const key = document.querySelector(keySelector) ||
        document.querySelector(`.key[data-key="${e.code}"]`) ||
        (e.key.length === 1 ? document.querySelector(`.key[data-key="${e.key.toLowerCase()}"]`) : null);

    if (key) {
        key.classList.add('active');
        setTimeout(() => key.classList.remove('active'), 150);
    }

    if (currentIndex >= currentText.length) return;

    if (!isTyping && e.key.length === 1) {
        isTyping = true;
        startTimer();
    }

    const charSpans = textDisplay.querySelectorAll('.char');
    const expectedChar = currentText[currentIndex];

    // Ignore modifier keys
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'CapsLock') return;

    if (e.key === 'Backspace') {
        // Optional: Allow backspacing? 
        // For this clone, let's say NO backspace for strict practice, or YES?
        // Let's implement NO backspace for now to keep it simple and forward-moving like some modes.
        // Or better, allow backspace but only if we want to correct the previous char.
        // Let's stick to: Type correct to advance. Type wrong -> error.
        return;
    }

    if (e.key === expectedChar) {
        // Correct
        charSpans[currentIndex].classList.remove('current', 'incorrect');
        charSpans[currentIndex].classList.add('correct');

        // Particle Effect
        const rect = charSpans[currentIndex].getBoundingClientRect();
        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);

        currentIndex++;

        if (currentIndex < currentText.length) {
            charSpans[currentIndex].classList.add('current');
        } else {
            // Finished
            clearInterval(timerInterval);
            alert(`Finished! WPM: ${wpmDisplay.innerText}, Accuracy: ${accuracyDisplay.innerText}`);
            init();
            return;
        }
    } else {
        // Incorrect
        charSpans[currentIndex].classList.add('incorrect');
        errors++;
    }

    updateWPM();
    updateAccuracy();
    updateProgress();
});

function createParticles(x, y) {
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        document.body.appendChild(particle);

        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const tx = (Math.random() - 0.5) * 50;
        const ty = (Math.random() - 0.5) * 50;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.backgroundColor = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`; // Blue-Cyan-Green range

        setTimeout(() => particle.remove(), 500);
    }
}

// Initialize
init();
