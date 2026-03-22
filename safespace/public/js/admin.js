let adminPass = localStorage.getItem('ss_admin_pass') || '';

if (adminPass) {
    showDashboard();
}

// ── Login ───────────────────────────────────────────
document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('admin-pass').value;
    // We just store it and try an API call. If it works, we're logged in.
    adminPass = pass;
    verifyAndLoad();
});

async function verifyAndLoad() {
    try {
        await api.adminGetReported(adminPass);
        localStorage.setItem('ss_admin_pass', adminPass);
        showDashboard();
        loadReports();
    } catch (err) {
        alert('Incorrect password or server error.');
        localStorage.removeItem('ss_admin_pass');
    }
}

function showDashboard() {
    document.getElementById('admin-login-overlay').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
    loadReports();
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('ss_admin_pass');
    window.location.reload();
});

// ── Tabs ───────────────────────────────────────────
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

        tab.classList.add('active');
        const target = tab.dataset.tab;
        document.getElementById(`tab-${target}`).style.display = 'block';

        if (target === 'reports') loadReports();
        if (target === 'feedbacks') loadFeedbacks();
    });
});

// ── Data Loading ───────────────────────────────────
async function loadReports() {
    const list = document.getElementById('reports-list');
    list.innerHTML = '<div class="loading"><div class="spinner"></div>Loading reports...</div>';

    try {
        const { stories, messages } = await api.adminGetReported(adminPass);

        let html = '<h3>Reported Stories</h3>';
        if (stories.length === 0) html += '<p class="text-muted">No reported stories.</p>';
        stories.forEach(s => {
            html += `
        <div class="admin-item-card">
          <div class="admin-item-content">
            <div class="admin-item-meta">Story ID: ${s.id} | Author: ${s.username || 'Anon'} | Posted: ${timeAgo(s.created_at)}</div>
            <div style="font-weight:700;">${escHtml(s.title)}</div>
            <p style="font-size:0.9rem;">${escHtml(s.content)}</p>
          </div>
          <div class="admin-item-actions">
            <button class="btn btn-danger btn-sm" onclick="deleteStory(${s.id})">Delete Story</button>
          </div>
        </div>`;
        });

        html += '<h3 class="mt-8">Reported Messages</h3>';
        if (messages.length === 0) html += '<p class="text-muted">No reported messages.</p>';
        messages.forEach(m => {
            html += `
        <div class="admin-item-card">
          <div class="admin-item-content">
            <div class="admin-item-meta">Msg ID: ${m.id} | Story ID: ${m.story_id} | Posted: ${timeAgo(m.created_at)}</div>
            <p style="font-size:0.9rem;">${escHtml(m.message)}</p>
          </div>
          <div class="admin-item-actions">
            <button class="btn btn-danger btn-sm" onclick="deleteMessage(${m.id})">Delete Msg</button>
          </div>
        </div>`;
        });

        list.innerHTML = html;
    } catch (err) {
        list.innerHTML = '<p class="text-danger">Failed to load reports.</p>';
    }
}

async function loadFeedbacks() {
    const list = document.getElementById('feedbacks-list');
    list.innerHTML = '<div class="loading"><div class="spinner"></div>Loading feedback...</div>';

    try {
        const feedbacks = await api.adminGetFeedbacks(adminPass);
        let html = '';
        if (feedbacks.length === 0) html = '<p class="text-muted">No feedback yet.</p>';
        feedbacks.forEach(f => {
            const rating = ['😞', '😐', '🙂', '😊', '😍', '😡', '🥺', '🫣', '💩'][f.rating - 1] || 'None';
            html += `
        <div class="admin-item-card">
          <div class="admin-item-content">
            <div class="admin-item-meta">Feedback ID: ${f.id} | Rating: ${rating} | Date: ${timeAgo(f.created_at)}</div>
            <p>${escHtml(f.content)}</p>
          </div>
        </div>`;
        });
        list.innerHTML = html;
    } catch (err) {
        list.innerHTML = '<p class="text-danger">Failed to load feedbacks.</p>';
    }
}

// ── Actions ───────────────────────────────────────────
window.deleteStory = async (id) => {
    if (!confirm('Delete this story and all its messages?')) return;
    try {
        await api.adminDeleteStory(id, adminPass);
        showToast('Story deleted.');
        loadReports();
    } catch (err) { alert('Failed to delete.'); }
};

window.deleteMessage = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
        await api.adminDeleteMessage(id, adminPass);
        showToast('Message deleted.');
        loadReports();
    } catch (err) { alert('Failed to delete.'); }
};
