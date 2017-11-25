/**
 * Created by hcm on 20.11.2017.
 */

function encode(val) {
  var hex, i;
  
  var result = "";
  for (i=0; i<val.length; i++) {
    hex = val.charCodeAt(i).toString(16);
    result += (""+hex).slice(-4);
  }
  
  return result;
}

function decode(val) {
  var j;
  var hexes = val.match(/.{1,2}/g) || [];
  var back = "";
  for(j = 0; j<hexes.length; j++) {
    back += String.fromCharCode(parseInt(hexes[j], 16));
  }
  
  return back;
}

module.exports = {
  encode,
  decode
}