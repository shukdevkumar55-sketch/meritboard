/**
 * Project: MeritBoard
 * File: js/quiz-core.js
 * Description: Logic Engine for Quiz with Advanced Analytics & Sharing
 * Status: FINAL COMPLETE (Fixed HTML Rendering & SVG Support)
 */

// =========================================
// 1. STATE VARIABLES & ANALYTICS HELPER
// =========================================
let quizData = null;
let currentQIndex = 0;
let timeRemaining = 0;
let timerInterval;
let userResponses = []; 
let currentLang = 'hi'; // Default Language: Hindi

// --- 📊 ANALYTICS HELPER FUNCTION ---
// Google Analytics 4 (GA4) Event Sender
function sendAnalyticsEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    } else {
        // Dev Mode: Agar Analytics setup nahi hai to console me dikhega
        console.log(`📊 Analytics [${eventName}]:`, params);
    }
}

// =========================================
// 2. INITIALIZATION & DATA LOADING
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // Get Quiz ID from URL
    const params = new URLSearchParams(window.location.search);
    const quizId = params.get('id');

    if (!quizId) {
        alert("No Quiz ID found. Redirecting to Home.");
        window.location.href = 'index.html';
        return;
    }

    loadQuizData(quizId);
});

async function loadQuizData(quizId) {
    try {
        console.log(`Loading Quiz: ${quizId}`);
        const response = await fetch(`./data/quizzes/${quizId}.json`);

        if (!response.ok) throw new Error("Quiz Data File Not Found");

        quizData = await response.json();

        // Initialize User State (Empty Answers)
        userResponses = new Array(quizData.questions.length).fill(null).map(() => ({
            answer: null, status: 'not-visited', isMarked: false
        }));

        // Render Instruction Screen first (Don't start quiz yet)
        renderInstructionScreen();

        // Initialize all button events
        setupEventListeners();

    } catch (error) {
        console.error(error);
        const body = document.querySelector('.quiz-body');
        if(body) {
            body.innerHTML = `
            <div style="text-align:center; padding:50px; color:red;">
                <h3>⚠️ Error Loading Test</h3>
                <p>Possible causes: JSON Syntax Error or File Missing.</p>
                <p>Technical Error: ${error.message}</p>
                <button onclick="history.back()" style="padding:10px; margin-top:10px;">Go Back</button>
            </div>`;
        }
    }
}

// =========================================
// 3. INSTRUCTION SCREEN
// =========================================
function renderInstructionScreen() {
    if(!document.getElementById('instTitle')) return;

    // Fill Basic Info
    document.getElementById('instTitle').innerText = quizData.testTitle;
    document.getElementById('instCategory').innerText = quizData.category || "General Test";
    document.getElementById('instQCount').innerText = quizData.questions.length;
    document.getElementById('instTime').innerText = (quizData.timeMinutes || 10) + " Min";
    document.getElementById('instMarks').innerText = quizData.questions.length * 1; 

    // Description & Image
    // ✅ FIX: Use innerHTML to render <br> and <b> tags in description
    document.getElementById('instDesc').innerHTML = quizData.description || "Read the instructions carefully before starting the test.";
    
    if(quizData.cover_image) {
        document.getElementById('instCover').src = quizData.cover_image;
    }

    // Dynamic Negative Marking Display
    const penalty = (quizData.negativeMarking !== undefined) ? quizData.negativeMarking : 0.25;
    const negElem = document.getElementById('instNegative');
    const negTextElem = document.getElementById('instNegText');

    if (penalty > 0) {
        negElem.innerText = "-" + penalty;
        negElem.style.color = "#d32f2f"; // Red
        negTextElem.innerHTML = `⚠️ <b>Negative Marking:</b> ${penalty} marks deducted for wrong answers.`;
        negTextElem.style.color = "#d32f2f";
    } else {
        negElem.innerText = "0";
        negElem.style.color = "#2e7d32"; // Green
        negTextElem.innerHTML = "✅ <b>No Negative Marking</b> in this test.";
        negTextElem.style.color = "#2e7d32";
    }
}

