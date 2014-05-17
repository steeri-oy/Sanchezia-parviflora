var trelloHookUri = 'https://trello.com/1/tokens/[USER_TOKEN]/webhooks/?key=[APPLICATION_KEY]';

var postData = {
    description: "to salesforce",
    callbackURL: "http://shrouded-dusk-4946.herokuapp.com/hooks",
    idModel: "537747bc30c9e56126e2b9bd"
};

require('request').post({
    uri: trelloHookUri,
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: require('querystring').stringify(postData)
    }, function(err,res,body) {
        console.log(body);
        console.log(res.statusCode);
});