/**
 * Project: MeritBoard
 * Engine: quiz.js (Bilingual & Static Section Bar Update)
 */

let questions = [];
let currentIdx = 0;
let userAnswers = []; 
let statusArray = []; 
let timerInterval;
let timeLeft;
let totalTime;
let isAnalysisMode = false;
let currentLang = 'hi'; // डिफॉल्ट भाषा हिन्दी

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id') || 'hssc-cet-01';

    // भाषा बदलने का इवेंट लिसनर
    const langSelector = document.getElementById('langSelect');
    if(langSelector) {
        langSelector.addEventListener('change', (e) => {
            currentLang = e.target.value;
            renderQuestion();
        });
    }

    loadQuizData(quizId);
});

async function loadQuizData(id) {
    try {
        // Vercel/Cloudflare के लिए पाथ को सटीक बनाना
        const response = await fetch(`./data/questions/${id}.json`);
        const data = await response.json();
        questions = data.questions;
        totalTime = data.timeMinutes * 60;
        timeLeft = totalTime;
        userAnswers = new Array(questions.length).fill(null);
        statusArray = new Array(questions.length).fill('not-visited');

        document.getElementById('quizTitle').innerText = data.testTitle;

        // सेक्शन बार लोड करें (अब यह सिर्फ लेबल्स दिखाएगा)
        renderSectionBar(data.sections || []);
        renderQuestion();
        renderPalette();
        startTimer();
    } catch (e) { 
        console.error(e);
        alert("Error loading quiz data!"); 
    }
}

// अपडेटेड: विषय (Sections) के टैब अब सिर्फ जानकारी के लिए हैं (No Click)
function renderSectionBar(sections) {
    const secBar = document.getElementById('sectionBar');
    if(!secBar) return;
    secBar.innerHTML = '';

    sections.forEach(sec => {
        const tab = document.createElement('div');
        tab.className = 'section-tab'; // यहाँ से 'active' लॉजिक हटा दिया गया है
        tab.innerText = sec;
        // क्लिक फंक्शन हटा दिया गया है ताकि स्विच न हो
        secBar.appendChild(tab);
    });
}

// jumpToSection फंक्शन को हटा दिया गया है क्योंकि इसकी अब ज़रूरत नहीं है

function renderQuestion() {
    const q = questions[currentIdx];
    const lang = currentLang;

    const qNumElement = document.getElementById('qNum');
    if(qNumElement) qNumElement.innerText = `Question ${currentIdx + 1}`;

    // भाषा के हिसाब से सवाल दिखाना
    const qTextElement = document.getElementById('qText');
    if(qTextElement) qTextElement.innerText = q[`q_${lang}`] || q.question;

    const grid = document.getElementById('optionsGrid');
    if(!grid) return;
    grid.innerHTML = '';

    // भाषा के हिसाब से ऑप्शंस दिखाना
    const options = q[`options_${lang}`] || q.options;

    options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = `option-btn ${userAnswers[currentIdx] === i ? 'selected' : ''}`;

        if(isAnalysisMode) {
            btn.disabled = true;
            if(i === q.answer) btn.classList.add('correct');
            else if(userAnswers[currentIdx] === i) btn.classList.add('wrong');
        } else {
            btn.onclick = () => { 
                userAnswers[currentIdx] = i; 
                statusArray[currentIdx] = 'answered';
                renderQuestion(); 
            };
        }
        btn.innerText = opt;
        grid.appendChild(btn);
    });

    // Analysis Mode में एक्सप्लेनेशन दिखाना
    if(isAnalysisMode && q.explanation) {
        const expDiv = document.createElement('div');
        expDiv.className = 'explanation-box';
        expDiv.style.marginTop = "15px";
        expDiv.style.padding = "10px";
        expDiv.style.background = "#f0f9ff";
        expDiv.style.borderLeft = "4px solid #03A9F4";
        expDiv.innerHTML = `<strong>Explanation:</strong> ${q.explanation}`;
        grid.appendChild(expDiv);
    }

    updateUI();
}

function updateUI() {
    const isLast = currentIdx === questions.length - 1;
    const submitBtn = document.getElementById('submitBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if(submitBtn) submitBtn.classList.toggle('hidden', !isLast || isAnalysisMode);
    if(nextBtn) nextBtn.classList.toggle('hidden', isLast);

    // नोट: यहाँ से सेक्शन टैब को हाईलाइट करने वाला कोड हटा दिया गया है ताकि बार स्थिर रहे।

    renderPalette();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        const timerDisplay = document.getElementById('timerDisplay');
        if(timerDisplay) timerDisplay.innerText = `${m}:${s < 10 ? '0'+s : s}`;

        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }
    }, 1000);
}

// बटन कंट्रोल्स
document.getElementById('nextBtn').onclick = () => {
    if(statusArray[currentIdx] === 'not-visited') statusArray[currentIdx] = 'not-answered';
    currentIdx++; 
    renderQuestion();
};

document.getElementById('prevBtn').onclick = () => { 
    if(currentIdx > 0) { 
        currentIdx--; 
        renderQuestion(); 
    } 
};

document.getElementById('clearResponseBtn').onclick = () => { 
    if(isAnalysisMode) return;
    userAnswers[currentIdx] = null; 
    statusArray[currentIdx] = 'not-visited';
    renderQuestion(); 
};

document.getElementById('markReviewBtn').onclick = () => { 
    if(isAnalysisMode) return;
    statusArray[currentIdx] = 'marked'; 
    if(currentIdx < questions.length - 1) {
        currentIdx++;
        renderQuestion();
    } else {
        renderPalette();
    }
};

function renderPalette() {
    const pGrid = document.getElementById('questionPalette');
    if(!pGrid) return;
    pGrid.innerHTML = '';
    questions.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = `p-btn ${statusArray[i]} ${i === currentIdx ? 'current' : ''}`;
        b.innerText = i + 1;
        b.onclick = () => { currentIdx = i; renderQuestion(); };
        pGrid.appendChild(b);
    });
}

document.getElementById('togglePalette').onclick = () => {
    const palette = document.getElementById('questionPalette');
    if(palette) palette.classList.toggle('hidden');
};

document.getElementById('submitBtn').onclick = submitQuiz;

function submitQuiz() {
    clearInterval(timerInterval);
    let score = 0;
    let attempted = 0;

    userAnswers.forEach((ans, i) => { 
        if(ans !== null) {
            attempted++;
            if(ans === questions[i].answer) score++;
        }
    });

    // रिजल्ट कैलकुलेशन
    const accuracy = attempted > 0 ? Math.round((score / attempted) * 100) : 0;
    const timeSpent = totalTime - timeLeft;
    const minSpent = Math.floor(timeSpent / 60);

    const finalScoreEl = document.getElementById('finalScore');
    const totalAttEl = document.getElementById('totalAttempted');
    const accValEl = document.getElementById('accuracyVal');
    const timeTakenEl = document.getElementById('timeTaken');

    if(finalScoreEl) finalScoreEl.innerText = score;
    if(totalAttEl) totalAttEl.innerText = attempted;
    if(accValEl) accValEl.innerText = accuracy + "%";
    if(timeTakenEl) timeTakenEl.innerText = minSpent + "m";

    const modal = document.getElementById('resultModal');
    if(modal) modal.classList.remove('hidden');
}

document.getElementById('viewAnalysisBtn').onclick = () => {
    isAnalysisMode = true;
    const modal = document.getElementById('resultModal');
    if(modal) modal.classList.add('hidden');
    currentIdx = 0;
    renderQuestion();
};