/**
 * Project: MeritBoard
 * Engine: main.js (Version 4.0 - Universal Dynamic Loader)
 * Features: Dynamic Section Injection, Multi-type Card Support, Quotes & Search
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
    console.log("MeritBoard Engine v4.0 Active...");
    displayDailyQuote();
    loadUniversalContent(); // डायनामिक कंटेंट लोड करें
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

/**
 * 4. Load Universal Content Logic
 * JSON से सेक्शन्स पढ़ेगा और उन्हें पेज पर रेंडर करेगा
 */
async function loadUniversalContent() {
    const container = document.getElementById('dynamicSectionsContainer');
    if (!container) return;
    
    try {
        const response = await fetch('./data/exams.json');
        if (!response.ok) throw new Error('Failed to fetch exams.json');
        
        const data = await response.json();
        const sections = data.homepage_sections;
        
        container.innerHTML = ''; // लोडिंग मैसेज हटाएँ
        
        sections.forEach(section => {
            // A. सेक्शन का ढांचा (Header + Slider Wrapper) तैयार करें
            const sectionHTML = createSectionHTML(section);
            container.insertAdjacentHTML('beforeend', sectionHTML);
            
            // B. उस सेक्शन के अंदर आइटम्स (Cards) भरें
            const gridId = `grid-${section.section_id}`;
            const gridElement = document.getElementById(gridId);
            
            if (section.items && section.items.length > 0) {
                section.items.forEach(item => {
                    const cardHTML = generateUniversalCard(item, section.content_type);
                    gridElement.insertAdjacentHTML('beforeend', cardHTML);
                });
            } else {
                gridElement.innerHTML = `<p class="loading">No content available in ${section.section_title}</p>`;
            }
        });
        
    } catch (error) {
        console.error('Engine Error:', error);
        container.innerHTML = `<p style="color:red; text-align:center; padding:20px;">⚠️ Unable to build MeritBoard. Check internet connection.</p>`;
    }
}

/**
 * 5. Create Section Template (Brings Slider functionality)
 */
function createSectionHTML(section) {
    return `
        <section id="${section.section_id}" class="category-section">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title-main">${section.section_title}</h2>
                    <a href="${section.view_all_link}" class="view-all-link">View All →</a>
                </div>
                <div class="slider-wrapper">
                    <div id="grid-${section.section_id}" class="exams-slider">
                        <!-- Cards will be injected here -->
                    </div>
                </div>
            </div>
        </section>
    `;
}

/**
 * 6. Generate Universal Card (Quiz, PDF, Jobs compatible)
 */
function generateUniversalCard(item, contentType) {
    const tagsHTML = item.tags ? item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : '';
    
    // कंटेंट टाइप के हिसाब से बटन का टेक्स्ट और बिहेवियर बदलें
    let actionText = "Start Free Test";
    let icon = "📊";
    
    if (contentType === "pdf") {
        actionText = "Download PDF";
        icon = "📁";
    } else if (contentType === "jobs") {
        actionText = "Apply Now";
        icon = "📢";
    }
    
    return `
        <div class="exam-card">
            <div class="card-badge">${item.status || 'Live'}</div>
            <h3>${item.title}</h3>
            <div class="tags-container">
                ${tagsHTML}
            </div>
            <div class="exam-info">
                ${icon} ${item.info || ''}
            </div>
            <p class="exam-desc">${item.desc || item.description || ''}</p>
            <a href="${item.link}" class="btn-start-test">
                ${actionText}
            </a>
        </div>
    `;
}

// 7. Search Feature Interaction
function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.onclick = () => {
            const query = prompt("What are you looking for today?");
            if (query) {
                alert(`We are indexing "${query}" for you. Stay tuned!`);
            }
        };
    }
}