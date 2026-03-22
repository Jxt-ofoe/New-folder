const express = require('express');
const router = express.Router({ mergeParams: true });
const { db } = require('../db');
const { filterMessage } = require('../middleware/filter');

// POST /api/stories/:id/messages
router.post('/', filterMessage, async (req, res) => {
    try {
        const { id: story_id } = req.params;
        const storyCheck = await db.execute({
            sql: 'SELECT id FROM stories WHERE id = ? AND is_reported = 0',
            args: [story_id]
        });
        if (storyCheck.rows.length === 0) return res.status(404).json({ error: 'Story not found.' });

        const { message } = req.body;
        const info = await db.execute({
            sql: 'INSERT INTO messages (story_id, message) VALUES (?, ?)',
            args: [story_id, message.trim()]
        });

        const newMsgResult = await db.execute({
            sql: 'SELECT * FROM messages WHERE id = ?',
            args: [Number(info.lastInsertRowid)]
        });
        res.status(201).json(newMsgResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});

// Standalone report message
router.post('/report-message/:msgId', async (req, res) => {
    try {
        const msgCheck = await db.execute({
            sql: 'SELECT id FROM messages WHERE id = ?',
            args: [req.params.msgId]
        });
        if (msgCheck.rows.length === 0) return res.status(404).json({ error: 'Message not found.' });

        await db.execute({
            sql: 'UPDATE messages SET is_reported = 1 WHERE id = ?',
            args: [req.params.msgId]
        });
        res.json({ message: 'Message has been reported. Thank you for keeping SafeSpace supportive.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to report message.' });
    }
});

module.exports = router;
