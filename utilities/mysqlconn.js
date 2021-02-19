const mysql = require('mysql2/promise');

// Pool connection to the database.
const connection = mysql.createPool({
    host: process.env.DATABASE_HOST,
    port: 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    multipleStatements: true,
    database: process.env.DATABASE_NAME
});

    console.log("Connected to SQL server!");
    // QUERIES TO CREATE THE DIFFERENT TABLES
    // var sql1 = 'CREATE TABLE TOPICS (topicid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, userid VARCHAR(100) NOT NULL, username VARCHAR(100) NOT NULL, topicname VARCHAR(100) NOT NULL, topicdetails TEXT(6000) NOT NULL, points INT NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP, comments INT NOT NULL)';
    // var sql1 = `CREATE TABLE COMMENTS (commentid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, topicid INT NOT NULL, userid VARCHAR(100) NOT NULL, username VARCHAR(100) NOT NULL, commentdetails TEXT(6000) NOT NULL, posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP, points INT NOT NULL)`;
    // var sql = `CREATE TABLE USERS (userid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL, fname VARCHAR(100) NOT NULL, lname VARCHAR(100) NOT NULL, password VARCHAR(255), )`;
    // var sql1 = 'CREATE TABLE TLIKES (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, topicid INT NOT NULL, userid VARCHAR(100) NOT NULL)'
    // var sql1 = 'CREATE TABLE CLIKES (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, commentid INT NOT NULL, userid VARCHAR(100) NOT NULL)'

    // connection.query(sql1).then(row => {
    //     console.log("Created");
    // }).catch(err =>{
    //     console.log(err)
    // })

module.exports = connection;
