/**
 * Project: MeritBoard Universal
 * File: js/feed-loader.js
 * Feature: Advanced Feed (Search Removed, Sorting & Tabs Active)
 * Status: FINAL OPTIMIZED
 */

const DATA_URL = './data/content.json';

// --- 1. DOM ELEMENTS ---
const GRID_CONTAINER = document.getElementById('feedGrid');
const EMPTY_STATE = document.getElementById('emptyState');
const PAGE_TITLE = document.getElementById('feedTitle');
const PAGE_SUBTITLE = document.getElementById('feedSubtitle');
const BREADCRUMB_CURRENT = document.getElementById('breadCrumbCurrent');

// Controls
const TABS_CONTAINER = document.getElementById('categoryTabs');
const SORT_SELECT = document.getElementById('sortBy');

// State Variables
let allItems = [];      // Store all data for current type
let currentType = '';   // 'video', 'quiz', 'book', etc.
let activeCategory = 'All';

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', initFeed);

async function initFeed() {
    try {
        // A. Get Type from URL
        const params = new URLSearchParams(window.location.search);
        currentType = params.get('type');

        // Redirect if no type specified
        if (!currentType) {
            window.location.href = 'index.html';
            return;
        }

        // B. Update Page Headers (Title/Subtitle)
        updateHeaders(currentType);

        // C. Fetch Data
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error("Failed to load content data");
        const data = await response.json();

        // D. Initial Filter by Type
        // Sirf wahi items rakhenge jo URL type se match karein
        allItems = data.filter(item => item.type === currentType);

        // Check if items exist
        if (allItems.length === 0) {
            showEmptyState(true);
            // Hide tabs if no content
            if (TABS_CONTAINER) TABS_CONTAINER.innerHTML = ''; 
            return;
        }

        // E. Render Interface
        renderCategoryTabs();
        setupEventListeners();

        // F. Initial Render (Show All)
        applyFilters();

    } catch (error) {
        console.error("Feed Error:", error);
        if (GRID_CONTAINER) {
            GRID_CONTAINER.innerHTML = `<div style="text-align:center; padding:30px; color:#ef5350; grid-column: 1/-1;">
                <h3>⚠️ Unable to load content</h3>
                <p>Please check your internet connection or try again later.</p>
            </div>`;
        }
    }
}

// --- 3. UI UPDATES ---

function updateHeaders(type) {
    const config = {
        'quiz': { t: 'Mock Tests Series 📝', s: 'Practice with latest exam patterns' },
        'video': { t: 'Video Classes ▶️', s: 'Learn from expert video lectures' },
        'pdf': { t: 'Study Notes (PDF) 📚', s: 'Download detailed study material' },
        'blog': { t: 'Articles & Guidance 📰', s: 'Tips and updates for aspirants' },
        'book': { t: 'Library & Books 📚', s: 'Read top summaries and books' }
    };

    const info = config[type] || { t: 'Content Feed', s: 'Browse collection' };
    
    if (PAGE_TITLE) PAGE_TITLE.innerText = info.t;
    if (PAGE_SUBTITLE) PAGE_SUBTITLE.innerText = info.s;
    if (BREADCRUMB_CURRENT) BREADCRUMB_CURRENT.innerText = info.t;
}

function renderCategoryTabs() {
    if (!TABS_CONTAINER) return;

    // Get unique categories from data
    const categories = ['All', ...new Set(allItems.map(item => item.category))];

    TABS_CONTAINER.innerHTML = categories.map(cat => `
        <button class="tab-btn ${cat === 'All' ? 'active' : ''}" 
                onclick="handleCategoryClick('${cat}', this)">
            ${cat}
        </button>
    `).join('');
}

function setupEventListeners() {
    // Sort Change Listener
    if (SORT_SELECT) {
        SORT_SELECT.addEventListener('change', () => applyFilters());
    }
}

// --- 4. FILTERING LOGIC ---

// Global function for Tab Clicks
window.handleCategoryClick = (category, btn) => {
    activeCategory = category;

    // Update Tab Styles
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Re-apply Filters
    applyFilters();
};

function applyFilters() {
    // 1. Start with copy of all items
    let results = [...allItems];

    // 2. Filter by Category
    if (activeCategory !== 'All') {
        results = results.filter(item => item.category === activeCategory);
    }

    // 3. Apply Sorting
    const sortMode = SORT_SELECT ? SORT_SELECT.value : 'newest';
    
    if (sortMode === 'newest') {
        // Assuming newer items are at the bottom of JSON, reverse them
        results.reverse(); 
    } else if (sortMode === 'az') {
        // Sort Alphabetically
        results.sort((a, b) => a.title.localeCompare(b.title));
    }
    // 'oldest' needs no change if JSON is naturally chronological

    // 4. Render Final List
    renderGrid(results);
}

// --- 5. RENDER GRID ---

function renderGrid(items) {
    if (items.length === 0) {
        showEmptyState(true);
    } else {
        showEmptyState(false);
        GRID_CONTAINER.innerHTML = items.map(item => createFeedCard(item)).join('');
    }
}

function showEmptyState(show) {
    if (show) {
        GRID_CONTAINER.classList.add('hidden');
        if (EMPTY_STATE) EMPTY_STATE.classList.remove('hidden');
    } else {
        if (EMPTY_STATE) EMPTY_STATE.classList.add('hidden');
        GRID_CONTAINER.classList.remove('hidden');
    }
}

// --- 6. CARD HTML GENERATOR ---

function createFeedCard(item) {
    // Determine Target Page based on Type
    let targetPage = 'view.html'; // Fallback
    
    if (item.type === 'quiz') {
        targetPage = 'quiz-view.html';
    } 
    else if (['blog', 'article', 'book', 'pdf', 'video'].includes(item.type)) {
        targetPage = 'article-view.html';
    }

    const link = `${targetPage}?id=${item.id}&type=${item.type}`;

    // Styling Config
    let config = { icon: '📄', btn: 'View', cls: 'btn-outline', col: '#607d8b' };
    
    if (item.type === 'quiz') config = { icon: '⏱️', btn: 'Start Test', cls: 'btn-quiz', col: '#1A237E' };
    if (item.type === 'video') config = { icon: '▶️', btn: 'Watch', cls: 'btn-video', col: '#c0392b' };
    if (item.type === 'pdf') config = { icon: '⬇️', btn: 'Download', cls: 'btn-pdf', col: '#27ae60' };
    if (item.type === 'blog') config = { icon: '📰', btn: 'Read', cls: 'btn-blog', col: '#e67e22' };
    if (item.type === 'book') config = { icon: '📚', btn: 'Read Book', cls: 'btn-blog', col: '#8e44ad' };

    // Return HTML
    return `
        <article class="content-card">
            <div class="card-thumbnail-wrapper">
                <span class="card-badge" style="background:${config.col}">${item.category}</span>
                <img src="${item.thumbnail}" class="card-img" loading="lazy" 
                     onerror="this.src='assets/default-thumb.jpg'" alt="${item.title}">
            </div>
            <div class="card-body">
                <div class="card-meta"><span>${config.icon} ${item.type.toUpperCase()}</span></div>
                <h3 class="card-title"><a href="${link}">${item.title}</a></h3>
                <a href="${link}" class="card-btn ${config.cls}">${config.btn}</a>
            </div>
        </article>
    `;
}
