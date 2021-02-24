const db = require('../utilities/mysqlconn');

// Function to handle the errors from the database
function handleDBError(error) {
    console.log("DB Error: " + error);
    throw error;
}

/**
 * Function to add a new post to the database
 * @param {The user id} userid 
 * @param {The username} username 
 * @param {The topic title} topictitle 
 * @param {The topic description} topicdesc 
 */
exports.addPost = function addPost(userid, username, topictitle, topicdesc) {
    // Query to add topic to databse
    var query = `INSERT INTO TOPICS (userid, username, topicname, topicdetails, points, posted, comments) VALUES ( ? , ?, ? , ? , 0, NOW(), 0);`;
    return db.query(query, [userid, username, topictitle, topicdesc]).catch(error => { return handleDBError(error) });
}

/**
 * Function that queries the db to edit the post
 * @param {The topic title} topictitle 
 * @param {The new edited body} topicdetails 
 * @param {The topic id to be edited} topicid 
 */
exports.editPost = function editPost(topictitle, topicdetails, topicid) {
    // Query to edit the post
    var query = `UPDATE TOPICS SET topicname = ?, topicdetails = ? WHERE topicid = ? ;`;
    return db.query(query, [topictitle, topicdetails, topicid]).catch(error => { return handleDBError(error) });
}

/**
 * Function to delete the post. It also deletes the comments associated and also deletes the likes associated
 * @param {The topic id to delete} topicid 
 */
exports.deletePost = function deletePost(topicid) {
    // Query db for the delete post
    var query = `DELETE FROM TOPICS WHERE topicid = ? ; DELETE FROM COMMENTS WHERE topicid = ?; DELETE FROM TLIKES WHERE topicid = ?`;
    return db.query(query, [topicid, topicid, topicid]).catch(error => { return handleDBError(error) });
}

/**
 * Function adds a comment, also updates the comment count
 * @param {The topic id to be commented on} topicid 
 * @param {The user id} userid 
 * @param {The username} username 
 * @param {The new comment} comment 
 */
exports.addComment = function addComment(topicid, userid, username, comment) {
    // Query to add Comments
    query = `INSERT INTO COMMENTS (topicid, userid, username, commentdetails, posted, points) VALUES (?, ?, ?, ?, NOW(), 0); UPDATE TOPICS SET comments = comments+1 WHERE topicid = ?;`;
    return db.query(query, [topicid, userid, username, comment, topicid]).catch(error => { return handleDBError(error) });
}

/**
 * Function to edit the comment
 * @param {The new comment body} commentdetails 
 * @param {The comment to be edited} commentid 
 */
exports.editComment = function editComment(commentdetails, commentid) {
    // Query to edit the post
    query = `UPDATE COMMENTS SET commentdetails = ? WHERE commentid = ?;`;
    return db.query(query, [commentdetails, commentid]).catch(error => { return handleDBError(error) });
}

