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

var inboxArray = [];

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

    var inboxElement = "<div class = 'inbox-element'><div class = 'time-row'>" + timestamp + "</div> <div class = 'data-row'>" + data + "</div><div class = 'lat-row'>" + recentLatitude + "</div><div class = 'lon-row'>" + recentLongitude + "</div> </div>";
    inBox.innerHTML += inboxElement;

    inboxArray.push({'latitude' : parseFloat(recentLatitude), 'longitude' : parseFloat(recentLongitude), 'accuracy' : parseInt(recentAccuracy), 'timestamp' : timestamp, 'data' : data});
    console.log('most recent latitude: ' + parseFloat(recentLatitude));
    console.log('final array latitude: ' + parseFloat(inboxArray[inboxArray.length-1].latitude));
    initMap(inboxArray);

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

//Google Maps part
/*function initMap(latLngObjArray) {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: {lat: 0, lng: -180},
        mapTypeId: 'terrain'
    });

    var flightPlanCoordinates = latLngObjArray;
        //[{lat: 0, lng: 0},]

    var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#3b4264',
        strokeOpacity: 0.7,
        strokeWeight: 2
    });

    flightPath.setMap(map);
}

initMap([{lat: 37.101, lng: -122.214},{lat: 47.101, lng: -125.214}]);
*/

function initMap(inboxArray) {
    var coordArray = [];
    var accuracyArray = [];
    for (var i = 0; i < inboxArray.length; i++) {
        var message = inboxArray[i];
        // console.log('mapside latitude: ' + message.latitude);
        coordArray.push({'lat': message.latitude, 'lng': message.longitude});
        accuracyArray.push({'acc': message.accuracy});
    }
    /*
    for (var message in inboxArray) {
        console.log(message.latitude);
        coordArray.push({'lat': message.latitude, 'lng': message.longitude});
        accuracyArray.push({'acc': message.accuracy});
    }
    */
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: {lat: 0, lng: -180},
        mapTypeId: 'terrain',
        styles: [
            {
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#1d2c4d"
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#8ec3b9"
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#1a3646"
                    }
                ]
            },
            {
                "featureType": "administrative.country",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#4b6878"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#64779e"
                    }
                ]
            },
            {
                "featureType": "administrative.province",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#4b6878"
                    }
                ]
            },
            {
                "featureType": "landscape.man_made",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#334e87"
                    }
                ]
            },
            {
                "featureType": "landscape.natural",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#023e58"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#283d6a"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#6f9ba5"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#1d2c4d"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#023e58"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#3C7680"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#304a7d"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#98a5be"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#1d2c4d"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#2c6675"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#255763"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#b0d5ce"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#023e58"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#98a5be"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#1d2c4d"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#283d6a"
                    }
                ]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#3a4762"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#0e1626"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#4e6d70"
                    }
                ]
            }
        ]
    });

    for (var i = 0; i < inboxArray.length; i++) {
        var accuracyCircle = new google.maps.Circle({
            strokeColor: '#fafff8',
            strokeOpacity: 0.7,
            strokeWeight: 2,
            fillColor: 'FF0000',
            fillOpacity: 0.35,
            map: map,
            center: {lat: coordArray[i].lat, lng: coordArray[i].lng},
            radius: 1000 * accuracyArray[i].acc
        });
    }


    var flightPath = new google.maps.Polyline({ path: coordArray, geodesic: true, strokeColor: '#fef8ff', strokeOpacity: 1.0, strokeWeight: 2 }); flightPath.setMap(map);
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
