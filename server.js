//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081);


var crypto = require('crypto');


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


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////


var messages = ['Here are the messages', 'Second one'];

server.get('/', function(req,res){
  res.end(messages.toString());
});

server.get('/hooks', function(req,res){
  console.log(req.body);

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

  console.log(hook.action.data.listAfter);
  if(hook.action.type == 'updateCard' && hook.action.data.listAfter != undefined) {
    console.log("MOVEMENT");
    return true;
  }
  console.log("NO MOVEMENT");
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
