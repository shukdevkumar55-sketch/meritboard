/**
 * Project: MeritBoard Universal
 * File: js/home-loader.js
 * Description: Loads Homepage Sections (Quiz, Books, Videos, etc.) with Sliders
 * Status: Verified & Complete (Latest Content First)
 */

const DATA_URL = './data/content.json';
const MAIN_CONTAINER = document.getElementById('dynamicContent');

document.addEventListener('DOMContentLoaded', initHomePage);

async function initHomePage() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error("Failed to load content data");

        const data = await response.json();
        
        // 🔥 UPDATE 1: Data fetch hote hi array ko completely reverse kar diya gaya hai.
        // Isse aap JSON mein jo bhi naya data end mein add karenge, wo top par aayega.
        data.reverse();

        renderSections(data);

    } catch (error) {
        console.error("Home Load Error:", error);
        if(MAIN_CONTAINER) {
            MAIN_CONTAINER.innerHTML = `<p style="text-align:center; padding:20px; color:red;">⚠️ Unable to load content. Please try again later.</p>`;
        }
    }
}

function renderSections(allData) {
    if (!MAIN_CONTAINER) return;
    MAIN_CONTAINER.innerHTML = '';

    // 1. Define Sections
    const sections = [
        { 
            id: 'sec-quiz', 
            type: 'quiz', 
            title: 'Latest Mock Tests 📝', 
            viewLink: 'feed.html?type=quiz' 
        },
        { 
            id: 'sec-book', 
            type: 'book', 
            title: 'Library & Books 📚', 
            viewLink: 'feed.html?type=book' 
        },
        { 
            id: 'sec-video', 
            type: 'video', 
            title: 'Video Classes ▶️', 
            viewLink: 'feed.html?type=video' 
        },
        { 
            id: 'sec-blog', 
            type: 'blog', 
            title: 'Latest Articles 📰', 
            viewLink: 'feed.html?type=blog' 
        },
        { 
            id: 'sec-pdf', 
            type: 'pdf', 
            title: 'Study Notes (PDF) ⬇️', 
            viewLink: 'feed.html?type=pdf' 
        }
    ];

    // 2. Render Each Section
    sections.forEach(sec => {
        // Filter Items (Handle 'blog' and 'article' as same type)
        const items = allData.filter(item => {
            if (sec.type === 'blog') return item.type === 'blog' || item.type === 'article';
            return item.type === sec.type;
        });

        if (items.length > 0) {
            // 🔥 UPDATE 2: Kyunki pura data shuru mein hi reverse ho chuka hai,
            // ab hume sirf shuruati 8 items lene hain bina dubara reverse kiye.
            const recentItems = items.slice(0, 8);
            const sectionHTML = createSectionHTML(sec, recentItems);
            MAIN_CONTAINER.insertAdjacentHTML('beforeend', sectionHTML);
        }
    });
}

function createSectionHTML(sec, items) {
    const cardsHTML = items.map(item => createCard(item)).join('');

    return `
        <section class="content-section" id="${sec.id}">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">${sec.title}</h2>
                    <a href="${sec.viewLink}" class="view-all-link">View All →</a>
                </div>
                
                <div class="slider-wrapper">
                    <div class="card-slider">
                        ${cardsHTML}
                    </div>
                </div>
            </div>
        </section>
    `;
}

function createCard(item) {
    // 3. Smart Linking Logic
    let targetPage = 'view.html'; // Default

    if (item.type === 'quiz') {
        targetPage = 'quiz-view.html';
    } 
    else if (item.type === 'blog' || item.type === 'article') {
        targetPage = 'article-view.html';
    }
    else if (item.type === 'book') {
        targetPage = 'book-view.html';
    }

    const link = `${targetPage}?id=${item.id}&type=${item.type}`;

    // 4. Style Configuration
    let config = { icon: '📄', btn: 'View', cls: 'btn-outline', col: '#607d8b' };

    if (item.type === 'quiz') config = { icon: '⏱️', btn: 'Start Test', cls: 'btn-quiz', col: '#1A237E' };
    if (item.type === 'video') config = { icon: '▶️', btn: 'Watch', cls: 'btn-video', col: '#c0392b' };
    if (item.type === 'pdf') config = { icon: '⬇️', btn: 'Download', cls: 'btn-pdf', col: '#27ae60' };

    if (item.type === 'blog' || item.type === 'article') {
        config = { icon: '📰', btn: 'Read', cls: 'btn-blog', col: '#e67e22' };
    }
    if (item.type === 'book') {
        config = { icon: '📚', btn: 'Read Book', cls: 'btn-blog', col: '#8e44ad' };
    }

    const thumb = item.thumbnail || 'assets/default-thumb.jpg';

    return `
        <article class="content-card">
            <div class="card-thumbnail-wrapper">
                <span class="card-badge" style="background:${config.col}">${item.category || 'General'}</span>
                <img src="${thumb}" class="card-img" loading="lazy" alt="${item.title}"
                     onerror="this.src='assets/default-thumb.jpg'">
            </div>
            <div class="card-body">
                <div class="card-meta"><span>${config.icon} ${item.type.toUpperCase()}</span></div>
                <h3 class="card-title"><a href="${link}">${item.title}</a></h3>
                <a href="${link}" class="card-btn ${config.cls}">${config.btn}</a>
            </div>
        </article>
    `;
}
