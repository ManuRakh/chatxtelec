module.exports =
{     getConnectionUrl:  function (app, MongoClient, url) {
    //Ввод данных для подключения к бд и создание ссылки для дальнейших подключений
      var hostString = "9a.mongo.evennode.com:27017/db33ee0f23395f4a844c799146bb9a82";
      var user = "db33ee0f23395f4a844c799146bb9a82";
      var dbName = "db33ee0f23395f4a844c799146bb9a82";
      var mongoPassword = "Otdyhaem123";
      var replica = "?replicaSet=eu-9";
      url = "mongodb://" + user + ":" + encodeURIComponent(mongoPassword) + "@" + 
      hostString + replica;
        MongoClient.connect(
          url, 
          {useUnifiedTopology: true, useNewUrlParser: true},
          function(err, client) {
            // var db = "db33ee0f23395f4a844c799146bb9a82";
            if(!err) {
              console.log("We are connected to MongoDB");
            } else {
              console.log("Error while connecting to MongoDB");
            }
            // const db = client.db(dbName);
            // const collection = db.collection('users');
  //           collection.insertMany(users, function(err, results){
  //               
  //                     console.log(results);
  //                     client.close();
  //                 });
          }
        );
          return url; //возвращаем созданную ссылку для дальнейших подключений
    }
}