const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'webdatabase.c5evzls879tt.us-west-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'Password1',
    database: 'forumproject'
});

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
    // var sql = 'CREATE TABLE TOPICS (topicid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid INT NOT NULL, topicname VARCHAR(100) NOT NULL, topicdetails TEXT(6000) NOT NULL, points INT NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP, comments json NOT NULL)';
    // var sql = 'CREATE TABLE TOPICS (topicid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP, comments json NOT NULL)';

    // var sql = 'DROP TABLE TOPICS';
    // connection.query(sql, function (err, result) {
    //     if (err) throw err;
    //     console.log("Table created");
    // });

});

module.exports = connection;