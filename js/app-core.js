/**
 * Project: MeritBoard Universal
 * File: js/app-core.js
 * Status: FIXED (Mobile Menu & Search Logic Enabled)
 */

const AppConfig = {
    dataPath: './data/config.json',
    state: {
        darkMode: localStorage.getItem('theme') === 'dark'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Buttons ko turant activate karein
    setupMobileInteractions();
    
    // 2. Phir baaki app load karein
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

// --- CORE FUNCTIONS ---

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
    if (!settings.enable_dark_mode) return;
    const body = document.body;
    const btn = document.getElementById('themeToggle');
    
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

// --- MOBILE INTERACTION LOGIC (Sabse Important) ---
function setupMobileInteractions() {
    console.log("Mobile Engine Started..."); // Debugging ke liye

    // 1. Mobile Menu Toggle
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

    // 2. Search Overlay Toggle
    const searchBtn = document.getElementById('searchTrigger');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('globalSearchInput');

    if (searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active'); // Show
            if(searchInput) searchInput.focus();
        });
    }

    if (closeSearch && searchOverlay) {
        closeSearch.addEventListener('click', () => {
            searchOverlay.classList.remove('active'); // Hide
        });
    }
}
