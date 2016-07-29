'use strict';

const logger = require('./logger');
const geolib = require('geolib');
const geocoder = require('geocoder');

function getDistance(a, b) {
  return geolib.getDistance(a, b);
}

function reverseGeoCode(location, callback) {
  geocoder.reverseGeocode(location.latitude, location.longitude,
   function (err, data) {
     if (data && data.results && data.results[0]) {
       callback(' (' + data.results[0].formatted_address + ')');
     } else {
       callback('');
     }
   });
}

function radians(degrees) {
  return degrees * Math.PI / 180;
}

function degrees(radians) {
  return radians * 180 / Math.PI;
}

function getBearing(start, target) {
  const s = toRadians(start);
  const d = toRadians(target);
  let dLong = d.longitiude - s.longitiude;
  const inner =
      Math.tan(d.latitude / 2.0 + Math.PI / 4.0) /
      Math.tan(s.latitude / 2.0 + Math.PI / 4.0);
  const dPhi = Math.log(inner);
  if (Math.abs(dLong) > Math.PI) {
    if (dLong > 0.0)
      dLong = -(2 * Math.PI - dLong);
    else
      dLong = (2 * Math.PI + dLong);
  }
  const bearing = degrees(Math.atan2(dLong, dPhi));
  return bearing;
}

const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
function cardinalBearing(degrees) {
  const degreesPerItem = 360 / cardinals.length;
  const option = (degrees + degreesPerItem * 0.5) / degreesPerItem;
  const index = Math.floor(option + cardinals.length) % cardinals.length;
  return cardinals[index];
}

function toRadians(a) {
  return {
    latitude: radians(a.latitude),
    longitiude: radians(a.longitude),
  };
}

module.exports = {
  getDistance,
  reverseGeoCode,
  getBearing,
  cardinalBearing,
};
