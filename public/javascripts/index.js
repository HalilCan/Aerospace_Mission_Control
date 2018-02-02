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

socket.on('new_message', function (obj) {
  var longitudeBox = document.getElementById('longitude-box');
  var latitudeBox = document.getElementById('latitude-box');
  var accuracyBox = document.getElementById('accuracy-box');
  
  var inBox = document.getElementById('inbox-box');
  
  var data = obj.data;
  var timestamp = obj.timestamp;
  
  console.log('new message update socket caught!');
  recentLatitude = obj.latitude;
  recentLongitude = obj.longitude;
  recentAccuracy = obj.acc;
  
  var inboxElement = '<div class = \'inbox-element\'><div class = \'time-row\'>' + timestamp + '</div> <div class = \'data-row\'>' + data + '</div><div class = \'lat-row\'>' + recentLatitude + '</div><div class = \'lon-row\'>' + recentLongitude + '</div> </div>';
  inBox.innerHTML += inboxElement;
  
  inboxArray.push({
    'latitude': parseFloat(recentLatitude),
    'longitude': parseFloat(recentLongitude),
    'accuracy': parseInt(recentAccuracy),
    'timestamp': timestamp,
    'data': data
  });
  console.log('most recent latitude: ' + parseFloat(recentLatitude));
  console.log('final array latitude: ' + parseFloat(inboxArray[inboxArray.length - 1].latitude));
  initMap(inboxArray);
  
  longitudeBox.value = recentLongitude;
  latitudeBox.value = recentLatitude;
  accuracyBox.value = recentAccuracy;
});

socket.on('flight_upload', function (obj) {

});

socket.on('new_coords', function (obj) {
  var longitudeBox = document.getElementById('longitude-box');
  var latitudeBox = document.getElementById('latitude-box');
  var accuracyBox = document.getElementById('accuracy-box');
  
  console.log('coord update socket caught!');
  recentLatitude = obj.latitude;
  recentLongitude = obj.longitude;
  recentAccuracy = obj.acc;
  
  longitudeBox.value = recentLongitude;
  latitudeBox.value = recentLatitude;
  accuracyBox.value = recentAccuracy;
  
});


