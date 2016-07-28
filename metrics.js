'use strict';

var fs = require('fs');
var dataFilePath = process.env.PGO_DATA || ".data";
var dataset = loadDataSet();
var rarity = loadRarityData();

var InitalSenstivity = process.env.PGO_METRIC_INITAL_SENSITIVITY || 1500;
var SensitivityDecreace = process.env.PGO_METRIC_SENSITIVITY_DECREACE || 0.75;
var SensitivityIncreace = process.env.PGO_METRIC_SENSITIVITY_INCREACE || 1.0;


function shouldReport(p){
  var name = p.pokemon.name;
  p.rarity = rarity[p.pokemon.id]||'common';
  if ( ! dataset[name] ){
    dataset[name] = { sensitivity:InitalSenstivity, lastSeen:Date.now() };
    triggerSaveDataSet();
    return true;
  }else{
    updateSensitiveity( dataset[name] );
    if ( dataset[name].sensitivity < p.distance ){ 
      dataset[name].sensitivity = dataset[name].sensitivity * SensitivityDecreace;
      triggerSaveDataSet();
      return true;
    }else{
      return false;
    }
  }
}

function loadDataSet(){
  try{
    return JSON.parse(fs.readFileSync( dataFilePath , 'utf8' ));
  }catch(e){
    return {};
  }
}

var saveTimeoutId;
function triggerSaveDataSet(){
  if ( !saveTimeoutId ){
    saveTimeoutId = setTimeout( saveDataSet , 1000 );
  }
}

function saveDataSet(){
  saveTimeoutId = null;
  fs.writeFile( dataFilePath , JSON.stringify(dataset) )
}

function loadRarityData(){
  try{
    return JSON.parse(fs.readFileSync( "./rarity.json" , 'utf8' ));
  }catch(e){
    return {};
  }
}

function updateSensitiveity( item ){
  var timeDelta = Date.now() - item.lastSeen;
  item.sensitivity += timeDelta / (1000*60) * SensitivityIncreace;
}

module.exports = {
  shouldReport:shouldReport
}
