let jwt = require('jsonwebtoken');

let validateToken = function (req, res, next) {
    const token = req.cookies.access_token || '';
    try {
        if (!token){
            console.log("You need to Login to create a post or comment!");
            req.token = false;
        } else {
            const decrypt = jwt.verify(token, process.env.CLIENT_SECRET);
            req.token = true;
            req.user = {
                id: decrypt.guid,
                username: decrypt.name,
                email: decrypt.email,
                fname: decrypt.firstName,
                lname: decrypt.lastName
            };
        }
        next();
    } catch (err) {
        req.token = false;
        console.log("Invalid token!");
        res.status(500).send({
            message: "Invalid token!"
        });
    }
};

module.exports = validateToken;