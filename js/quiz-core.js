/**
 * Project: MeritBoard
 * File: js/quiz-core.js
 * Description: Dedicated Logic Engine for Quiz Page
 * Status: FINAL (Hindi Default Enabled)
 */

// --- STATE VARIABLES ---
let quizData = null;
let currentQIndex = 0;
let timeRemaining = 0;
let timerInterval;
let userResponses = []; 
let currentLang = 'hi'; // ✅ Default set to Hindi

// --- 1. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // URL se Quiz ID nikalo (e.g. ?id=hssc-cet-01)
    const params = new URLSearchParams(window.location.search);
    const quizId = params.get('id');

    if (!quizId) {
        alert("No Quiz ID found. Going back to Home.");
        window.location.href = 'index.html';
        return;
    }

    loadQuizData(quizId);
});

async function loadQuizData(quizId) {
    try {
        // Fetch JSON Data
        console.log(`Fetching: ./data/quizzes/${quizId}.json`);
        const response = await fetch(`./data/quizzes/${quizId}.json`);
        
        if (!response.ok) throw new Error("Quiz Data File Not Found");
        
        quizData = await response.json();

        // 1. Init User State
        userResponses = new Array(quizData.questions.length).fill(null).map(() => ({
            answer: null, status: 'not-visited', isMarked: false
        }));

        // 2. Setup Timer
        timeRemaining = (quizData.timeMinutes || 10) * 60;
        startTimer();

        // 3. Render Header Info
        document.getElementById('quizTitle').innerText = quizData.testTitle;
        renderHeaderTabs();
        
        // 4. Load First Question
        loadQuestion(0);
        generatePalette();

        // 5. Setup Events
        setupEventListeners();

    } catch (error) {
        console.error(error);
        document.querySelector('.quiz-body').innerHTML = `
            <div style="text-align:center; padding:50px; color:red;">
                <h3>⚠️ Error Loading Test</h3>
                <p>${error.message}</p>
                <button onclick="history.back()" style="padding:10px; margin-top:10px;">Go Back</button>
            </div>`;
    }
}

// --- 2. CORE RENDERER ---
function loadQuestion(index) {
    if (index < 0 || index >= quizData.questions.length) return;

    // Mark as Visited
    if (userResponses[index].status === 'not-visited') {
        userResponses[index].status = 'not-answered';
        updatePaletteItem(index);
    }

    currentQIndex = index;
    const q = quizData.questions[index];
    const lang = currentLang;

    // A. Meta Info
    document.getElementById('qNumber').innerText = `Q.${index + 1}`;
    
    // B. Question Text
    // Fallback: If Hindi missing, show English
    const text = (lang === 'hi' && q.q_hi) ? q.q_hi : q.q_en;
    document.getElementById('questionText').innerHTML = text;

    // C. Options
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    
    const options = (lang === 'hi' && q.options_hi) ? q.options_hi : q.options_en;
    options.forEach((opt, i) => {
        const div = document.createElement('div');
        const isSelected = userResponses[index].answer === i;
        
        div.className = `q-opt ${isSelected ? 'selected' : ''}`;
        div.innerHTML = `<b>${String.fromCharCode(65+i)}.</b> ${opt}`;
        div.onclick = () => selectOption(i);
        
        container.appendChild(div);
    });

    // D. Buttons
    document.getElementById('btnPrev').disabled = (index === 0);
    document.getElementById('btnNext').innerText = (index === quizData.questions.length - 1) ? "Submit Test" : "Save & Next";
    
    // Update Language Toggle Button Text
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
        langBtn.innerText = (currentLang === 'hi') ? "Switch to English" : "Switch to Hindi";
    }

    // E. Highlights
    highlightCurrentPalette(index);
    highlightActiveTab(q.section);
}

function selectOption(optIndex) {
    userResponses[currentQIndex].answer = optIndex;
    userResponses[currentQIndex].status = 'answered';
    loadQuestion(currentQIndex); 
    updatePaletteItem(currentQIndex);
}

