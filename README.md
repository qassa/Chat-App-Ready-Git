Реализавана защита от отправки со стороны клиента содержимого, способного переключить среду на исполняемую (частичная)
Реализована базовая защита от отправки в параметрах get - запроса на адрес http://localhost:3700/id недоверенных данных
Реализована полная защита от XSS для поля ввода, полным исключением из текста сообщения запрещенных символов (включая ' " & < > /)
Реализована защита от отправки клиентом emit со значением string_value, которое незарегистрировано
Реализовано задание своих правил по исключению из чата (свое время блокировки, уровень пенальти)
Реализована проверка длины сообщения на допустимую на обеих сторонах. Максимально допустимая длина сообщения запрашивается с сервера через socket - соедлинение. Если сообщение все же было передано, несмотря на установленные запреты, то проверка на серверной стороне убирает все символы после максимального допустимого по индексу
Реализован вывод обычного сообщения о том, что длина передаваемого сообщения превышает допустимый размер. Сообщение выполнено в виде блочного элемента с красным фоном, текстом сообщения об ошибке и указанием максимально возможной длины сообщения



еще не Реализовано - приложение разделено на 2 части: frontend, backend. Frontend часть переписана с использованием библиотеки React

Еще не реализован вывод элемента UI для переподключения к чату, переключение к чату в коде
Еще не реализована полная проверка приходящих get - запросов на некорректные данные. Чтобы ее провести, нужно разобрать состав второго аргумента, который обычно передается в app.get('/id', function(req,res){ }); состав запроса в фреймворке express. В нем точно есть заголовок, тело (только у POST-запросов), параметры, запрос. На текущем этапе проверка выполняется только для параметров
Еще не реализовано сохранение имен пользователей чата, времени отправки сообщения по серверному времени (перевод времени согласно тому, что установлено у пользователя)
