const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { filterStory } = require('../middleware/filter');

// GET /api/stories?sort=latest|most_liked
router.get('/', async (req, res) => {
    try {
        const sortField = req.query.sort === 'most_liked' ? 'likes' : 'created_at';
        const sortOrder = 'DESC';
        const query = `
      SELECT id, title, content, is_anonymous, username, likes, created_at
      FROM stories
      WHERE is_reported = 0
      ORDER BY ${sortField} ${sortOrder}
    `;
        const result = await db.execute(query);
        const stories = result.rows;

        const formatted = stories.map(s => ({
            ...s,
            preview: s.content.length > 200 ? s.content.substring(0, 200) + '...' : s.content,
            displayName: s.is_anonymous ? 'Anonymous' : (s.username || 'Anonymous'),
            is_anonymous: Boolean(s.is_anonymous)
        }));

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stories.' });
    }
});

// POST /api/stories
router.post('/', filterStory, async (req, res) => {
    try {
        const { title, content, is_anonymous = true, username } = req.body;
        const anon = is_anonymous ? 1 : 0;
        const name = anon ? null : (username ? username.trim().substring(0, 50) : null);

        const query = `
      INSERT INTO stories (title, content, is_anonymous, username)
      VALUES (?, ?, ?, ?)
    `;
        const info = await db.execute({
            sql: query,
            args: [title.trim(), content.trim(), anon, name]
        });

        const storyResult = await db.execute({
            sql: 'SELECT * FROM stories WHERE id = ?',
            args: [Number(info.lastInsertRowid)]
        });
        const story = storyResult.rows[0];

        res.status(201).json({
            ...story,
            displayName: story.is_anonymous ? 'Anonymous' : (story.username || 'Anonymous'),
            is_anonymous: Boolean(story.is_anonymous)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create story.' });
    }
});

// GET /api/stories/:id
router.get('/:id', async (req, res) => {
    try {
        const storyResult = await db.execute({
            sql: 'SELECT * FROM stories WHERE id = ? AND is_reported = 0',
            args: [req.params.id]
        });
        const story = storyResult.rows[0];
        if (!story) return res.status(404).json({ error: 'Story not found.' });

        const msgResult = await db.execute({
            sql: 'SELECT id, message, created_at FROM messages WHERE story_id = ? AND is_reported = 0 ORDER BY created_at ASC',
            args: [req.params.id]
        });

        res.json({
            ...story,
            displayName: story.is_anonymous ? 'Anonymous' : (story.username || 'Anonymous'),
            is_anonymous: Boolean(story.is_anonymous),
            messages: msgResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch story.' });
    }
});

// POST /api/stories/:id/like
router.post('/:id/like', async (req, res) => {
    try {
        const storyCheck = await db.execute({
            sql: 'SELECT id FROM stories WHERE id = ? AND is_reported = 0',
            args: [req.params.id]
        });
        if (storyCheck.rows.length === 0) return res.status(404).json({ error: 'Story not found.' });

        await db.execute({
            sql: 'UPDATE stories SET likes = likes + 1 WHERE id = ?',
            args: [req.params.id]
        });

        const updated = await db.execute({
            sql: 'SELECT id, likes FROM stories WHERE id = ?',
            args: [req.params.id]
        });
        res.json({ likes: updated.rows[0].likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to like story.' });
    }
});

// POST /api/stories/:id/report
router.post('/:id/report', async (req, res) => {
    try {
        const storyCheck = await db.execute({
            sql: 'SELECT id FROM stories WHERE id = ?',
            args: [req.params.id]
        });
        if (storyCheck.rows.length === 0) return res.status(404).json({ error: 'Story not found.' });

        await db.execute({
            sql: 'UPDATE stories SET is_reported = 1 WHERE id = ?',
            args: [req.params.id]
        });
        res.json({ message: 'Story has been reported. Thank you for helping keep SafeSpace safe.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to report story.' });
    }
});

module.exports = router;
