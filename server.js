/**
 * Created by hcm on 12.11.2017.
 */
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rock = require('./rock');
var request = require('request');
var url = require('url');
var fs = require('fs');
var hexify = require('./hexify');
var qs = require('querystring');

var express = require('express');
var app = express();

//Port config for Heroku, 5000 for Webstorm
app.set( 'port', ( process.env.PORT || 8000 ));

var server = app.listen(app.get('port') || 8000);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

//To parse x-www-form-urlencoded request bodies, Express.js can use urlencoded()
//middleware from the body-parser module.
var bodyparser = require('body-parser');
var jsonParser = bodyParser.json();
app.use(bodyparser.urlencoded({extended: false}));

var index = require('./routes/index');
var users = require('./routes/users');

// Main listening port for RockBlock Server communication
var listeningPort = 8000;

class incomingMessage {
  constructor(imei, momsn, transmitTime, iridiumLatitude, iridiumLongitude, iridiumCep, data) {
    this.imei = imei;
    this.momsn = momsn;
    this.transmitTime = transmitTime;
    this.iridiumLatitude = iridiumLatitude;
    this.iridiumLongitude = iridiumLongitude;
    this.iridiumCep = imei;
    this.data = data;
    this.dehexData = hexify.decode(data);
  }
  getImei() {
        return this.imei;
  }
  getMomsn() {
      return this.momsn;
  }
  getTransmitTime() {
      return this.transmitTime;
  }
  getIridiumLatitude() {
      return this.iridiumLatitude;
  }
  getIridiumLongitude() {
      return this.iridiumLongitude;
  }
  getIridiumAccuracy() {
      return this.iridiumCep;
  }
  getData() {
      return this.data;
  }
  getDecodedData() {
      return this.dehexData;
  }
  getObject() {
      return {
        'imei' : this.imei,
        'momsn' : this.momsn,
        'transmit_time' : this.transmitTime,
        'iridium_latitude' : this.iridiumLatitude,
        'iridium_longitude' : this.iridiumLongitude,
        'accuracy' : this.iridiumCep,
        'hex_data' : this.data,
        'data' : this.dehexData
      };
  }
}

// Global latitude and longitude variables for last known location
var latitude = 0.0;
var longitude = 0.0;
var gpsAccuracy = 0.0;

var logData = function(imei, momsn, transmitTime, irLat, irLon, irCep, data) {
  // Collect all the important information from the message;
  var imei = imei;
  var momsn = momsn;
  var transmitTime = irLat;
  var iridiumLatitude = irLat;
  var iridiumLongitude = irLon;
  var iridiumCep = irCep; //estimate of the accuracy of lat-long in km
  var data = data;
  
  latitude = iridiumLatitude;
  longitude = iridiumLongitude;
  gpsAccuracy = iridiumCep;

  io.sockets.emit('new_coords', {'latitude':latitude, 'longitude':longitude, 'acc':gpsAccuracy});

  //TODO: log data to the server database
  console.log('\n' + imei + '\n' + data);
  console.log('data: ' + hexify.decode(data));
};



//This handles the post request made by the client
//TODO: return the global requests list/chain/linkedlist object?
app.post('/client_message', function(req, res) {
  // Use URL to parse the request and get a URL object from it.
  var msgObject = req.body;
  
  var imei = msgObject.imei;
  var username = msgObject.username;
  var password = msgObject.password;
  var message = msgObject.data;
  console.log('got data: ' + message);
  
  rock.send(imei, username, password, message);
  res.writeHead(200, {'content-type': 'application/json'});
  res.end();
});

// TODO: setup the rocblock server router to the /incoming url
app.post('/incoming', function(req, res){
  console.log('incoming detected!');
  
  // The data sent from RB is in req.body
  var formData = req.body;
  console.log(formData);
  console.log(formData.imei);
  
  // We will log the data
  logData(formData.imei, formData.momsn, formData.transmit_time, formData.iridium_latitude, formData.iridium_longitude, formData.iridium_cep, formData.data);
  
  // RockBlock documentation requires us to respond with http status 200
  // res.writeHead(200, {'Content-Type': 'application/json'});
  // TODO: Do I really need this?
  res.sendStatus(200);
  res.end();
});

app.post('/send_message', jsonParser, function(req, res) {
  //TODO: Check if this is parsing correctly, record sent messages in db
  var msgObject = req.body;
  rock.send(msgObject.imei, msgObject.username, msgObject.password, msgObject.msg);
  //console.log(msgObject.imei + " " + msgObject.username + " " + msgObject.password + " " + msgObject.msg);
  res.writeHead(200, {'content-type': 'application/json'});
  res.end();
});

// This is how we send messages to the RockBlock servers
var send = function(imei, username, password, data) {
  request.post(
    'https://core.rock7.com/rockblock',
    { json: {
      imei: imei,
      username: username,
      password: password,
      data: data,
    } },
    function (error, response, body) {
      //response + body here
      if (!error && response.statusCode === 200) {
        console.log(body);
      }
    }
  );
};


//This is how we specify the path to the template files in the folder 'templates':
app.set('views', path.join(__dirname, 'public'));
//This is how we set the template engine
app.set('view engine', 'pug');

//This is how we serve the template page with the response
app.get('/home', function (req, res) {
  res.render('index', {date: (new Date()).toDateString()});
});

app.get('/', function (req, res) {
  res.render('index', {date: (new Date()).toDateString()});
});


//app.listen(app.get('port'));