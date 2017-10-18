document.onreadystatechange = function() {
	if (document.readyState == "complete"){
	var messages = [];

	var socket = new io.connect('http://localhost:3700', {
    	'reconnection': false
	});

	var field = document.getElementById("field");
	var sendButton = document.getElementById("send");
	var content = document.getElementById("content");

	socket.on('message', function (data){
		if (data.message) {
			messages.push(data.message);
			content.innerHTML += data.message + '<br />';
		} else {
			console.log("There is a problem:", data);
		}
	});

	sendButton.onclick = function() {
		var text = field.value;
		socket.emit('send', {message: text});

		//отправка с клиента текста сообщеня очень большое кол-во раз
//		x=0;
//		while(x<100){
//			//io.connect('http://localhost:3700');
//			socket.emit('send', {message: text});
//			x++;
//		}
//
//		//отправка с клиента спама emit-ов с указанием event string, для которой не зарегистрирован обработчик
//		x=0;
//		while(x<10000){
//			socket.emit('some_emit_string_value');
//			x++;
//		}
	};
}
}