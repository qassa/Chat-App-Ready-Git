
//модуль полностью берет на себя отработку временных таймеров, которые изменяют время блокировок, взаимодействует с antispam.js -> входит в socket-anti-spam, chat_main -> parent модуль, вызывающий данный
var penaltyParams = undefined;
var sockets = [];

module.exports = function(antiSpam){
	antiSpamInited(antiSpam);

	defaultBlock = 5000;
	penaltyParams = {
		max_messages: 10,  //20
		start_block: defaultBlock,  //30 в мс
		increase_block: 2,
		previous_time: defaultBlock,
		current_block: defaultBlock //в мс
		//start_block, previous_block, current_block выставлять одинаковыми
	}

	traceSocket = function(socket){ //установить определенные правила для сокета
	//push
		if (socket != undefined){
			sockets[(sockets.push(socket)-1)].rules = penaltyParams; //push возвращает обновленное свойство length
			//console.log('сокет '+socket+'был добавлен в sockets. Его правила представлены объектом '+sockets[sockets.length-1].rules);
		}
		console.log('состав массива сокетов после добавления'+sockets.length);
	}

	tryRemoveSocket = function(socket){ //удалить сокет из списка отслеживаемых. Почему try? Потому что удаление будет производиться только в том случае, если сокет был отключен и значение свойства объекта users.desconnected == true, если бан для пользователя закончился, но он не отключался, то действие производиться не будет
		//зачем это нужно? Это нужно затем, что при простом отключении сокета на него все еще распространяются правила
		deleted = false;

		ip = antiSpam.extractIP(socket);
		for (var i=0; i<sockets.length; i++){
			if (sockets[i].ip === ip){
				obj = sockets[i];
				console.log('проверка таймера '+obj.timer);
				if(obj.timer == undefined){
					//splice
					//for (var obj in sockets){ перечисление с помощью for in не позволяет получить доступ к свойстам объекта obj. Это значит, что значение obj.ip будет undefined
					//теперь громоздкая конструкция, которая занималась извлечением номера последнео индекса для итератора Object.keys(sockets).indexOf(obj) заменяется на обычный счетчик цикла i
					antiSpam.disconnectUserFull(socket, function(deletedSocket){
						if (deletedSocket){
							deleted = deletedSocket;
							sockets.splice(i, 1); //вызов array.splice(start, deleteCount), не наоборот
							console.log('состав массива сокетов после удаления '+sockets.length);
						}
					});
				}
				break;
			}
		}
		return deleted;
	}

	changeSocketRules = function(penalty){ //установить для пользователя особенные правила

	}

	return this;
}

function refreshTimer(function1, obj, time){
	clearTimeout(obj.timer);
	obj.timer = setTimeout(function(){function1(obj)}, time);
	//в качестве первого аргумента в setTimeout передается функция (поэтому если у вызываемой функции есть аргументы, то передать их можно так function(){ yourFunc(arg1, arg2); })
}

function removeTimer(obj){
	obj.timer = undefined;
}

function antiSpamInited(antiSpam){
	antiSpam.event.on('ban', (socket, data) => { 
		for (var i=0; i<sockets.length; i++){
			if (sockets[i].ip === socket.ip){
				console.log('пользователь забанен, вот он '+antiSpam);
				obj = sockets[i];
				obj.rules.previous_time = obj.rules.current_block;
				refreshTimer(banTimer, obj, obj.rules.previous_time);
				console.log('"Timing helper": пользователь был заблокирован на '+obj.rules.current_block+' мс');
				obj.rules.current_block *= obj.rules.increase_block;
				antiSpam.changeBanDuration(socket, obj.rules.current_block/1000);
			}
			else{
				///вызов события ban для непереданного socket
			}
		}
  		
	})

	function lowerInterval(socket){
		console.log('прошли '+socket.rules.previous_time+' секунд после бана');
		var timeToSet = socket.rules.previous_time/socket.rules.increase_block;
		var tryToRemove = false;
		if (timeToSet <= socket.rules.start_block){
			socket.rules.current_block = socket.rules.start_block;
			socket.rules.previous_time = socket.rules.start_block;
			removeTimer(socket);
			tryToRemove = tryRemoveSocket(socket);
			console.log('таймаут установлен на минимальный '+socket.rules.current_block);
		}
		else{
			socket.rules.previous_time = timeToSet;
			socket.rules.current_block = socket.rules.current_block/socket.rules.increase_block;
			refreshTimer(lowerInterval, socket, timeToSet);
		}
		if(tryToRemove == false){
			antiSpam.changeBanDuration(socket, socket.rules.current_block/1000); //изменяем длительность бана только если достигнуто таймаут не становлен на минимлаьный, т.е. на 5 сек
			console.log('изменяем длительность банааааааааааааааааааааааааааааа');
		}
	}

	function banTimer(socket){
		console.log('прошли '+socket.rules.previous_time+' секунд бана');
		refreshTimer(lowerInterval, socket, socket.rules.previous_time);
	}

}