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

router.use(async (req, res, next) => {
    await validateToken(req, res, next);
    if (req.token) {
        console.log("VALID TOKEN");
    } else {
        console.log("No Token, Redirecting to login");
        res.redirect('/login');
    }
});

// addcomment  endpoint to add coment topic
router.post('/addcomment', function (req, res) {
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
});

router.get('/editcomment', function (req, res) {
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
});

// edit comment  endpoint to edit coment topic
router.post('/editcomment', function (req, res) {
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
                res.redirect(`/api/comments/?topic=${commentid[0]}`);
            });
    } else {
        res.sendStatus(500);
    }
});

// delete endpoint to delete comment
router.get('/deletecomment', function (req, res) {
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
});

// Increment comment like
router.get('/commentlike', function (req, res) {
    var topicid = req.query.topic;
    if (topicid) {
        //Query to get the row
        var query = `UPDATE COMMENTS SET points = points + 1 WHERE commentid = ? ; SELECT * FROM COMMENTS WHERE commentid = ?`;
        db.query(query, [topicid, topicid])
            .then(rows => {
                res.redirect(`/api/comments/?topic=${rows[0][1][0].topicid}`);
            }).catch(err => {
                console.log(err.code);
            });
    }
});

module.exports = router;