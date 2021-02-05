
const express = require('express');
const router = express.Router();
const db = require('../utlities/mysqlconn');


const bodyParser = require('body-parser');

// urlencoded to help extract data from form
router.use(bodyParser.urlencoded({ extended: true }));

// Add endpoint to insert into list of topics
router.post('/addpost', function (req, res) {

    getResult(req, 'addpost');

    res.redirect('/');

});

// edit endpoint to edit topic
router.post('/editpost', function (req, res) {

    getResult(req, 'editpost');

    res.redirect('/');

});

// delete endpoint to delte topic
router.post('/deletepost', function (req, res) {

    getResult(req, 'deletepost');

    res.redirect('/');

});

// delete endpoint to delte topic
router.post('/addcomment', function (req, res) {

    getResult(req, 'addcomment');

    var arr = req.body.tid.split(',');
    res.redirect(`/comment?topic=${arr[0]}`);

});

//Function to make the insert, edit and deletes into the database
async function getResult(req, router) {

    try {

        let query;

        if (router === 'addpost') {
            var fakeuserid = 14;
            //Query to add post
            query = `INSERT INTO TOPICS (userid, topicname, topicdetails, points, posted, comments) VALUES ( ${fakeuserid} , '${req.body.title}' , '${req.body.desc}' , 0, NOW(), 0)`;

        } else if (router === 'editpost') {
            //Query to edit the post
            query = `UPDATE TOPICS SET topicname = '${req.body.title}', topicdetails = '${req.body.desc}' WHERE topicid = ${req.body.tid} `;

        } else if (router === 'deletepost') {
            if (req.body.tid !== "No") {

                //Query to delete post
                query = `DELETE FROM TOPICS WHERE topicid = ${req.body.tid} `;

            }
        } else if (router === 'addcomment') {

            var arr = req.body.tid.split(',');

            //only create table if it is zero comments
            if (arr[1] === '0') {
                var sql1 = `CREATE TABLE th${arr[0]} (commentid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid INT NOT NULL, commentdetails TEXT(6000) NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
                db.query(sql1, function (err1, result1) {

                });
            }

            var sql2 = `INSERT INTO th${arr[0]} (userid, commentdetails, posted) VALUES (10, '${req.body.desc}', NOW())`;
            db.query(sql2, function (err2, result2) {

            });

            db.query(`SELECT * FROM th${arr[0]}`, function(err3, result3){
                var count = result3.length;
                db.query(`UPDATE TOPICS SET comments = '${count}' WHERE topicid = ${arr[0]}`, function (err, result) {

                });
            });



            //  //Creating a new comment table, it will not create if already there
            // var sql = `CREATE TABLE th${req.body.tid} (commentid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid INT NOT NULL, commentdetails TEXT(6000) NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
            // // var sql2 = `SELECT * FROM th${req.body.tid}`;
            // let count;
            // db.query(`${sql}`, function (err, result) {
            //     console.log(result);
            // });            



            // query1 = `INSERT INTO th${req.body.tid} (userid, commentdetails, posted) VALUES (10, '${req.body.desc}', NOW())`;
            // query2 = `UPDATE TOPICS SET comments = '${count + 1}' WHERE topicid = ${req.body.tid}`;

            // //Creating a new comment table, it will not create if already there
            // var sql = `CREATE TABLE th${req.body.tid} (commentid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid INT NOT NULL, commentdetails TEXT(6000) NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
            // db.query(sql, function (err, result) {

            // });            

            // var count;

            // db.query(`SELECT * FROM th${req.body.tid}`, (err2, result2) => {
            //     count = result2.length;
            //     // console.log(count)
            // });

            // // console.log(count);

            // // var sqlupdatecomment = `UPDATE TOPICS SET comments = '${count + 1}' WHERE topicid = ${req.body.tid}`;
            // db.query(`UPDATE TOPICS SET comments = '${count + 1}' WHERE topicid = ${req.body.tid}`, function (err, result) {
            //     console.log(count)

            // });
            query = `SELECT * FROM th${arr[0]}`;
        }

        db.query(query, (err, results) => {
            if (err) throw err;
        });


    } finally {
        // if (db && db.end) db.end();
    }

}

module.exports = router;