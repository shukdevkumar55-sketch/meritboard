/**
 * Project: MeritBoard Universal
 * File: js/app-core.js
 * Status: FINAL COMPLETE (With Fail-Safe Search & Mobile Fixes)
 */

const AppConfig = {
    dataPath: './data/config.json',
    contentPath: './data/content.json', // Search data source
    state: {
        darkMode: localStorage.getItem('theme') === 'dark'
    }
};

// Search Data Cache
let searchData = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Activate Mobile Menu
    setupMobileInteractions();
    
    // 2. Activate Search System
    initSearchSystem();
    
    // 3. Load Main App Config
    initApp();
});

async function initApp() {
    try {
        const response = await fetch(AppConfig.dataPath);
        if (!response.ok) throw new Error('Config load failed');
        const config = await response.json();

        setupIdentity(config.site_identity);
        renderNavigation(config.navigation_menu);
        renderFooter(config.footer_sections, config.site_identity);
        setupTheme(config.ui_settings);

    } catch (error) {
        console.error("Initialization Error:", error);
    }
}

// --- 1. IDENTITY & NAVIGATION ---

function setupIdentity(identity) {
    document.title = `${identity.site_name} | ${identity.tagline}`;
    const logoContainer = document.getElementById('brandLogo');
    if (logoContainer) {
        logoContainer.innerHTML = `
            <a href="index.html" class="logo-link">
                <span class="logo-text">Merit<span>Board</span></span>
            </a>
        `;
    }
}

function renderNavigation(menuItems) {
    const navContainer = document.getElementById('mainNav');
    if (!navContainer) return;
    navContainer.innerHTML = menuItems.map(item => `
        <a href="${item.link}" class="nav-item">${item.label}</a>
    `).join('');
}

function renderFooter(footerData, identity) {
    const footerContainer = document.getElementById('dynamicFooter');
    if (!footerContainer) return;
    const socialHTML = footerData.social_links.map(social => `
        <a href="${social.url}" class="social-icon">🔗</a>
    `).join('');
    footerContainer.innerHTML = `
        <div class="footer-content container">
            <div class="footer-about">
                <h3>${identity.site_name}</h3>
                <p>${footerData.about_text}</p>
            </div>
            <div class="footer-social">${socialHTML}</div>
            <div class="footer-copyright">&copy; ${new Date().getFullYear()} ${identity.site_name}</div>
        </div>
    `;
}

function setupTheme(settings) {
    if (!settings || !settings.enable_dark_mode) return;
    const body = document.body;
    const btn = document.getElementById('themeToggle');
    
    // Apply saved state
    if (AppConfig.state.darkMode) body.classList.add('dark-mode');
    
    if (btn) {
        btn.innerHTML = AppConfig.state.darkMode ? '☀️' : '🌙';
        btn.onclick = () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            btn.innerHTML = isDark ? '☀️' : '🌙';
        };
    }
}

// --- 2. MOBILE MENU INTERACTION ---
function setupMobileInteractions() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mainNav');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            
            // Icon Toggle (Hamburger <-> Cross)
            const isOpen = nav.classList.contains('active');
            menuBtn.innerHTML = isOpen 
                ? '<span style="font-size:1.5rem;">✕</span>' 
                : '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        });
    }
}