function sendToServer() {
  var imeiBox = document.getElementById('imei-box');
  var usernameBox = document.getElementById('username-box');
  var passwordBox = document.getElementById('password-box');
  
  var messageButton = document.getElementById('send-message-button');
  var messageBox = document.getElementById('msg-box');
  
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
    success: function (data) {
      console.log('client to server POST success!');
    },
    error: function (xhr, ajaxOptions, thrownError) {
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
  for (var i = 0; i < inboxArray.length; i ++) {
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
    zoom: 7,
    center: {lat: 39.95233, lng: - 75.16379},
    mapTypeId: 'terrain',
    styles: [
      {
        'elementType': 'geometry',
        'stylers': [
          {
            'color': '#212121'
          }
        ]
      },
      {
        'elementType': 'labels.icon',
        'stylers': [
          {
            'visibility': 'off'
          }
        ]
      },
      {
        'elementType': 'labels.text.fill',
        'stylers': [
          {
            'color': '#757575'
          }
        ]
      },
      {
        'elementType': 'labels.text.stroke',
        'stylers': [
          {
            'color': '#212121'
          }
        ]
      },
      {
        'featureType': 'administrative',
        'elementType': 'geometry',
        'stylers': [
          {
            'color': '#757575'
          }
        ]
      },
      {
        'featureType': 'administrative.country',
        'elementType': 'labels.text.fill',
        'stylers': [
          {
            'color': '#9e9e9e'
          }
        ]
      },
      {
        'featureType': 'administrative.land_parcel',
        'stylers': [
          {
            'visibility': 'off'
          }
        ]
      },
      {
        'featureType': 'administrative.locality',
        'elementType': 'labels.text.fill',
        'stylers': [
          {
            'color': '#bdbdbd'
          }
        ]
      },
      {
        'featureType': 'poi',
        'elementType': 'labels.text.fill',
        'stylers': [
          {
            'color': '#757575'
          }
        ]
      },
      {
        'featureType': 'poi.park',
        'elementType': 'geometry',
        'stylers': [
          {
            'color': '#181818'
          }
        ]
      },
      {
        'featureType': 'poi.park',
        'elementType': 'labels.text.fill',
        'stylers': [
          {
            'color': '#616161'
          }
        ]
      },
      {
        'featureType': 'poi.park',
        'elementType': 'labels.text.stroke',
        'stylers': [
          {
            'color': '#1b1b1b'
          }
        ]
      },
      {
        'featureType': 'road',
        'elementType': 'geometry.fill',
        'stylers': [
          {
            'color': '#2c2c2c'
          }
        ]
      },
      {
        'featureType': 'road',
        'elementType': 'labels.text.fill',
        'stylers': [
          {
            'color': '#8a8a8a'
          }
        ]
      },
      {
        'featureType': 'road.arterial',
        'elementType': 'geometry',
        'stylers': [
          {
            'color': '#373737'
          }
        ]
      },
      {
        'featureType': 'road.highway',
        'elementType': 'geometry',
        'stylers': [
          {
            'color': '#3c3c3c'
          }
        ]
      },
      {
        'featureType': 'road.highway.controlled_access',
        'elementType': 'geometry',
        'stylers': [
          {
            'color': '#4e4e4e'
          }
        ]
      },
      {
        'featureType': 'road.local',
        'elementType': 'labels.text.fill',
        'stylers': [
          {
            'color': '#616161'
          }
        ]
      },
      {
        'featureType': 'transit',
        'elementType': 'labels.text.fill',
        'stylers': [
          {
            'color': '#757575'
          }
        ]
      },
      {
        'featureType': 'water',
        'elementType': 'geometry',
        'stylers': [
          {
            'color': '#262626'
          }
        ]
      },
      {
        'featureType': 'water',
        'elementType': 'labels.text.fill',
        'stylers': [
          {
            'color': '#3d3d3d'
          }
        ]
      }
    ]
  });
  
  for (var i = 0; i < inboxArray.length; i ++) {
    var accuracyCircle = new google.maps.Circle({
      strokeColor: '#fafff8',
      strokeOpacity: 0.7,
      strokeWeight: 2,
      fillColor: '#ffd6e8',
      fillOpacity: 0.35,
      map: map,
      center: {lat: coordArray[i].lat, lng: coordArray[i].lng},
      radius: 1000 * accuracyArray[i].acc
    });
  }
  
  
  var flightPath = new google.maps.Polyline({
    path: coordArray,
    geodesic: true,
    strokeColor: '#fef8ff',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  flightPath.setMap(map);
}

function downloadCsv() {
  var csv = inboxToCsv();
  var dateText = getCurrentDate();
  var filename = 'flightData-' + dateText;
  var element = document.createElement('a');
  
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
  element.setAttribute('download', filename);
  
  element.style.display = 'none';
  document.body.appendChild(element);
  
  element.click();
  
  document.body.removeChild(element);
}

function getCurrentDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  
  if (dd < 10) {
    dd = '0' + dd
  }
  
  if (mm < 10) {
    mm = '0' + mm
  }
  
  today = mm + '/' + dd + '/' + yyyy;
  
  return today;
}

function inboxToCsv() {
  var csv = 'timestamp,latitude,longitude,accuracy,data;';
  for (var i = 0; i < inboxArray.length; i ++) {
    var inboundMsg = inboxArray[i];
    csv += inboundMsg.timestamp + ',' + inboundMsg.latitude.toString() + ',' + inboundMsg.longitude.toString() + ',' + inboundMsg.accuracy.toString() + ',' + inboundMsg.data + ';';
  }
  return csv;
}

function openTab(event, tabName) {
  var i, tabcontent, tablinks;
  
  tabcontent = document.getElementsByClassName('tab-content');
  for (i = 0; i < tabcontent.length; i ++) {
    tabcontent[i].style.display = 'none';
  }
  
  tablinks = document.getElementsByClassName('tablinks');
  for (i = 0; i < tablinks.length; i ++) {
    tablinks[i].className = tablinks[i].className.replace('active', '');
  }
  
  document.getElementById(tabName).style.display = 'block';
  event.currentTarget.className += 'active';
}

function calculateBurst(gasType, launchVolume, balloonWeight, payloadWeight) {
  var totexDataDict = {
    '200': [3.00, 0.25],
    '300': [3.78, 0.25],
    '350': [4.12, 0.25],
    '450': [4.72, 0.25],
    '500': [4.99, 0.25],
    '600': [6.02, 0.3],
    '700': [6.53, 0.3],
    '800': [7.00, 0.3],
    '1000': [7.86, 0.3],
    '1200': [8.63, 0.25],
    '1500': [9.44, 0.25],
    '2000': [10.54, 0.25],
    '3000': [13.00, 0.25]
  };
  
  const heliumDensity = 0.1786; //at 0C, 101kPa
  const hydrogenDensity = 0.0899; //at 0C, 101kPa
  const airDensity = 1.205; //at 0C, 101kPa
  var gasDensity = 0.0;
  if (gasType === 'helium') {gasDensity = heliumDensity;} else if (gasType === 'hydrogen') {gasDensity = hydrogenDensity}
  ;
  const airDensityModel = 7283.3;
  
  var launchDiameter = 2 * Math.pow(((3 * launchVolume) / (4 * Math.PI)), 1 / 3);
  var area = Math.PI * Math.pow(launchDiameter / 2, 2);
  
  const balloonWeightString = balloonWeight.toString();
  var burstDiameter = totexDataDict[balloonWeightString][0];
  var burstVolume = (4 / 3) * Math.PI * Math.pow(burstDiameter / 2, 3);
  var burstVolumeRatio = burstVolume / launchVolume;
  var burstHeightMeters = - (airDensityModel * Math.log(1 / burstVolumeRatio));
  
  var grossLift = launchVolume * (airDensity - gasDensity);
  var freeLift = grossLift - ((balloonWeight + payloadWeight) / 1000);
  var balloonCd = totexDataDict[balloonWeightString][1];
  var ascentRateMeters = Math.sqrt(freeLift / (0.5 * balloonCd * airDensity * area));
  var ascentRateFeet = (ascentRateMeters * 3.28) * 60; //also convert from m/sec to ft/min
  var neutralLift = payloadWeight / 1000 + freeLift;
  var burstHeightFeet = burstHeightMeters * 3.28;
  var timeToBurst = burstHeightFeet / ascentRateFeet;
  
  return [burstHeightFeet, ascentRateFeet, neutralLift, timeToBurst];
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
