let jwt = require('jsonwebtoken');

let validateToken = async function (req, res, next) {
    const token = req.cookies.access_token || '';
    try {
        if (!token){
            console.log("You need to Login to create a post or comment!");
            req.token = false;
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
    } catch (err) {
        req.token = false;
        console.log("Invalid token!");
        // res.status(500).send({
        //     message: "Invalid token!"
        // });
    }
    next();
};

module.exports = validateToken;