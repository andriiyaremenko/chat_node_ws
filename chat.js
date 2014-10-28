var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var messages = [];
var users = [];
var getNames = function(arr){
  var result = arr.map(function(el){return el.name;});
  return result;
};

var sendMessage = function(msgObj, toArr){
  var msg = {senderName: msgObj.senderName, newMessage: msgObj.newMessage}
  if(toArr){
    for(var i = 0; i < toArr.length; i++){
      io.to(toArr[i].socketId).emit('chat message', msg);
    }
  }else{
    io.emit('chat message', msg);
  }
}

var messageManager = function(msg, usersArr, newcomer){
  if(msg.to.length > 1){
    var recieversArr = usersArr.filter(function(el){return msg.to.indexOf(el.name) != -1;});
    sendMessage(msg, recieversArr);
  }else if (msg.to.lengt = 1 && newcomer){
    sendMessage(msg, usersArr);
  }else{
    sendMessage(msg);
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
      messageManager(messages[i], [newUser], true);
    }
    messageManager({senderName: name, newMessage: name + " is connected!", to: []});
    console.log("Connected: " + name);
  });

  socket.on('chat message', function(msg){
    messageManager(msg, users);
    messages.push(msg);
  });

});

http.listen(3000, function(){
  console.log('listening on *: 3000');
});
