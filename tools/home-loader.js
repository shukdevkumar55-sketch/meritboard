/**
 * MeritBoard Tools Home Loader - Final Version
 * Logic: Fetch index -> Map folders -> Build paths -> Render cards
 */

document.addEventListener("DOMContentLoaded", () => {
    initDynamicLoader();
});

async function initDynamicLoader() {
    const mainBody = document.getElementById("dynamic-tools-body");
    const indexPath = "/tools/tools-index.json";

    if (!mainBody) return;
    mainBody.innerHTML = ''; // Skeleton clear karein

    try {
        const indexResponse = await fetch(indexPath);
        if (!indexResponse.ok) throw new Error("tools-index.json nahi mili!");
        
        const indexData = await indexResponse.json();

        for (const cat of indexData.categories) {
            // Section banayein
            const gridElement = createCategorySection(cat, mainBody);

            for (const folder of cat.toolsFolders) {
                // IMPORTANT: Yahan humne file name logic ko simple rakha hai
                // bmi-calculator folder ke andar bmi.json honi chahiye.
                const fileName = folder.split('-')[0]; 
                const toolJsonPath = `/tools/data/${cat.categoryID}/${folder}/${fileName}.json`;

                console.log("Fetching tool from:", toolJsonPath); // Debugging ke liye
                fetchAndRenderCard(toolJsonPath, gridElement);
            }
        }
    } catch (error) {
        console.error("Framework Error:", error);
        mainBody.innerHTML = `<p style="text-align:center; padding:20px;">Error loading tools. Check console.</p>`;
    }
}

function createCategorySection(cat, container) {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.innerHTML = `
        <div class="category-header">
            <i class="fa-solid fa-layer-group category-icon"></i>
            <h2>${cat.categoryName}</h2>
        </div>
        <div class="tools-grid"></div>
    `;
    container.appendChild(section);
    return section.querySelector('.tools-grid');
}

async function fetchAndRenderCard(path, grid) {
    try {
        const res = await fetch(path);
        if (!res.ok) {
            console.error(`File NOT found: ${path}`); // Batayega kaunsi file miss hai
            return;
        }
        
        const data = await res.json();
        const htmlLink = path.replace('.json', '.html');

        const card = document.createElement('a');
        card.href = htmlLink;
        card.className = 'tool-card';
        card.innerHTML = `
            <div class="tool-icon-box">
                <i class="${data.icon}"></i>
            </div>
            <div class="tool-info">
                <h3>${data.title}</h3>
                <p>${data.description}</p>
            </div>
            <div class="card-arrow" style="margin-left: auto; opacity: 0.3;">
                <i class="fa-solid fa-chevron-right"></i>
            </div>
        `;
        grid.appendChild(card);
        console.log(`Success: Card loaded for ${data.title}`);
    } catch (e) {
        console.error("Card rendering failed:", e);
    }
}
