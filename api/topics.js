const express = require('express');
const router = express.Router();
const dbGetAPI = require('../db/dbGetAPI');
const dbPostAPI = require('../db/dbPostAPI');
const validateToken = require('../utilities/validateToken');

// Renders the index page
router.get('/', validateToken, function (req, res) {
    // Returns a promise for the topics table and pagination information
    var tableTopics;
    var userLikes = {};
    // Check the promise
    dbGetAPI.getTopics(req).then(result1 => {
        var page = result1[1];
        var dbPromise2 = result1[0];
        dbPromise2.then(table => {
            tableTopics = table[0];
            if (req.user) {
                return dbGetAPI.getTLikes(req, tableTopics);
            } else {
                return Promise.resolve({});
            }
        }).then(results2 => {
            if (req.user) {
                var tLikes = results2;
                //Calculate the like display, checks users and all their topic likes
                for (const [key, value] of Object.entries(tLikes)) {
                    if (!userLikes[req.user.id]) {
                        userLikes[req.user.id] = [tLikes[key].topicid];
                    } else {
                        userLikes[req.user.id].push(tLikes[key].topicid);
                    }
                }
            }
            var currentTime = new Date();
            currentTime.setHours(currentTime.getHours() + 8);
            var timediff = currentTime - tableTopics[1].posted;
            var seconds = Math.floor((timediff)/1000);
            var minutes = Math.floor(seconds/60);
            var hours = Math.floor(minutes/60);
            var days = Math.floor(hours/24);
            var months = Math.floor(days/30);
            var time;
            if (months !== 0) {
                time = months === 1 ? months + " month ago" : months + " months ago";
            } else if (days !== 0) {
                time = days === 1 ? days + " day ago" : days + " days ago";
            } else if (hours !== 0) {
                time = hours === 1 ? hours + " hour ago" : hours + " hours ago";
            } else if (minutes !== 0) {
                time = minutes === 1 ? minutes + " minute ago" : minutes + " minutes ago";
            } else {
                time = seconds === 1 ? seconds + " second ago" : seconds + " seconds ago";
            }
            // console.log(time);





            hours = hours-(days*24);
            minutes = minutes-(days*24*60)-(hours*60);
            seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);

            res.render('../views/index', {
                topics: tableTopics, user: req.user, userLikes: userLikes, page: page
            });
        });
    }).catch(error => {
        console.log(error);
        res.sendStatus(500);
    });
});

// Using the middleware to validate token.
router.use(validateToken, (req, res, next) => {
    if (!req.user) {
        res.redirect('/login');
    } else {
        next();
    }
});

// Renders the addpost page
router.get('/addpost', function (req, res) {
    res.render('../views/addpost', { uid: req.user.id });
});

// Add endpoint to insert into list of topics
router.post('/addpost', function (req, res) {
    var userid = req.user.id;
    var username = req.user.username;
    var topictitle = req.body.title;
    var topicdesc = req.body.desc;
    if (topictitle && topicdesc && userid && username) {
        // Promise to add the post
        dbPostAPI.addPost(userid, username, topictitle, topicdesc)
            .then(() => {
                res.redirect('/api/topics/');
                })
            .catch(error => {throw error});
    } else {
        console.log("Missing Information");
        res.sendStatus(500);
    }
});

// Renders the editpost page
router.get('/editpost', function (req, res) {
    var topicid = req.query.topic;
    var page = req.query.page;
    var user = req.user;
    if (topicid && page && user) {
        // Get post promise
        dbGetAPI.getSinglePost(topicid)
            .then(post => {
                res.render('../views/editpost.ejs', { post: post[0], user: user, page: { currentPage: page } });
            }).catch(error => {throw error});
    } else {
        res.sendStatus(500);
    }
});

// Edit endpoint to edit topic
router.post('/editpost', function (req, res) {
    var topictitle = req.body.title;
    var topicdetails = req.body.desc;
    var topicid = req.body.tid;
    if (topictitle && topicdetails && topicid) {
        // Get Edit post promise 
        dbPostAPI.editPost(topictitle, topicdetails,topicid)
            .then(() => {
                res.redirect('/api/topics/');
            }).catch(error => {throw error});
    } else {
        res.sendStatus(500);
    }
});

// Renders the delete page
router.get('/deletepost', function (req, res) {
    var topicid = req.query.topic;
    var page = req.query.page;
    var user = req.user;
    if (topicid && page && user) {
        // Get post promise
        dbGetAPI.getSinglePost(topicid)
            .then(post => {
                res.render('../views/deletepost', { post: post[0], user: user, page: { currentPage: page } });
            }).catch(error => {throw error});
    } else {
        res.sendStatus(500);
    }
});

// Delete endpoint to delete topic
router.post('/deletepost', function (req, res) {
    var topicid = req.body.tid;
    if (topicid) {
        // Delete topic promise
        dbPostAPI.deletePost(topicid)
            .then(() => {
                res.redirect(`/api/topics`);
            }).catch(error => {throw error});
    }
});

// Increment like
router.get('/addlike', function (req, res) {
    var topicid = req.query.topic;
    var page = req.query.page;
    var home = req.query.home;
    var userid = req.user.id;
    if (topicid && page && home && userid) {
        // Promise to update the likes
        dbGetAPI.addTopicLikes(topicid, userid)
            .then(() => {
                if (home === "home") {
                    if (page) {
                        res.redirect(`/api/topics/?page=${page}`);
                    } else {
                        res.redirect('/api/topics/');
                    }
                } else {
                    res.redirect(`/api/comments/?topic=${topicid}&page=${page}`);
                }            
            }).catch(error => {throw error});
    }
});

module.exports = router;