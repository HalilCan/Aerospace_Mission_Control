/**
 * Created by hcm on 03.11.2017.
 */
var http = require('http');
var fs = require('fs');
var request = require('request');
var bl = require('bl');
var hexify = require('./hexify');
var querystring = require('querystring');


var send = function(imei, username, password, data) {
  var hexifiedData = hexify.encode(data);
  console.log('sending hexified: ' + hexifiedData);
  
  var dataObject = {
    imei: imei,
    username: username,
    password: password,
    data: hexifiedData
  };
  var dataString = JSON.stringify(dataObject);
  
 /* var options = {
    hostname: 'https://core.rock7.com/rockblock',
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json',
    },
    qs: dataString,
  };
  
  request(options, function(error, response, body) {
    console.log(body);
    if (!error && response.statusCode === 200) {
      console.log(body);
    }
  });
  */
  
  request.post(
    'https://core.rock7.com/rockblock/MT',
    {form: {
      imei: imei,
      username: username,
      password: password,
      data: hexifiedData,
    } },
    function (error, response, body) {
      //response + body here
      console.log('rockblock post response: ' + response.statusCode + ' ' + body);
      if (! error && response.statusCode === 200) {
        console.log('\n' + body);
      }
    }
  );
  
};

module.exports.send = send;