/**
 * Project: MeritBoard Reader
 * File: js/book-core.js
 * Feature: Multi-Level Structure (Category > Subject > Chapter > Page)
 */

// --- STATE ---
let bookData = null;
let flatList = []; // Stores the linear sequence of all pages
let currentIndex = 0; // Current position in flatList

// --- DOM ELEMENTS ---
const ELEMENTS = {
    content: document.getElementById('pageContent'),
    floatingHeader: document.getElementById('chapterHeader'),
    topTitle: document.getElementById('topBarTitle'),
    sidebarList: document.getElementById('chapterList'),
    pellets: document.getElementById('chapterPellets'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    sidebar: document.getElementById('chapterSidebar'),
    overlay: document.getElementById('sidebarOverlay')
};

document.addEventListener('DOMContentLoaded', initReader);

async function initReader() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id') || 'book-01'; // Default for testing

    try {
        const response = await fetch(`./data/books/${id}.json`);
        if (!response.ok) throw new Error("Book file not found.");
        
        bookData = await response.json();
        
        // 1. Set Title
        document.title = `${bookData.title} | ${bookData.subject}`;
        if(ELEMENTS.topTitle) ELEMENTS.topTitle.innerText = bookData.title;

        // 2. GENERATE FLAT LIST (The Core Logic)
        // We convert the hierarchy into a simple list of slides
        generateFlatList();

        // 3. Render
        renderSidebar();
        loadView(0); // Start at index 0 (Book Info)
        setupControls();
        setupGestures();

    } catch (err) {
        showError(err.message);
    }
}

// --- FLATTENER LOGIC ---
function generateFlatList() {
    flatList = [];

    // 1. Add Info Page
    flatList.push({ type: 'info', title: 'Book Info' });

    // 2. Add Preface
    flatList.push({ type: 'preface', title: 'Preface' });

    // 3. Add All Pages from All Chapters
    bookData.chapters.forEach((chap, cIdx) => {
        chap.pages.forEach((page, pIdx) => {
            flatList.push({
                type: 'page',
                chapterTitle: chap.title,
                pageNo: page.page_no,
                totalPages: chap.pages.length,
                content: page.content,
                chapterIndex: cIdx // For Sidebar Highlighting
            });
        });
    });
}

// --- CONTENT RENDERER ---
function loadView(index) {
    if (index < 0 || index >= flatList.length) return;
    
    currentIndex = index;
    const view = flatList[index];
    let html = '';
    let headerHtml = '';

    window.scrollTo({ top: 0, behavior: 'auto' });

    // RENDER BASED ON TYPE
    if (view.type === 'info') {
        headerHtml = `<span style="color:#d84315">CATEGORY: ${bookData.category}</span>`;
        html = `
            <div class="book-info-layout">
                <img src="${bookData.cover}" class="cover" alt="Cover" onerror="this.src='assets/default-thumb.jpg'">
                <h1>${bookData.title}</h1>
                <div class="book-meta-table">
                    <div><span class="label">Subject</span> <span>${bookData.subject}</span></div>
                    <div><span class="label">Category</span> <span>${bookData.category}</span></div>
                    <div><span class="label">Author</span> <span>${bookData.author}</span></div>
                    <div><span class="label">Total Chapters</span> <span>${bookData.chapters.length}</span></div>
                </div>
                <div style="margin-top:20px; text-align:left;">${bookData.info}</div>
            </div>`;
    } 
    else if (view.type === 'preface') {
        headerHtml = "BHUMIKA / PREFACE";
        html = `<h2>Introduction</h2>${bookData.preface}`;
    } 
    else if (view.type === 'page') {
        // Show Chapter Title AND Page Number
        headerHtml = `
            <span style="display:block; color:#333;">${view.chapterTitle}</span>
            <span style="font-size:0.7rem; color:#888;">Page ${view.pageNo} of ${view.totalPages}</span>
        `;
        html = view.content;
    }

    // UPDATE DOM
    ELEMENTS.content.innerHTML = html;
    if(ELEMENTS.floatingHeader) ELEMENTS.floatingHeader.innerHTML = headerHtml;

    updateUI(view);
}

