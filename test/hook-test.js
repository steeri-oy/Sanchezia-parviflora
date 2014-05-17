var trelloHookUri = process.env.TRELLO_HOOK_URL || null;
var callBackUrl = ADDURLHERE
var boardId = 537747bc30c9e56126e2b9bd;


var postData = {
    description: "My third webhook",
    callbackURL: callBackUrl,
    idModel: boardId
};
require('request').post({
    uri: trelloHookUri,
    headers:{'content-type': 'application/x-www-form-urlencoded'},
    body:require('querystring').stringify(postData)
    },function(err,res,body){
        console.log(body);
        console.log(res.statusCode);
});