const rooms_functions = 	require("./rooms.js"); 
const MongoClient = require('mongodb').MongoClient;
var url;
const MongoDb = 	require("../mongodb/mongodb.js"); //проверка подключения к бд, и получение рабочего Url для дальнейших действий
url = MongoDb.getConnectionUrl(url);//получение url
const mongoClient = new MongoClient(url,{useUnifiedTopology: true, useNewUrlParser: true}); //соединение с MongoDb и создание переменной для дальнейших действий с БД
console.log(url);
exports.showMessagesHistory = function(socket, author, io)
{
    // rooms_functions.roomsHistory[socket.room].forEach(element => { //получить массив сообщений от юзера в данной комнате  
	// 	io.sockets["in"](socket.room).emit('MESS_FROM_HISTORY', {
	// 		message: element, 
	// 	});
	// });
	MongoDb.showUserHistory(mongoClient, author, io, socket);
	
}

exports.addMessageToHistory = function(current_room, role, author, message, request, time)
{
    MongoDb.addMessageToDb(mongoClient, current_room, role, author, message,request,time);//добавляем запись в бд

}



