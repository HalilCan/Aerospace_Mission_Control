/**
 * Created by hcm on 20.11.2017.
 */

function hexify(val) {
  let hex, i;
  
  let result = "";
  for (i=0; i<val.length; i++) {
    hex = val.charCodeAt(i).toString(16);
    result += ("000"+hex).slice(-4);
  }
  
  return result;
}

function dehexify(val) {
  let j;
  let hexes = val.match(/.{1,4}/g) || [];
  let back = "";
  for(j = 0; j<hexes.length; j++) {
    back += String.fromCharCode(parseInt(hexes[j], 16));
  }
  
  return back;
}

module.exports = {
  hexify,
  dehexify
}