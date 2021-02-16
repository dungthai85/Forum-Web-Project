let jwt = require('jsonwebtoken');

let validateToken = async function (req, res, next) {
    const token = req.cookies.access_token || '';
    try {
        if (!token){
            console.log("You need to Login!!");
        } else {
            const decrypt = await jwt.verify(token, process.env.CLIENT_SECRET);
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
        console.log("Invalid token!!");
    }
};

module.exports = validateToken;