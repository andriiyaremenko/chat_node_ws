var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var messages = [];
var users = [];
var getNames = function(arr){
  var result = arr.map(function(el){return el.name;});
  return result;
};

var sendMessage = function(usersArr, msg, newcomer){
  if(msg.to.length > 1){
    var recieversArr = usersArr.filter(function(el){return msg.to.indexOf(el.name) != -1;});
    for(var i = 0; i < recieversArr.length; i++){
      io.to(recieversArr[i].socketId).emit('chat message', msg.senderName + ": " + msg.newMessage);
    }
  }else if (newcomer){
    io.to(usersArr[0].socketId).emit('chat message', msg.senderName + ": " + msg.newMessage);
  }else{
    io.emit('chat message', msg.senderName + ": " + msg.newMessage);
  }

}

app.get('/', function(req, res){
  res.sendfile('chat.html');
});

io.on('connection', function(socket){
  socket.on('init', function(){
    io.to(socket.id).emit('users connected', getNames(users));
  });

  socket.on('join', function(name){
    var newUser = {name: name, socketId: socket.id};
    users.push(newUser);
    io.emit('join data', name);
    for(var i = 0; i < messages.length; i++){
      sendMessage([newUser], messages[i], true);
    }
    io.emit('chat message', name +  " is connected!");
    console.log("Connected: " + name);
  });

  socket.on('chat message', function(msg){
    sendMessage(users, msg);
    messages.push(msg);
    console.log(messages);
  });

});

http.listen(3000, function(){
  console.log('listening on *: 3000');
});
