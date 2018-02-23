/**
 * Created by hcm on 12.11.2017.
 */
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rock = require('./rock');
var request = require('request');
var url = require('url');
var fs = require('fs');
var hexify = require('./hexify');
var qs = require('querystring');
var formidable = require('formidable');

var express = require('express');
var app = express();

//Port config for Heroku, 5000 for Webstorm
app.set('port', ( process.env.PORT || 3030 ));

var server = app.listen(app.get('port') || 3030);
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

//incoming message class
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
      'imei': this.imei,
      'momsn': this.momsn,
      'transmit_time': this.transmitTime,
      'iridium_latitude': this.iridiumLatitude,
      'iridium_longitude': this.iridiumLongitude,
      'accuracy': this.iridiumCep,
      'hex_data': this.data,
      'data': this.dehexData
    };
  }
}

//Message inbox Array
var inbox = new Array();

// Global latitude and longitude variables for last known location
var latitude = 0.0;
var longitude = 0.0;
var gpsAccuracy = 0.0;

/**
 *
 * @param imei
 * @param momsn
 * @param transmitTime
 * @param irLat
 * @param irLon
 * @param irCep
 * @param data
 */
var logData = function (imei, momsn, transmitTime, irLat, irLon, irCep, data) {
  // Collect all the important information from the message;
  var imei = imei;
  var momsn = momsn;
  var transmitTime = transmitTime;
  var iridiumLatitude = irLat;
  var iridiumLongitude = irLon;
  var iridiumCep = irCep; //estimate of the accuracy of lat-long in km
  var data = data;
  
  var newMessage = new incomingMessage(imei, momsn, transmitTime, iridiumLatitude, iridiumLongitude, iridiumCep, data);
  inbox.push(newMessage);
  console.log(inbox[0].getDecodedData());
  
  latitude = iridiumLatitude;
  longitude = iridiumLongitude;
  gpsAccuracy = iridiumCep;
  
  io.sockets.emit('new_message', {
    'timestamp': transmitTime,
    'data': hexify.decode(data),
    'latitude': latitude,
    'longitude': longitude,
    'acc': gpsAccuracy
  });
  
  //TODO: log data to the server database
  console.log('\n' + imei + '\n' + data);
  console.log('data: ' + hexify.decode(data));
};


///////////////////////////////////////////////////////////////////////////////
// FLIGHT SIMULATION

/* inputs:
 gasType: Helium or Hydrogen, launchVolume in cubic meters, balloonWeight and payloadWeight in grams
 outputs:
 burstHeight in ft, ascentRate in ft/min, neutralLift in kg, burstTime in minutes
 */
function calculateBurst(gasType, launchVolume, balloonWeight, payloadWeight) {
  var totexDataDict = {
    '200': [3.00, 0.25],
    '300': [3.78, 0.25],
    '350': [4.12, 0.25],
    '450': [4.72, 0.25],
    '500': [4.99, 0.25],
    '600': [6.02, 0.3],
    '700': [6.53, 0.3],
    '800': [7.00, 0.3],
    '1000': [7.86, 0.3],
    '1200': [8.63, 0.25],
    '1500': [9.44, 0.25],
    '2000': [10.54, 0.25],
    '3000': [13.00, 0.25]
  };
  
  const heliumDensity = 0.1786; //at 0C, 101kPa
  const hydrogenDensity = 0.0899; //at 0C, 101kPa
  const airDensity = 1.205; //at 0C, 101kPa
  var gasDensity = 0.0;
  if (gasType === 'helium') {gasDensity = heliumDensity;} else if (gasType === 'hydrogen') {gasDensity = hydrogenDensity}
  ;
  const airDensityModel = 7283.3;
  
  var launchDiameter = 2 * Math.pow(((3 * launchVolume) / (4 * Math.PI)), 1 / 3);
  var area = Math.PI * Math.pow(launchDiameter / 2, 2);
  
  const balloonWeightString = balloonWeight.toString();
  var burstDiameter = totexDataDict[balloonWeightString][0];
  var burstVolume = (4 / 3) * Math.PI * Math.pow(burstDiameter / 2, 3);
  var burstVolumeRatio = burstVolume / launchVolume;
  var burstHeightMeters = - (airDensityModel * Math.log(1 / burstVolumeRatio));
  
  var grossLift = launchVolume * (airDensity - gasDensity);
  var freeLift = grossLift - ((balloonWeight + payloadWeight) / 1000);
  var balloonCd = totexDataDict[balloonWeightString][1];
  var ascentRateMeters = Math.sqrt(freeLift / (0.5 * balloonCd * airDensity * area));
  var ascentRateFeet = (ascentRateMeters * 3.28) * 60; //also convert from m/sec to ft/min
  var neutralLift = payloadWeight / 1000 + freeLift;
  var burstHeightFeet = burstHeightMeters * 3.28;
  var timeToBurst = burstHeightFeet / ascentRateFeet;
  
  return [burstHeightFeet, ascentRateFeet, neutralLift, timeToBurst];
}