// =========================================
// 4. CORE QUIZ RENDERER
// =========================================
function loadQuestion(index) {
    if (index < 0 || index >= quizData.questions.length) return;

    // Mark current question as 'not-answered' if visited first time
    if (userResponses[index].status === 'not-visited') {
        userResponses[index].status = 'not-answered';
        updatePaletteItem(index);
    }

    currentQIndex = index;
    const q = quizData.questions[index];

    // Update Question Number & Marks
    document.getElementById('qNumber').innerText = `Q.${index + 1}`;

    // Dynamic Marks Display
    const penalty = (quizData.negativeMarking !== undefined) ? quizData.negativeMarking : 0.25;
    const plusBadge = document.querySelector('.plus');
    const minusBadge = document.querySelector('.minus');

    if(plusBadge) plusBadge.innerText = "+1.0";
    if(minusBadge) minusBadge.innerText = penalty > 0 ? `-${penalty}` : "0"; 

    // --- [TEXT RENDERING LOGIC] --- 
    // Render Question Text AND Image (if SVG exists)
    let text = (currentLang === 'hi' && q.q_hi) ? q.q_hi : q.q_en;

    // Check if SVG Image exists in JSON
    if (q.svg_image) {
        text += `<div class="q-image-container" style="margin: 20px auto; max-width: 100%; text-align: center;">${q.svg_image}</div>`;
    }

    // ✅ FIX: Use innerHTML to render SVG and HTML tags
    document.getElementById('questionText').innerHTML = text;
    // -----------------------------

    // Render Options
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';

    const options = (currentLang === 'hi' && q.options_hi) ? q.options_hi : q.options_en;
    options.forEach((opt, i) => {
        const div = document.createElement('div');
        const isSelected = userResponses[index].answer === i;

        div.className = `q-opt ${isSelected ? 'selected' : ''}`;
        
        // ✅ FIX: Use innerHTML here too for bold tags like <b>A.</b>
        div.innerHTML = `<b>${String.fromCharCode(65+i)}.</b> ${opt}`;
        
        div.onclick = () => selectOption(i); // Click Event

        container.appendChild(div);
    });

    // Update Buttons State
    document.getElementById('btnPrev').disabled = (index === 0);
    document.getElementById('btnNext').innerText = (index === quizData.questions.length - 1) ? "Submit Test" : "Save & Next";

    // Update Language Button Text
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
        langBtn.innerText = (currentLang === 'hi') ? "Switch to English" : "Switch to Hindi";
    }

    // Highlight Navigation Items
    highlightCurrentPalette(index);
    highlightActiveTab(q.section);
}

function selectOption(optIndex) {
    userResponses[currentQIndex].answer = optIndex;
    userResponses[currentQIndex].status = 'answered';
    loadQuestion(currentQIndex); 
    updatePaletteItem(currentQIndex);
}

// =========================================
// 5. EVENTS & NAVIGATION
// =========================================
function setupEventListeners() {

    // A. Start Quiz Button
    const startBtn = document.getElementById('btnStartQuiz');
    if(startBtn) {
        startBtn.onclick = () => {
            // UI Transition
            document.getElementById('instructionScreen').classList.add('hidden');
            document.querySelector('.quiz-header').classList.remove('hidden');
            document.querySelector('.quiz-body').classList.remove('hidden');
            document.querySelector('.quiz-footer').classList.remove('hidden');

            // Setup Header
            document.getElementById('quizTitle').innerText = quizData.testTitle;
            renderHeaderTabs(); 

            // 🔥 ANALYTICS: Track Level Start
            sendAnalyticsEvent('level_start', {
                level_name: quizData.testTitle,
                category: quizData.category || 'General'
            });

            // Start Engine
            timeRemaining = (quizData.timeMinutes || 10) * 60;
            startTimer();
            loadQuestion(0);
            generatePalette();

            // History State for Back Button
            history.pushState({ page: 'quiz_active' }, document.title, window.location.href);
        };
    }

    // B. Handle Browser Back Button
    window.onpopstate = function(event) {
        const quizBody = document.querySelector('.quiz-body');
        if (!quizBody.classList.contains('hidden')) {
            clearInterval(timerInterval); // Stop timer

            // Hide Quiz & Show Instructions
            document.querySelector('.quiz-header').classList.add('hidden');
            document.querySelector('.quiz-body').classList.add('hidden');
            document.querySelector('.quiz-footer').classList.add('hidden');
            document.getElementById('instructionScreen').classList.remove('hidden');
        }
    };

    // C. Navigation Buttons
    document.getElementById('btnNext').onclick = () => {
        if (currentQIndex < quizData.questions.length - 1) loadQuestion(currentQIndex + 1);
        else showSubmitModal();
    };

    document.getElementById('btnPrev').onclick = () => loadQuestion(currentQIndex - 1);

    document.getElementById('btnReview').onclick = () => {
        userResponses[currentQIndex].isMarked = true;
        updatePaletteItem(currentQIndex);
        if (currentQIndex < quizData.questions.length - 1) loadQuestion(currentQIndex + 1);
    };

    // D. Header Actions
    document.getElementById('langToggle').onclick = () => {
        currentLang = (currentLang === 'hi') ? 'en' : 'hi';
        loadQuestion(currentQIndex);
    };

    document.getElementById('headerSubmitBtn').onclick = showSubmitModal;

    // E. Palette Toggles
    const overlay = document.getElementById('paletteOverlay');
    document.getElementById('btnPalette').onclick = () => overlay.classList.remove('hidden');
    document.getElementById('closePalette').onclick = () => overlay.classList.add('hidden');

    // F. Modal Actions
    const modal = document.getElementById('submitModal');
    document.getElementById('cancelSubmit').onclick = () => modal.classList.add('hidden');
    document.getElementById('confirmSubmit').onclick = () => {
        modal.classList.add('hidden');
        finishQuiz();
    };

    // G. ADVANCED SHARE BUTTON LOGIC (Header)
    const btnShareHeader = document.getElementById('btnShareHeader');
    if (btnShareHeader) {
        btnShareHeader.onclick = async () => {
            const shareData = {
                title: quizData.testTitle,
                text: `Attempt this Mock Test: "${quizData.testTitle}" on MeritBoard.`,
                url: window.location.href
            };

            // 🔥 ANALYTICS: Track Share Click
            sendAnalyticsEvent('share', {
                method: 'System Share',
                content_type: 'Quiz Link',
                item_id: quizData.testTitle
            });

            // 1. Try Native Share
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) { console.log('Native share closed'); }
            } 
            // 2. Fallback: Clipboard Copy
            else {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast("Link Copied to Clipboard! 📋");
                } catch (err) {
                    prompt("Copy this link:", window.location.href);
                }
            }
        };
    }

    // H. Result Share Button
    const btnShareResult = document.getElementById('btnShareResult');
    if (btnShareResult) {
        btnShareResult.onclick = shareResultOnWhatsApp;
    }
}

