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

var pokeMap = {};

a.init(username, password, location, provider, function(err) {
  if (err) throw err;

  logger.log('info', 'Current location: ' + a.playerInfo.locationName);
  logger.log('info', 'lat/long/alt: : ' + a.playerInfo.latitude + ' ' + a.playerInfo.longitude + ' ' + a.playerInfo.altitude);
  var start_location = {latitude:a.playerInfo.latitude,
    longitude:a.playerInfo.longitude};

  a.GetProfile(function(err, profile) {
    if (err) throw err;

    logger.log('info', 'Username: ' + profile.username);

    setInterval(function() {
      a.Heartbeat(function (err,hb) {
        if(err) {
          logger.log('error', err);
        }

        if (!hb || !hb.cells) {
          logger.log('error', 'hb or hb.cells undefined - aborting');
        } else {
          logger.log('info', 'Heartbeat received');
          for (var i = hb.cells.length - 1; i >= 0; i--) {
            if(hb.cells[i].WildPokemon[0]) {
              var wildPokemon = hb.cells[i].WildPokemon;
              var newPokeMap = {};
              for (var j = wildPokemon.length - 1; j >= 0; j--) {
                var pokeId = wildPokemon[j].pokemon.PokemonId;
                var pokemon = a.pokemonlist[parseInt(pokeId)-1];
                newPokeMap[ pokemon.id ] = true;

                var pokemonAlreadyPresent = pokeMap[ pokemon.id ];

                if (!pokemonAlreadyPresent) {
                  var latitude = wildPokemon[j].Latitude;
                  var longitude = wildPokemon[j].Longitude;

                  var position = { latitude : wildPokemon[j].Latitude,
                    longitude : wildPokemon[j].Longitude};
                  var distance = geo.getDistance(position,start_location);
                  var bearing = geo.cardinalBearing(geo.getBearing(start_location,position));
                  if ( metrics.shouldReport( wildPokemon[j] , pokemon , distance) ){
                    geo.reverseGeoCode(position, function(geocode){
                      var message = 'There is a *' + pokemon.name + '* ('+pokemon.num+') '+distance+'m '+bearing+geocode+'! <https://maps.google.co.uk/maps?f=d&dirflg=w&saddr=' + start_location.latitude+","+start_location.longitude+'&daddr=' + position.latitude + ',' + position.longitude+'|Route>';
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
                  } else {
                    logger.log('info', pokemon.name + ' not interesting: skipping');
                  }
                } else {
                  logger.log('info', pokemon.name + ' already present: skipping');
                }
              }
              pokeMap = newPokeMap;
            }
          }
        }
      });
    }, 60000);
  });
});
