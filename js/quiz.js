/**
 * Project: MeritBoard
 * Engine: quiz.js (Full Features: Sharing, Analysis, Bilingual, Static Bar)
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
let shareConfig = {}; // JSON से शेयर डेटा लोड करने के लिए

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id') || 'hssc-cet-01';

    // 1. Language Listener
    const langSelector = document.getElementById('langSelect');
    if(langSelector) {
        langSelector.addEventListener('change', (e) => {
            currentLang = e.target.value;
            renderQuestion();
        });
    }

    // 2. Header Share Listener (Invite)
    document.getElementById('shareQuizBtn').onclick = () => shareQuiz();

    loadQuizData(quizId);
});

async function loadQuizData(id) {
    try {
        const response = await fetch(`./data/questions/${id}.json`);
        const data = await response.json();
        
        questions = data.questions;
        totalTime = data.timeMinutes * 60;
        timeLeft = totalTime;
        shareConfig = data.shareConfig || { 
            inviteText: "Prepare for your exams on MeritBoard!", 
            challengeMsg: "I just completed the test on MeritBoard. Can you beat my score?" 
        };
        
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
    secBar.innerHTML = sections.map(sec => `<div class="section-tab">${sec}</div>`).join('');
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
        if(timeLeft <= 0) { clearInterval(timerInterval); submitQuiz(); }
    }, 1000);
}

// Button Controls
document.getElementById('nextBtn').onclick = () => {
    if(statusArray[currentIdx] === 'not-visited') statusArray[currentIdx] = 'not-answered';
    currentIdx++; renderQuestion();
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
    if(currentIdx < questions.length - 1) { currentIdx++; renderQuestion(); } 
    else renderPalette();
};

function renderPalette() {
    const pGrid = document.getElementById('questionPalette');
    if(!pGrid) return;
    pGrid.innerHTML = questions.map((_, i) => `
        <button class="p-btn ${statusArray[i]} ${i === currentIdx ? 'current' : ''}" onclick="goToQuestion(${i})">
            ${i + 1}
        </button>
    `).join('');
}

window.goToQuestion = (i) => { currentIdx = i; renderQuestion(); };

document.getElementById('togglePalette').onclick = () => {
    document.getElementById('questionPalette').classList.toggle('hidden');
};

// ==========================================
// SHARING LOGIC (Invite & Result Challenge)
// ==========================================

function shareQuiz() {
    const shareUrl = window.location.href;
    const shareText = shareConfig.inviteText;

    if (navigator.share) {
        navigator.share({
            title: 'MeritBoard Quiz',
            text: shareText,
            url: shareUrl
        }).catch(console.error);
    } else {
        // Fallback for Desktop: WhatsApp
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`, '_blank');
    }
}

function shareResultChallenge(score, total) {
    const shareUrl = window.location.href;
    // [SCORE] टैग को रियल स्कोर से रिप्लेस करना
    let challengeText = shareConfig.challengeMsg.replace("[SCORE]", `${score}/${total}`);
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(challengeText + "\n\n" + shareUrl)}`, '_blank');
}

// ==========================================
// PROFESSIONAL SUBMIT & ANALYSIS
// ==========================================

document.getElementById('submitBtn').onclick = submitQuiz;

function submitQuiz() {
    clearInterval(timerInterval);
    
    let score = 0;
    let attempted = 0;
    let subjectStats = {}; 

    questions.forEach((q, i) => {
        const ans = userAnswers[i];
        const sec = q.section || "General";
        if (!subjectStats[sec]) subjectStats[sec] = { total: 0, correct: 0 };
        subjectStats[sec].total++;

        if (ans !== null) {
            attempted++;
            if (ans === q.answer) {
                score++;
                subjectStats[sec].correct++;
            }
        }
    });

    // Hide Quiz, Show Result Page
    document.getElementById('quizHeader').classList.add('hidden');
    document.getElementById('sectionBar').classList.add('hidden');
    document.getElementById('quizMain').classList.add('hidden');
    document.getElementById('quizFooter').classList.add('hidden');
    document.getElementById('analysisPage').classList.remove('hidden');

    // Fill Stats
    document.getElementById('resFinalScore').innerText = score;
    document.getElementById('resTotalQs').innerText = questions.length;
    document.getElementById('resAttempted').innerText = attempted;
    document.getElementById('resAccuracy').innerText = (attempted > 0 ? Math.round((score/attempted)*100) : 0) + "%";
    
    const timeSpent = totalTime - timeLeft;
    document.getElementById('resTime').innerText = Math.floor(timeSpent / 60) + "m " + (timeSpent % 60) + "s";

    // Challenge Friend Button Logic
    document.getElementById('challengeFriendBtn').onclick = () => shareResultChallenge(score, questions.length);

    // Subject List
    const subList = document.getElementById('subjectWiseList');
    subList.innerHTML = Object.keys(subjectStats).map(sec => `
        <div class="subject-item">
            <span>${sec}</span>
            <span class="sub-score">${subjectStats[sec].correct} / ${subjectStats[sec].total}</span>
        </div>
    `).join('');

    renderFinalSolutions();
    window.scrollTo(0, 0);
}

function renderFinalSolutions() {
    const solList = document.getElementById('solutionsList');
    solList.innerHTML = '';

    questions.forEach((q, i) => {
        const userAns = userAnswers[i];
        const isCorrect = userAns === q.answer;
        const options = q[`options_${currentLang}`] || q.options;

        let optionsHTML = options.map((opt, optIdx) => {
            let cls = '';
            if (optIdx === q.answer) cls = 'correct';
            else if (optIdx === userAns && !isCorrect) cls = 'wrong';
            return `<div class="sol-opt ${cls}">${opt}</div>`;
        }).join('');

        solList.innerHTML += `
            <div class="solution-item">
                <div class="sol-q">Q${i+1}. ${q[`q_${currentLang}`] || q.question}</div>
                <div class="sol-options-container">${optionsHTML}</div>
                <div class="sol-exp"><strong>Explanation:</strong> ${q.explanation || 'No explanation available.'}</div>
            </div>`;
    });
}