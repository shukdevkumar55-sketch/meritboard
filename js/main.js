/**
 * Project: MeritBoard
 * Engine: main.js
 * Function: Fetch data, Render Exam Cards, and Manage UI Logic
 */

// 1. Motivational Quotes Array (Accuracy & Inspiration)
const quotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The secret of getting ahead is getting started.",
    "Hard work beats talent when talent doesn't work hard.",
    "Haryana's next top ranker is reading this. Keep going!",
    "Believe in yourself and all that you are. Your Merit awaits.",
    "Your preparation today determines your rank tomorrow."
];

// 2. Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    displayDailyQuote();
    fetchExams();
});

// 3. Display Random Quote
function displayDailyQuote() {
    const quoteElement = document.getElementById('dailyQuote');
    if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.innerText = `"${quotes[randomIndex]}"`;
    }
}

// 4. Fetch Exam Data from JSON
async function fetchExams() {
    const examsGrid = document.getElementById('examsGrid');
    const haryanaGrid = document.getElementById('haryanaExamsGrid');

    try {
        const response = await fetch('data/exams.json');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        renderExams(data.exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        if (examsGrid) examsGrid.innerHTML = `<p class="error">Unable to load exams. Please try again later.</p>`;
    }
}

// 5. Render Exams to Grid
function renderExams(exams) {
    const examsGrid = document.getElementById('examsGrid');
    const haryanaGrid = document.getElementById('haryanaExamsGrid');

    // Clear loading messages
    if (examsGrid) examsGrid.innerHTML = '';
    if (haryanaGrid) haryanaGrid.innerHTML = '';

    exams.forEach(exam => {
        const cardHTML = createExamCard(exam);

        // Logic: Separate Haryana exams from general exams
        if (exam.category === 'haryana-special' && haryanaGrid) {
            haryanaGrid.innerHTML += cardHTML;
        } else if (examsGrid) {
            examsGrid.innerHTML += cardHTML;
        }
    });
}

// 6. Create HTML Card Template (Scalability)
function createExamCard(exam) {
    // Generate Tags HTML
    const tagsHTML = exam.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ');

    return `
        <div class="exam-card">
            <div class="card-badge">${exam.status}</div>
            <h3>${exam.title}</h3>
            <div class="tags-container">${tagsHTML}</div>
            <p class="exam-info">
                <span>📊 ${exam.totalQuestions} Qs</span> | 
                <span>⏱️ ${exam.timeLimit}</span>
            </p>
            <p class="exam-desc">${exam.description}</p>
            <a href="${exam.link}" class="btn btn-primary" style="width: 100%; text-align: center; margin-top: 10px;">
                Start Test
            </a>
        </div>
    `;
}

// 7. Search Feature (Placeholder for future expansion)
// Isse website ka code future-proof rehta hai
const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const query = prompt("Which exam are you looking for?");
        if (query) {
            alert(`Searching for "${query}"... This feature will be live soon!`);
        }
    });
}