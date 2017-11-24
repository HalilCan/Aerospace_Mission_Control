/**
 * Created by hcm on 20.11.2017.
 */

// You REALLY want async = true.
// Otherwise, it'll block ALL execution waiting for server response.
var async = true;

function sendToServer() {
  var imeiBox = document.getElementById("imei-box");
  var usernameBox = document.getElementById("username-box");
  var passwordBox = document.getElementById("password-box");
  
  var messageButton = document.getElementById("send-message-button");
  var messageBox = document.getElementById("msg-box");
  
  //Record transceiver configuration data
  
  var IMEI = imeiBox.value;
  var USERNAME = usernameBox.value;
  var PASSWORD = passwordBox.value;
  var message = messageBox.value;
  var messageData = {
    imei: IMEI,
    username: USERNAME,
    password: PASSWORD,
    data: message
  };
  //Setup the ajax request
  var url = '/client_message';
  
  $.ajax({
    url: url,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(messageData),
    dataType: 'json',
    success: function(data){
      console.log('client to server POST success: ' + data);
    },
    error: function(xhr, ajaxOptions, thrownError) {
      if (xhr.status === 200) {
        alert(ajaxOptions);
      } else {
        alert(xhr.status);
        alert(thrownError);
      }
    }
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
