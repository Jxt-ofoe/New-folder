/**
 * SafeSpace – Shared API helpers
 */
const BASE = '';

async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
}

const api = {
    getStories: (sort = 'latest') => apiFetch(`/api/stories?sort=${sort}`),
    getStory: (id) => apiFetch(`/api/stories/${id}`),
    createStory: (payload) => apiFetch('/api/stories', { method: 'POST', body: payload }),
    likeStory: (id) => apiFetch(`/api/stories/${id}/like`, { method: 'POST' }),
    reportStory: (id) => apiFetch(`/api/stories/${id}/report`, { method: 'POST' }),
    addMessage: (storyId, message) => apiFetch(`/api/stories/${storyId}/messages`, { method: 'POST', body: { message } }),
    reportMsg: (msgId) => apiFetch(`/api/messages/${msgId}/report`, { method: 'POST' }),
    // New Admin and Feedback
    submitFeedback: (payload) => apiFetch('/api/feedback', { method: 'POST', body: payload }),
    adminGetReported: (pass) => apiFetch('/api/admin/reported', { headers: { 'Authorization': `Bearer ${pass}` } }),
    adminGetFeedbacks: (pass) => apiFetch('/api/admin/feedbacks', { headers: { 'Authorization': `Bearer ${pass}` } }),
    adminDeleteStory: (id, pass) => apiFetch(`/api/admin/stories/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${pass}` } }),
    adminDeleteMessage: (id, pass) => apiFetch(`/api/admin/messages/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${pass}` } }),
};

// ── Toast notifications ──────────────────────────────────
function showToast(msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ── Utility ──────────────────────────────────────────────
function timeAgo(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const sec = Math.floor((now - d) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitial(name) {
    return (name || 'A').charAt(0).toUpperCase();
}

function buildStoryCard(story) {
    const liked = (typeof likedStories !== 'undefined' ? likedStories : []).includes(String(story.id));
    const messages = (story.messages || []).slice(0, 3);

    return `
    <article class="feed-card" id="story-${story.id}">
      <div class="feed-card-header">
        <div class="author-avatar">${getInitial(story.displayName)}</div>
        <div>
          <div class="author-name">${escHtml(story.displayName)}</div>
          <div class="time">${timeAgo(story.created_at)}</div>
        </div>
      </div>
      
      <div class="feed-card-body" onclick="window.location='/story.html?id=${story.id}'" style="cursor:pointer">
        <h3 class="feed-story-title">${escHtml(story.title)}</h3>
        <p class="feed-story-content">${escHtml(story.content)}</p>
      </div>

      <div class="feed-card-footer">
        <div class="feed-actions">
          <button class="feed-action-btn ${liked ? 'liked' : ''}" onclick="event.stopPropagation(); if(window.handleFeedLike) window.handleFeedLike(${story.id})" id="like-btn-${story.id}">
            ${liked ? '❤️' : '🤍'}
          </button>
          <button class="feed-action-btn" onclick="window.location='/story.html?id=${story.id}'">
            💬
          </button>
          <button class="feed-action-btn" onclick="event.stopPropagation(); if(window.openReportModal) window.openReportModal(${story.id})">
            ⚑
          </button>
        </div>
        
        <div class="feed-likes-count"><span id="like-count-${story.id}">${story.likes || 0}</span> hearts</div>
        
        <div class="feed-comments-preview">
          ${messages.map(m => `
            <div class="feed-comment-item">
              <b>Supportive User:</b> ${escHtml(m.message)}
            </div>
          `).join('')}
          ${story.messages && story.messages.length > 0 ? `<a href="/story.html?id=${story.id}" class="feed-view-all">View full story and messages</a>` : '<div class="feed-view-all">No messages yet. Be the first!</div>'}
        </div>
      </div>
    </article>`;
}

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Nav active link
(function () {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        if ((path === '/' || path.endsWith('index.html')) && href === '/index.html') a.classList.add('active');
        else if (path.endsWith('stories.html') && href.includes('stories.html')) a.classList.add('active');
        else if (path.endsWith('share.html') && href.includes('share.html')) a.classList.add('active');
    });
    // mobile hamburger
    const ham = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (ham && navLinks) {
        ham.addEventListener('click', () => navLinks.classList.toggle('open'));
    }
})();
