const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { adminAuth } = require('../middleware/auth');

// Apply admin auth to all routes in this router
router.use(adminAuth);

// GET /api/admin/reported (stories and messages)
router.get('/reported', async (req, res) => {
    try {
        const reportedStories = await db.execute('SELECT * FROM stories WHERE is_reported = 1');
        const reportedMessages = await db.execute('SELECT * FROM messages WHERE is_reported = 1');

        res.json({
            stories: reportedStories.rows,
            messages: reportedMessages.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch reported content.' });
    }
});

// DELETE /api/admin/messages/:id
router.delete('/messages/:id', async (req, res) => {
    try {
        await db.execute({
            sql: 'DELETE FROM messages WHERE id = ?',
            args: [req.params.id]
        });
        res.json({ message: 'Message deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete message.' });
    }
});

// DELETE /api/admin/stories/:id
router.delete('/stories/:id', async (req, res) => {
    try {
        // Also delete associated messages
        await db.execute({
            sql: 'DELETE FROM messages WHERE story_id = ?',
            args: [req.params.id]
        });
        await db.execute({
            sql: 'DELETE FROM stories WHERE id = ?',
            args: [req.params.id]
        });
        res.json({ message: 'Story deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete story.' });
    }
});

// GET /api/admin/feedbacks
router.get('/feedbacks', async (req, res) => {
    try {
        const result = await db.execute('SELECT * FROM feedbacks ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch feedbacks.' });
    }
});

module.exports = router;
