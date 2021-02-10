const express = require('express');
const router = express.Router();
const db = require('../utlities/mysqlconn');

// Renders the comments page
router.get('/', function (req, res) {
    var topicid = req.query.topic;
    if(topicid){
        var query = `SELECT * FROM TOPICS WHERE topicid = ?; SELECT * FROM COMMENTS WHERE topicid = ?;`;
        db.query(query, [topicid, topicid]).then(row => {
            if (req.cookies.access_token !== undefined) {
                res.render('../views/comment', {post: row[0][0], comments : row[0][1], user: req.cookies.access_token });
            } else {
                res.render('../views/comment', {post: row[0][0], comments : row[0][1], user: {} });
            }

        }).catch(err => {
            console.log(err);
        })

    }

});

// addcomment  endpoint to add coment topic
router.post('/addcomment', function (req, res) {

    var arr = req.body.tid;

            query = `INSERT INTO COMMENTS (topicid, userid, commentdetails, posted, points) VALUES ('${arr}', 10, "${req.body.desc}", NOW(), 0); UPDATE TOPICS SET comments = comments+1 WHERE topicid = '${arr}';`;
            db.query(query).then(row =>{
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
                res.render('../views/editcomment.ejs', { comment: rows[0] });
        });
    } else {
        res.sendStatus(500);
    }

});

// edit comment  endpoint to edit coment topic
router.post('/editcomment', function (req, res) {

    var commentdetals = req.body.desc;
    var commentid = req.body.tid.split(',');
    if (commentdetals && commentid){
        //Query to edit the post
        query = `UPDATE COMMENTS SET commentdetails = ? WHERE commentid = ?`;
        db.query(query, [commentdetals, commentid[1]])
            .then((rows, err) => {
                if(err){
                    console.log(err.code);
                }
    });

    res.redirect(`/api/comments/?topic=${commentid[0]}`);
    } else {
        res.sendStatus(500);
    }
    // ; UPDATE TOPICS SET comments = comments-1 WHERE topicid = '${topicid}';

});

// delete endpoint to delete comment
router.get('/deletecomment', function (req, res) {
    console.log(req.query.topic)
    var commentid = req.query.topic.split(',');
    if(commentid){
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

module.exports = router;