// --- 3. ADVANCED SEARCH SYSTEM (Robust Version) ---
async function initSearchSystem() {
    const searchInput = document.getElementById('headerSearchInput');
    const resultsBox = document.getElementById('liveSearchResults');
    const clearBtn = document.getElementById('clearSearch');
    const inputBox = document.querySelector('.search-input-box');

    // Verification
    if (!searchInput || !resultsBox || !inputBox) {
        console.warn("Search elements missing.");
        return;
    }

    // A. Load Data (With Fallback)
    try {
        const res = await fetch(AppConfig.contentPath);
        if (res.ok) {
            searchData = await res.json();
            console.log("✅ Search loaded via JSON");
        } else {
            throw new Error("JSON Fetch Failed");
        }
    } catch (err) {
        console.warn("⚠️ Using Fallback Search Data (JSON missing/error)");
        // Fallback Data ensures search ALWAYS works for demo
        searchData = [
            { id: 'book-01', type: 'book', title: 'Ancient History of India', category: 'History', thumbnail: 'assets/default-thumb.jpg' },
            { id: 'note-01', type: 'pdf', title: 'SSC Math Formulas', category: 'Maths', thumbnail: 'assets/default-thumb.jpg' },
            { id: 'test-quiz', type: 'quiz', title: 'GK Speed Test', category: 'General Knowledge', thumbnail: 'assets/default-thumb.jpg' },
            { id: 'vid-01', type: 'video', title: 'English Strategy 2026', category: 'Strategy', thumbnail: 'assets/default-thumb.jpg' }
        ];
    }

    // B. Mobile Click Fix (Important)
    inputBox.addEventListener('click', (e) => {
        // Only trigger if NOT clicking the clear button
        if (e.target !== clearBtn && !clearBtn.contains(e.target)) {
            inputBox.classList.add('focused');
            searchInput.style.display = 'block'; 
            searchInput.focus();
        }
    });

    // C. Typing Logic
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length > 0) {
            clearBtn.classList.add('active');
            resultsBox.classList.add('active');
            performSearch(query, resultsBox);
        } else {
            clearBtn.classList.remove('active');
            resultsBox.classList.remove('active');
        }
    });

    // D. Focus & Blur Logic
    searchInput.addEventListener('focus', () => {
        inputBox.classList.add('focused');
        if (searchInput.value.length > 0) resultsBox.classList.add('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!inputBox.contains(e.target) && !resultsBox.contains(e.target)) {
            resultsBox.classList.remove('active');
            inputBox.classList.remove('focused');
            
            // Mobile par wapas input chupayein
            if (window.innerWidth <= 1024) searchInput.style.display = 'none';
        }
    });

    // E. Clear Button
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchInput.value = '';
            resultsBox.classList.remove('active');
            clearBtn.classList.remove('active');
            searchInput.focus();
        });
    }
}

function performSearch(query, container) {
    if (!searchData.length) return;

    // Filter Logic: Title OR Category OR Tags
    const matches = searchData.filter(item => {
        const inTitle = item.title.toLowerCase().includes(query);
        const inCat = item.category ? item.category.toLowerCase().includes(query) : false;
        
        // Tag check (safeguard if tags are missing)
        const inTags = item.tags ? item.tags.some(tag => tag.toLowerCase().includes(query)) : false;
        
        return inTitle || inCat || inTags;
    });

    // No Results Found State
    if (matches.length === 0) {
        container.innerHTML = `<div class="search-status">No results found for "<b>${query}</b>"</div>`;
        return;
    }

    // Limit Results
    const topResults = matches.slice(0, 6);
    
    // Generate HTML
    const html = topResults.map(item => {
        // Smart Link Generator
        let link = '#';
        if (item.type === 'quiz') link = `quiz-view.html?id=${item.id}`;
        else if (item.type === 'book' || item.type === 'pdf') link = `book-view.html?id=${item.id}&type=${item.type}`;
        else link = `article-view.html?id=${item.id}`;

        const typeClass = item.type || 'general';

        return `
            <a href="${link}" class="search-item">
                <img src="${item.thumbnail}" class="s-thumb" onerror="this.src='assets/default-thumb.jpg'">
                <div class="s-info">
                    <div class="s-title">${highlightMatch(item.title, query)}</div>
                    <div class="s-meta">
                        <span class="badge ${typeClass}">${typeClass.toUpperCase()}</span>
                        <span>• ${item.category || 'General'}</span>
                    </div>
                </div>
            </a>
        `;
    }).join('');

    // "View All" Link (if many results)
    let footer = '';
    if (matches.length > 6) {
        footer = `<a href="feed.html?q=${query}" class="search-item" style="justify-content:center; color:var(--primary-color); font-weight:600;">
                    See all ${matches.length} results →
                  </a>`;
    }

    container.innerHTML = html + footer;
}

// Helper: Highlight Search Text
function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span style="color:#d84315; background:#fff3e0;">$1</span>');
}
