var private_max_length = 300;

var Sanitizer = function(){
	//добавлено при реализации защиты от XSS в URL
	this.expressSanitizer = require("express-sanitizer");
	this.bodyParser = require("body-parser");

	this.customSanitizer = require("sanitizer");

	//так как это теперь отдельный модуль, то в нем можно добавить логику по расширению стандартного функционала библиотеки. Добавим удаление из строки запрещенных символов
	//библиотека выполняет только одно условие - недопустить перехода в исполняемый контекст
	this.sanitize = function(value){
		var str=''; re= /[^'"<>&\/]+/g;
		while((match = re.exec(value)) !== null){ //использовать while можно из-за того, что в регулярном выражении указан флаг глобального сопоставления, в ином случае сопоставление выполнялось бы бесконечное число раз. В объекте регулярного выражения хранится lastIndex, при каждом следующем проходе exec использует этот индекс для начала поиска
			str += match[0];
			console.log(str);
		}

		value = customSanitizer.sanitize(str);

		//проверка на длину переданного сообщения, укоротить длину
		//на клиенте установлено ограничение на количество передаваемых символов
		//на случай, если сообщение все-таки будет отправлено
		value = value.split('').splice(0,private_max_length).join('');
		//value.length - больше количества элементов в массиве, начиная с 300-го символа. Будут удалены все символы до конца массива

		return value;
	}

	this.max_message_length = function(){
		return private_max_length;
	}
}

module.exports = Sanitizer;