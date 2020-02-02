var usernames = 			{}; //массив с именами пользователей
var rooms = 				[]; //массив  с комнатами, по умолчанию при входе в приложение будет кидать в Лобби
var usersInfo = 			[];
const messages_functions = 	require("./messages.js"); 

//===========================отсоединяет пользователя от сети========================================
exports.disconnect=  function(socket) //
{
    socket.on('disconnect', function(data) {
	});
}

//===========================Модуль Меняет комнату========================================
exports.switchRoom = function(socket, io)
{
    socket.on('SWITCH_ROOM', function(newroom) { //функция для изменения текущей комнаты
        var oldroom;
        oldroom = socket.room;
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('CLEAN_CHAT');
        socket.emit('TECH-MESSEGE', 'server', 'you have left room ' + oldroom);
        socket.emit('TECH-MESSEGE', 'server', 'you have connected to ' + newroom + " room");
        socket.broadcast.to(oldroom).emit('TECH-MESSEGE', 'server ',socket.username + ' has left this room');
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('TECH-MESSEGE', 'server ',socket.username + ' has joined this room');
        socket.emit('UPDATE_ROOMS', rooms, newroom);
        messages_functions.show_mess_to_admin(socket, newroom, io);//показывает историю сообщений админу(Оператору)
        socket.emit('USER-INFO',...usersInfo[newroom]);
        });
}

//===========================Модуль Удаляет комнату========================================
exports.deleteRoom = function(socket)
{
    socket.on("DETELE_ROOM", function(room) {
		messages_functions.removeValueFromArr(rooms, room);
		io.sockets.emit('UPDATE_ROOMS', rooms, socket.room);  //обновляет комнаты после удаления оной
		socket.emit('CLEAN_CHAT');
	});
}

//===========================Модуль Создает комнату========================================
exports.createRoom = function(socket)
{
    socket.on('CREATE_ROOM', function(room) { //функция для создания комнаты
		rooms.push(room);
		io.sockets.emit('UPDATE_ROOMS', rooms, socket.room);  //вызов в index.html
	});
}

//===========================Модуль добавляет пользователя в сеть========================================

exports.addUser = function(socket, io)
{
    socket.on('ADD_USER', function(username,userInfo) {
        socket.username = username;
        socket.room = username;
        createRoomByServer(socket,username, io);
        switchRoomByServer(socket, username);
        usernames[username] = username;
        socket.broadcast.to(socket.room).emit('TECH-MESSEGE', 'server ',socket.username + ' has connected to this room');//отправка сообщения юзерам данной комнаты о новом сочатчанине
        socket.emit('UPDATE_ROOMS', rooms, username);
        console.log( username + " подключился к " + socket.room +" room" );//сообщение о подключении юзера в консоль
        getUserInfo(username, userInfo,socket, io); //отправляет объект userInfo на хранение на сервер
        });
}

//===========================Модуль отправки сообщения на сервер========================================
exports.toServerMess = function(socket, io)
{
    socket.on('TO_SERVER_MESS', function(data) { 
		// Внутри функции мы передаем событие 'add mess',
		// которое будет вызвано у всех пользователей в ТЕКУЩЕЙ КОМНАТЕ и у них добавится новое сообщение 
		if (data.current_room==='Admin'){}
		else{
		removeValueFromArr(rooms, data.current_room);
		rooms.unshift(data.current_room); //ставит комнату в самый верх списка комнат
		}
		io.sockets.emit('UPDATE_ROOMS', rooms, undefined);
		console.log(data.current_room + " "+ data.role + " "+ data.author + " "+ data.message + " "+ data.request + " "+ data.time);
		if(data.role=='guest')
		{
		messages_functions.addMessageToHistory(
			data.current_room,
			data.role, 
			data.author, 
			data.message, 
			data.request,
			data.time,
			'Оператор'
			);//добавит сообщение в историю пользователя в бд адрессованное Оператору(Админу)
		}
		else
		{
		messages_functions.addMessageToHistory(
			data.current_room, 
			data.role, 
			data.author, 
			data.message, 
			data.request,
			data.time,
			data.current_room
			);//добавит сообщение в историю пользователя в бд адрессованное Клиенту 
		}
		io.sockets["in"](data.current_room).emit('TO_CHAT_MESS', { //отправка сообщения в чат
			role: data.role, 
			author: data.author, 
			message: data.message, 
			request: data.request, 
			time: data.time
		});
	});
}

//===========================Модуль создания комнаты во время входа пользователя========================================

function createRoomByServer(socket, roomName, io)
{
     let	match = searchStringInArray(roomName, rooms); //поиск совпадений комнат
		if(match) //если нет совпадения - добавить комнату в список комнат
			{
				console.log("Комната с таким именем уже существует");
			}
		else
			{
				rooms.push(roomName); //добавляет элемент в начало массива
				io.sockets.emit('UPDATE_ROOMS', rooms, socket.room);  //вызов в index.html ***********
			}
}

//===========================Модуль изменения комнаты========================================

function switchRoomByServer (socket, newroom)
{
    var oldroom;
	oldroom = socket.room;
	socket.leave(socket.room);
	socket.join(newroom);
	//socket.emit('TECH-MESSEGE', 'server', 'you have left room ' + oldroom);
	socket.emit('TECH-MESSEGE', 'server', 'you have connected to ' + newroom);
	//socket.broadcast.to(oldroom).emit('TECH-MESSEGE', 'server ',socket.username + ' has left this room');
	socket.room = newroom;
	socket.broadcast.to(newroom).emit('TECH-MESSEGE', 'server ',socket.username + ' has joined this room');
	socket.emit('UPDATE_ROOMS', rooms, socket.room);
}

//===========================Модуль извлечения информации о пользователе========================================

function getUserInfo(username, userInfo, socket, io)
{
    let	match = searchStringInArray(username, usersInfo); //поиск совпадений имен в информации о клиентов
		if(match) //если нет совпадения - добавить клиента в список информации о нем
			{
				console.log("Information is already exist");
				messages_functions.show_mess_to_user(socket, username, io);//показывает историю сообщений

			}
			else
		{
				usersInfo.push(username);
				usersInfo[username] = [];
				usersInfo[username].push(userInfo);
				messages_functions.show_mess_to_user(socket, username, io);//показывает историю сообщений

		}
}

//===========================Функция удаления перменной из массива данных========================================

function removeValueFromArr(arr, value) {
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] === value) {
            arr.splice(i, 1);
            break;
        }
    }
    return arr;
}

//===========================Функция поиска вхождения строки  в массиве========================================
function searchStringInArray (str, strArray) {
    console.log(strArray);
    console.log(str);
    return strArray.find( (el)=> {return el === str} )
    return 1;
}