// --- 3. EVENTS & NAVIGATION ---
function setupEventListeners() {
    // Navigation
    document.getElementById('btnNext').onclick = () => {
        if (currentQIndex < quizData.questions.length - 1) loadQuestion(currentQIndex + 1);
        else showSubmitModal();
    };
    
    document.getElementById('btnPrev').onclick = () => loadQuestion(currentQIndex - 1);
    
    document.getElementById('btnReview').onclick = () => {
        userResponses[currentQIndex].isMarked = true;
        // If un-answered, mark status as 'not-answered' but flag isMarked=true
        updatePaletteItem(currentQIndex);
        if (currentQIndex < quizData.questions.length - 1) loadQuestion(currentQIndex + 1);
    };

    // Header Actions
    document.getElementById('langToggle').onclick = () => {
        // Toggle Logic: If Hi -> En, else -> Hi
        currentLang = (currentLang === 'hi') ? 'en' : 'hi';
        loadQuestion(currentQIndex);
    };
    
    document.getElementById('headerSubmitBtn').onclick = showSubmitModal;

    // Palette Toggles
    const overlay = document.getElementById('paletteOverlay');
    document.getElementById('btnPalette').onclick = () => overlay.classList.remove('hidden');
    document.getElementById('closePalette').onclick = () => overlay.classList.add('hidden');

    // Modal Actions
    const modal = document.getElementById('submitModal');
    document.getElementById('cancelSubmit').onclick = () => modal.classList.add('hidden');
    document.getElementById('confirmSubmit').onclick = () => {
        modal.classList.add('hidden');
        finishQuiz();
    };

    // --- NEW: Header Share Button Logic ---
    const btnShareHeader = document.getElementById('btnShareHeader');
    if (btnShareHeader) {
        btnShareHeader.onclick = () => {
            const shareData = {
                title: quizData.testTitle,
                text: `Attempt this Mock Test: ${quizData.testTitle}`,
                url: window.location.href
            };
            
            // Native Share (Mobile) or Clipboard (Desktop)
            if (navigator.share) {
                navigator.share(shareData).catch(console.error);
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard! 📋");
            }
        };
    }

    // --- NEW: Result Share Button Logic ---
    const btnShareResult = document.getElementById('btnShareResult');
    if (btnShareResult) {
        btnShareResult.onclick = shareResultOnWhatsApp;
    }
}

// --- 4. PALETTE & TABS ---
function generatePalette() {
    const grid = document.getElementById('paletteGrid');
    grid.innerHTML = '';
    
    quizData.questions.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'p-btn not-visited';
        btn.id = `pal-btn-${i}`;
        btn.innerText = i + 1;
        btn.onclick = () => {
            loadQuestion(i);
            document.getElementById('paletteOverlay').classList.add('hidden');
        };
        grid.appendChild(btn);
    });
}

function updatePaletteItem(index) {
    const btn = document.getElementById(`pal-btn-${index}`);
    if(!btn) return;

    const s = userResponses[index];
    let cls = 'p-btn';

    // Priority Logic for Colors
    if (s.isMarked && s.answer !== null) cls += ' ans rev'; // Purple with Green Dot
    else if (s.isMarked) cls += ' rev'; // Purple
    else if (s.answer !== null) cls += ' ans'; // Green
    else if (s.status === 'not-answered') cls += ' not-ans'; // Red
    else cls += ' not-visited'; // White

    if (index === currentQIndex) cls += ' active';
    btn.className = cls;
}

function highlightCurrentPalette(index) {
    document.querySelectorAll('.p-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`pal-btn-${index}`);
    if(btn) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function renderHeaderTabs() {
    const container = document.getElementById('sectionTabs');
    const sections = [...new Set(quizData.questions.map(q => q.section || "General"))];
    
    container.innerHTML = sections.map(sec => 
        `<span class="tab" onclick="jumpToSection('${sec}')">${sec}</span>`
    ).join('');
}

window.jumpToSection = (sec) => {
    const idx = quizData.questions.findIndex(q => q.section === sec);
    if(idx !== -1) loadQuestion(idx);
}

function highlightActiveTab(sec) {
    document.querySelectorAll('.tab').forEach(t => {
        if(t.innerText === sec) t.classList.add('active');
        else t.classList.remove('active');
    });
}

// --- 5. TIMER ---
function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
        const s = (timeRemaining % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').innerText = `${m}:${s}`;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert("Time Up!");
            finishQuiz();
        }
    }, 1000);
}

function showSubmitModal() {
    document.getElementById('submitModal').classList.remove('hidden');
}

