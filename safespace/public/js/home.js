// Home page – load featured stories + stats
async function loadHome() {
    try {
        const stories = await api.getStories('latest');

        // Update stats
        document.getElementById('stat-stories').textContent = stories.length;
        // Estimate messages (we don't have a global count endpoint, show stories-based metric)
        document.getElementById('stat-messages').textContent = stories.reduce((acc, s) => acc + (s.likes || 0), 0) + '+';

        const container = document.getElementById('featured-stories');
        const featured = stories.slice(0, 3);

        if (featured.length === 0) {
            container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="icon">🌱</div>
          <h3>Be the first to share</h3>
          <p>No stories yet. Your story could be the spark that helps someone feel less alone.</p>
          <a href="/share.html" class="btn btn-primary">Share Your Story</a>
        </div>`;
            return;
        }

        container.innerHTML = featured.map(buildStoryCard).join('');
    } catch (err) {
        document.getElementById('featured-stories').innerHTML = `
      <p class="text-muted text-center" style="grid-column:1/-1">Could not load stories. Make sure the server is running.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadHome);
