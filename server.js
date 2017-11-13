/**
 * Created by hcm on 12.11.2017.
 */
let path = require('path');
let http = require('http');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let rock = require('./rock');
let request = require('request');
let url = require('url');

let index = require('./routes/index');
let users = require('./routes/users');

// Main listening port for RockBlock Server communication
let listeningPort = 8000;

let send = function(imei, username, password, data) {
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

let logData = function(url_obj) {
  // Collect all the important information from the message;
  let imei = url_obj.query.imei;
  let momsn = url_obj.query.momsn;
  let transmitTime = url_obj.query.transmit_time;
  let iridiumLatitude = url_obj.query.iridium_latitude;
  let iridiumLongitude = url_obj.query.iridium_longitude;
  let iridiumCep = url_obj.query.iridium_cep; //estimate of the accuracy of lat-long in km
  let data = url_obj.query.data;
  console.log(imei + '\n' + data);
};

let server = http.createServer(function (req, res) {
  if (req.method === 'POST') {
    // Use URL to parse the request and get a URL object from it.
    let urlObject = url.parse(req.url, true);
  
    // Get the path from the url
    let urlPath = urlObject.pathname;
    
    // Now we will log the data
    logData(urlObject);
    
    // RockBlock documentation requires us to respond with http status 200
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res;
  }
}).listen(listeningPort);