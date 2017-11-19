/**
 * Created by hcm on 12.11.2017.
 */
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rock = require('./rock');
var request = require('request');
var url = require('url');
var fs = require('fs');

var express = require('express');
var app = express();

//To parse x-www-form-urlencoded request bodies, Express.js can use urlencoded()
//middleware from the body-parser module.
var bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({extended: false}));

var index = require('./routes/index');
var users = require('./routes/users');

// Main listening port for RockBlock Server communication
var listeningPort = 8000;

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

var logData = function(url_obj) {
  // Collect all the important information from the message;
  var imei = url_obj.query.imei;
  var momsn = url_obj.query.momsn;
  var transmitTime = url_obj.query.transmit_time;
  var iridiumLatitude = url_obj.query.iridium_latitude;
  var iridiumLongitude = url_obj.query.iridium_longitude;
  var iridiumCep = url_obj.query.iridium_cep; //estimate of the accuracy of lat-long in km
  var data = url_obj.query.data;
  
  //TODO: log data to the server database
  console.log(imei + '\n' + data);
};

//TODO: setup the rocblock server router to the /incoming url
app.post('/incoming', function(req, res){
  // Use URL to parse the request and get a URL object from it.
  var urlObject = url.parse(req.url, true);
  
  // Get the path from the url
  var urlPath = urlObject.pathname;
  
  // Now we will log the data
  logData(urlObject);
  
  // RockBlock documentation requires us to respond with http status 200
  res.writeHead(200, {'Content-Type': 'application/json'});
  return res;
});


app.listen(listeningPort);

var server = http.createServer(function (req, res) {
  if (req.method === 'POST') {
  
  }
}).listen(listeningPort);