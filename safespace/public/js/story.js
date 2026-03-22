// Story Detail page logic
const urlParams = new URLSearchParams(window.location.search);
const storyId = urlParams.get('id');
let currentStory = null;
let likedStories = JSON.parse(localStorage.getItem('ss_liked') || '[]');

// ── Modal ──────────────────────────────────────────────────
const modal = document.getElementById('report-modal');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');
let reportAction = null;

function openModal(action) {
    reportAction = action;
    modal.classList.add('open');
    modalConfirm.focus();
}
function closeModal() {
    modal.classList.remove('open');
    reportAction = null;
}
modalCancel.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
modalConfirm.addEventListener('click', async () => {
    if (!reportAction) return;
    closeModal();
    try {
        await reportAction();
        showToast('Reported. Thank you for keeping SafeSpace safe.', 'success');
    } catch (_) {
        showToast('Could not submit report. Please try again.', 'error');
    }
});

// ── Render story ───────────────────────────────────────────
function renderStory(story) {
    currentStory = story;
    document.title = story.title + ' - SafeSpace';

    const liked = likedStories.includes(String(story.id));
    const area = document.getElementById('story-content-area');

    area.innerHTML =
        '<article class="story-detail-card" aria-label="Story">' +
        '<h1 class="story-title">' + escHtml(story.title) + '</h1>' +
        '<div class="story-meta-row">' +
        '<span class="story-meta-chip"><span class="author-avatar" style="width:28px;height:28px;font-size:0.75rem">' + getInitial(story.displayName) + '</span> ' + escHtml(story.displayName) + '</span>' +
        '<span class="story-meta-chip">&#128338; ' + timeAgo(story.created_at) + '</span>' +
        '<span class="story-meta-chip">&#10084;&#65039; <span id="like-count">' + story.likes + '</span> ' + (story.likes === 1 ? 'heart' : 'hearts') + '</span>' +
        '</div>' +
        '<div class="story-content">' + escHtml(story.content) + '</div>' +
        '<div class="story-actions">' +
        '<button class="like-btn ' + (liked ? 'liked' : '') + '" id="like-btn" aria-pressed="' + liked + '" aria-label="Heart this story">' +
        '<span class="heart">' + (liked ? '&#10084;&#65039;' : '&#129293;') + '</span>' +
        '<span id="like-label">' + (liked ? 'Hearted' : 'Heart This Story') + '</span></button>' +
        '<button class="btn btn-ghost btn-sm" id="report-story-btn" aria-label="Report this story">&#9873; Report</button>' +
        '</div></article>' +

        '<section class="messages-section" aria-label="Community messages">' +
        '<h2 class="messages-header">&#128172; Messages of Support <span id="msg-count" style="font-size:0.85rem;color:var(--clr-text-muted);font-family:var(--font-sans);font-weight:400"></span></h2>' +
        '<div class="message-form-card">' +
        '<p class="message-form-title">Send a message of encouragement &#128153;</p>' +
        '<div id="msg-error" class="form-error mb-4" role="alert"></div>' +
        '<form id="message-form" novalidate>' +
        '<div class="form-group">' +
        '<textarea id="msg-input" class="form-textarea" rows="3" maxlength="1000" placeholder="Write something kind and supportive..." aria-label="Your message of support"></textarea>' +
        '<div class="char-count" id="msg-count-chars">0 / 1000</div>' +
        '</div>' +
        '<div style="display:flex;justify-content:flex-end;margin-top:0.75rem">' +
        '<button type="submit" class="btn btn-primary btn-sm" id="msg-submit-btn">Send Message &#128153;</button>' +
        '</div></form></div>' +
        '<div id="messages-list" class="message-list" aria-live="polite"></div>' +
        '</section>';

    // Attach events after DOM is built
    document.getElementById('like-btn').addEventListener('click', handleLike);
    document.getElementById('report-story-btn').addEventListener('click', function () {
        openModal(function () { return api.reportStory(story.id); });
    });
    document.getElementById('msg-input').addEventListener('input', function () {
        var len = document.getElementById('msg-input').value.length;
        var el = document.getElementById('msg-count-chars');
        el.textContent = len + ' / 1000';
        el.className = 'char-count' + (len > 900 ? ' warn' : '') + (len >= 1000 ? ' over' : '');
    });
    document.getElementById('message-form').addEventListener('submit', handleMsgSubmit);
    renderMessages(story.messages || []);
}

