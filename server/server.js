require('dotenv').config({path: '.env'})

const express = require('express');
var Twit = require('twit');
const app = express();
var mysql = require('mysql')

app.listen(3000, () => console.log('Server running'))

var T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET_KEY,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
})

var dBconfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

var connection = mysql.createConnection(dBconfig);

app.use(require('cors')());
var myParser = require('body-parser');


app.use(myParser.urlencoded({
  extended: true
}));
app.use(myParser.json());
app.use(myParser.raw());

connection.connect(function (err) {
  if (err) throw err;
  console.log('Connected to database');

  /* ADD RECORDS */
  app.post('/add', function (req, res) {
    var insertSql = 'INSERT into users (accountURL) values(?)';
    var secondCheck = 'SELECT 1 FROM users WHERE EXISTS (SELECT 1 FROM users WHERE accountURL = ? LIMIT 1)';

    for (let [key, value] of Object.entries(req.body.url)) {
      connection.query(secondCheck, `${value}`, (err, result, fields) => {
        if (err) throw err;
        if (result[0]) {
          console.log("exist")
        } else {
          connection.query(insertSql, `${value}`, (err, result, fields) => {
            if (err) throw err;
            // console.log("dodano")
          })
        }
      })
    }

    var responseStatus = "Ok.";

    res.status(200).json({
      status: responseStatus
    })

  })

  /* NUMBER OF RECORDS */

  app.get('/count', function (req, res) {
    var sql = 'SELECT COUNT(*) as total FROM users'
    connection.query(sql, (err, result, fields) => {
      res.status(200).json({
        num: result[0].total
      })
    })
  })

  /* UPDATE BASE */
  app.get('/update', function (req, res) {
    var getAll = 'SELECT * FROM users';


    connection.query(getAll, (err, result, fields) => {
      for (var i = 0; i < result.length; i++) {
        var url = result[i].accountURL;
        var nickname = result[i].accountURL.split('.com/')[1];
        getFromTwitter(nickname, url);
      }
      res.status(200).json({
        status: "Baza zaktualizowana"
      })
    })
  })

  function getFromTwitter(nickname, url) {
    T.get('users/show', {
      screen_name: nickname
    }, function (err, data, response) {
      console.log(err);
      // console.log(data);

      var followersCount = data.followers_count;
      var location = data.location;
      var tweetsCount = data.statuses_count;
      var twitterId = data.id;
      var accountURL = url;

      var record = [];
      record.push(followersCount);
      record.push(location);
      record.push(tweetsCount);
      record.push(twitterId);
      record.push(nickname);
      record.push(accountURL);

      var updateBase = 'UPDATE users SET followersCount = ?, location = ?, tweetsCount = ?, twitterId = ?, nickname = ? WHERE accountURL = ?';
      connection.query(updateBase, record, (err, result, fields) => {})

    })

  }

  app.get('/all', function (req, res) {
    var getAll = 'SELECT @rownum := @rownum +1 rank, nickname, accountURL, location, followersCount, tweetsCount FROM users, (SELECT @rownum :=0)r ORDER BY followersCount DESC';
    connection.query(getAll, (err, result, fields) => {
      res.status(200).json(result);
    })

  })

  app.get('/tweetSort', function (req, res) {
    var getAll = 'SELECT @rownum := @rownum +1 rank, nickname, accountURL, location, followersCount, tweetsCount FROM users, (SELECT @rownum :=0)r ORDER BY tweetsCount DESC';
    connection.query(getAll, (err, result, fields) => {
      res.status(200).json(result);
    })

  })

  app.get('/delete', function (req, res) {
    var getAll = 'SELECT * FROM users WHERE nickname IS NULL';
    connection.query(getAll, (err, result, fields) => {
      console.log(result.length);
      for (var i = 0; i < result.length; i++) {
        var url = result[i].accountURL;
        var nickname = result[i].accountURL.split('.com/')[1];
        deleteFromDb(nickname, url);
      }
      res.status(200).json({
        status: "Nieaktualne rekordy usunięte z bazy"
      })
    })
  })

  function deleteFromDb(nickname, url) {
    T.get('users/show', {
      screen_name: nickname
    }, function (err, data, response) {
      if (data.errors[0].code === 50) {
        var deleteSQL = 'DELETE FROM users WHERE accountURL = ?';
        connection.query(deleteSQL, url, (err, result, fields) => {
          console.log("Deleted: " + url);
          if (err) throw err;
        })

      }
    })
  }
})