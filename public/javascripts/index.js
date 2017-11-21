/**
 * Created by hcm on 20.11.2017.
 */

// You REALLY want async = true.
// Otherwise, it'll block ALL execution waiting for server response.
let async = true;

var rock = require('../../rock');
var hexify = require('../../hexify');

let imeiBox = document.getElementById("imei-box");
let usernameBox = document.getElementById("username-box");
let passwordBox = document.getElementById("password-box");

let sendMessageButton = document.getElementById("send-message-button");
let sendMessageBox = document.getElementById("send-message-box");