// --- 6. RESULT & SOLUTIONS ---
function finishQuiz() {
    clearInterval(timerInterval);
    
    let totalScore = 0;
    let correct = 0; 
    let wrong = 0;
    let secAnalysis = {}; // { "GK": {score:1, total:5} }

    quizData.questions.forEach((q, i) => {
        const uAns = userResponses[i].answer;
        const sec = q.section || "General";
        
        if(!secAnalysis[sec]) secAnalysis[sec] = {score:0, total:0};
        secAnalysis[sec].total += 1;

        if(uAns === q.answer) {
            correct++; totalScore += 1; secAnalysis[sec].score += 1;
        } else if(uAns !== null) {
            wrong++; totalScore -= 0.25; secAnalysis[sec].score -= 0.25;
        }
    });

    // Hide Quiz UI
    document.querySelector('.quiz-header').classList.add('hidden');
    document.querySelector('.quiz-body').classList.add('hidden');
    document.querySelector('.quiz-footer').classList.add('hidden');
    
    // Show Result
    const resScreen = document.getElementById('resultScreen');
    resScreen.classList.remove('hidden');

    // Fill Summary
    document.getElementById('scoreObtained').innerText = totalScore.toFixed(2);
    document.getElementById('scoreTotal').innerText = quizData.questions.length;
    document.getElementById('resCorrect').innerText = correct;
    document.getElementById('resWrong').innerText = wrong;
    
    const acc = (correct+wrong)>0 ? ((correct/(correct+wrong))*100).toFixed(0) : 0;
    document.getElementById('resAccuracy').innerText = acc + "%";

    // Fill Section Analysis
    document.getElementById('sectionAnalysis').innerHTML = Object.keys(secAnalysis).map(sec => `
        <div class="sec-item">
            <b>${sec}</b>
            <span>${secAnalysis[sec].score} / ${secAnalysis[sec].total}</span>
        </div>
    `).join('');

    // Fill Solutions
    document.getElementById('solutionsList').innerHTML = quizData.questions.map((q, i) => {
        const uAns = userResponses[i].answer;
        const isCorrect = uAns === q.answer;
        const isSkipped = uAns === null;

        let statusClass = isSkipped ? '' : (isCorrect ? 'correct' : 'wrong');
        let statusText = isSkipped ? 'Skipped' : (isCorrect ? 'Correct' : 'Wrong');
        let statusColor = isSkipped ? 'grey' : (isCorrect ? 'green' : 'red');

        // Options List
        const opts = (currentLang === 'hi' && q.options_hi) ? q.options_hi : q.options_en;
        const optsHtml = opts.map((opt, oIdx) => {
            let style = "";
            if(oIdx === q.answer) style = "color:green; font-weight:700;";
            if(oIdx === uAns && !isCorrect) style = "color:red; text-decoration:line-through;";
            
            return `<div style="${style}">• ${opt} ${oIdx===q.answer?'✅':''}</div>`;
        }).join('');

        const qText = (currentLang==='hi' && q.q_hi) ? q.q_hi : q.q_en;

        return `
            <div class="sol-card ${statusClass}">
                <div style="font-size:0.8rem; font-weight:700; color:${statusColor}; margin-bottom:5px;">
                    Q${i+1} • ${statusText}
                </div>
                <div style="font-weight:600; margin-bottom:10px;">${qText}</div>
                <div style="background:#fafafa; padding:10px; border-radius:6px; font-size:0.9rem;">
                    ${optsHtml}
                </div>
                <div class="sol-exp">
                    <b>💡 Explanation:</b><br>
                    ${q.explanation || "N/A"}
                </div>
            </div>
        `;
    }).join('');
}

// --- 7. SHARE RESULT LOGIC ---
function shareResultOnWhatsApp() {
    // 1. Get Score Data
    const score = document.getElementById('scoreObtained').innerText;
    const total = document.getElementById('scoreTotal').innerText;
    const title = quizData.testTitle;
    
    // --- 7. SHARE RESULT LOGIC ---
function shareResultOnWhatsApp() {
    // 1. Get Score Data
    const score = document.getElementById('scoreObtained').innerText;
    const total = document.getElementById('scoreTotal').innerText;
    const title = quizData.testTitle;
    
    // 2. Create Message
    const text = `🔥 Challenge Alert! 🔥\n\nI just scored ${score}/${total} in "${title}" on MeritBoard.\n\nCan you beat my score? Attempt now: ${window.location.href}`;

    // 3. Open WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
}
