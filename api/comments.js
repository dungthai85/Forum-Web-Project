const express = require('express');
const router = express.Router();
const db = require('../utilities/mysqlconn');
const validateToken = require('../utilities/validateToken');

// Renders the comments page
router.get('/', validateToken, function (req, res) {
    var topicid = req.query.topic;
    if (topicid) {
        var query = `SELECT * FROM TOPICS WHERE topicid = ?; SELECT * FROM COMMENTS WHERE topicid = ?;`;
        db.query(query, [topicid, topicid]).then(row => {
            res.render('../views/comment', { post: row[0][0], comments: row[0][1], user: req.user });
        }).catch(err => {
            console.log(err);
        })
    }
});

// addcomment  endpoint to add coment topic
router.post('/addcomment', validateToken, function (req, res) {
    if (req.user) {
        var arr = req.body.tid;
        var userid = req.user.id;
        var username = req.user.username;
        var comment = req.body.desc;
        query = `INSERT INTO COMMENTS (topicid, userid, username, commentdetails, posted, points) VALUES (?, ?, ?, ?, NOW(), 0); UPDATE TOPICS SET comments = comments+1 WHERE topicid = '${arr}';`;
        db.query(query, [arr, userid, username, comment]).then(row => {
            res.redirect(`/api/comments/?topic=${arr}`);
        }).catch(err => {
            console.log(err);
        })
    } else {
        res.redirect('/login');
    }
});

router.get('/editcomment', validateToken, function (req, res) {
    if (req.user) {
        var commentid = req.query.topic.split(',');
        if (commentid) {
            //Query db for the topic to edit
            db.query(`SELECT * FROM COMMENTS WHERE commentid = ?`, [commentid[1]])
                .then(rows => {
                    res.render('../views/editcomment.ejs', { comment: rows[0], user: req.user });
                });
        } else {
            res.sendStatus(500);
        }
    } else {
        res.redirect('/login');
    }
});

// edit comment  endpoint to edit coment topic
router.post('/editcomment', validateToken, function (req, res) {
    if (req.user) {
        var commentdetals = req.body.desc;
        var commentid = req.body.tid.split(',');
        if (commentdetals && commentid) {
            //Query to edit the post
            query = `UPDATE COMMENTS SET commentdetails = ? WHERE commentid = ?`;
            db.query(query, [commentdetals, commentid[1]])
                .then((rows, err) => {
                    if (err) {
                        console.log(err.code);
                    }
                });
            res.redirect(`/api/comments/?topic=${commentid[0]}`);
        } else {
            res.sendStatus(500);
        }
    } else {
        res.redirect('/login');
    }
});

// delete endpoint to delete comment
router.get('/deletecomment', validateToken, function (req, res) {
    if (req.user) {
        var commentid = req.query.topic.split(',');
        if (commentid) {
            //Query db for the delete post
            var sql = `DELETE FROM COMMENTS WHERE commentid = ?; UPDATE TOPICS SET comments = comments - 1 WHERE topicid = ? `;
            db.query(sql, [commentid[1], commentid[0]]).then((rows, err) => {
                if (err) {
                    console.log(err.code);

                }
                res.redirect(`/api/comments/?topic=${commentid[0]}`);
            });
        }
    } else {
        res.redirect('/login');
    }
});

module.exports = router;