// =========================================
// 6. PALETTE & TABS UTILITIES
// =========================================
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

    if (s.isMarked && s.answer !== null) cls += ' ans rev';
    else if (s.isMarked) cls += ' rev';
    else if (s.answer !== null) cls += ' ans';
    else if (s.status === 'not-answered') cls += ' not-ans';
    else cls += ' not-visited';

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

// =========================================
// 7. TIMER & SUBMISSION
// =========================================
function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
        const s = (timeRemaining % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').innerText = `${m}:${s}`;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert("Time Up! Submitting automatically.");
            finishQuiz();
        }
    }, 1000);
}

function showSubmitModal() {
    document.getElementById('submitModal').classList.remove('hidden');
}

// =========================================
// 8. RESULT & SOLUTIONS LOGIC (Analytics Added)
// =========================================
function finishQuiz() {
    // 1. Stop Timer
    clearInterval(timerInterval);

    let totalScore = 0;
    let correct = 0; 
    let wrong = 0;
    let secAnalysis = {}; 

    // 2. Get Penalty from JSON (Default 0.25)
    const penalty = (quizData.negativeMarking !== undefined) ? quizData.negativeMarking : 0.25;

    // 3. Calculate Score
    quizData.questions.forEach((q, i) => {
        const uAns = userResponses[i].answer;
        const sec = q.section || "General";

        if(!secAnalysis[sec]) secAnalysis[sec] = {score:0, total:0};
        secAnalysis[sec].total += 1;

        if(uAns === q.answer) {
            correct++; 
            totalScore += 1; 
            secAnalysis[sec].score += 1;
        } else if(uAns !== null) {
            wrong++; 
            totalScore -= penalty; 
            secAnalysis[sec].score -= penalty;
        }
    });

    // 4. 🔥 ANALYTICS: Track Quiz Completion & Score
    const percentage = (totalScore / quizData.questions.length) * 100;
    const acc = (correct+wrong)>0 ? ((correct/(correct+wrong))*100).toFixed(0) : 0;

    sendAnalyticsEvent('level_end', {
        level_name: quizData.testTitle,
        success: percentage >= 40, // Assuming 40% is passing
        score: totalScore,
        accuracy: acc
    });

    sendAnalyticsEvent('post_score', {
        score: totalScore,
        level: quizData.testTitle,
        character: quizData.category // Using category as character
    });

    // 5. HIDE QUIZ UI
    document.querySelector('.quiz-header').classList.add('hidden');
    document.querySelector('.quiz-body').classList.add('hidden');
    document.querySelector('.quiz-footer').classList.add('hidden');
    document.getElementById('paletteOverlay').classList.add('hidden');

    // 6. SHOW RESULT SCREEN
    const resScreen = document.getElementById('resultScreen');
    resScreen.classList.remove('hidden');

    // 7. FILL DATA
    document.getElementById('scoreObtained').innerText = totalScore.toFixed(2);
    document.getElementById('scoreTotal').innerText = quizData.questions.length;

    const correctEl = document.getElementById('resCorrect');
    correctEl.innerText = correct;
    correctEl.parentElement.classList.add('correct'); // Add Green Color Class

    const wrongEl = document.getElementById('resWrong');
    wrongEl.innerText = wrong;
    wrongEl.parentElement.classList.add('wrong'); // Add Red Color Class

    document.getElementById('resAccuracy').innerText = acc + "%";

    // 8. FILL SECTION ANALYSIS
    document.getElementById('sectionAnalysis').innerHTML = Object.keys(secAnalysis).map(sec => `
        <div class="sec-item">
            <b>${sec}</b>
            <span>${secAnalysis[sec].score.toFixed(2)} / ${secAnalysis[sec].total}</span>
        </div>
    `).join('');

    // 9. FILL DETAILED SOLUTIONS
    renderSolutions(quizData.questions);
}

