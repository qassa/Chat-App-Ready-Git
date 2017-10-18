var express = require('express');
var antiSpam = require('socket-anti-spam');
var app = express();
//в отличие от index1.js все require вынесены вверх
var port = 3700;
io = require('socket.io').listen(app.listen(port));

antiSpam.init({
	banTime: 0.1,
	kickThreshold: 10,
	kickTimesBeforeBan: 2,
	banning: true,
	heartBeatStale: 40,
	heartBeatCheck: 4,
	io: io,
})

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
	res.render("page");
});

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function(socket){
	socket.emit('message', {message: 'welcome to the chat'});
	console.log('Выполнено подключение нового пользователя к чату');

	socket.on('send',function (data){
		io.sockets.emit('message', data);
		antiSpam.addSpam(socket);
	});
});

antiSpam.event.on('ban', (socket, data) => {
	console.log('пользователь '+socket+' был заблокирован\n');
	console.log(data);
})

antiSpam.event.on('spamscore', (socket, data) => { 
	console.log(data.score)
})


console.log("Listening on port "+port);