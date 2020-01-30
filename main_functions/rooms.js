var usernames = {}; //массив с именами пользователей
var rooms = []; //массив  с комнатами, по умолчанию при входе в приложение будет кидать в Лобби
var roomsHistory = []//первый элемент с именем комнаты, второй = архив сообщений. История сообщений по сути
var usersInfo = [];
const messages_functions = 	require("./messages.js"); 

// const io  = mainjs.io;
exports.disconnect=  function(socket)
{
    socket.on('disconnect', function(data) {
	});
}
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
        messages_functions.showMessagesHistory(socket, newroom, io);//показывает историю сообщений
        socket.emit('USER-INFO',...usersInfo[newroom]);
        });
}
exports.deleteRoom = function(socket)
{
    socket.on("DETELE_ROOM", function(room) {
		messages_functions.removeValueFromArr(rooms, room);
		io.sockets.emit('UPDATE_ROOMS', rooms, socket.room);  //вызов в index.html
		socket.emit('CLEAN_CHAT');
	});
}
exports.createRoom = function(socket)
{
    socket.on('CREATE_ROOM', function(room) { //функция для создания комнаты
		rooms.push(room);
		io.sockets.emit('UPDATE_ROOMS', rooms, socket.room);  //вызов в index.html
	});
}



exports.addUser = function(socket, io)
{
    socket.on('ADD_USER', function(username,userInfo) {
        socket.username = username;
        socket.room = username;
        createRoomByServer(socket,username, io);
        switchRoomByServer(socket, username);
        usernames[username] = username;
        //socket.join('lobby'); //по умолчанию подключается к комнате Lobby
        //socket.emit('TECH-MESSEGE', 'server', 'you <b>' + username +'</b> have connected to chat');  //отправка сообщения об успешном подключении к чату
        socket.broadcast.to(socket.room).emit('TECH-MESSEGE', 'server ',socket.username + ' has connected to this room');//отправка сообщения юзерам данной комнаты о новом сочатчанине
        socket.emit('UPDATE_ROOMS', rooms, username);
        console.log( username + " подключился к " + socket.room +" room" );//сообщение о подключении юзера в консоль
        getUserInfo(username, userInfo); //отправляет объект userInfo на хранение на сервер
        });
}
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
		console.log(data.current_room + " "+ data.role + " "+ data.author + " "+ data.message + " "+ data.request + " "+ data.time)
		messages_functions.addMessageToHistory(data.current_room, data.role, data.author, data.message, data.request,data.time);//добавит сообщение в историю
		io.sockets["in"](data.current_room).emit('TO_CHAT_MESS', {
			role: data.role, 
			author: data.author, 
			message: data.message, 
			request: data.request, 
			time: data.time
		});
	});
}
function searchStringInArray (str, strArray) {
    console.log(strArray);
    console.log(str);
    return strArray.find( (el)=> {return el === str} )
    return 1;
}
function createRoomByServer(socket, roomName, io)
{
    // let	match = searchStringInArray(roomName, rooms); //поиск совпадений комнат
    let match = 1;
		if(match) //если нет совпадения - добавить комнату в список комнат
			{
				console.log("Комната с таким именем уже существует");
			}
		else
			{
				rooms.push(roomName); //добавляет элемент в начало массива
				roomsHistory.push(roomName);
				roomsHistory[roomName] = [];

				io.sockets.emit('UPDATE_ROOMS', rooms, socket.room);  //вызов в index.html ***********
			}
}
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
function getUserInfo(username, userInfo)
{
    let	match = searchStringInArray(username, usersInfo); //поиск совпадений имен в информации о клиентов
		if(match) //если нет совпадения - добавить клиента в список информации о нем
			{
				console.log("Information is already exist");
			}
			else
		{
				usersInfo.push(username);
				usersInfo[username] = [];
				usersInfo[username].push(userInfo);
		}
}
function removeValueFromArr(arr, value) {
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] === value) {
            arr.splice(i, 1);
            break;
        }
    }
    return arr;
}