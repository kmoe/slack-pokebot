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
console.log(data);
     if ( data && data.results && data.results[0] ){
       callback(' ('+data.results[0].formatted_address+')');
     }else{
       callback('');
     }
   });
}

function getBearing(start,location){
  
}

module.exports = {
  getDistance:getDistance,
  reverseGeoCode:reverseGeoCode,
  getBearing:getBearing
};
