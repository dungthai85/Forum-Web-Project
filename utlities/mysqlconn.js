const mysql = require('mysql2/promise');
const connection = mysql.createPool({
    host: 'webdatabase.c5evzls879tt.us-west-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'Password1',
    multipleStatements: true,
    database: 'forumproject'
});

// connection.connect((err) => {
//     if (err) throw err;
//     console.log("Connected!");
    // var sql = 'CREATE TABLE TOPICS (topicid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid INT NOT NULL, topicname VARCHAR(100) NOT NULL, topicdetails TEXT(6000) NOT NULL, points INT NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP, comments INT NOT NULL)';

    // var sql = `CREATE TABLE COMMENTS (commentid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, topicid INT NOT NULL, userid INT NOT NULL, commentdetails TEXT(6000) NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP, points INT NOT NULL)`;

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