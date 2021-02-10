const rp = require('request-promise');
const parseXML = require('xml2js').parseString;

let getUser = async function (parsed, url) {
    const json = JSON.parse(parsed);
    var options = {
        url: `https://${url}/v2/profile/user/user/${json.userId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + json.access_token, //Access token provided from above response
            'x-osp-appId': process.env.CLIENT_ID, //"3694457r8f"
            'x-osp-userId': json.userId //userId provided from above response
        }
    };

    let generate = await rp(options);
    let profile = await extractProfileInfo(generate, json.access_token);

    return profile;
}


function extractProfileInfo(body, accessToken) {
    return new Promise(function (resolve, reject) {
        parseXML(body, function (err, obj) {
            if (err) {
                return reject("parse: " + err);
            } else {
                try {
                    var guid = obj.UserVO.userID[0];
                    var userName = obj.UserVO.userBaseVO[0].userName[0];
                    var nameInfo = obj.UserVO.userBaseVO[0].userBaseIndividualVO[0];
                    var email = "";
                    obj.UserVO.userIdentificationVO.forEach(function (x) {
                        if (x.loginIDTypeCode[0] === "003") {
                            email = x.loginID[0];
                        }
                    });
                    var lname = (nameInfo ? nameInfo.familyName[0] : " ");
                    var fname = (nameInfo ? nameInfo.givenName[0] : " ");
                    var profileImg = "";
                    if (obj.UserVO.userBaseVO[0].photographImageFileURLText) {
                        profileImg = obj.UserVO.userBaseVO[0].photographImageFileURLText[0];
                    }

                    var profileJSON = {
                        "guid": guid,
                        "name": userName,
                        "email": email,
                        "token": accessToken,
                        "lastName": (lname || " "),
                        "firstName": (fname || " "),
                        "profileImg": profileImg
                    };
                    return resolve(profileJSON);
                } catch (ex) {
                    return reject("parse: " + ex);
                }
            }
        });
    });
}

module.exports = getUser;