/**
 * Project: MeritBoard
 * Engine: quiz.js (Bilingual & Sectional Update)
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
        const response = await fetch(`data/questions/${id}.json`);
        const data = await response.json();
        questions = data.questions;
        totalTime = data.timeMinutes * 60;
        timeLeft = totalTime;
        userAnswers = new Array(questions.length).fill(null);
        statusArray = new Array(questions.length).fill('not-visited');
        
        document.getElementById('quizTitle').innerText = data.testTitle;
        
        renderSectionBar(data.sections || []);
        renderQuestion();
        renderPalette();
        startTimer();
    } catch (e) { 
        console.error(e);
        alert("Error loading quiz data!"); 
    }
}

// विषय (Sections) के टैब बनाना
function renderSectionBar(sections) {
    const secBar = document.getElementById('sectionBar');
    if(!secBar) return;
    secBar.innerHTML = '';
    
    sections.forEach(sec => {
        const tab = document.createElement('div');
        tab.className = 'section-tab';
        tab.innerText = sec;
        tab.onclick = () => jumpToSection(sec);
        secBar.appendChild(tab);
    });
}

// किसी खास सेक्शन के पहले सवाल पर जाना
function jumpToSection(sectionName) {
    const firstIdx = questions.findIndex(q => q.section === sectionName);
    if(firstIdx !== -1) {
        currentIdx = firstIdx;
        renderQuestion();
    }
}

function renderQuestion() {
    const q = questions[currentIdx];
    const lang = currentLang;
    
    document.getElementById('qNum').innerText = `Question ${currentIdx + 1}`;
    
    // भाषा के हिसाब से सवाल दिखाना (q_en या q_hi)
    document.getElementById('qText').innerText = q[`q_${lang}`] || q.question;
    
    const grid = document.getElementById('optionsGrid');
    grid.innerHTML = '';

    // भाषा के हिसाब से ऑप्शंस दिखाना (options_en या options_hi)
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
        expDiv.innerHTML = `<strong>Explanation:</strong> ${q.explanation}`;
        grid.appendChild(expDiv);
    }

    updateUI();
}

function updateUI() {
    const isLast = currentIdx === questions.length - 1;
    document.getElementById('submitBtn').classList.toggle('hidden', !isLast || isAnalysisMode);
    document.getElementById('nextBtn').classList.toggle('hidden', isLast);
    
    // एक्टिव सेक्शन टैब को हाईलाइट करना
    const tabs = document.querySelectorAll('.section-tab');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.innerText === questions[currentIdx].section);
    });

    renderPalette();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        document.getElementById('timerDisplay').innerText = `${m}:${s < 10 ? '0'+s : s}`;
        
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
    document.getElementById('questionPalette').classList.toggle('hidden');
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

    document.getElementById('finalScore').innerText = score;
    document.getElementById('totalAttempted').innerText = attempted;
    document.getElementById('accuracyVal').innerText = accuracy + "%";
    document.getElementById('timeTaken').innerText = minSpent + "m";
    
    document.getElementById('resultModal').classList.remove('hidden');
}

document.getElementById('viewAnalysisBtn').onclick = () => {
    isAnalysisMode = true;
    document.getElementById('resultModal').classList.add('hidden');
    currentIdx = 0;
    renderQuestion();
};