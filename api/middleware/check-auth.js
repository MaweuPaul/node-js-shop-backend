const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Correctly split the header to extract the token
    const token = req.headers.authorization.split(' ')[1];
    console.log(token); // This will now log the correct token
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Auth Failed',
    });
  }
};
