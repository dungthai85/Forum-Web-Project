const db = require('../utilities/mysqlconn');

// Function to handle the errors from the database
function handleDBError(error) {
    console.log("DB Error: " + error);
    throw error;
}

/**
 * Function to get count and return list of topics and calls a function to calculate the pagination
 * @param {Contains the request} req 
 */
exports.getTopics = function getTopics(req) {
    // First Query to get the count for pagination
    var query1 = `SELECT COUNT(topicid) as tablelength FROM TOPICS;`;
    return db.query(query1).then(rows => {
        // Calculation for pagination
        var page = pagination(req, rows[0][0].tablelength, 8);
        // Query 2 to get the table from start of page to end of page
        var query2 = `SELECT * FROM TOPICS ORDER BY topicid DESC LIMIT ?, ?;`;
        return [db.query(query2, [page.countStart, page.countEnd]), page];
    }).catch(err => { return handleDBError(err) });
}

/**
 * Function returns the likes from the user in the current topics
 * @param {Contains the request} req 
 * @param {Takes in the tbale of topics} tableTopics 
 */
exports.getTLikes = function getLikes(req, tableTopics) {
    //Calculate the like display, checks user and all their topic likes
    var currentTopicNum = [];
    for (const [key, value] of Object.entries(tableTopics)) {
        currentTopicNum.push(tableTopics[key].topicid);
    }
    //Final query to get likes from table for user
    var query3 = `SELECT * FROM TLIKES WHERE userid = ? AND topicid IN (${currentTopicNum.length === 0 ? 0 : currentTopicNum.join(',')});`;
    return db.query(query3, req.user.id).then(tlikes => {return tlikes[0]}).catch(err => { return handleDBError(err) });
}

/**
 * Function Gets the count from the comment table and calls the function to calulate the paginantion and returns the table for current comments
 * @param {Contains the request} req 
 */
exports.getComments = function getComments(req) {
    var topicid = req.query.topic;
    var tableTopics;
    if (topicid) {
        //First query to get the count and the topic
        var query1 = `SELECT * FROM TOPICS WHERE topicid = ?; SELECT COUNT(commentid) as commentlength FROM COMMENTS WHERE topicid = ?;`;
        return db.query(query1, [topicid, topicid]).then((row) => {
            // Calculation for pagination
            var page = pagination(req, row[0][1][0].commentlength, 10);
            tableTopics = row[0][0];
            // Second query to get table for comments
            var query2 = `SELECT * FROM COMMENTS WHERE topicid = ? ORDER BY commentid LIMIT ?, ?;`;
            return [db.query(query2, [topicid, page.countStart, page.countEnd]), page, tableTopics];
        });
    }
}

/**
 * Function returns the likes from both of the tables for the current comments and tpoic
 * @param {Contains the request} req 
 * @param {The table of current comments} tableComments 
 */
exports.getCLikes = function getCLikes(req, tableComments) {
    var topicid = req.query.topic;
    //Calculate the like display, checks user and all their topic likes
    var currentCommentNum = [];
    for (const [key, value] of Object.entries(tableComments)) {
        currentCommentNum.push(tableComments[key].commentid);
    }
    // Final query to get likes from topics and comments from current user
    var query3 = `SELECT * FROM TLIKES WHERE userid = ? and topicid = ?; SELECT * FROM CLIKES WHERE userid = ? AND commentid IN (${currentCommentNum.length === 0 ? 0 : currentCommentNum.join(',')});`;
    return db.query(query3, [req.user.id, topicid, req.user.id]).then((likes) => {return likes}).catch(err => { return handleDBError(err) });
}

/**
 * Function calls the single topic to be deleted or edited
 * @param {Current topic id} topicid 
 */
exports.getSinglePost = function getSinglePost(topicid) {
    // Query db for the topic to edit/delete
    var query = `SELECT * FROM TOPICS WHERE topicid = ?;`;
    return db.query(query, [topicid]).then(row => {return row});
}

/**
 * Function updates the database with the new likes for the topic
 * @param {Current topic id} topicid 
 * @param {Current user id} userid 
 */
exports.updateTopicLikes = function updateTopicLikes(topicid, userid, like) {
     // Query to get the row
     if (like) {
        var query = `UPDATE TOPICS SET points = points - 1 WHERE topicid = ?; DELETE FROM TLIKES WHERE topicid = ? AND userid = ?`;
        return db.query(query, [topicid, topicid, userid]).catch(err => { return handleDBError(err) });
     } else {
        var query = `UPDATE TOPICS SET points = points + 1 WHERE topicid = ?; INSERT INTO TLIKES (topicid, userid) VALUES ( ? , ?);`;
        return db.query(query, [topicid, topicid, userid]).catch(err => { return handleDBError(err) });
     }
}

/**
 * Function queries a single comment to be edited
 * @param {Current comment id} commentid 
 */
exports.editSingleComment = function editSingleComment(commentid) {
    // Query db for the topic to edit
    var query = `SELECT * FROM COMMENTS WHERE commentid = ?;`;
    return db.query(query, [commentid]).then(rows => {return rows}).catch(err => {return handleDBError(err)});
}

/**
 * function updates the comments table and selects the current comments to be displayed and also insert likes into like table
 * @param {Current topic id} topicid 
 * @param {Current user id} userid 
 */
exports.updateCommentLikes = function updateCommentLikes(topicid, userid, like) {
    // Query to update the comment likes
    if (like) {
        var query = `UPDATE COMMENTS SET points = points - 1 WHERE commentid = ? ; SELECT * FROM COMMENTS WHERE commentid = ?; DELETE FROM CLIKES WHERE commentid = ? AND userid = ?;`;
        return db.query(query, [topicid, topicid, topicid, userid]).then(rows => {return rows}).catch(err => {return handleDBError(err)});
    } else {
        var query = `UPDATE COMMENTS SET points = points + 1 WHERE commentid = ? ; SELECT * FROM COMMENTS WHERE commentid = ?; INSERT INTO CLIKES (commentid, userid) VALUES ( ? , ?);`;
        return db.query(query, [topicid, topicid, topicid, userid]).then(rows => {return rows}).catch(err => {return handleDBError(err)});
    }
}

exports.deleteComment = function deleteComment(commentid, topicid) {
        // Query db to delete comment
        var sql = `DELETE FROM COMMENTS WHERE commentid = ?; UPDATE TOPICS SET comments = comments - 1 WHERE topicid = ?; DELETE FROM CLIKES WHERE commentid = ?`;
        return db.query(sql, [commentid, topicid, commentid]).then(row => {return row}).catch(error => {return handleDBError(error)});
}

/**
 * Function does the calculation for pagination
 * @param {Contains the request} req 
 * @param {The total size of the current table} tsize 
 * @param {How many items to be displayed per page} perPage 
 */
function pagination(req, tsize, perPage) {
        // Calculation for pagination
        var totalsize = tsize;
        var pagesize = perPage;
        var pagecount = Math.ceil(totalsize / pagesize);
        var currentpage = req.query.page ? parseInt(req.query.page) : 1;
        var start = (currentpage * pagesize) - pagesize;
        var end = start + pagesize - 1;
        var endquery = pagesize;
        if (end > totalsize) {
            endquery = totalsize - start;
            end = totalsize - 1
        }

        return {
            totalSize: totalsize,
            pageSize: pagesize,
            pageCount: pagecount,
            currentPage: currentpage,
            countStart: start,
            countEnd: endquery
        };
}