function updateUI(currentView) {
    // 1. Buttons
    ELEMENTS.prevBtn.disabled = (currentIndex === 0);
    const isLast = (currentIndex === flatList.length - 1);
    ELEMENTS.nextBtn.disabled = isLast;
    ELEMENTS.nextBtn.innerHTML = isLast ? "<span>Finished ✅</span>" : "<span>Next →</span>";

    // 2. Sidebar Highlighting
    // Reset all
    document.querySelectorAll('.chapter-nav-list button').forEach(b => b.classList.remove('active'));
    
    // Find active sidebar item
    let activeId = '';
    if (currentView.type === 'info') activeId = 'nav-info';
    else if (currentView.type === 'preface') activeId = 'nav-preface';
    else if (currentView.type === 'page') activeId = `nav-chap-${currentView.chapterIndex}`;

    const activeEl = document.getElementById(activeId);
    if (activeEl) {
        activeEl.classList.add('active');
        activeEl.scrollIntoView({ block: 'nearest' });
    }

    // 3. Pellets (Only show for current Chapter pages if in chapter mode)
    renderPellets(currentView);
}

// --- NAVIGATION ---
function renderSidebar() {
    let html = `
        <li><button id="nav-info" onclick="jumpToType('info')">ℹ️ Book Info</button></li>
        <li><button id="nav-preface" onclick="jumpToType('preface')">📝 Bhumika</button></li>
        <hr style="margin:5px 0; border:0; border-top:1px solid #eee;">
    `;

    bookData.chapters.forEach((chap, idx) => {
        html += `<li>
            <button id="nav-chap-${idx}" onclick="jumpToChapter(${idx})">
                <span style="font-size:0.8rem; color:#888;">${idx+1}.</span> ${chap.title}
            </button>
        </li>`;
    });
    ELEMENTS.sidebarList.innerHTML = html;
}

// Helper to find index in flatList
function jumpToType(type) {
    const idx = flatList.findIndex(item => item.type === type);
    if(idx !== -1) loadView(idx);
    toggleSidebar(false);
}

function jumpToChapter(chapIdx) {
    // Find first page of this chapter
    const idx = flatList.findIndex(item => item.type === 'page' && item.chapterIndex === chapIdx);
    if(idx !== -1) loadView(idx);
    toggleSidebar(false);
}

// Show pellets only for the current chapter's pages
function renderPellets(view) {
    if (!ELEMENTS.pellets) return;
    
    if (view.type !== 'page') {
        ELEMENTS.pellets.innerHTML = ''; // Hide dots on Info/Preface
        return;
    }

    // Generate dots for total pages in THIS chapter
    let html = '';
    for (let i = 1; i <= view.totalPages; i++) {
        const isActive = (i === view.pageNo) ? 'active' : '';
        // Note: This only switches pages within current chapter visually
        // Actual navigation is linear
        html += `<div class="pellet ${isActive}"></div>`;
    }
    ELEMENTS.pellets.innerHTML = html;
}

// --- CONTROLS ---
function setupControls() {
    ELEMENTS.prevBtn.onclick = () => loadView(currentIndex - 1);
    ELEMENTS.nextBtn.onclick = () => loadView(currentIndex + 1);
    
    document.getElementById('toggleIndexBtn').onclick = () => toggleSidebar(true);
    document.getElementById('closeSidebar').onclick = () => toggleSidebar(false);
    if(ELEMENTS.overlay) ELEMENTS.overlay.onclick = () => toggleSidebar(false);
}

function toggleSidebar(open) {
    if(open) {
        ELEMENTS.sidebar.classList.add('open');
        if(ELEMENTS.overlay) ELEMENTS.overlay.classList.add('active');
    } else {
        ELEMENTS.sidebar.classList.remove('open');
        if(ELEMENTS.overlay) ELEMENTS.overlay.classList.remove('active');
    }
}

// --- SWIPE ---
function setupGestures() {
    const area = document.getElementById('readingArea');
    let startX = 0;
    area.addEventListener('touchstart', e => startX = e.changedTouches[0].screenX, {passive: true});
    area.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].screenX;
        if (startX - endX > 50) loadView(currentIndex + 1); // Left Swipe (Next)
        if (endX - startX > 50) loadView(currentIndex - 1); // Right Swipe (Prev)
    }, {passive: true});
}

function showError(msg) {
    ELEMENTS.content.innerHTML = `<p style="text-align:center; padding:30px; color:red;">${msg}</p>`;
}
