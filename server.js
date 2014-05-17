//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081);


var crypto = require('crypto');
var nforce = require('nforce');


var trelloToken = process.env.TRELLO_TOKEN || 'null';

//Setup Express
var server = express.createServer(


  );
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
server.listen( port);




function verifyTrelloWebhookRequest(request, secret, callbackURL) {
  var hash = crypto.createHmac('sha1', secret).update(request.body + callbackURL);

  return hash.digest('base64') == request.headers['x-trello-webhook'];
}




//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});

//SALESFORCE

// var clientId = process.env.SF_CLIENT_ID || null;
// var clientSecret = process.env.SF_CLIENT_SECRET || null;
// var redirectUri = process.env.SF_REDIRECT_URI || null;
// var environment = process.env.SF_ENVIRONMENT || 'sandbox';
// var username = process.env.SF_USERNAME || null;
// var password = process.env.SF_PASSWORD || null;


// var org = nforce.createConnection({
//   clientId: clientId,
//   clientSecret: clientSecret,
//   redirectUri: redirectUri,
//   environment: environment,  // optional, salesforce 'sandbox' or 'production', production default
//   mode: 'multi' // optional, 'single' or 'multi' user mode, multi default
// });

// var oauth;
// org.authenticate({ username: username, password: password}, function(err, resp){
//   // store the oauth object for this user
//   if (err) {
//     console.log(err.message);
//   } else {
//     oauth = resp;
//   makeQuery();
//   console.log("Success");
//   }
// });

// function makeQuery() {
//   var q = "SELECT Id, Name, Completed__c, Completed_Date__c FROM Story__c WHERE Trello_Card_Id__c = '537781ee0b6bb9240a17710e' LIMIT 1";

//   org.query({ query: q, oauth: oauth }, function(err, resp){

//     if(!err && resp.records) {

//     var acc = resp.records[0];
//     acc.set('Completed__c', true);
//     var date = new Date();
//     acc.set('Completed_Date__c', date.toISOString());

//     org.update({ sobject: acc, oauth: oauth }, function(err, resp){
//       if(!err) {
//       console.log('It worked!');
//       } else {
//       console.log(err.message);
//       }
//     });

//     } else {
//     console.log(err.message);
//     }
//   });
// }



///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////


var messages = ['Here are the messages', 'Second one'];

server.get('/', function(req,res){
  res.end(messages.toString());
});

server.get('/hooks', function(req,res){
  res.send(200);
});

server.post('/hooks', function(req,res){
  messages.push(JSON.stringify(req.body, null, 2));
  var hook = req.body;
  processHook(hook);
  res.send(200);
});


function processHook(hook) {
  if(isCardMovement(hook)) {
    sendCardMovement(hook);
  }
}

function isCardMovement(hook) {
  if(hook.action.type == 'updateCard' && hook.action.data.listAfter != undefined) {
    return true;
  }
  return false;
}

function sendCardMovement(hook) {
  console.log("CARD MOVED!");
}


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
console.log('Trello token ' + trelloToken );
