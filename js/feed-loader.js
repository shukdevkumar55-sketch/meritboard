/**
 * Project: MeritBoard Universal
 * File: js/feed-loader.js
 * Feature: Advanced Feed with Tabs, Search, Sort & Dynamic Linking
 * Status: FINAL (Features Added)
 */

const DATA_URL = './data/content.json';

// DOM Elements
const GRID_CONTAINER = document.getElementById('feedGrid');
const EMPTY_STATE = document.getElementById('emptyState');
const PAGE_TITLE = document.getElementById('feedTitle');
const PAGE_SUBTITLE = document.getElementById('feedSubtitle');
const BREADCRUMB_CURRENT = document.getElementById('breadCrumbCurrent');

// New Controls
const TABS_CONTAINER = document.getElementById('categoryTabs');
const SEARCH_INPUT = document.getElementById('localSearch');
const SORT_SELECT = document.getElementById('sortBy');

// State Variables
let allItems = [];      // Raw data from JSON
let filteredItems = []; // Data specific to current Type (e.g. all Videos)
let currentType = '';   
let activeCategory = 'All';

document.addEventListener('DOMContentLoaded', initFeed);

async function initFeed() {
    try {
        // 1. Get URL Parameters
        const params = new URLSearchParams(window.location.search);
        currentType = params.get('type'); // 'video', 'quiz', 'book', 'blog'

        if (!currentType) {
            window.location.href = 'index.html';
            return;
        }

        // 2. Set Page Headers
        updateHeaders(currentType);

        // 3. Fetch Data
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error("Failed to load data");
        const data = await response.json();

        // 4. Initial Filter by TYPE (Crucial)
        filteredItems = data.filter(item => item.type === currentType);
        
        // Save initial state for local filtering
        allItems = [...filteredItems];

        if (filteredItems.length === 0) {
            showEmptyState(true);
            return;
        }

        // 5. Setup UI Components
        renderCategoryTabs();
        setupEventListeners();

        // 6. Initial Render
        applyFilters();

    } catch (error) {
        console.error("Feed Error:", error);
        GRID_CONTAINER.innerHTML = `<div style="text-align:center; padding:20px; color:red;">⚠️ Error loading content.</div>`;
    }
}

// --- 1. UI SETUP & HEADERS ---

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

    // Extract unique categories dynamically
    const categories = ['All', ...new Set(filteredItems.map(item => item.category))];

    TABS_CONTAINER.innerHTML = categories.map(cat => `
        <button class="tab-btn ${cat === 'All' ? 'active' : ''}" 
                onclick="handleCategoryClick('${cat}', this)">
            ${cat}
        </button>
    `).join('');
}

function setupEventListeners() {
    // Local Search Listener
    if (SEARCH_INPUT) {
        SEARCH_INPUT.addEventListener('input', () => applyFilters());
    }
    // Sort Listener
    if (SORT_SELECT) {
        SORT_SELECT.addEventListener('change', () => applyFilters());
    }
}

// --- 2. CORE FILTERING ENGINE ---

window.handleCategoryClick = (category, btn) => {
    activeCategory = category;

    // Update UI
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    applyFilters();
};

function applyFilters() {
    let results = [...allItems]; // Start with all items of current type

    // A. Category Filter
    if (activeCategory !== 'All') {
        results = results.filter(item => item.category === activeCategory);
    }

    // B. Search Text Filter
    const searchTerm = SEARCH_INPUT ? SEARCH_INPUT.value.toLowerCase().trim() : '';
    if (searchTerm) {
        results = results.filter(item => 
            item.title.toLowerCase().includes(searchTerm) || 
            (item.tags && item.tags.some(t => t.toLowerCase().includes(searchTerm)))
        );
    }

    // C. Sorting
    const sortMode = SORT_SELECT ? SORT_SELECT.value : 'newest';
    if (sortMode === 'newest') {
        // Assuming higher ID/Index is newer, or you can add a date field later
        results.reverse(); 
    } else if (sortMode === 'oldest') {
        // Default order
    } else if (sortMode === 'az') {
        results.sort((a, b) => a.title.localeCompare(b.title));
    }

    // D. Render
    renderGrid(results);
}

// --- 3. RENDER LOGIC ---

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

function createFeedCard(item) {
    // --- LINKING LOGIC (Updated for Books/Articles) ---
    let targetPage = 'view.html'; // Default
    
    if (item.type === 'quiz') {
        targetPage = 'quiz-view.html';
    } 
    else if (item.type === 'blog' || item.type === 'article' || item.type === 'book') {
        targetPage = 'article-view.html'; // New Reader Page
    }

    const link = `${targetPage}?id=${item.id}&type=${item.type}`;

    // --- VISUAL CONFIG ---
    let config = { icon: '📄', btn: 'View', cls: 'btn-outline', col: '#607d8b' };
    
    if (item.type === 'quiz') config = { icon: '⏱️', btn: 'Start Test', cls: 'btn-quiz', col: '#1A237E' };
    if (item.type === 'video') config = { icon: '▶️', btn: 'Watch', cls: 'btn-video', col: '#c0392b' };
    if (item.type === 'pdf') config = { icon: '⬇️', btn: 'Download', cls: 'btn-pdf', col: '#27ae60' };
    if (item.type === 'blog') config = { icon: '📰', btn: 'Read', cls: 'btn-blog', col: '#e67e22' };
    if (item.type === 'book') config = { icon: '📚', btn: 'Read Book', cls: 'btn-blog', col: '#8e44ad' };

    return `
        <article class="content-card">
            <div class="card-thumbnail-wrapper">
                <span class="card-badge" style="background:${config.col}">${item.category}</span>
                <img src="${item.thumbnail}" class="card-img" loading="lazy" 
                     onerror="this.src='assets/default-thumb.jpg'">
            </div>
            <div class="card-body">
                <div class="card-meta"><span>${config.icon} ${item.type.toUpperCase()}</span></div>
                <h3 class="card-title"><a href="${link}">${item.title}</a></h3>
                <div class="card-tags">
                    ${item.tags ? item.tags.slice(0,3).map(t=>`#${t}`).join(' ') : ''}
                </div>
                <a href="${link}" class="card-btn ${config.cls}">${config.btn}</a>
            </div>
        </article>
    `;
}
