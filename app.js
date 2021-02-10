const express = require('express');
const app = express();
const dotenv = require('dotenv');
const rp = require('request-promise');
const cookieParser = require('cookie-parser');

const parseXML = require('xml2js').parseString;

dotenv.config({ path: './.env' });

const bodyParser = require('body-parser');

let generateToken = require('./utilities/generateToken');

// urlencoded to help extract data from form
app.use(bodyParser.urlencoded({ extended: false }));

// parses json body sent by api clients
app.use(express.json());

// requests parses cookies
app.use(cookieParser());

// Setting the view for ejs
app.set('view engine', 'ejs');

// Making the css folder static to be accessable by ejs page
app.use('/css', express.static('css'));

var topicrouter = require('./api/topics');
var commentrouter = require('./api/comments');

// Renders the login page
app.get('/login', function (req, res) {
    res.redirect('https://stg-account.samsung.com/accounts/v1/STWS/signInGate?response_type=code&locale=en&countryCode=US&client_id=3694457r8f&redirect_uri=http://localhost:3000/sa/signin/callback&state=CUSTOM_TOKEN&goBackURL=http://localhost:3000/api/topics/');
});

app.get('/sa/signin/callback', async function (req, res) {

    try {
        var options = {
            url: `https://${req.query.auth_server_url}/auth/oauth2/token`,
            method: `POST`,
            form: {
                grant_type: "authorization_code",
                code: req.query.code,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        //Generate access token
        let generate = await rp(options);
        let profile = await getUser(generate, req.query.auth_server_url);

        //adding expiration to the token
        profile.exp = Math.floor(Date.now() / 1000) + (60 * 60);
        
        // Creating a token to store in cookie
        await generateToken(res, profile);

        res.redirect('/api/topics');

    } catch (error) {
        console.log("Could not sign in");
    }

});

async function getUser(parsed, url) {
    const json = JSON.parse(parsed);
    var options = {
        url: `https://${url}/v2/profile/user/user/${json.userId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + json.access_token, //Access token provided from above response
            'x-osp-appId': process.env.CLIENT_ID, //"3694457r8f"
            'x-osp-userId': json.userId //userId provided from above response
        }
    };

    let generate = await rp(options);
    let profile = await extractProfileInfo(generate, json.access_token);
    return profile;
}

function extractProfileInfo(body, accessToken) {
    return new Promise(function (resolve, reject) {
        parseXML(body, function (err, obj) {
            if (err) {
                return reject("parse: " + err);
            } else {
                try {
                    var guid = obj.UserVO.userID[0];
                    var userName = obj.UserVO.userBaseVO[0].userName[0];
                    var nameInfo = obj.UserVO.userBaseVO[0].userBaseIndividualVO[0];
                    var email = "";
                    obj.UserVO.userIdentificationVO.forEach(function (x) {
                        if (x.loginIDTypeCode[0] === "003") {
                            email = x.loginID[0];
                        }
                    });
                    var lname = (nameInfo ? nameInfo.familyName[0] : " ");
                    var fname = (nameInfo ? nameInfo.givenName[0] : " ");
                    var profileImg = "";
                    if (obj.UserVO.userBaseVO[0].photographImageFileURLText) {
                        profileImg = obj.UserVO.userBaseVO[0].photographImageFileURLText[0];
                    }

                    var profileJSON = {
                        "guid": guid,
                        "name": userName,
                        "email": email,
                        "token": accessToken,
                        "lastName": (lname || " "),
                        "firstName": (fname || " "),
                        "profileImg": profileImg
                    };
                    return resolve(profileJSON);
                } catch (ex) {
                    return reject("parse: " + ex);
                }
            }
        });
    });
}



// Routes to add, edit, and delete topics
app.use('/api/topics', topicrouter);

// Routes to add, edit, and delete comments
app.use('/api/comments', commentrouter);

// Opens server to listen to port 3000
app.listen(3000, function () {

});

// connection.end((err) => {
//     console.log("Connection ended");
//   });