// ── Render messages ────────────────────────────────────────
function renderMessages(messages) {
    var list = document.getElementById('messages-list');
    var countEl = document.getElementById('msg-count');
    if (countEl) countEl.textContent = '(' + messages.length + ')';

    if (messages.length === 0) {
        list.innerHTML =
            '<div class="empty-state">' +
            '<div class="icon">&#128172;</div>' +
            '<h3>No messages yet</h3>' +
            '<p>Be the first to send an encouraging word. It means more than you know.</p>' +
            '</div>';
        return;
    }

    list.innerHTML = messages.map(function (m) {
        return '<div class="message-bubble" data-msg-id="' + m.id + '">' +
            '<p class="message-text">' + escHtml(m.message) + '</p>' +
            '<div class="message-footer">' +
            '<span class="message-time">&#128338; ' + timeAgo(m.created_at) + '</span>' +
            '<button class="report-msg-btn" onclick="reportMessage(' + m.id + ')" aria-label="Report this message">&#9873; Report</button>' +
            '</div></div>';
    }).join('');
}

// ── Like handler ───────────────────────────────────────────
async function handleLike() {
    var btn = document.getElementById('like-btn');
    if (!btn || !currentStory) return;
    var alreadyLiked = likedStories.includes(String(currentStory.id));
    if (alreadyLiked) {
        showToast('You have already hearted this story! \u{1F499}', 'warning');
        return;
    }
    btn.disabled = true;
    try {
        var result = await api.likeStory(currentStory.id);
        likedStories.push(String(currentStory.id));
        localStorage.setItem('ss_liked', JSON.stringify(likedStories));
        currentStory.likes = result.likes;
        document.getElementById('like-count').textContent = result.likes;
        btn.classList.add('liked');
        btn.setAttribute('aria-pressed', 'true');
        btn.querySelector('.heart').textContent = '\u2764\uFE0F';
        document.getElementById('like-label').textContent = 'Hearted';
        showToast('\u{1F499} Thank you for showing support!');
    } catch (_) {
        showToast('Could not register heart. Try again.', 'error');
    }
    btn.disabled = false;
}

// ── Message submit ─────────────────────────────────────────
async function handleMsgSubmit(e) {
    e.preventDefault();
    var input = document.getElementById('msg-input');
    var errBox = document.getElementById('msg-error');
    var submitBtn = document.getElementById('msg-submit-btn');
    var msg = input.value.trim();

    errBox.classList.remove('visible');
    if (!msg) {
        errBox.textContent = 'Message cannot be empty.';
        errBox.classList.add('visible');
        return;
    }
    if (msg.length < 2) {
        errBox.textContent = 'Please write at least a few characters.';
        errBox.classList.add('visible');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    try {
        var newMsg = await api.addMessage(storyId, msg);
        input.value = '';
        document.getElementById('msg-count-chars').textContent = '0 / 1000';
        currentStory.messages = (currentStory.messages || []).concat([newMsg]);
        renderMessages(currentStory.messages);
        showToast('\u{1F499} Your message of support was sent!');
    } catch (err) {
        errBox.textContent = err.message || 'Could not send message.';
        errBox.classList.add('visible');
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message \u{1F499}';
}

// ── Report message (global fn for html onclick) ────────────
function reportMessage(msgId) {
    openModal(function () {
        return api.reportMsg(msgId).then(function () {
            var el = document.querySelector('[data-msg-id="' + msgId + '"]');
            if (el) { el.style.opacity = '0.4'; el.style.pointerEvents = 'none'; }
        });
    });
}

// ── Init ───────────────────────────────────────────────────
async function loadStory() {
    if (!storyId) {
        document.getElementById('story-content-area').innerHTML =
            '<div class="empty-state"><div class="icon">&#128269;</div><h3>Story Not Found</h3>' +
            '<p>This story does not exist or has been removed.</p>' +
            '<a href="/stories.html" class="btn btn-primary">Browse Stories</a></div>';
        return;
    }
    try {
        var story = await api.getStory(storyId);
        renderStory(story);
    } catch (_) {
        document.getElementById('story-content-area').innerHTML =
            '<div class="empty-state"><div class="icon">&#128148;</div><h3>Could Not Load Story</h3>' +
            '<p>This story may have been removed or the server is unavailable.</p>' +
            '<a href="/stories.html" class="btn btn-primary">Browse Stories</a></div>';
    }
}

document.addEventListener('DOMContentLoaded', loadStory);
