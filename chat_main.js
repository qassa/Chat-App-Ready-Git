var io, antiSpam, spamCheckEmit, spamCheckOn, emit, timingHelper, messageLimit;

var Chat = function(app){
	io = require('socket.io').listen(app);
	antiSpam = require('socket-anti-spam');
	timingHelper = require('./timing_helper')(antiSpam);
	Emitter = require('events').EventEmitter;
	//emit = Emitter.prototype.emit;
	ioInited(io); antiSpamInited(antiSpam);

	spamCheckEmit = ["connection","connect","disconnect","disconnecting","message","send",'message_limit']; //возможно добавить disconnect, disconnecting
	spamCheckOn = ["connection","send"]; //добавить connecting, connect
	antiSpam.init({
		kickThreshold: 3,
		kickTimesBeforeBan: 1,
		banning: true,
		heartBeatStale: 40,
		heartBeatCheck: 4,
		io: io,
	})
}

module.exports = Chat;

var ioInited = function(){
	io.sockets.on('connection', function(socket){
		//все отлавливаемые события обрабатываются в функции emit_emits, кроме 'connect' и 'connection', т.к. они вызываются на объекте sockets и не обрабатываются socket-anti-spam и выполнить эту обработку в теле функции emit_emits не получится, т.к. это приведет к рекурсивным вызовам
		//это единственная строка, где addSpam вызывается принудительно, все остальные вызовы вынесены в функцию emit_emits
		antiSpam.addSpam(socket);

		var onevent = socket.onevent;
		socket.onevent = function(packet){
			var args = packet.data || [];
			onevent.call(this,packet);
			packet.data = ["*"].concat(args);
			onevent.call(this, packet); //таким образом, для каждого события, создаваемого на клиенте, выполнится как минимум событие *, если для события зарегистрированы дополнительные обработчики, то они также выполнятся (проще - каждое событие будет обработано 2 раза)
		}

		//полуачем ссылку на socket.emit, переопределяем функцию, проверяем на несуществующие обработчики вызовы всех emit на объекте socket
		var emit = socket.emit;

		//console.log('объект emit ',emit);

		//библиотека socket-anti-spam берет на себя обработку событий disconnection, disconnect. connection, connect и другие события для обекта sockets не увеличивают spamScore
		//события disconnection, disconnect вызываются как правило на объекте emit
		//события connection, connect вызываются на emits
		//пока что убираем проверку на всех sockets, т.к. пользователь инициирует события на emits только при выполнении подключения. Другими словами, неясно как пользователь может самостоятельно генерировать события для объекта sockets, если у него на него даже нет ссылки. Но с другой стороны, если генерация sockets.emit выполняется на серверной стороне, тогда почему не генерируются предварительные события 'connect' и 'connection' для отдельного socket
		//var emits = io.sockets.emit;

		//var on = socket.on;
		//console.log('вот что находится внутри on ',on);
		//var ons = io.sockets.on;
//
		//on_ons = function(arguments, on){
			//if (spamCheckOn.contains(arguments[0]) == false){
				//antiSpam.addSpam(socket);
				//console.log(arguments[0],' такого on обработчика не существует');
			//}
			//else{
				//console.log(arguments[0],' такой обработчик on существует');
				//on.bind(socket, arguments[0], arguments[1]);
			//}
		//}

		emit_emits = function(arguments, emit, sender){ //sender указывает, было событие отправлено socket или sockets
			data = Array.prototype.slice.call(arguments);
			//if (spamCheckEmit.contains(data[0])){
			//	antiSpam.addSpam(socket);

			//}
			console.log('я добрался до проверки обработчиков');
			if (spamCheckEmit.contains(data[0]) == false){
				antiSpam.addSpam(socket);
				console.log(data[0],' такого обработчика не существует');
			}
			else{
				console.log(data[0],' такой обработчик присутствует');
				emit.apply(socket, arguments);
			}
		}

		socket.emit = function(){
			emit_emits(arguments, emit, 'emit');
		}

		//io.sockets.emit = function(){
			//emit_emits(arguments, emits, 'emits');
		//}

		//socket.on = function(){
			//on_ons(arguments, on);
		//}
//
		//io.sockets.on = function(){
			//on_ons(arguments, ons);
//		}
		

		//отправка клиенту максимально допустимой длины сообщения сращу после подключения
		length = max_message_length();
		socket.emit('message_limit', {limit: length});

		socket.emit('message', {message: 'welcome to the chat'});
		console.log('Выполнено подключение нового пользователя к чату');

		socket.on('send',function (data){
			//в этом месте, сразу после получения данных от клиента у нас приходит undtrusted data, которую надо проверить
			//sanitizer уже подключен, проверяем работоспособность для отдельных строк
			data.message = sanitize(data.message);
			data.message = data.username+': '+data.message;
			console.log('что получилось с data ',data);
			io.sockets.emit('message', data);
			antiSpam.addSpam(socket);
		});

//		socket.on('max_message_size', function(socket){
//			if (socket != null)
//				socket.emit('message_limit', messageLimit);
//		});

		socket.on('disconnecting', function(){
			antiSpam.disconnectUser(socket);
			timingHelper.tryRemoveSocket(socket);
		});

		socket.on('*',function(event, data){
			console.log(event, 'обработано событие с клиента');
		});

	});
}

var antiSpamInited = function(){
	messageLimit = antiSpam.max_message_length;

	antiSpam.event.on('ban', (socket, data) => {
	  console.log('пользователь '+socket+' был заблокирован\n');
	  console.log(data);
	});

	antiSpam.event.on('spamscore', (socket, data) => { 
  		console.log(data.score)
	});

	antiSpam.event.on('newAuthenticated', (socket) =>{
		timingHelper.traceSocket(socket);
		console.log('аутентификация нового клиента');
	});

	Array.prototype.contains = function(k){
		for (var p in this)
			if (this[p] === k)
				return true;
		return false;
	}
}