#!/usr/bin/env node
var Web_Socket_Server = require('ws');
var clients = [];
var id;
var freeid;
var stop;
var kesh = {};
var setting_poorsong = {};
var Web_Socket = new Web_Socket_Server.Server({port:numeric});
var fs = require("fs");
var optimaze = {};//запилить оптимизацию кейса, чтобы меньше проверок делал
console.log("It come to live!!1! at numeric \r\n");
Web_Socket.on('connection', function(ws){
	fs.appendFileSync("log_file.log", "Обнаружили новое соединение \r\n");
	freeid = 0;
	stop = false;
	while (clients[freeid] && !stop){
		freeid++;
		if (freeid > 10){
			stop = true;
			let msg = {
				type:'error',
				code:0,
				message:"Превышен предел клиентов"
			};
			ws.send(JSON.stringify(msg));
		}
	}
	if (!stop) local_connect(freeid, ws);
});
local_connect = function(id, ws){
	let reading_file = null;
	let setting_poorsong = {};
	clients[id] = ws;
	let msg = {
		type:'connect',
		code:0,
		message:"Вы подсоеденились"
	};
	ws.send(JSON.stringify(msg));
	ws.on('message', function(inp_message){
		console.log(inp_message);
		events = JSON.parse(inp_message);
		switch (events.type){
			case 'set_current':
				kesh.current = events.message;
				for (var key in clients){
					clients[key].send(inp_message);
				}
			break;
			case 'im_current':
				msg = {
					type:'set_current',
					message:kesh.current
				}
				ws.send(JSON.stringify(msg));
			break;
			case 'get_winsize':
				reading_file = JSON.parse(fs.readFileSync('current_setting.txt', 'utf8'));
				msg = {
					type:'return_winsize',
					message:reading_file
				}
				ws.send(JSON.stringify(msg));
			break;
			case 'set_size':
				reading_file = JSON.parse(fs.readFileSync('current_setting.txt', 'utf8'));
				switch (events.message.type){
					case 'font_song':
						reading_file.font_song = events.message.val.font_song
					break;
					case 'font_head':
						reading_file.font_headr = events.message.val.font_headr
					break;
					case 'size_logo':
						reading_file.height_log = events.message.val.height_log
						reading_file.width_log = events.message.width_log
					break;
					case 'size':
						reading_file.height_window = events.message.val.height
						reading_file.width_window = events.message.val.width
					break;
				}
				fs.writeFileSync('current_setting.txt', JSON.stringify(reading_file));
			break;
			case 'im_manager_poorsong':
			setting_poorsong = JSON.parse(fs.readFileSync('poorsong_setting.txt', 'utf8'));
			msg = {
					type:'auth',
					message:{
						{"Данные аутентификации"}
					}
				}

				ws.send(JSON.stringify(msg));
				msg = { 
					type:'setting_value',
					message:setting_poorsong.setting
				}
				ws.send(JSON.stringify(msg));
			break;
			case 'get_size_manager_poorsong':
				setting_poorsong = JSON.parse(fs.readFileSync('poorsong_setting.txt', 'utf8'));
				msg = {
					type:'return_size_manager_window',
					message:setting_poorsong.manager
				}
				ws.send(JSON.stringify(msg));
			break;
			case 'get_size_poorsong':
				setting_poorsong = JSON.parse(fs.readFileSync('poorsong_setting.txt', 'utf8'));
				msg = {
					type:'return_size_poorsong_window',
					message:setting_poorsong.poorsong
				}
				ws.send(JSON.stringify(msg));
			break;
			case 'get_old_winnrs':
				reading_file = JSON.parse(fs.readFileSync('old_winners.txt', 'utf8'));
				msg = {
					type:'return_old_winners',
					message:reading_file
				}
				ws.send(JSON.stringify(msg));
			break;
			case 'list_request_poorsong':
				msg = {
					type:'return_list_request_poorsong',
					message:events.message
				}
				for (var key in clients){
					clients[key].send(JSON.stringify(msg));
				}
			break;
			case 'list_winners_poorsong':
				fs.writeFileSync('old_winners.txt', JSON.stringify(events.message));
			break
			case 'set_size_manager_poorsong':
				setting_poorsong = JSON.parse(fs.readFileSync('poorsong_setting.txt', 'utf8'));
				setting_poorsong.manager = events.message;
				fs.writeFileSync('poorsong_setting.txt', JSON.stringify(setting_poorsong));
			break;
			case 'clear_field_foorsong':
				msg = {
					type:'clear_list_request_poorsong',
					message:'OK!'
				}
				for (var key in clients){
					clients[key].send(JSON.stringify(msg));
				}
			break;
			case 'im_poorsong':
				setting_poorsong = JSON.parse(fs.readFileSync('poorsong_setting.txt', 'utf8'));
				msg = {
					type:'set_setting_poorsong',
					message:setting_poorsong.setting
				}
				ws.send(JSON.stringify(msg));
			break;
			case 'set_size_poorsong':
				setting_poorsong = JSON.parse(fs.readFileSync('poorsong_setting.txt', 'utf8'));
				//setting_poorsong.poorsong[events.message.type] = events.message.value;
				switch (events.message.type){
					case 'size_font':
						setting_poorsong.poorsong.font_size = events.message.font_size
					break;
					case 'size_window':
						setting_poorsong.poorsong.height_window = events.message.height_window
						setting_poorsong.poorsong.width_window = events.message.width_window
					break;
				}
				fs.writeFileSync('poorsong_setting.txt', JSON.stringify(setting_poorsong));
			break;
			case 'set_setting_poorsong':
				setting_poorsong.setting[events.message.type] = events.message.value;
				events.message = setting_poorsong.setting
				for (var key in clients){
					clients[key].send(JSON.stringify(events));
				}
				fs.writeFileSync('poorsong_setting.txt', JSON.stringify(setting_poorsong));
			break;
		}
	});
	ws.on ('close', function () {
		fs.appendFileSync("log_file.log", "Клиент " + id + " закрыл соединение \r\n");
		delete clients[id];
	});
}
