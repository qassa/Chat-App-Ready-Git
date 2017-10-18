document.onreadystatechange = function() {
	if (document.readyState == "complete"){
	var messages = [];

	//var socket = io({
	//	'reconnection': false
	//	'reconnection': 'false'
	//});
	//socket.connect('http://localhost:3700');

	//var socket = io.connect('http://localhost:3700');

	var socket;
	var connect = function(){
		socket = new io.connect('http://localhost:3700', {
    		'reconnection': false
		});
	}();

	var field = document.getElementById("field");
	var sendButton = document.getElementById("send");
	var content = document.getElementById("content");
	var errorSpace = document.getElementById("message_control");
	var name = document.getElementById("name_holder");

	var message_limit, text;

	socket.on('message', function (data){
		if (data.message) {
			messages.push(data.message);
			//var html = '';
			//for (var i=0; i<messages.length; i++){
			//	html += messages[i] + '<br />';
			//}
			content.innerHTML += data.message + '<br />';
		} else {
			console.log("There is a problem:", data);
		}
	});

	socket.on('message_limit', function(data){ //вообще при каждом вызове on() происходит добавлении функции к списку вызываемых, поэтому это лучше вынести в те части, которые будут выполняться один раз, чтобы там на них один раз подписаться (изначально выводилось из sendButton.onClick)
		message_limit = data.limit;
	});

	sendButton.onclick = function() {
		text = field.value;
		var messageSize = text.length;
		if (messageSize == 0)
			socket.emit('max_message_size');

		if (messageSize >= message_limit){
			errorSpace.style.display = 'block';
			errorSpace.innerHTML = 'Текст сообщения превышает '+message_limit+' символов';
			setTimeout(function(){errorSpace.style.display = 'none';}, 5000);
		}
		else{
			console.log(messageSize);
			console.log(message_limit);
			socket.emit('send', {message: text, username: name.value});
			socket.emit('i don\'t exist', );
			socket.emit('i don\'t exist', 'send 1 param');
		}

		//если передали message - обычная отправка сообщения, если передали message1 - спам вызовом большого количества раз функции emit('non_existing') с несуществующим обработчиком
		//if (text == "message"){
		//	socket.emit('send', {message: text});			
		//}

		//else {
		//	x=0;
		//	while(x<10000){
		//	socket.emit('some_emit_string_value');
		//	x++;
		//	console.log('отправка спама emit закончена');
		//	}
		//	socket.emit('send', {message: text});
		//}
	};
}
}