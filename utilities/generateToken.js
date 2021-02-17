let jwt = require('jsonwebtoken');

const generateToken = async function (res, claims) {
    const token = jwt.sign(claims, process.env.CLIENT_SECRET);
    // console.log(token);

    // return cookie called access_token with 5 min expiration
    return res.cookie('access_token', token, {
        expires: new Date(Date.now() + 2 * 60 * 1000),
        httpOnly: true
    });
}

module.exports = generateToken;