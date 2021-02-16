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

console.log("STARTING SERVER");

var topicrouter = require('./api/topics');
var commentrouter = require('./api/comments');
var sa = require('./api/signin');

// Redirects the login to Samsung STG
app.get('/login', function (req, res) {
    res.redirect('https://stg-account.samsung.com/accounts/v1/STWS/signInGate?response_type=code&locale=en&countryCode=US&client_id=3694457r8f&redirect_uri=http://localhost:3000/sa/signin/callback&state=CUSTOM_TOKEN&goBackURL=http://localhost:3000/api/topics/');
});

app.get('/logout', function (req, res) {
    res.clearCookie('access_token');
    res.redirect('https://stg-account.samsung.com/accounts/v1/STWS/signOutGate?client_id=3694457r8f&state=CUSTOM_TOKEN&signOutURL=http://localhost:3000/api/topics/')
});

// 
//Route to the callback for SA login
app.use('/sa', sa)

// Routes to add, edit, and delete topics
app.use('/api/topics', topicrouter);

// Routes to add, edit, and delete comments
app.use('/api/comments', commentrouter);

app.get('/', function (req, res) {
    console.log("Hello we are on main page");
    res.sendStatus(404);
})

// Opens server to listen to port 3000
app.listen(3000, function () {
    console.log("Listening on 3000");

});

// connection.end((err) => {
//     console.log("Connection ended");
//   });
