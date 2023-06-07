const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('auth-token');
    if(!token) res.status(401).send('Ban khong co quyen truy cap');

    try {
        const checkToken = jwt.verify(token, 'token');
        req.user = checkToken;
        next();
    } catch (e) {
        res.status(400).send('Token incorrect');
    }
};