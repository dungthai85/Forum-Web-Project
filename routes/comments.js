const express = require('express');
const router = express.Router();
const db = require('../utlities/mysqlconn');


const bodyParser = require('body-parser');

// urlencoded to help extract data from form
router.use(bodyParser.urlencoded({ extended: true }));

// Renders the comments page
router.get('/comment', function (req, res) {
    var topicid = req.query.topic;
    if(topicid){
        var query = `SELECT * FROM TOPICS WHERE topicid = ?; SELECT * FROM COMMENTS WHERE topicid = ${topicid};`;
        db.query(query, [topicid]).then(row => {

            res.render('../views/comment', {post: row[0][0], comments : row[0][1] });  

        }).catch(err => {
            console.log(err);
        })

    }

});

// addcomment  endpoint to add coment topic
router.post('/addcomment', function (req, res) {

    var arr = req.body.tid;

            query = `INSERT INTO COMMENTS (topicid, userid, commentdetails, posted, points) VALUES ('${arr}', 10, '${req.body.desc}', NOW(), 0); UPDATE TOPICS SET comments = comments+1 WHERE topicid = '${arr}';`;
            db.query(query).then(row =>{
                res.redirect(`/comment?topic=${arr}`);

            }).catch(err => {
                console.log(err);
            })
    
});

router.get('/editcomment', function (req, res) {
    var commentid = req.query.topic;
    if (commentid) {
        //Query db for the topic to edit
        db.query(`SELECT * FROM COMMENTS WHERE commentid = ?`, [commentid])
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
    var commentid = req.body.tid;
    if (commentdetals && commentid){
        //Query to edit the post
        query = `UPDATE COMMENTS SET commentdetails = ? WHERE commentid = ?`;
        db.query(query, [commentdetals, commentid])
            .then((rows, err) => {
                if(err){
                    console.log(err.code);
                }
    });

    res.redirect('/');
    } else {
        res.sendStatus(500);
    }
    // ; UPDATE TOPICS SET comments = comments-1 WHERE topicid = '${topicid}';

});

module.exports = router;