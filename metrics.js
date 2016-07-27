'use strict';

var dataset = {};

function shouldReport(encounter,pokemon,distance){
  console.log(dataset,pokemon,distance);
  var name = pokemon.name;
  if ( ! dataset[name] ){
    dataset[name] = { sensitivity:500, lastSeen:Date.now() };
    return true;
  }else{
    updateSensitiveity( dataset[name] )
    if ( dataset[name].sensitivity < distance ){ 
      dataset[name].sensitivity = dataset[name].sensitivity * 0.75;
      return true;
    }else{
      return false;
    }
  }
}

function updateSensitiveity( item ){
  var timeDelta = Date.now() - item.lastSeen;
  item.sensitivity += timeDelta / (1000*60)
}

module.exports = {
  shouldReport:shouldReport
}
