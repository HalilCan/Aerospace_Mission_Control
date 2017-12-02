/**
 * Created by hcm on 20.11.2017.
 */

// You REALLY want async = true.
// Otherwise, it'll block ALL execution waiting for server response.
var async = true;

var socket = io();

var recentLatitude = 0.0;
var recentLongitude = 0.0;
var recentAccuracy = 0.0;

socket.on('new_message', function(obj){
    var longitudeBox = document.getElementById("longitude-box");
    var latitudeBox = document.getElementById("latitude-box");
    var accuracyBox = document.getElementById("accuracy-box");

    var inBox = document.getElementById("inbox-box");

    var data = obj.data;
    var timestamp = obj.timestamp;

    console.log('new message update socket caught!');
    recentLatitude = obj.latitude;
    recentLongitude = obj.longitude;
    recentAccuracy = obj.acc;

    var inboxElement = "<div class = 'inbox-element'><div class = 'time-row'>" + timestamp + "</div> <div class = 'data-row'>" + data + "</div><div class = 'lat-row'>" + recentLatitude + "</div><div class = 'lon-row'>\" + recentLongitude + \"</div> </div>";
    inBox.innerHTML += inboxElement;

    longitudeBox.value = recentLongitude;
    latitudeBox.value = recentLatitude;
    accuracyBox.value = recentAccuracy;
});

socket.on('new_coords', function(obj){
  var longitudeBox = document.getElementById("longitude-box");
  var latitudeBox = document.getElementById("latitude-box");
  var accuracyBox = document.getElementById("accuracy-box");
  
  console.log('coord update socket caught!');
  recentLatitude = obj.latitude;
  recentLongitude = obj.longitude;
  recentAccuracy = obj.acc;

  longitudeBox.value = recentLongitude;
  latitudeBox.value = recentLatitude;
  accuracyBox.value = recentAccuracy;
  
});


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
  var data = {};
  data.title = 'title';
  data.message = messageData;
  
  $.ajax({
    url: url,
    type: 'POST',
    data: (messageData),
    success: function(data){
      console.log('client to server POST success!');
    },
    error: function(xhr, ajaxOptions, thrownError) {
      if (xhr.status === 200) {
        alert(xhr.status);
        alert(ajaxOptions);
      } else {
        alert(xhr.status);
        alert(thrownError);
      }
    }
  });
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
