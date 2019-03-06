#!/usr/bin/env node
var Web_Socket_Server = require('ws');
var clients = [];
var id;
var freeID;
var stop;
var Web_Socket = new Web_Socket_Server.Server({port:numeric});
console.log("It come to live!!1! at numeric \r\n");
Web_Socket.on('connection', ws => {
	freeID = 0;
	stop = false;
	while (clients[freeID] && !stop){
		freeID++;
		if (freeID > 10){
			stop = true;
			let msg = "Превышен предел клиентов"
			ws.send(msg);
		}
	}
	if (!stop) local_connect(freeID, ws);
});
local_connect = function(id, ws){
	clients[id] = ws;
	let msg = "Вы подсоеденились"
	ws.send(JSON.stringify(msg));
	ws.on('message', inp_message => {
		console.log(inp_message);
		for (var key in clients){
			if (key == id) continue;
			else clients[key].send(inp_message);
		}
	});
	ws.on ('close', () => {
		delete clients[id];
	});
}
