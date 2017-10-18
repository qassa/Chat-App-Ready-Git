var users = {};
var socket = {};
socket.ip = '. . .1';
users[socket.ip] = {
	name: 'simple_name',
	surname: 'much_more_simpler_surname'
}

for (obj in users){
	compare = obj == socket.ip;
	console.log('current users[socket.ip] is '+compare);
	delete users[obj];
	console.log('current users[socket.ip] is '+users[obj]);
	//console.log('current user object is '+users[i][socket.ip]);
}

