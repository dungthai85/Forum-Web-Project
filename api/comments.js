const express = require('express');
const router = express.Router();
const dbGetAPI = require('../db/dbGetAPI');
const dbPostAPI = require('../db/dbPostAPI');
const validateToken = require('../utilities/validateToken');

// Renders the comments page
router.get('/', validateToken, function (req, res) {
    // Get the promimse form the database
    dbGetAPI.getComments(req).then(result1 => {
        var tableComments;
        var userCLikes = {};
        var userTLikes = {}
        var page = result1[1];
        var tableTopics = result1[2];
        var dbPromise2 = result1[0];
        dbPromise2.then(table => {
            tableComments = table[0];
            if (req.user) {
                return dbGetAPI.getCLikes(req, tableComments);
            } else {
                return Promise.resolve({});
            }
        }).then(result2 => {
            if (req.user) {
                var tlikes = result2[0][0];
                var clikes = result2[0][1];
                //Calculate the like display, checks users and all their topic likes
                if (!userTLikes[req.user.id] && Object.keys(tlikes).length !== 0 ) {
                    userTLikes[req.user.id] = [tlikes[0].topicid];
                } 
                //Calculate the like display, checks users and all their comment likes
                for (const [key, value] of Object.entries(clikes)) {
                    if (!userCLikes[req.user.id]) {
                        userCLikes[req.user.id] = [clikes[key].commentid];
                    } else {
                        userCLikes[req.user.id].push(clikes[key].commentid);
                    }
                }
            } 
            res.render('../views/comment', {
                post: tableTopics, comments: tableComments, user: req.user, userTLikes: userTLikes, userCLikes: userCLikes, page: page
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

// Addcomment endpoint to add coment topic
router.post('/addcomment', function (req, res) {
    var arr = req.body.tid;
    var userid = req.user.id;
    var username = req.user.username;
    var comment = req.body.desc;
    if (arr && userid && username && comment) {
        // Promise to add comment
        dbPostAPI.addComment(arr, userid, username, comment)
            .then((rows) => {
                res.redirect(`/api/comments/?topic=${arr}`);
            }).catch(error => {throw error});
    }
});

// Renders the edit comment page
router.get('/editcomment', function (req, res) {
    var topicid = req.query.topic;
    var commentid = req.query.comment;
    var page = req.query.page;
    var user = req.user;
    if (commentid && topicid && page && user) {
        // Promise to edit the comment
        dbGetAPI.editSingleComment(commentid)
            .then(rows => {
                res.render('../views/editcomment.ejs', { comments: rows[0], user: user, page: { currentPage: page }, post: [{ topicid: topicid }] });
            }).catch(error => {throw error});
    } else {
        res.sendStatus(500);
    }
});

// Edit comment endpoint to edit coment topic
router.post('/editcomment', function (req, res) {
    var commentdetails = req.body.desc;
    var body = req.body.tid.split(',');
    var topicid = body[0];
    var commentid = body[1];
    var page = body[2];
    if (commentdetails && commentid && topicid && page) {
        // Promise to edit the comment
        dbPostAPI.editComment(commentdetails, commentid)
            .then(() => {
                res.redirect(`/api/comments/?topic=${topicid}&page=${page}`);
            }).catch(error => {throw error});
    } else {
        res.sendStatus(500);
    }
});

// Delete endpoint to delete comment
router.get('/deletecomment', function (req, res) {
    var topicid = req.query.topic;
    var commentid = req.query.comment;
    var page = req.query.page;
    if (commentid && topicid && page) {
        // Promise to delete comment
        dbGetAPI.deleteComment(commentid, topicid)
            .then(() => {
                res.redirect(`/api/comments/?topic=${topicid}&page=${page}`);
            }).catch(error => {throw error});
    }
});

// Increment comment like
router.get('/commentlike', function (req, res) {
    var topicid = req.query.topic;
    var commentid = req.query.comment;
    var page = req.query.page;
    var userid = req.user.id;
    if (topicid && page && userid) {
        // Promise to get the comment likes
        dbGetAPI.getCLikes(req, { 0: { commentid: parseInt(commentid) } })
        .then(clikes => {
            if (clikes[0][1].length !== 0) {
                dbGetAPI.updateCommentLikes(commentid, userid, true).then(() => {
                    res.redirect(`/api/comments/?topic=${topicid}&page=${page}`);
                }).catch(error => {throw error});
            } else {
                dbGetAPI.updateCommentLikes(commentid, userid, false).then(() => {
                    res.redirect(`/api/comments/?topic=${topicid}&page=${page}`);
                }).catch(error => {throw error});
            }
        });
    }
});

module.exports = router;