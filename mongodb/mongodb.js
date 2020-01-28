 const user = "db33ee0f23395f4a844c799146bb9a82";
 const dbName = "db33ee0f23395f4a844c799146bb9a82";
exports.getConnectionUrl = function(url) {
  //Ввод данных для подключения к бд и создание ссылки для дальнейших подключений
  var hostString = "9a.mongo.evennode.com:27017/db33ee0f23395f4a844c799146bb9a82";
  var mongoPassword = "Otdyhaem123";
  var replica = "?replicaSet=eu-9";
  url = "mongodb://" + this.user + ":" + encodeURIComponent(mongoPassword) + "@" +
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
    const db = client.db(this.dbName);
    const collection = db.collection("users");
    if (err)
      return console.log(err);
    collection.find().toArray(function (err, results) {
      console.log(results);
      client.close();
    });
  });
}