document.getElementById('feedback-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('feedback-content').value.trim();
    const rating = document.querySelector('input[name="rating"]:checked').value;
    const btn = document.getElementById('submit-btn');
    const successBox = document.getElementById('feedback-success');
    const errorBox = document.getElementById('feedback-error');

    successBox.classList.remove('visible');
    errorBox.classList.remove('visible');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        await api.submitFeedback({ content, rating });
        successBox.textContent = 'Thank you for your feedback! 💙 We appreciate your help in building SafeSpace.';
        successBox.classList.add('visible');
        document.getElementById('feedback-form').reset();
    } catch (err) {
        errorBox.textContent = err.message || 'Failed to submit feedback.';
        errorBox.classList.add('visible');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Send Feedback 💙';
    }
});
