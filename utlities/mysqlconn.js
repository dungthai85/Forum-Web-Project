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
//     // var sql = 'CREATE TABLE TOPICS (topicid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid INT NOT NULL, topicname VARCHAR(100) NOT NULL, topicdetails TEXT(6000) NOT NULL, points INT NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP, comments INT NOT NULL)';


//     // var sql = 'DROP TABLE TOPICS';
//     // connection.query(sql, function (err, result) {
//     //     // if (err) throw err;
//     //     console.log("Table created");
//     //     console.log(err.code);
//     // });

//     // connection.query('SELECT * FROM TOPICS', (err, results) => {
//     //     if (err) throw err;
//     //     console.log(results);
//     // });

// });

module.exports = connection;