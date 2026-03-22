require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./server/db');

const storiesRouter = require('./server/routes/stories');
const messagesRouter = require('./server/routes/messages');
const adminRouter = require('./server/routes/admin');
const feedbackRouter = require('./server/routes/feedback');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/stories', storiesRouter);
app.use('/api/stories/:id/messages', messagesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/feedback', feedbackRouter);

// Catch-all: serve frontend for any unmatched routes
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Init DB then start server
async function start() {
    try {
        await initDB();
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`🌱 SafeSpace server running at http://localhost:${PORT}`);
            });
        }
    } catch (err) {
        console.error('Failed to initialize database:', err);
    }
}
start();

module.exports = app;