// Helper Function to Render Solutions
function renderSolutions(questions) {
    const list = document.getElementById('solutionsList');
    list.innerHTML = questions.map((q, i) => {
        const uAns = userResponses[i].answer;
        const isCorrect = uAns === q.answer;
        const isSkipped = uAns === null;

        let statusClass = isSkipped ? 'skipped' : (isCorrect ? 'correct' : 'wrong');
        let statusText = isSkipped ? 'Skipped' : (isCorrect ? 'Correct' : 'Wrong');
        let statusColor = isSkipped ? '#757575' : (isCorrect ? '#2e7d32' : '#d32f2f');

        // Options HTML
        const opts = (currentLang === 'hi' && q.options_hi) ? q.options_hi : q.options_en;
        const optsHtml = opts.map((opt, oIdx) => {
            let style = "";
            let icon = "";

            // Correct Option
            if(oIdx === q.answer) {
                style = "color:#2e7d32; font-weight:700; background:#e8f5e9;";
                icon = "✅";
            }
            // User Wrong Option
            else if(oIdx === uAns && !isCorrect) {
                style = "color:#d32f2f; text-decoration:line-through; background:#ffebee;";
                icon = "❌";
            }

            return `<div class="sol-opt" style="${style}">${String.fromCharCode(65+oIdx)}. ${opt} ${icon}</div>`;
        }).join('');

        // --- [SVG & HTML TEXT SUPPORT FOR SOLUTIONS] ---
         // Render Question Text AND Image (if SVG exists) in Solution
        let qText = (currentLang==='hi' && q.q_hi) ? q.q_hi : q.q_en;

        if (q.svg_image) {
            qText += `<div class="sol-image" style="margin: 15px auto; text-align: center;">${q.svg_image}</div>`;
        }
        // -----------------------------

        return `
            <div class="sol-card ${statusClass}">
                <div class="sol-status" style="color:${statusColor}; border-color:${statusColor}">
                    Q.${i+1} ${statusText}
                </div>
                <div class="sol-question">${qText}</div>
                
                <div style="margin:10px 0;">
                    ${optsHtml}
                </div>

                <div class="sol-exp">
                    <b>💡 Explanation:</b>
                    ${q.explanation || "No explanation provided."}
                </div>
            </div>
        `;
    }).join('');
}

// =========================================
// 9. HELPERS (Share & Toast)
// =========================================

function shareResultOnWhatsApp() {
    const score = document.getElementById('scoreObtained').innerText;
    const total = document.getElementById('scoreTotal').innerText;
    const title = quizData.testTitle;

    // 🔥 ANALYTICS: Track Result Share
    sendAnalyticsEvent('share', {
        method: 'WhatsApp',
        content_type: 'Quiz Result',
        item_id: title
    });

        const text = `🔥 Challenge Alert! 🔥\n\nI just scored ${score}/${total} in "${title}" on MeritBoard.\n\nCan you beat my score? Attempt now: ${window.location.href}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
}

// Toast Notification Logic
function showToast(message) {
    let toast = document.getElementById('toast-box');

    // Create toast if not exists
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-box';
        document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.className = "show";

    // Auto hide after 3 seconds
    setTimeout(() => { 
        toast.className = toast.className.replace("show", ""); 
    }, 3000);
}