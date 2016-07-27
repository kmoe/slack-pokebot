'use strict';

var PokemonGO = require('pokemon-go-node-api');
var request = require('request');
var geolib = require('geolib');
var geocoder = require('geocoder');
var _ = require('lodash');

var metrics = require('./metrics');

var winston = require('winston');
require('winston-loggly-bulk');

winston.add(winston.transports.Loggly, {
  token: process.env.LOGGLY_TOKEN,
  subdomain: process.env.LOGGLY_SUBDOMAIN,
  tags: ["Winston-NodeJS"],
  json: true
});

winston.log('info',"Initialised");

var a = new PokemonGO.Pokeio();

var location = {
  type: 'name',
  name: process.env.PGO_LOCATION,
};

var username = process.env.PGO_USERNAME;
var password = process.env.PGO_PASSWORD;
var provider = process.env.PGO_PROVIDER || 'google';

var pokeMap;

a.init(username, password, location, provider, function(err) {
  if (err) throw err;

  winston.log('info', 'Current location: ' + a.playerInfo.locationName);
  winston.log('info', 'lat/long/alt: : ' + a.playerInfo.latitude + ' ' + a.playerInfo.longitude + ' ' + a.playerInfo.altitude);
  var start_location = {latitude:a.playerInfo.latitude,
    longitude:a.playerInfo.longitude};

  a.GetProfile(function(err, profile) {
    if (err) throw err;

    winston.log('info', 'Username: ' + profile.username);
    // console.log('1[i] Poke Storage: ' + profile.poke_storage);
    // console.log('1[i] Item Storage: ' + profile.item_storage);
    //
    // var poke = 0;
    // if (profile.currency[0].amount) {
    //   poke = profile.currency[0].amount;
    // }
    //
    // console.log('1[i] Pokecoin: ' + poke);
    // console.log('1[i] Stardust: ' + profile.currency[1].amount);

    setInterval(function() {
      a.Heartbeat(function (err,hb) {
        if(err) {
          winston.log('error', err);
        }

        if (!hb || !hb.cells) {
          winston.log('error', 'hb or hb.cells undefined - aborting');
        } else {
          for (var i = hb.cells.length - 1; i >= 0; i--) {
            if(hb.cells[i].WildPokemon[0]) {
              var wildPokemon = hb.cells[i].WildPokemon;

              for (var j = wildPokemon.length - 1; j >= 0; j--) {
                var pokeId = wildPokemon[j].pokemon.PokemonId;
                var pokemon = a.pokemonlist[parseInt(pokeId)-1];

                var pokemonAlreadyPresent = _.some(pokeMap, function(poke) {
                  return poke.id === pokeId;
                });

                if (!pokemonAlreadyPresent) {
                  var latitude = wildPokemon[j].Latitude;
                  var longitude = wildPokemon[j].Longitude;

                  var position = { latitude : wildPokemon[j].Latitude,
                    longitude : wildPokemon[j].Longitude};
                  var distance = geolib.getDistance(position,start_location)
                  if ( metrics.shouldReport( wildPokemon[j] , pokemon , distance) ){
                    reverseGeoCode(position,start_location, function(geocode){
                      var message = 'There is a *' + pokemon.name + '* ('+pokemon.num+') '+distance+'m away'+geocode+'! <https://maps.google.co.uk/maps?f=d&dirflg=w&saddr=' + start_location.latitude+","+start_location.longitude+'&daddr=' + position.latitude + ',' + position.longitude+'|Route>';
                      if ( process.env.SLACK_WEBHOOK_URL ){
                        request.post({
                          url: process.env.SLACK_WEBHOOK_URL,
                          json: true,
                          body: {
                            text: message,
                            icon_url: pokemon.img
                          }
                        }, function(error, response, body) {
                          winston.log('error', error);
                          if(response.body) console.log(response.body);
                        });
                      }
                    winston.log('info', "POST: "+ message );
                    });
                  } else {
                    winston.log('info', pokemon.name + ' not interesting: skipping');
                  }
                } else {
                  winston.log('info', pokemon.name + ' already present: skipping');
                }
              }
              pokeMap = _.map(wildPokemon, function(poke) {
                return {
                  id: poke.pokemon.PokemonId
                };
              });
            }
          }
        }
      });
    }, 60000);
  });
});

function reverseGeoCode(location,callback){
 geocoder.reverseGeocode( location.latitude , location.longitude , 
   function(err,data){
     console.log(data);
     callback(data);
   });
}
