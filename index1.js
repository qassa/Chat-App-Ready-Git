var express = require('express');
var sanitizer = require('./sanitize_helper')();
var app = express();
var server = require('http').Server(app);
var chat = require('./chat_main')(server); //при попытке передать вместо http_server app -> error 'Please, parse an http.Server instance'
//Это значит, что выражение app.listen(port); возвращает server. Да, так оно и есть. В application.js выполняется такой участок кода
//app.listen = function listen() {
//  var server = http.createServer(this);
//  return server.listen.apply(server, arguments);
//};
var port = 3700;

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
	res.render("page");
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());

server.listen(port);

app.get('/id', function(req, res) {
  console.log('получен get запрос');
 	//res.sendStatus(500);
  // replace an HTTP posted body property with the sanitized string 
  req.query.sanitizedParam1 = req.sanitize(req.query.param1);
  req.query.sanitizedParam2 = req.sanitize(req.query.param2);
  	console.log(req);
});

console.log("Listening on port "+port);