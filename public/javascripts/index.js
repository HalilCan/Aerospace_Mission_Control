/**
 * Created by hcm on 20.11.2017.
 */

// You REALLY want async = true.
// Otherwise, it'll block ALL execution waiting for server response.
var async = true;

var rock = require('../../rock');
var hexify = require('../../hexify');

var imeiBox = document.getElementById("imei-box");
var usernameBox = document.getElementById("username-box");
var passwordBox = document.getElementById("password-box");

var messageButton = document.getElementById("send-message-button");
var messageBox = document.getElementById("msg-box");


var sendMessage = $(function() {
  $('message-form').submit(function(event) {
    //We don't want the form to redirect the client
    event.preventDefault();
    //Record transceiver configuration data
    var IMEI = imeiBox.value;
    var USERNAME = usernameBox.value;
    var PASSWORD = passwordBox.value;
    var message = messageBox.value;
    var hexMessage = hexify.encode(message);
    var messageObject = {
      imei: IMEI,
      username: USERNAME,
      password: PASSWORD,
      data: hexMessage
    };
    $.post('/send-message', data, function(res) {
      console.log(res);
    })
  });
});