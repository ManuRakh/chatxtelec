 const user = "db33ee0f23395f4a844c799146bb9a82";
 const dbName = "db33ee0f23395f4a844c799146bb9a82";
exports.getConnectionUrl = function(url) {
  //Ввод данных для подключения к бд и создание ссылки для дальнейших подключений
  var hostString = "9a.mongo.evennode.com:27017/db33ee0f23395f4a844c799146bb9a82";
  var mongoPassword = "Otdyhaem123";
  var replica = "?replicaSet=eu-9";
  url = "mongodb://" + user + ":" + encodeURIComponent(mongoPassword) + "@" +
    hostString + replica;
  
  //           const db = client.db(dbName);
  //           const collection = db.collection('users');
  //           collection.insertMany(users, function(err, results){
  //           console.log(results);
  //           client.close();

  return url; //возвращаем созданную ссылку для дальнейших подключений
}
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
exports.addMessageToDb = function(mongoClient, current_room, msg)
{
    mongoClient.connect(function (err, client) {
    const db = client.db(dbName);
    const collection = db.collection("users");
    let msgHistory = {
      author: current_room,
      msg: msg
    };
      collection.findOne({author: current_room},(function(err, results){       
      if(results=='') //если записей не обнаружено - добавляет новую запись
        {
          console.log('Записей не обнаружено, создаю новую запись');
          collection.insertOne(msgHistory, function(err, results){    
          console.log(results);
          client.close();
          });
        }     
      else //если же записи обнаружены - обновляет историю сообщений добавлением нового в конец истории
        { 
            let endMessage =  results.msg + '\n' + msg;
            collection.updateOne({ author: current_room }, { $set: { msg: endMessage } }, (err, result) => {
            if (err) {
              console.log('Unable update user: ', err)
              throw err
            }
            console.log('Запись обнаружена, обновляю запись');
            console.log('Обновленная запись теперь выглядит так: \n')
            console.log(endMessage);
            client.close();
  
          });
        }
      }));
  });
}