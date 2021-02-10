
const e = require('express');
const express = require('express');
const router = express.Router();
const db = require('../utlities/mysqlconn');

// Renders the index page
router.get('/', function (req, res) {

        //Query db to open all of the posts
        db.query('SELECT * FROM TOPICS')
        .then((rows, err) =>{
            if(err) {
                console.log(err.code);
            }
            if (req.cookies.access_token !== undefined) {
                res.render('../views/index', {topics : rows[0], user: req.cookies.access_token });
            } else {
                res.render('../views/index', {topics : rows[0], user: {} });
            }
        });


});

// Renders the addpost page
router.get('/addpost', function (req, res) {

    if(req.cookies.access_token !== undefined){
        res.render('../views/addpost', {uid : req.cookies.access_token.guid});
    } else {
        res.redirect('/login');
    }
    
});

// Add endpoint to insert into list of topics
router.post('/addpost', function (req, res) {

    if(req.cookies.access_token !== undefined){
        var userid = req.cookies.access_token.guid;
        var topictitle = req.body.title;
        var topicdesc = req.body.desc;
        if (topictitle && topicdesc) {
            //Query to add post
            var query = `INSERT INTO TOPICS (userid, topicname, topicdetails, points, posted, comments) VALUES ( ? , ? , ? , 0, NOW(), 0)`;
            db.query(query, [userid, topictitle, topicdesc])
                .then((rows, err) => {
                    if(err){
                        console.log(err.code);
                    }
                    res.redirect('/api/topics/');
            });
        }  else {
            res.sendStatus(500);
        }
    } else {
        
    }


});

// Renders the editpost page
router.get('/editpost', function (req, res) {
    var topicid = req.query.topic;
    if (topicid) {
        //Query db for the topic to edit
        var query = `SELECT * FROM TOPICS WHERE topicid = ?`;
        db.query(query, [topicid])
            .then(rows => {
                if (req.cookies.access_token !== undefined) {
                    res.render('../views/editpost.ejs', { post: rows[0], user: req.cookies.access_token });
                } else {
                    res.render('../views/editpost.ejs', { post: rows[0], user: {} });
                }
        });
    } else {
        res.sendStatus(500);
    }

});

// edit endpoint to edit topic
router.post('/editpost', function (req, res) {
    var topictitle = req.body.title;
    var topicdetals = req.body.desc;
    var topicid = req.body.tid;
    if (topictitle && topicdetals && topicid){
        //Query to edit the post
        var query = `UPDATE TOPICS SET topicname = ?, topicdetails = ? WHERE topicid = ? `;
        db.query(query, [topictitle, topicdetals, topicid])
            .then((rows, err) => {
                if(err){
                    console.log(err.code);
                }
    });

    res.redirect('/api/topics/');
    } else {
        res.sendStatus(500);
    }

});

// Renders the delete page
router.get('/deletepost', function (req, res) {
    var topicid = req.query.topic;
    if(topicid){
        //Query db for the delete post
        var query = `SELECT * FROM TOPICS WHERE topicid = ?`;
        db.query(query, [topicid]).then((rows, err) => {
            if (err) {
                console.log(err.code);
            }
            // console.log(results);
            res.render('../views/deletepost', {post: rows[0]});
        });
    }
});

// delete endpoint to delte topic
router.post('/deletepost', function (req, res) {
    var topicid = req.body.tid;
    if(topicid){
        //Query db for the delete post
        var query = `DELETE FROM TOPICS WHERE topicid = ? ; DELETE FROM COMMENTS WHERE topicid = ?`;
        db.query(query, [topicid, topicid]).then((rows, err) => {
            if (err) {
                console.log(err.code);
            }
            res.redirect('/api/topics/');
        });
    }
});

// Increment like
router.get('/addlike', function (req, res) {
    var topicid = req.query.topic;

    if (topicid) {
        //Query to get the row
        var query = `UPDATE TOPICS SET points = points + 1 WHERE topicid = ? `;
        db.query(query, [topicid])
            .then(rows => {
                if (req.query.page === "home") {
                    res.redirect('/api/topics/');
                } else {
                    res.redirect(`/api/comments/?topic=${topicid}`);
                }
            }).catch(err => {
                console.log(err.code);
            });
    }
});

module.exports = router;