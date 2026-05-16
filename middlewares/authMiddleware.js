const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  console.log("TOKEN RECEIVED:", token);
  console.log("SECRET USED TO VERIFY:", process.env.JWT_SECRET || 'secret123');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

    console.log("DECODED TOKEN:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);

    return res.status(401).json({
      message: 'Token invalide ou expiré.',
      error: err.message
    });
  }
};

module.exports = protect;