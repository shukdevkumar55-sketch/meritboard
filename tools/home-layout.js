/**
 * MeritBoard Tools Lab - Layout Engine v2.0
 * Features: Dynamic Header/Footer, Persistent Dark Mode, Mobile Nav Fix
 */

document.addEventListener("DOMContentLoaded", () => {
    // Path configuration - Absolute path use karein taaki sub-folders mein problem na ho
    const layoutConfigPath = "/tools/home-layout-config.json";

    fetch(layoutConfigPath)
        .then(response => {
            if (!response.ok) throw new Error("Layout configuration not found");
            return response.json();
        })
        .then(data => {
            renderHeader(data);
            renderFooter(data);
            initThemeLogic(data); // Dark mode initialization
            initMobileMenu();     // Mobile toggle initialization
        })
        .catch(err => console.error("MB-Layout Error:", err));
});

// --- 1. Header Rendering ---
function renderHeader(data) {
    const headerContainer = document.getElementById("dynamic-header-container");
    if (!headerContainer) return;

    const navItems = data.navigation_menu.map(item => `
        <a href="${item.link}" class="nav-item ${item.active ? 'active' : ''}" id="nav-${item.id}">
            ${item.label}
        </a>
    `).join('');

    headerContainer.innerHTML = `
        <header class="site-header">
            <div class="header-container container">
                <div class="brand-area">
                    <a href="/" class="logo-link">
                        <span class="logo-text">${data.site_identity.site_name}<span> Lab</span></span>
                    </a>
                </div>

                <nav id="mainNav" class="desktop-nav">
                    ${navItems}
                </nav>

                <div class="header-actions">
                    <button id="themeToggle" class="btn-icon" title="Toggle Theme">🌙</button>
                    <button id="mobileMenuBtn" class="btn-icon mobile-only" aria-label="Menu">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
            </div>
        </header>
    `;
}

// --- 2. Footer Rendering ---
function renderFooter(data) {
    const footerContainer = document.getElementById("dynamic-footer-container");
    if (!footerContainer) return;

    const socialIcons = data.footer_sections.social_links.map(s => `
        <a href="${s.url}" class="social-icon" target="_blank" rel="noopener">
            <i class="${s.icon_class}"></i>
        </a>
    `).join('');

    const quickLinks = data.footer_sections.quick_links.map(l => `
        <a href="${l.link}">${l.label}</a>
    `).join('');

    footerContainer.innerHTML = `
        <footer class="site-footer">
            <div class="container">
                <div class="footer-social-icons">
                    ${socialIcons}
                </div>
                <div class="footer-links-grid" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
                    ${quickLinks}
                </div>
                <p class="copyright" style="opacity: 0.7; font-size: 0.9rem;">
                    ${data.footer_sections.about_text}<br><br>
                    © 2026 ${data.site_identity.site_name}. All Rights Reserved.
                </p>
            </div>
        </footer>
    `;
}

// --- 3. Dark Mode Persistence Logic ---
function initThemeLogic(data) {
    const themeBtn = document.getElementById('themeToggle');
    const storageKey = data.ui_settings.theme_storage_key;
    
    // Check local storage for saved theme
    const savedTheme = localStorage.getItem(storageKey);
    
    const applyTheme = (isDark) => {
        if (isDark) {
            document.body.classList.add('dark-mode');
            themeBtn.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            themeBtn.textContent = '🌙';
        }
    };

    // Initial Apply
    if (savedTheme === 'dark') applyTheme(true);

    themeBtn.addEventListener('click', () => {
        const isNowDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem(storageKey, isNowDark ? 'dark' : 'light');
        themeBtn.textContent = isNowDark ? '☀️' : '🌙';
    });
}

// --- 4. Mobile Menu Logic (Sync with style.css) ---
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mainNav');
    
    if (mobileBtn && nav) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nav.classList.toggle('active'); // CSS class name is 'active' in your style.css
        });

        // Close menu if clicking outside
        document.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    }
}
