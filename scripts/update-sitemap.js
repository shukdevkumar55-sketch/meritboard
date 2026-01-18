const fs = require('fs');
const path = require('path');

// 1. अपनी वेबसाइट का URL यहाँ बदलें
const DOMAIN = 'https://meritboard.vercel.app';

// मेन फोल्डर का पता
const rootDir = path.join(__dirname, '..');
const sitemapPath = path.join(rootDir, 'sitemap.xml');

// 2. स्टैटिक पेज लिस्ट (इनमें बदलाव कम होता है)
const pages = [
  '',
  'index.html',
  'feed.html',
  'book-view.html',
  'quiz-view.html'
];

console.log("🔍 Scanning for new content...");

// XML का Header
let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// स्टैटिक पेज जोड़ना
pages.forEach(page => {
  xmlContent += `  <url><loc>${DOMAIN}/${page}</loc></url>\n`;
});

// 3. JSON फाइलों को स्कैन करना (AUTOMATION PART)
// मान लीजिये आपकी बुक्स 'data/books' में हैं
const booksDir = path.join(rootDir, 'data', 'books');

if (fs.existsSync(booksDir)) {
  const files = fs.readdirSync(booksDir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      // id = filename (बिना .json के)
      const id = file.replace('.json', '');
      console.log(`✅ Found Book: ${id}`);
      // नई लाइन Inject करना
      xmlContent += `  <url><loc>${DOMAIN}/book-view.html?id=${id}</loc><changefreq>weekly</changefreq></url>\n`;
    }
  });
}

// 4. Quizzes को स्कैन करना
const quizDir = path.join(rootDir, 'data', 'quizzes');

if (fs.existsSync(quizDir)) {
  const files = fs.readdirSync(quizDir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const id = file.replace('.json', '');
      console.log(`✅ Found Quiz: ${id}`);
      xmlContent += `  <url><loc>${DOMAIN}/quiz-view.html?id=${id}</loc><changefreq>weekly</changefreq></url>\n`;
    }
  });
}

// XML का Footer बंद करना
xmlContent += `</urlset>`;

// 5. पुरानी फाइल को हटाकर नई फाइल लिखना
fs.writeFileSync(sitemapPath, xmlContent);
console.log("🎉 Sitemap Updated Successfully!");