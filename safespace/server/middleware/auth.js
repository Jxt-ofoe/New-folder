require('dotenv').config();

function adminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (authHeader === `Bearer ${adminPass}`) {
        return next();
    }

    res.status(401).json({ error: 'Unauthorized. Admin access required.' });
}

module.exports = { adminAuth };
