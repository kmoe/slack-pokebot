'use strict';

const fs = require('fs');
const _ = require('lodash');

const dataFilePath = process.env.PGO_DATA || '.data';

const InitalSenstivity = process.env.PGO_METRIC_INITAL_SENSITIVITY || 1500;
const SensitivityDecrease = process.env.PGO_METRIC_SENSITIVITY_DECREACE || 0.75;
const SensitivityIncrease = process.env.PGO_METRIC_SENSITIVITY_INCREACE || 1.0;

function loadDataSet() {
  try {
    return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  } catch (e) {
    return {};
  }
}

const dataset = loadDataSet();

let saveTimeoutId;
function saveDataSet() {
  saveTimeoutId = null;
  fs.writeFile(dataFilePath, JSON.stringify(dataset));
}

function triggerSaveDataSet() {
  if (!saveTimeoutId) {
    saveTimeoutId = setTimeout(saveDataSet, 1000);
  }
}

function loadRarityData() {
  try {
    return JSON.parse(fs.readFileSync('./rarity.json', 'utf8'));
  } catch (e) {
    return {};
  }
}

const rarity = loadRarityData();

function updateSensitivity(item) {
  const newItem = _.clone(item);
  const timeDelta = Date.now() - item.lastSeen;
  newItem.sensitivity += timeDelta / ((1000 * 60) * SensitivityIncrease);
  return newItem;
}

function shouldReport(p) {
  const newP = _.clone(p);
  const name = p.pokemon.name;
  let result = null;
  newP.rarity = rarity[p.pokemon.id] || 'common';
  if (!dataset[name]) {
    dataset[name] = { sensitivity: InitalSenstivity, lastSeen: Date.now() };
    triggerSaveDataSet();
    result = newP;
  } else {
    const newItem = updateSensitivity(dataset[name]);
    if (newItem.sensitivity < p.distance) {
      newItem.sensitivity *= SensitivityDecrease;
      dataset[name] = newItem;
      triggerSaveDataSet();
      result = newP;
    }
  }
  return result;
}

module.exports = {
  shouldReport,
};
