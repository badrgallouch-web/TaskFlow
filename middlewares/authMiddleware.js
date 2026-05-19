const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // FIX: حذف console.log التي كانت تطبع الـ token والـ secret في الـ terminal
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Token invalide ou expiré.',
            error: err.message
        });
    }
};

module.exports = protect;