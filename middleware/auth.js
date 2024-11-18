const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.cookies.token || '';
  try {
    if (!token) {
      req.user = { profile: 'guest'};
      next();
    }
    else{
    const decrypt = jwt.verify(token, 'JWT_SECRET');
    req.user = decrypt;
    next();
    }
  } catch (err) {
    return res.status(500).json(err.toString());
  }
};