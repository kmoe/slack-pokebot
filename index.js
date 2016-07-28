'use strict';

var PokemonGO = require('pokemon-go-node-api');
var request = require('request');
var _ = require('lodash');

var logger = require('./logger');
var metrics = require('./metrics');
var geo = require('./geo');

logger.log('info',"Initialised");

var a = new PokemonGO.Pokeio();

var location = {
  type: 'name',
  name: process.env.PGO_LOCATION,
};

var username = process.env.PGO_USERNAME;
var password = process.env.PGO_PASSWORD;
var provider = process.env.PGO_PROVIDER || 'google';

var start_location;

a.init(username, password, location, provider, function(err) {
  if (err) throw err;

  logger.log('info', 'Current location: ' + a.playerInfo.locationName);
  logger.log('info', 'lat/long/alt: : ' + a.playerInfo.latitude + ' ' + a.playerInfo.longitude + ' ' + a.playerInfo.altitude);
  start_location = {
    latitude:a.playerInfo.latitude,
    longitude:a.playerInfo.longitude };

  a.GetProfile(function(err, profile) {
    if (err) throw err;

    logger.log('info', 'Username: ' + profile.username);

    function getHeartbeat() {
      logger.log('info','Requesting heartbeat');
      a.Heartbeat(function (err,hb) {
        if(err) {
          logger.log('error', err);
        }

        if (!hb || !hb.cells) {
          logger.log('error', 'hb or hb.cells undefined - aborting');
        } else {
          logger.log('info', 'Heartbeat received');
          var hbPokemon = [];
          for (var i = hb.cells.length - 1; i >= 0; i--) {
            if(hb.cells[i].WildPokemon[0]) {
              var wildPokemon = hb.cells[i].WildPokemon;
              for (var j = wildPokemon.length - 1; j >= 0; j--) {
                var pokeId = wildPokemon[j].pokemon.PokemonId;
                var pokemon = a.pokemonlist[parseInt(pokeId)-1];
                var position = { latitude : wildPokemon[j].Latitude,
                                 longitude : wildPokemon[j].Longitude};
                hbPokemon.push( { pokemon:pokemon , details:wildPokemon[j], position:position });
              }
            }
          }
          logger.log('info','Found '+hbPokemon.length+' pokemon');
          if ( hbPokemon.length == 0 ) return;
          var newPokemon = removeKnownPokemon( hbPokemon );
          logger.log('info','Found '+newPokemon.length+' new pokemon');
          if ( newPokemon.length == 0 ) return;
          var interestingPokemon = removeUniteretingPokemon( newPokemon );
          logger.log('info','Found '+interestingPokemon.length+' interesting pokemon');
          if ( interestingPokemon.length == 0 ) return;
          sendMessage( interestingPokemon );
        } 
      });
    }
    getHeartbeat();
    setInterval( getHeartbeat , 60000);
  });
});


var knownPokemon = {};
function removeKnownPokemon(pokemon){
  var nextKnownPokemon = {};
  var unknownPokemon = [];
  for ( var id in pokemon ){ 
    var p = pokemon[id];
    if ( !knownPokemon[p.id] ){
      unknownPokemon.push(p);
    }
    nextKnownPokemon[p.id] = true;
  }
  knownPokemon = nextKnownPokemon;
  return unknownPokemon;
}

function removeUniteretingPokemon(pokemon){
  var interestingPokemon = [];
  for ( var id in pokemon ){ 
    var p = pokemon[id];
console.log(p);
    p.distance = geo.getDistance(p.position,start_location);
    p.bearing = geo.cardinalBearing(geo.getBearing(start_location,p.position));
    if ( metrics.shouldReport( p ) ){
      interestingPokemon.push(p);
    }
  }
  return interestingPokemon
}

function sendMessage(pokemon){
  for ( var id in pokemon ){
    var p = pokemon[id];
    geo.reverseGeoCode(p.position, function(geocode){
      var message = 'There is a *' + p.pokemon.name + '* ('+p.pokemon.num+') '+p.distance+'m '+p.bearing+geocode+'! <https://maps.google.co.uk/maps?f=d&dirflg=w&saddr=' + start_location.latitude+","+start_location.longitude+'&daddr=' + p.position.latitude + ',' + p.position.longitude+'|Route>';
      if ( process.env.SLACK_WEBHOOK_URL ){
        request.post({
          url: process.env.SLACK_WEBHOOK_URL,
          json: true,
          body: {
            text: message,
            icon_url: pokemon.img
          }
        }, function(error, response, body) {
          if(error) logger.error(error);
          if(response.body) logger.log(response.body);
        });
      }
      logger.log('info', "POST: "+ message );
    });
  }
}
