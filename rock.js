/**
 * Created by hcm on 03.11.2017.
 */
var http = require('http');
var fs = require('fs');
var request = require('request');
var bl = require('bl');


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
}

module.exports.request = send;