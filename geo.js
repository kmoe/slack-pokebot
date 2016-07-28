'use strict';

var logger = require('./logger');
var geolib = require('geolib');
var geocoder = require('geocoder');

function getDistance(a,b){
  return geolib.getDistance(a,b);
}

function reverseGeoCode(location,callback){
 geocoder.reverseGeocode( location.latitude , location.longitude , 
   function(err,data){
     if ( data && data.results && data.results[0] ){
       callback(' ('+data.results[0].formatted_address+')');
     }else{
       callback('');
     }
   });
}

function radians(degrees) {
  return degrees * Math.PI / 180;
};
 
function degrees(radians) {
  return radians * 180 / Math.PI;
};

function getBearing(start,target){
  var s = toRadians(start);
  var d = toRadians(target);
  var dLong  = d.longitiude - s.longitiude;
  var inner = 
      Math.tan(d.latitude/2.0+Math.PI/4.0)/
      Math.tan(s.latitude/2.0+Math.PI/4.0);
  var dPhi = Math.log(inner);
  if (Math.abs(dLong) > Math.PI ){
    if (dLong > 0.0)
      dLong = -(2*Math.PI - dLong);
    else
      dLong = (2*Math.PI + dLong);
  }
  var bearing = degrees(Math.atan2(dLong,dPhi));
  return bearing;
}

var cardinals = ['N','NE','E','SE','S','SW','W','NW'];
function cardinalBearing(degrees){
  var degreesPerItem = 360 / cardinals.length;
  var option = (degrees + degreesPerItem*0.5) / degreesPerItem
  var index = Math.floor(option + cardinals.length ) % cardinals.length
  return cardinals[index];
}

function toRadians(a){
  return {
    latitude:radians(a.latitude),
    longitiude:radians(a.longitude)
  };
}

module.exports = {
  getDistance:getDistance,
  reverseGeoCode:reverseGeoCode,
  getBearing:getBearing,
  cardinalBearing:cardinalBearing
};
