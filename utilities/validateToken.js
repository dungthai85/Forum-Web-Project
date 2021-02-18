let jwt = require('jsonwebtoken');

function validateToken(req, res, next) {
    const token = req.cookies.access_token || '';
    if (!token) {
        console.log("You need to Login to create a post or comment!");
        req.token = false;
        next();
    } else {
        jwt.verify(token, process.env.CLIENT_SECRET, (err, decrypt) => {
            if (err) {
                res.status(503).send({message: "Invalid JWT"});
            } else {
                req.user = {
                    id: decrypt.guid,
                    username: decrypt.name,
                    email: decrypt.email,
                    fname: decrypt.firstName,
                    lname: decrypt.lastName
                };
            next();
            }
        });
    }
}

module.exports = validateToken;