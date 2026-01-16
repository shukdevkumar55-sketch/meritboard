/**
 * Project: MeritBoard
 * Engine: quiz.js (Full Analysis & Professional Report Update)
 */

let questions = [];
let currentIdx = 0;
let userAnswers = []; 
let statusArray = []; 
let timerInterval;
let timeLeft;
let totalTime;
let isAnalysisMode = false;
let currentLang = 'hi'; 

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id') || 'hssc-cet-01';

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
        const response = await fetch(`./data/questions/${id}.json`);
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

function renderSectionBar(sections) {
    const secBar = document.getElementById('sectionBar');
    if(!secBar) return;
    secBar.innerHTML = '';
    sections.forEach(sec => {
        const tab = document.createElement('div');
        tab.className = 'section-tab'; 
        tab.innerText = sec;
        secBar.appendChild(tab);
    });
}

function renderQuestion() {
    // सवाल बदलने पर ऊपर स्क्रॉल करें
    const mainContent = document.getElementById('quizMain');
    if (mainContent) mainContent.scrollTop = 0;

    const q = questions[currentIdx];
    const lang = currentLang;

    document.getElementById('qNum').innerText = `Question ${currentIdx + 1}`;
    document.getElementById('qText').innerText = q[`q_${lang}`] || q.question;

    const grid = document.getElementById('optionsGrid');
    if(!grid) return;
    grid.innerHTML = '';

    const options = q[`options_${lang}`] || q.options;

    options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = `option-btn ${userAnswers[currentIdx] === i ? 'selected' : ''}`;
        
        // सामान्य क्विज़ मोड
        btn.onclick = () => { 
            userAnswers[currentIdx] = i; 
            statusArray[currentIdx] = 'answered';
            renderQuestion(); 
        };
        
        btn.innerText = opt;
        grid.appendChild(btn);
    });

    updateUI();
}

function updateUI() {
    const isLast = currentIdx === questions.length - 1;
    document.getElementById('submitBtn').classList.toggle('hidden', !isLast);
    document.getElementById('nextBtn').classList.toggle('hidden', isLast);
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

// Controls
document.getElementById('nextBtn').onclick = () => {
    if(statusArray[currentIdx] === 'not-visited') statusArray[currentIdx] = 'not-answered';
    currentIdx++; 
    renderQuestion();
};

document.getElementById('prevBtn').onclick = () => { 
    if(currentIdx > 0) { currentIdx--; renderQuestion(); } 
};

document.getElementById('clearResponseBtn').onclick = () => { 
    userAnswers[currentIdx] = null; 
    statusArray[currentIdx] = 'not-visited';
    renderQuestion(); 
};

document.getElementById('markReviewBtn').onclick = () => { 
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

// ==========================================
// PROFESSIONAL SUBMIT & ANALYSIS LOGIC
// ==========================================

function submitQuiz() {
    clearInterval(timerInterval);
    
    let score = 0;
    let attempted = 0;
    let subjectStats = {}; 

    // 1. डेटा कैलकुलेट करें
    questions.forEach((q, i) => {
        const ans = userAnswers[i];
        const sec = q.section || "General";

        if (!subjectStats[sec]) {
            subjectStats[sec] = { total: 0, correct: 0 };
        }
        subjectStats[sec].total++;

        if (ans !== null) {
            attempted++;
            if (ans === q.answer) {
                score++;
                subjectStats[sec].correct++;
            }
        }
    });

    // 2. पुराने UI को छुपाएं और Analysis Page दिखाएं
    document.getElementById('quizHeader').classList.add('hidden');
    document.getElementById('sectionBar').classList.add('hidden');
    document.getElementById('quizMain').classList.add('hidden');
    document.getElementById('quizFooter').classList.add('hidden');
    document.getElementById('analysisPage').classList.remove('hidden');

    // 3. स्कोरकार्ड भरें
    document.getElementById('resFinalScore').innerText = score;
    document.getElementById('resTotalQs').innerText = questions.length;
    document.getElementById('resAttempted').innerText = attempted;
    document.getElementById('resAccuracy').innerText = (attempted > 0 ? Math.round((score/attempted)*100) : 0) + "%";
    
    const timeSpent = totalTime - timeLeft;
    document.getElementById('resTime').innerText = Math.floor(timeSpent / 60) + "m " + (timeSpent % 60) + "s";

    // मोटिवेशनल टैग
    const perfTag = document.getElementById('performanceTag');
    const pct = (score / questions.length) * 100;
    if(pct >= 80) perfTag.innerText = "Excellent Performance! 🏆";
    else if(pct >= 50) perfTag.innerText = "Good Job! Keep it up. 👍";
    else perfTag.innerText = "Keep Practicing! You can do better. 💪";

    // 4. विषयवार स्कोर दिखाएं
    const subList = document.getElementById('subjectWiseList');
    subList.innerHTML = '';
    for (let sec in subjectStats) {
        subList.innerHTML += `
            <div class="subject-item">
                <span>${sec}</span>
                <span class="sub-score">${subjectStats[sec].correct} / ${subjectStats[sec].total}</span>
            </div>`;
    }

    // 5. सॉल्यूशन लिस्ट रेंडर करें (All 100 Questions)
    renderFinalSolutions();
    
    // एनालिसिस पेज के सबसे ऊपर स्क्रॉल करें
    window.scrollTo(0, 0);
}

function renderFinalSolutions() {
    const solList = document.getElementById('solutionsList');
    solList.innerHTML = '';

    questions.forEach((q, i) => {
        const userAns = userAnswers[i];
        const isCorrect = userAns === q.answer;
        const options = q[`options_${currentLang}`] || q.options;

        let optionsHTML = '';
        options.forEach((opt, optIdx) => {
            let cls = '';
            if (optIdx === q.answer) cls = 'correct'; // हमेशा सही जवाब को हरा करें
            else if (optIdx === userAns && !isCorrect) cls = 'wrong'; // अगर गलत चुना तो उसे लाल करें
            
            optionsHTML += `<div class="sol-opt ${cls}">${opt}</div>`;
        });

        solList.innerHTML += `
            <div class="solution-item">
                <div class="sol-q">Q${i+1}. ${q[`q_${currentLang}`] || q.question}</div>
                <div class="sol-options-container">
                    ${optionsHTML}
                </div>
                <div class="sol-exp">
                    <strong>Explanation:</strong> ${q.explanation || 'Solution will be updated soon.'}
                </div>
            </div>`;
    });
}