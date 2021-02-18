const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

dotenv.config({ path: './.env' });

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
var sa = require('./api/signin');

// Redirects the login to Samsung STG
app.get('/login', function (req, res) {
    res.redirect('https://stg-account.samsung.com/accounts/v1/STWS/signInGate?response_type=code&locale=en&countryCode=US&client_id=3694457r8f&redirect_uri=http://34.220.239.52:3000/sa/signin/callback&state=CUSTOM_TOKEN&goBackURL=http://34.220.239.52:3000/api/topics/');
});

app.get('/logout', function (req, res) {
    var page = req.query.page;
    var home = req.query.home;
    var topicid = req.query.topic;
    res.clearCookie('access_token');
    if(home === "home"){
        res.redirect(`https://stg-account.samsung.com/accounts/v1/STWS/signOutGate?client_id=3694457r8f&state=CUSTOM_TOKEN&signOutURL=http://34.220.239.52:3000/api/topics/?page=${page}`);
    } else {
        res.redirect(`https://stg-account.samsung.com/accounts/v1/STWS/signOutGate?client_id=3694457r8f&state=CUSTOM_TOKEN&signOutURL=http://34.220.239.52:3000/api/comments/?topic=${topicid}`);
    }
});

//Route to the callback for SA login
app.use('/sa', sa);

// Routes to add, edit, and delete topics
app.use('/api/topics', topicrouter);

// Routes to add, edit, and delete comments
app.use('/api/comments', commentrouter);


// Opens server to listen to port 3000
app.listen(3000, function () {
    console.log("Listening on 3000");
});

// connection.end((err) => {
//     console.log("Connection ended");
//   });


