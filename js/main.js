/**
 * Project: MeritBoard
 * Engine: main.js (Version 3.0 - Slider & Category Logic)
 * Features: Dynamic Category Loading, Random Quotes, Search Logic
 */

// 1. Motivational Quotes Array
const quotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The secret of getting ahead is getting started.",
    "Haryana's next top ranker is reading this. Keep going!",
    "Your preparation today determines your rank tomorrow.",
    "Focus on your goal, the MeritBoard will show your name soon.",
    "Hard work beats talent when talent doesn't work hard."
];

// 2. Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log("MeritBoard Home Engine Ready...");
    displayDailyQuote();
    loadExamsData();
    setupSearch();
});

// 3. Display Random Quote with Smooth Transition
function displayDailyQuote() {
    const quoteElement = document.getElementById('dailyQuote');
    if (!quoteElement) return;
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.style.opacity = 0;
    
    setTimeout(() => {
        quoteElement.innerText = `"${quotes[randomIndex]}"`;
        quoteElement.style.opacity = 1;
    }, 400);
}

// 4. Fetch and Render Data into Sliders
async function loadExamsData() {
    const haryanaSlider = document.getElementById('haryanaExamsGrid');
    const popularSlider = document.getElementById('examsGrid');
    
    try {
        const response = await fetch('./data/exams.json');
        if (!response.ok) throw new Error('Failed to fetch exams.json');
        
        const data = await response.json();
        const allExams = data.exams;
        
        // स्लाइडर्स को खाली करें
        if (haryanaSlider) haryanaSlider.innerHTML = '';
        if (popularSlider) popularSlider.innerHTML = '';
        
        // डेटा को फ़िल्टर और रेंडर करें
        allExams.forEach(exam => {
            const cardHTML = generateExamCard(exam);
            
            // हरियाणा स्पेशल स्लाइडर के लिए
            if (exam.category === 'haryana-special' && haryanaSlider) {
                haryanaSlider.insertAdjacentHTML('beforeend', cardHTML);
            }
            // पॉपुलर क्विज़ स्लाइडर के लिए
            else if (popularSlider) {
                popularSlider.insertAdjacentHTML('beforeend', cardHTML);
            }
        });
        
        // अगर स्लाइडर खाली है तो मैसेज दिखाएँ
        checkEmptySlider(haryanaSlider, "No Haryana tests available yet.");
        checkEmptySlider(popularSlider, "More tests coming soon!");
        
    } catch (error) {
        console.error('Error:', error);
        const errorMsg = `<p style="color:red; padding:20px;">⚠️ Unable to load tests. Check your internet.</p>`;
        if (haryanaSlider) haryanaSlider.innerHTML = errorMsg;
    }
}

// 5. Generate Card HTML (Consistent with Style.css)
function generateExamCard(exam) {
    const tagsHTML = exam.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');
    
    return `
        <div class="exam-card">
            <div class="card-badge">${exam.status || 'Live'}</div>
            <h3>${exam.title}</h3>
            <div class="tags-container">
                ${tagsHTML}
            </div>
            <div class="exam-info">
                📊 ${exam.totalQuestions} Questions | ⏱️ ${exam.timeLimit}
            </div>
            <p class="exam-desc">${exam.description}</p>
            <a href="${exam.link}" class="btn-start-test">
                Start Free Test
            </a>
        </div>
    `;
}

// 6. Helper: Check if slider is empty
function checkEmptySlider(slider, msg) {
    if (slider && slider.innerHTML === '') {
        slider.innerHTML = `<p class="loading" style="width:100%; text-align:center;">${msg}</p>`;
    }
}

// 7. Search Feature Sync
function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.onclick = () => {
            const query = prompt("Which exam are you looking for?");
            if (query) {
                alert(`Searching for "${query}"... Feature coming soon!`);
            }
        };
    }
}