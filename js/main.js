/**
 * Project: MeritBoard
 * Engine: main.js (Version 2.0 - High Accuracy)
 */

// 1. Motivational Quotes (Bright & Motivational Theme)
const quotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The secret of getting ahead is getting started.",
    "Haryana's next top ranker is reading this. Keep going!",
    "Your preparation today determines your rank tomorrow.",
    "Focus on your goal, the MeritBoard will show your name soon.",
    "Hard work beats talent when talent doesn't work hard."
];

// 2. Initialize Website
document.addEventListener('DOMContentLoaded', () => {
    console.log("MeritBoard Engine Started...");
    displayDailyQuote();
    loadExamsData();
});

// 3. Display Random Quote (Hero Section)
function displayDailyQuote() {
    const quoteElement = document.getElementById('dailyQuote');
    if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.style.opacity = 0; // Fade effect start
        setTimeout(() => {
            quoteElement.innerText = `"${quotes[randomIndex]}"`;
            quoteElement.style.opacity = 1; // Fade effect end
        }, 300);
    }
}

// 4. Fetch and Render Data (The Core Logic)
async function loadExamsData() {
    // Relative path works better on GitHub Pages
    const jsonPath = 'data/exams.json'; 
    
    const examsGrid = document.getElementById('examsGrid');
    const haryanaGrid = document.getElementById('haryanaExamsGrid');

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error('Failed to load exams database');
        
        const data = await response.json();
        const allExams = data.exams;

        // Clear "Loading..." messages
        if (examsGrid) examsGrid.innerHTML = '';
        if (haryanaGrid) haryanaGrid.innerHTML = '';

        // Distribute Exams into Categories
        allExams.forEach(exam => {
            const cardHTML = generateExamCard(exam);

            if (exam.category === 'haryana-special' && haryanaGrid) {
                haryanaGrid.insertAdjacentHTML('beforeend', cardHTML);
            } else if (examsGrid) {
                examsGrid.insertAdjacentHTML('beforeend', cardHTML);
            }
        });

    } catch (error) {
        console.error('Fetch Error:', error);
        const errorMsg = `<p style="color: red; padding: 20px;">⚠️ Error loading tests. Please check your internet or path.</p>`;
        if (examsGrid) examsGrid.innerHTML = errorMsg;
    }
}

// 5. Card Template (Matching your Professional CSS)
function generateExamCard(exam) {
    // Create tags string
    const tags = exam.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');

    return `
        <div class="exam-card">
            <div class="card-badge">${exam.status}</div>
            <h3>${exam.title}</h3>
            <div class="tags-container">
                ${tags}
            </div>
            <div class="exam-info">
                <span>📊 ${exam.totalQuestions} Questions</span> | 
                <span>⏱️ ${exam.timeLimit}</span>
            </div>
            <p class="exam-desc">${exam.description}</p>
            <a href="${exam.link}" class="btn btn-primary" style="display: block; width: 100%; text-align: center;">
                Start Free Test
            </a>
        </div>
    `;
}

// 6. Search Interaction (Sleek UI)
const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const query = prompt("Which Haryana Exam are you preparing for?");
        if (query) {
            alert(`Looking for "${query}" tests... We are adding more tests daily!`);
        }
    });
}