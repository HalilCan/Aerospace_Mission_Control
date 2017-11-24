/**
 * Created by hcm on 20.11.2017.
 */

// You REALLY want async = true.
// Otherwise, it'll block ALL execution waiting for server response.
var async = true;

var imeiBox = document.getElementById("imei-box");
var usernameBox = document.getElementById("username-box");
var passwordBox = document.getElementById("password-box");

var messageButton = document.getElementById("send-message-button");
var messageBox = document.getElementById("msg-box");


function sendToServer() {
  //Record transceiver configuration data
  
  var IMEI = imeiBox.value;
  var USERNAME = usernameBox.value;
  var PASSWORD = passwordBox.value;
  var message = messageBox.value;
  var $this = $(this);
  var messageObject = {
    imei: IMEI,
    username: USERNAME,
    password: PASSWORD,
    data: message
  };
  //Setup the ajax request
  var url = '/client_messsage';
  
  $.ajax({
    url: url,
    type: 'POST',
    contentType: 'application/JSON',
  })
}



/* $('message-form').submit(function(event) {
  //We don't want the form to redirect the client
  event.preventDefault();
  /**
  $.post('/send-message', data, function(res) {
    console.log(res);
  })
  */
//});
