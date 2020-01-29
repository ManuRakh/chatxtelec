 //===========================Входные данные========================================
 const user = "db33ee0f23395f4a844c799146bb9a82";
 const dbName = "db33ee0f23395f4a844c799146bb9a82";
 const hostString = "9a.mongo.evennode.com:27017/db33ee0f23395f4a844c799146bb9a82";
 const mongoPassword = "Otdyhaem123";
 const replica = "?replicaSet=eu-9";
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
exports.addMessageToDb = function(mongoClient, current_room, role, author, message,request,time)
{
    mongoClient.connect(function (err, client) { //соединение с бд
    new Promise((resolve, reject) => { //объявление обещания колбека, отвечает за точное закрытие соединения с БД после выполнения работы
        const db = client.db(dbName);
        const collection = db.collection("users");
        let msgHistory = { //массив с данными о сообщении
          role:     role, 
          author:   author, 
          msg:      author+":"+ message, 
          request:  request, 
          time:     time     
        };
    collection.findOne({author: current_room},(function(err, results){       //ищет пользователя в БД по имени комнаты
          console.log(results);
          if(results=='' || results==null) //если записей не обнаружено - добавляет новую запись
            {
                console.log('Записей не обнаружено, создаю новую запись');
                collection.insertOne(msgHistory);//добавление записи
            }     
          else //если же записи обнаружены - обновляет историю сообщений добавлением нового в конец истории
            { 
                console.log('Запись обнаружена, провожу обновление');
                let endMessage =  results.msg + '\n' + message; //добавляет новую запись в конец старой
                collection.updateOne({ author: current_room }, { $set: { msg: endMessage } }, (err, result) => { //обновляет запись
                if (err) {
                  console.log('Не получилось обновить запись: ', err)
                  throw err
                }
                console.log('Запись обновлена');
                console.log('Обновленная запись теперь выглядит так:');
                console.log(endMessage);
                console.log('Обновление завершено')
      
              });
            }
          }));
    }).then(() => client.close());;
  });
}
//===========================Конец добавления сообщения в БД========================================
