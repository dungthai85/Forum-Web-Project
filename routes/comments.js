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
        var topic2 = "th" + topicid;
        var query = `SELECT * FROM TOPICS WHERE topicid = ? ;  SELECT * FROM ${topic2}`;
        db.query(query, [topicid]).then(row => {
            console.table(row[0][0]);
            console.table(row[0][1]);
            if(row[0][0].comments !== 0){
                res.render('../views/comment', {post: row[0][0], comments : row[0][1] });
            } else {
                res.render('../views/comment', {post: row[0], comments : {} });
            }
        }).catch(err => {
            console.log(err);
        })
    }

});

// addcomment  endpoint to add coment topic
router.post('/addcomment', function (req, res) {

    var arr = req.body.tid.split(',');

            //only create table if it is zero comments
            if (arr[1] === '0') {
                var sql1 = `CREATE TABLE th${arr[0]} (commentid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid INT NOT NULL, commentdetails TEXT(6000) NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
                db.query(sql1, function (err1, result1) {

                });
            }

            // query = `INSERT INTO th${arr[0]} (userid, commentdetails, posted) VALUES (10, '${req.body.desc}', NOW())`;

            // db.query(`SELECT * FROM th${arr[0]}`, function(err3, result3){
            //     var count = result3.length;
            //     db.query(`UPDATE TOPICS SET comments = '${count + 1}' WHERE topicid = ${arr[0]}`, function (err, result) {

            //     });
            // });


    res.redirect(`/comment?topic=${arr[0]}`);

});

module.exports = router;