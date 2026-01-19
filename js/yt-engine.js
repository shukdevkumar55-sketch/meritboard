/**
 * Project: MeritBoard
 * File: js/yt-engine.js
 * Description: Bug-Free YouTube Engine
 */

// ⚠️ YOUR API KEY HERE
const API_KEY = 'AIzaSyCvhMk3z9NpGqrjOaZIjXdDa62YglbH0FI'; // <--- Paste New Key Here

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
let currentPlaylist = [];
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Default Search
    searchCourses('Competitive Exams Strategy Playlist');
});

// --- HELPER: Trigger Search on Button Click ---
function triggerSearch() {
    const query = document.getElementById('courseSearch').value;
    if(query.trim()) searchCourses(query + ' Full Playlist');
}

function handleEnter(e) {
    if(e.key === 'Enter') triggerSearch();
}

// --- HELPER: Smart Thumbnail Picker ---
function getThumbnail(thumbnails) {
    if(!thumbnails) return 'assets/default-thumb.jpg';
    // Priority: MaxRes -> High -> Medium
    if (thumbnails.maxres) return thumbnails.maxres.url;
    if (thumbnails.high) return thumbnails.high.url;
    return thumbnails.medium ? thumbnails.medium.url : (thumbnails.default?.url || '');
}

// 1. SEARCH LOGIC
async function searchCourses(query) {
    const grid = document.getElementById('courseGrid');
    grid.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i><br>Searching...</div>';

    try {
        const url = `${BASE_URL}/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=playlist&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if(data.error) throw new Error(data.error.message);
        if(!data.items || data.items.length === 0) {
            grid.innerHTML = '<div class="loading-state">No courses found.</div>';
            return;
        }

        renderGrid(data.items);
    } catch (err) {
        console.error(err);
        grid.innerHTML = `<div class="loading-state" style="color:red">Error: ${err.message}</div>`;
    }
}

function renderGrid(items) {
    const grid = document.getElementById('courseGrid');
    grid.innerHTML = '';

    items.forEach(item => {
        const info = item.snippet;
        const thumb = getThumbnail(info.thumbnails);

        const card = document.createElement('div');
        card.className = 'course-card';
        card.onclick = () => loadClassroom(item.id.playlistId, info.channelTitle);

        card.innerHTML = `
            <div class="thumb-box">
                <img src="${thumb}" class="thumb-img" loading="lazy">
                <div class="playlist-badge"><i class="fa-solid fa-play"></i> PLAYLIST</div>
            </div>
            <div class="course-info">
                <div class="course-title">${info.title}</div>
                <div class="course-author"><i class="fa-solid fa-user-pen"></i> ${info.channelTitle}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 2. CLASSROOM LOGIC
async function loadClassroom(playlistId, author) {
    document.getElementById('hubView').classList.add('hidden');
    document.getElementById('classroomView').classList.remove('hidden');
    document.getElementById('activeAuthor').innerText = author;
    
    // Stop Main Page Scroll
    document.body.style.overflow = 'hidden'; 

    const list = document.getElementById('videoList');
    list.innerHTML = '<div style="padding:20px; color:#aaa; text-align:center;">Loading Syllabus...</div>';

    try {
        const url = `${BASE_URL}/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if(data.error) throw new Error(data.error.message);

        // Filter private videos
        currentPlaylist = data.items.filter(i => i.snippet.title !== 'Private video');
        
        if(currentPlaylist.length === 0) throw new Error("No public videos in this course.");

        renderSidebar();
        playVideo(0);
    } catch (err) {
        alert(err.message);
        closeClassroom();
    }
}

function renderSidebar() {
    const list = document.getElementById('videoList');
    list.innerHTML = '';

    currentPlaylist.forEach((item, idx) => {
        const info = item.snippet;
        const thumb = info.thumbnails.medium?.url || info.thumbnails.default?.url;

        const div = document.createElement('div');
        div.className = `list-item ${idx === currentIndex ? 'playing' : ''}`;
        div.onclick = () => playVideo(idx);
        div.id = `vid-${idx}`;

        div.innerHTML = `
            <div class="li-thumb"><img src="${thumb}" loading="lazy"></div>
            <div class="li-details">
                <div class="li-title">${info.title}</div>
            </div>
        `;
        list.appendChild(div);
    });
}

function playVideo(idx) {
    if(idx < 0 || idx >= currentPlaylist.length) return;
    currentIndex = idx;
    
    const vid = currentPlaylist[idx].snippet;
    const player = document.getElementById('mainPlayer');
    player.src = `https://www.youtube.com/embed/${vid.resourceId.videoId}?autoplay=1&rel=0&modestbranding=1&color=white`;
    
    document.getElementById('activeTitle').innerText = vid.title;
    
    // Update Sidebar UI
    document.querySelectorAll('.list-item').forEach(el => el.classList.remove('playing'));
    const activeItem = document.getElementById(`vid-${idx}`);
    if(activeItem) {
        activeItem.classList.add('playing');
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function closeClassroom() {
    document.getElementById('mainPlayer').src = '';
    document.getElementById('classroomView').classList.add('hidden');
    document.getElementById('hubView').classList.remove('hidden');
    document.body.style.overflow = 'auto'; // Restore Scroll
}
