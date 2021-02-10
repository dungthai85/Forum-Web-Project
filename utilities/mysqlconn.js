const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: process.env.DATABASE_HOST,
    port: 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    multipleStatements: true,
    database: process.env.DATABASE_NAME
});

// connection.connect((err) => {
//     if (err) throw err;
//     console.log("Connected!");
    // var sql1 = 'CREATE TABLE TOPICS (topicid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid VARCHAR(100) NOT NULL, username VARCHAR(100) NOT NULL, topicname VARCHAR(100) NOT NULL, topicdetails TEXT(6000) NOT NULL, points INT NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP, comments INT NOT NULL)';

    // var sql1 = `CREATE TABLE COMMENTS (commentid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, topicid INT NOT NULL, userid VARCHAR(100) NOT NULL, username VARCHAR(100) NOT NULL, commentdetails TEXT(6000) NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP, points INT NOT NULL)`;

    // // var sql = `CREATE TABLE USERS (userid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL, fname VARCHAR(100) NOT NULL, lname VARCHAR(100) NOT NULL, password VARCHAR(255), )`;

        // var sql1 = 'DROP TABLE COMMENTS';

    // connection.query(sql1).then(row => {
    //     console.log("Created")
    // }).catch(err =>{
    //     console.log(err)

    // })
    // connection.query('SELECT * FROM COMMENTS').then(row => {
    //     console.table(row[0]);
    // })


    // var sql = 'DROP TABLE TOPICS';
    // connection.query(sql, function (err, result) {
    //     // if (err) throw err;
    //     console.log("Table created");
    //     // console.log(err.code);
    // });

    // connection.query('SELECT * FROM TOPICS', (err, results) => {
    //     if (err) throw err;
    //     console.table(results);
    // });

    // connection.query('SELECT * FROM COMMENTS', (err, results) => {
    //     if (err) throw err;
    //     console.table(results);
    // });

// });

module.exports = connection;