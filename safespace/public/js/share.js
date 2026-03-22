// Share Story page logic
const form = document.getElementById('story-form');
const titleInput = document.getElementById('story-title');
const contentInput = document.getElementById('story-content');
const titleCount = document.getElementById('title-count');
const contentCount = document.getElementById('content-count');
const anonToggle = document.getElementById('anon-toggle');
const toggleLabel = document.getElementById('toggle-label');
const usernameGroup = document.getElementById('username-group');
const usernameInput = document.getElementById('story-username');
const submitBtn = document.getElementById('submit-btn');
const submitText = document.getElementById('submit-text');
const submitSpinner = document.getElementById('submit-spinner');
const errorBox = document.getElementById('form-error');
const successBox = document.getElementById('form-success');

// Char counters
titleInput.addEventListener('input', () => {
    const len = titleInput.value.length;
    titleCount.textContent = `${len} / 200`;
    titleCount.className = 'char-count' + (len > 180 ? ' warn' : '') + (len >= 200 ? ' over' : '');
});

contentInput.addEventListener('input', () => {
    const len = contentInput.value.length;
    contentCount.textContent = `${len} / 5000`;
    contentCount.className = 'char-count' + (len > 4500 ? ' warn' : '') + (len >= 5000 ? ' over' : '');
});

// Anonymous toggle
anonToggle.addEventListener('change', () => {
    const isAnon = anonToggle.checked;
    toggleLabel.innerHTML = isAnon ? 'Posting as <strong>Anonymous</strong>' : 'Posting with <strong>your name</strong>';
    usernameGroup.style.display = isAnon ? 'none' : 'block';
});

// Show/hide error/success
function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('visible');
    successBox.classList.remove('visible');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function showSuccess(msg) {
    successBox.textContent = msg;
    successBox.classList.add('visible');
    errorBox.classList.remove('visible');
}
function setLoading(loading) {
    submitBtn.disabled = loading;
    submitText.classList.toggle('hidden', loading);
    submitSpinner.classList.toggle('hidden', !loading);
}

// Form submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.remove('visible');

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const is_anonymous = anonToggle.checked;
    const username = usernameInput.value.trim();

    // Client-side validation
    if (!title) return showError('Please give your story a title.');
    if (title.length > 200) return showError('Title must be 200 characters or fewer.');
    if (!content) return showError('Please write your story content.');
    if (content.length < 10) return showError('Story content must be at least 10 characters.');
    if (!is_anonymous && !username) return showError('Please enter a display name or switch to Anonymous.');

    setLoading(true);
    try {
        const story = await api.createStory({ title, content, is_anonymous, username: is_anonymous ? undefined : username });
        showSuccess('🌱 Your story has been shared! Redirecting…');
        form.reset();
        titleCount.textContent = '0 / 200';
        contentCount.textContent = '0 / 5000';
        setTimeout(() => { window.location.href = `/story.html?id=${story.id}`; }, 1500);
    } catch (err) {
        showError(err.message || 'Failed to submit. Please try again.');
    } finally {
        setLoading(false);
    }
});
