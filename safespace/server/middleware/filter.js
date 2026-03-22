// Basic list of harmful/profanity words to block
const BLOCKED_WORDS = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'faggot',
    'nigger', 'retard', 'kill yourself', 'kys', 'go die', 'you should die',
    'suicide method', 'how to kill', 'worthless', 'nobody loves you'
];

/**
 * Sanitize and filter text content.
 * Returns { clean: true } or { clean: false, reason: string }
 */
function checkContent(text) {
    if (!text || typeof text !== 'string') {
        return { clean: false, reason: 'Content cannot be empty.' };
    }
    const trimmed = text.trim();
    if (trimmed.length === 0) {
        return { clean: false, reason: 'Content cannot be empty or whitespace only.' };
    }
    const lower = trimmed.toLowerCase();
    for (const word of BLOCKED_WORDS) {
        if (lower.includes(word)) {
            return { clean: false, reason: 'Your submission contains content that violates our community guidelines. Please keep this space safe and supportive.' };
        }
    }
    return { clean: true };
}

/**
 * Middleware to filter story submissions.
 */
function filterStory(req, res, next) {
    const { title, content } = req.body;

    if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'Story title is required.' });
    }
    if (title.trim().length > 200) {
        return res.status(400).json({ error: 'Title must be 200 characters or fewer.' });
    }
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Story content is required.' });
    }
    if (content.trim().length < 10) {
        return res.status(400).json({ error: 'Story content must be at least 10 characters.' });
    }
    if (content.trim().length > 5000) {
        return res.status(400).json({ error: 'Story content must be 5000 characters or fewer.' });
    }

    const titleCheck = checkContent(title);
    if (!titleCheck.clean) return res.status(400).json({ error: titleCheck.reason });

    const contentCheck = checkContent(content);
    if (!contentCheck.clean) return res.status(400).json({ error: contentCheck.reason });

    next();
}

/**
 * Middleware to filter message submissions.
 */
function filterMessage(req, res, next) {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message cannot be empty.' });
    }
    if (message.trim().length > 1000) {
        return res.status(400).json({ error: 'Message must be 1000 characters or fewer.' });
    }

    const check = checkContent(message);
    if (!check.clean) return res.status(400).json({ error: check.reason });

    next();
}

module.exports = { filterStory, filterMessage };
