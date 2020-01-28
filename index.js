var express = require('express');
//const {MongoClient} = require('mongodb');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
bodyParser = require('body-parser'),
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
require("./routes")(app, __dirname); //находится в папке routes в файле index.js
// const newsJSON = require(__dirname + '/admins/index.json');
//===========================Настройка соединения с MongoDb========================================
const MongoClient = require('mongodb').MongoClient;
var url;
const MongoDb = require("./mongodb/mongodb.js"); //проверка подключения к бд, и получение рабочего Url для дальнейших действий
url = MongoDb.getConnectionUrl(url);//получение url
const mongoClient = new MongoClient(url,{useUnifiedTopology: true, useNewUrlParser: true}); //соединение с MongoDb и создание переменной для дальнейших действий с БД
console.log(url);
//===========================Конец Настройки========================================
// Отслеживание порта
server.listen(3000, console.log("чат для сервера запущен")); //к примеру для входа используется localhost:3000
//===========================******************========================================

//Глобальные Массивы со всеми подключениями
var usernames = {}; //массив с именами пользователей
var rooms = []; //массив  с комнатами, по умолчанию при входе в приложение будет кидать в Лобби
var roomsHistory = []//первый элемент с именем комнаты, второй = архив сообщений. История сообщений по сути
var usersInfo = [];
try{
	workWithSockets(); //основная серверная часть со всеми операциями
	const uri = "mongodb+srv://<manucher5160@gmail.com>:<password>@<your-cluster-url>/test?retryWrites=true&w=majority";

}
catch(exception)
{
	console.log("error" + exception);
}
//===========================******************========================================

function workWithSockets()
{
// Событие подключения к серверу
	io.sockets.on('connection', function(socket) {
		// слушатель события "новый пользователь"
		addUser(socket);
	//===========================******************========================================
		// слушатель события "создание комнаты"
		createRoom(socket);
	//===========================******************========================================
		// слушатель события "удаление комнаты"
		deleteRoom(socket);
		//===========================******************========================================
		// слушатель события "смена комнаты"
		switchRoom(socket);
		//===========================******************========================================
		// // слушатель события "передача сообщения на сервер"
		toServerMess(socket);
		//===========================******************========================================
		// слушатель события "отключение"
		disconnect(socket);
		//===========================******************========================================
	});
}


function addUser(socket)
{
	socket.on('ADD_USER', function(username,userInfo) {
	socket.username = username;
	socket.room = username;
	createRoomByServer(socket,username);
	switchRoomByServer(socket, username);
	usernames[username] = username;
	//socket.join('lobby'); //по умолчанию подключается к комнате Lobby
	//socket.emit('TECH-MESSEGE', 'server', 'you <b>' + username +'</b> have connected to chat');  //отправка сообщения об успешном подключении к чату
	socket.broadcast.to(socket.room).emit('TECH-MESSEGE', 'server ',socket.username + ' has connected to this room');//отправка сообщения юзерам данной комнаты о новом сочатчанине
	socket.emit('UPDATE_ROOMS', rooms, username);
	console.log( username + " подключился к " + socket.room +" room" );//сообщение о подключении юзера в консоль
	getUserInfo(username,userInfo); //отправляет объект userInfo на хранение на сервер
	});
}

function getUserInfo(username,userInfo)
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
function createRoomByServer(socket, roomName)
{		

		let	match = searchStringInArray(roomName, rooms); //поиск совпадений комнат
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

function switchRoomByServer(socket, newroom)
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
function createRoom(socket)
{
	socket.on('CREATE_ROOM', function(room) { //функция для создания комнаты
		rooms.push(room);
		io.sockets.emit('UPDATE_ROOMS', rooms, socket.room);  //вызов в index.html
	});
}
function deleteRoom(socket)//функция удаления комнаты
{

	socket.on("DETELE_ROOM", function(room) {
		removeValueFromArr(rooms, room);
		io.sockets.emit('UPDATE_ROOMS', rooms, socket.room);  //вызов в index.html
		socket.emit('CLEAN_CHAT');
	});

}
function switchRoom(socket)
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
	showMessagesHistory(socket);//показывает историю сообщений
	socket.emit('USER-INFO',...usersInfo[newroom]);


	});
}

function showMessagesHistory(socket) //показывает историю сообщений
{
		roomsHistory[socket.room].forEach(element => { //получить массив сообщений от юзера в данной комнате  
			io.sockets["in"](socket.room).emit('MESS_FROM_HISTORY', {
				message: element, 
			}
			);
		});
	
}
function toServerMess(socket)
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
		addMessageToHistory(data.current_room, data.role, data.author, data.message, data.request,data.time);//добавит сообщение в историю
		io.sockets["in"](data.current_room).emit('TO_CHAT_MESS', {
			role: data.role, 
			author: data.author, 
			message: data.message, 
			request: data.request, 
			time: data.time
		});
	});
}


function addMessageToHistory(current_room, role, author, message,request,time)
{

		MongoDb.addMessageToDb(mongoClient, current_room, message);//добавляем запись в бд
		roomsHistory[current_room].push({
			role:role,
			author:author,
			message:message,
			request:request,
			time:time
		});

	
}
function disconnect(socket)
{
	socket.on('disconnect', function(data) {
	});
}


function searchStringInArray (str, strArray) {
	return strArray.find( (el)=> {return el === str} )
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