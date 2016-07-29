'use strict';

const fs = require('fs');
const dataFilePath = process.env.PGO_DATA || '.data';
const dataset = loadDataSet();
const rarity = loadRarityData();

const InitalSenstivity = process.env.PGO_METRIC_INITAL_SENSITIVITY || 1500;
const SensitivityDecreace = process.env.PGO_METRIC_SENSITIVITY_DECREACE || 0.75;
const SensitivityIncreace = process.env.PGO_METRIC_SENSITIVITY_INCREACE || 1.0;


function shouldReport(p) {
  const name = p.pokemon.name;
  p.rarity = rarity[p.pokemon.id] || 'common';
  if (! dataset[name]) {
    dataset[name] = { sensitivity: InitalSenstivity, lastSeen: Date.now() };
    triggerSaveDataSet();
    return true;
  } else {
    updateSensitiveity(dataset[name]);
    if (dataset[name].sensitivity < p.distance) {
      dataset[name].sensitivity = dataset[name].sensitivity * SensitivityDecreace;
      triggerSaveDataSet();
      return true;
    } else {
      return false;
    }
  }
}

function loadDataSet() {
  try {
    return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  } catch (e) {
    return {};
  }
}

let saveTimeoutId;
function triggerSaveDataSet() {
  if (!saveTimeoutId) {
    saveTimeoutId = setTimeout(saveDataSet, 1000);
  }
}

function saveDataSet() {
  saveTimeoutId = null;
  fs.writeFile(dataFilePath, JSON.stringify(dataset));
}

function loadRarityData() {
  try {
    return JSON.parse(fs.readFileSync('./rarity.json', 'utf8'));
  } catch (e) {
    return {};
  }
}

function updateSensitiveity(item) {
  const timeDelta = Date.now() - item.lastSeen;
  item.sensitivity += timeDelta / (1000 * 60) * SensitivityIncreace;
}

module.exports = {
  shouldReport,
};
