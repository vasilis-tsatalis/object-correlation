// run two times to import data in mongo db

const mongodb = require("mongodb").MongoClient;
const csvtojson = require("csvtojson");
require('dotenv/config');


let url = process.env.DB_CONNECTION;

csvtojson()
  //.fromFile("movies.csv")
  .fromFile("ratings.csv")
  .then(csvData => {
    //console.log(csvData);

    mongodb.connect(
      url,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err, client) => {
        if (err) throw err;
        client
          .db("MoviesDB")
          //.collection("movies")
          .collection("ratings")
          .insertMany(csvData, (err, res) => {
            if (err) throw err;
            console.log(`Inserted: ${res.insertedCount} rows`);
            client.close();
          });
      }
    );
  });