///////////////////////////////////////////////////////////////////////////////

//This handles the post request made by the client
//TODO: return the global requests list/chain/linkedlist object?
app.post('/client_message', function (req, res) {
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



app.post('/incoming', function (req, res) {
  console.log('incoming detected!');
  
  // The data sent from RB is in req.body
  var formData = req.body;
  console.log(formData);
  console.log(formData.imei);
  
  // We will log the data
  // Temp fix: all longitudes are negative -> We thought this was necessary, but turns out RockBlock test data is always in the +,+ range
  logData(formData.imei, formData.momsn, formData.transmit_time, formData.iridium_latitude, (formData.iridium_longitude), formData.iridium_cep, formData.data);
  
  // RockBlock documentation requires us to respond with http status 200
  // res.writeHead(200, {'Content-Type': 'application/json'});
  // TODO: Do I really need this?
  res.sendStatus(200);
  res.end();
});

app.post('/send_message', jsonParser, function (req, res) {
  //TODO: Check if this is parsing correctly, record sent messages in db
  var msgObject = req.body;
  rock.send(msgObject.imei, msgObject.username, msgObject.password, msgObject.msg);
  //console.log(msgObject.imei + " " + msgObject.username + " " + msgObject.password + " " + msgObject.msg);
  res.writeHead(200, {'content-type': 'application/json'});
  res.end();
});

// This is how we send messages to the RockBlock servers
var send = function (imei, username, password, data) {
  request.post(
    'https://core.rock7.com/rockblock',
    {
      json: {
        imei: imei,
        username: username,
        password: password,
        data: data,
      }
    },
    function (error, response, body) {
      //response + body here
      if (! error && response.statusCode === 200) {
        console.log(body);
      }
    }
  );
};


////////////////////////////////////////////////
// DATABASE

/**
 * Models
 */
var User = mongoose.model("User", {
  firstName: String,
  lastName: String
});

var FlightMessage = mongoose.model("FlightMessage", {
  imei: String,
  momsn: String,
  transmitTime: String,
  iridiumLatitude: String,
  iridiumLongitude: String,
  iridiumCep: String, //accuracy
  data: String,
});

socket.on('dblogin', dbkey => {
  mongoose.connect(dbkey, { useMongoClient: true }, () => {
    console.log("DB is connected");
  });
});

socket.on('saveFlight', arck => {
  saveFlight();
});

function saveFlight() {
  for (var i = 0; i < inbox.length; i++) {
    var flightMessage = new FlightMessage(inbox[i].getObject());
    flightMessage.save();
  }
}


/////////////////////////////////////////////////

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

//TODO: implement db first, that will help get around the download/upload
//formidable upload handler
/*
var upload = require('formidable-upload');
var uploader = upload()
  .accept(text/plain)
  .to(['public', 'flightpaths']);

app.post('/upload', uploader.middleware('userfile'));
*/
//formidable file upload for flight data analysis
/*
var dataPath = '';
app.post('/upload', function (req, res) {
  var form = new formidable.IncomingForm();
  
  form.parse(req, function (err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:\n\n');
    dataPath = files.path;
    res.end(util.inspect({fields: fields, files: files}));
  });
  form.on('file', function (name, file) {
    console.log('Uploaded' + file.name);
  });
});
*/

//app.listen(app.get('port'));