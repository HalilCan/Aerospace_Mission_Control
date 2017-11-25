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
  var post_data = querystring.stringify({
  
  });
  
  var hexifiedData = hexify.encode(data);
  console.log('sending hexified: ' + hexifiedData);
  request.post(
    'https://core.rock7.com/rockblock/MT',
    {
      imei: imei,
      username: username,
      password: password,
      data: hexifiedData,
    },
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