// Stories list page logic
let currentSort = 'latest';
let likedStories = JSON.parse(localStorage.getItem('ss_liked') || '[]');

async function loadStories(sort = 'latest') {
    const container = document.getElementById('stories-grid');
    const countEl = document.getElementById('story-count');
    container.className = 'feed-container';
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading feed…</div>';

    try {
        const stories = await api.getStories(sort);
        const count = stories.length;
        countEl.textContent = count === 0 ? 'No stories yet' : `${count} ${count === 1 ? 'story' : 'stories'} shared`;

        if (count === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🌱</div>
          <h3>No stories yet</h3>
          <p>Be the first to share your story. Someone out there needs to read it.</p>
          <a href="/share.html" class="btn btn-primary">Share Your Story</a>
        </div>`;
            return;
        }

        container.innerHTML = stories.map(buildStoryCard).join('');
    } catch (err) {
        container.innerHTML = `<p class="text-muted text-center">Could not load feed. Please make sure the server is running.</p>`;
    }
}

window.handleFeedLike = async (id) => {
    if (likedStories.includes(String(id))) return;
    const btn = document.getElementById(`like-btn-${id}`);
    const countEl = document.getElementById(`like-count-${id}`);

    try {
        const result = await api.likeStory(id);
        likedStories.push(String(id));
        localStorage.setItem('ss_liked', JSON.stringify(likedStories));
        btn.classList.add('liked');
        btn.innerHTML = '❤️';
        countEl.textContent = result.likes;
        showToast('💙 Thank you for showing support!');
    } catch (err) {
        showToast('Could not register heart.', 'error');
    }
};

window.openReportModal = (id) => {
    if (confirm('Are you sure you want to report this story?')) {
        api.reportStory(id).then(() => {
            showToast('Story reported. Thank you.', 'success');
            document.getElementById(`story-${id}`).style.opacity = '0.5';
        });
    }
};

// Sort buttons
document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSort = btn.dataset.sort;
        loadStories(currentSort);
    });
});

document.addEventListener('DOMContentLoaded', () => loadStories('latest'));
