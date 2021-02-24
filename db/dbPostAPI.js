const db = require('../utilities/mysqlconn');

// Function to handle the errors from the database
function handleDBError(error) {
    console.log("DB Error: " + error);
    throw error;
}

/**
 * 
 * @param {*} userid 
 * @param {*} username 
 * @param {*} topictitle 
 * @param {*} topicdesc 
 */
exports.addPost = function addPost(userid, username, topictitle, topicdesc) {
    // Query to add topic to databse
    var query = `INSERT INTO TOPICS (userid, username, topicname, topicdetails, points, posted, comments) VALUES ( ? , ?, ? , ? , 0, NOW(), 0);`;
    return db.query(query, [userid, username, topictitle, topicdesc]).catch(error => { return handleDBError(error) });
}

exports.editPost = function editPost(topictitle, topicdetails, topicid) {
    // Query to edit the post
    var query = `UPDATE TOPICS SET topicname = ?, topicdetails = ? WHERE topicid = ? ;`;
    return db.query(query, [topictitle, topicdetails, topicid]).catch(error => { return handleDBError(error) });
}

exports.deletePost = function deletePost(topicid) {
    // Query db for the delete post
    var query = `DELETE FROM TOPICS WHERE topicid = ? ; DELETE FROM COMMENTS WHERE topicid = ?; DELETE FROM TLIKES WHERE topicid = ?`;
    return db.query(query, [topicid, topicid, topicid]).catch(error => { return handleDBError(error) });
}

exports.addComment = function addComment(arr, userid, username, comment) {
    // Query to add Comments
    query = `INSERT INTO COMMENTS (topicid, userid, username, commentdetails, posted, points) VALUES (?, ?, ?, ?, NOW(), 0); UPDATE TOPICS SET comments = comments+1 WHERE topicid = ?;`;
    return db.query(query, [arr, userid, username, comment, arr]).catch(error => { return handleDBError(error) });
}

exports.editComment = function editComment(commentdetails, commentid) {
    // Query to edit the post
    query = `UPDATE COMMENTS SET commentdetails = ? WHERE commentid = ?;`;
    return db.query(query, [commentdetails, commentid]).catch(error => { return handleDBError(error) });
}

