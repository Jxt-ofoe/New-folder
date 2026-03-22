const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.post('/', async (req, res) => {
    try {
        const { content, rating } = req.body;
        if (!content) return res.status(400).json({ error: 'Feedback content is required.' });

        await db.execute({
            sql: 'INSERT INTO feedbacks (content, rating) VALUES (?, ?)',
            args: [content.trim(), rating || null]
        });

        res.status(201).json({ message: 'Thank you for your feedback! 💙' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit feedback.' });
    }
});

module.exports = router;
