(function() {
    const configUrl = '/data/ads-config.json'; // Apni file ka sahi path dein

    async function initAds() {
        try {
            const response = await fetch(configUrl);
            const data = await response.json();
            const width = window.innerWidth;
            
            // Device type detect karna
            let device = 'desktop';
            if (width < 600) device = 'mobile';
            else if (width < 1024) device = 'tablet';

            const containers = document.querySelectorAll('.dynamic-ad-slot');

            containers.forEach(container => {
                const id = container.getAttribute('data-ad-id');
                const ad = data.slots[id];
                if (!ad) return;

                const currentConfig = ad[device] || ad['desktop'];

                if (ad.type === 'adsense') {
                    renderAdsense(container, data.global_client, currentConfig);
                } else if (ad.type === 'sponsored') {
                    renderSponsored(container, currentConfig);
                }
            });
        } catch (err) {
            console.error("Ad System Error:", err);
        }
    }

    function renderAdsense(container, client, config) {
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.cssText = config.style || 'display:block';
        ins.setAttribute('data-ad-client', client);
        ins.setAttribute('data-ad-slot', config.slot);
        
        container.appendChild(ins);
        
        // AdSense ko trigger karna
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }

    function renderSponsored(container, config) {
        container.innerHTML = `
            <a href="${config.link}" target="_blank" rel="nofollow sponsored">
                <img src="${config.img}" alt="${config.alt}">
            </a>
        `;
    }

    // DOM load hone par run karein
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAds);
    } else {
        initAds();
    }
})();
