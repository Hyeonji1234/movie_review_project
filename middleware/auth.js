const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT 토큰 생성
const generateToken = (user_id) => {
  return jwt.sign(
    { user_id },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '7d' }
  );
};

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    req.user_id = decoded.user_id;
    next();
  });
};

module.exports = { generateToken, authenticateToken };
