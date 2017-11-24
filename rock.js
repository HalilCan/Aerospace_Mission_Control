/**
 * Created by hcm on 03.11.2017.
 */
var http = require('http');
var fs = require('fs');
var request = require('request');
var bl = require('bl');
var hexify = require('./hexify');


var send = function(imei, username, password, data) {
  var hexifiedData = hexify.encode(data);
  console.log('sending hexified: ' + data);
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
}

module.exports.send = send;