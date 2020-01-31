 //===========================Входные данные========================================
 const user =           "db33ee0f23395f4a844c799146bb9a82";
 const dbName =         "db33ee0f23395f4a844c799146bb9a82";
 const hostString =     "9a.mongo.evennode.com:27017/db33ee0f23395f4a844c799146bb9a82";
 const mongoPassword =  "Otdyhaem123";
 const replica =        "?replicaSet=eu-9";
 //===========================Конец входных данных========================================

 
 //===========================Получение рабочего Url для соединения с Mongodb========================================
exports.getConnectionUrl = function(url) {
 url = "mongodb://" + user + ":" + encodeURIComponent(mongoPassword) + "@" + //создание рабочего Url
    hostString + replica;
    return url; //возвращаем созданную ссылку для дальнейших подключений
}
//===========================Конец получения рабочего Url========================================


//===========================Показать таблицу пользователей полностью========================================
exports.showUsersTable = function(mongoClient) {
  mongoClient.connect(function (err, client) {
    const db = client.db(dbName);
    const collection = db.collection("users");
    if (err)
      return console.log(err);
    collection.find().toArray(function (err, results) {
      console.log(results);
      client.close();
    });
  });
}
//===========================Конец получения таблицы========================================


//===========================Добавление сообщения в БД========================================
exports.addMessageToDb = function(mongoClient, current_room, role, author, message,request,time, operator)
{

    mongoClient.connect(function (err, client) { //соединение с бд
    new Promise((resolve, reject) => { //объявление обещания колбека, отвечает за точное закрытие соединения с БД после выполнения работы
        const db = client.db(dbName);
        const collection = db.collection("users");
        let msgHistory = { //массив с данными о сообщении
          role:     role, 
          author:   author, 
          to_whom:  operator,
          msg:      author+":"+ message, 
          request:  request, 
          time:     time     
        };
        collection.insertOne(msgHistory);//добавление записи
        console.log('Добавлено новое сообщение в бд')
    }).then(() => client.close());;
  });
}
//===========================Конец добавления сообщения в БД========================================
exports.show_mess_to_admin = function(mongoClient, author, io, socket)
{
  mongoClient.connect(function (err, client) {
    new Promise((resolve, reject) => { //объявление обещания колбека, отвечает за точное закрытие соединения с БД после выполнения работы

    const db = client.db(dbName);
    const collection = db.collection("users");
    if (err)
      return console.log(err);
      collection.find({$or:[{author:author},{to_whom:author}]}, ).sort({ time: -1 }).toArray(function (err, results) {
        //console.log(results);
        start_sending_msgs(results, author, 'MESS_TO_ADMIN', io)

       
    
      });
  }).then(() => client.close());
  });
}
exports.show_mess_to_user = function(mongoClient, author, io, socket)
{
  mongoClient.connect(function (err, client) {
    new Promise((resolve, reject) => { //объявление обещания колбека, отвечает за точное закрытие соединения с БД после выполнения работы
      let msgs = [];
    const db = client.db(dbName);
    const collection = db.collection("users");
    if (err)
      return console.log(err);

      collection.find({$or:[{author:author},{to_whom:author}]}, ).sort({ time: -1 }).limit(10).toArray(function (err, results) {
      //console.log(results);
      start_sending_msgs(results, author, 'MESS_TO_USER', io)
     
  
    });
    
  }).then(() => client.close());
  });
}

function start_sending_msgs(results, author, to_whom, io)
{
  results.reverse();
  results.forEach(element => {
      try {
        io.sockets["in"](author).emit(to_whom, {
          message: element.msg+":"+element.request, 
            });
      } 
      catch (error) {}
  });
}