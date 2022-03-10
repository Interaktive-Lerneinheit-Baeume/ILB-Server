/* eslint-env node */

import fs from "fs";
import path from "path";
import Config from "../Config.js";
import Logger from "../utils/Logger.js";
import * as Time from "../utils/Time.js";
import {
  Experiment,
  ExperimentMessage,
  ExperimentError,
} from "./Experiment.js";

const CONDITIONS = ["viewing", "constructing"];

let experiments;

function loadExperimentsFromDisk(dataPath) {
  Logger.log(`Loading experiments from disk (${dataPath}) ...`);
  let files = fs.readdirSync(dataPath);
  experiments = [];
  files.forEach((file) => experiments.push(Experiment.fromFile(path.join(
    dataPath, file))));
  Logger.log(`Loaded ${experiments.length} experiments!`);
}

/**
 * Updates the corresponding JSON file with the data from the experiment object.
 * If the objects
 * state was set to "closed", the file will be moved
 * from Config.dataDir to Config.resultsDir and the
 * experiment object will be removed from the live array ("experiments");
 */
function updateExperimentOnDisk(experiment) {
  Logger.log(`Updating experiment (${experiment.id}) on disk ...`);
  let filePath = path.join(Config.dataDir, experiment.id + ".json"),
    experimentAsJSON = JSON.stringify(experiment);
  fs.writeFileSync(filePath, experimentAsJSON);
  
  if (experiment.state === "closed") {
    Logger.log(`Closing experiment (${experiment.id}) for good ...`);
    let targetPath = path.join(Config.resultsDir, experiment.id + ".json");
    fs.copyFileSync(filePath, targetPath);
    fs.unlinkSync(filePath);
    for (let i = 0; i < experiments.length; i++) {
      if (experiments[i].id === experiment.id) {
        experiments.splice(i, 1);
        return new ExperimentMessage(
          `Experiment ${experiment.id} closed and moved to storage.`);
      }
    }
  }
  return new ExperimentMessage(`Experiment ${experiment.id} updated.`);
}

function updateClosedExperimentOnDisk(experiment) {
  Logger.log(`Updating closed experiment ${experiment.id} ...`);
  let filePath = path.join(Config.resultsDir, experiment.id + ".json"),
    experimentAsJSON = JSON.stringify(experiment);
  fs.writeFileSync(filePath, experimentAsJSON);
  return new ExperimentMessage(`Appended data to experiment ${experiment.id}.`);
}

/**
 * Resets the given experiment in the live array ("experiments") and on disk so that it can be reused
 * by another participant
 */
function resetExperimentWidthID(id) {
  Logger.log(`Resetting experiment ${id}`);
  let foundExperiments = experiments.filter((experiment) => experiment.id ===
    id);
  if (foundExperiments.length !== 0) {
    foundExperiments[0].state = "open";
    foundExperiments[0].startedAt = null;
    return updateExperimentOnDisk(foundExperiments[0]);
  }
  return new ExperimentError(
    `Unknown ID, could not reset experiment for ${id}`);
}

function pickRandomExperimentWithConditionBias(availableExperiments) {
  let filteredExperiments = {},
    experimentsForPick,
    randomNumber;
  CONDITIONS.forEach((condition) => (filteredExperiments[condition] =
    availableExperiments.filter((experiment) => experiment
      .engagement === condition)));

  experimentsForPick = filteredExperiments[CONDITIONS[0]];
  for (let i = 1; i < CONDITIONS.length; i++) {
    let condition = CONDITIONS[i],
      experimentsForConditions = filteredExperiments[condition];
    if (experimentsForConditions.length > experimentsForPick.length) {
      experimentsForPick = experimentsForConditions;
    }
  }
  randomNumber = Math.floor(Math.random() * experimentsForPick.length);
  return experimentsForPick[randomNumber];
}

class ExperimentManager {

  constructor() {
    loadExperimentsFromDisk(Config.dataDir);
    setInterval(
      this.resetIdleExperiments,
      Config.idleExperimentsCheckInterval * Time.ONE_MINUTE,
    );
  }

  /**
   * Resets all currently started experiments wich where not finished within the expected time frame. Called
   * regularly to prevent prepared cases getting lost when users start but not finish experiments.
   */
  resetIdleExperiments() {
    Logger.log("Looking for idle experiments ...");
    let now = Date.now(),
      idleExperiments = experiments.filter((experiment) => experiment
        .state === "in-use" && ((now - experiment.startedAt) > (Config
          .experimentResetTime * Time.ONE_MINUTE)));
    for (let i = 0; i < idleExperiments.length; i++) {
      let idleExperiment = idleExperiments[i];
      resetExperimentWidthID(idleExperiment.id);
    }
  }

  /**
   * Returns a currently not used and not yet finished experiment by
   * randomly picking one while trying to balance the different conditions.
   *
   * Before returning, the picked experiment's state will be changed to "in-use".
   */
  pickRandomExperiment() {
    Logger.log("Picking random experiment ...");
    let availableExperiments, pick;
    if (experiments.length === 0) {
      Logger.error("No experiment available!");
      return new ExperimentError("No more experiments available");
    }
    availableExperiments = experiments.filter((experiment) => experiment
      .state === "open");
    if (availableExperiments.length === 0) {
      Logger.error("No open experiment available!");
      return new ExperimentError("No open experiment currently available");
    }
    pick = pickRandomExperimentWithConditionBias(availableExperiments);
    pick.state = "in-use";
    pick.startedAt = Date.now();
    updateExperimentOnDisk(pick);
    Logger.log(`Picked experiment (${pick.id}).`);
    return pick;
  }

  /**
   *
   * Returns the experiment, identified by the given id, without changing its state
   */
  getExperiment(id) {
    Logger.log(`Retrieving experiment (${id}) ...`);
    let foundExperiments = experiments.filter((experiment) => experiment.id === id);
    if (foundExperiments.length !== 0) {
      return foundExperiments[0];
    }
    Logger.error("Could not find experiment!");
    return new ExperimentError(`Could not retrieve experiment for ${id}`);
  }

  /**
   * Resets the state of the given experiments so that it can be reused by another
   * participant.
   */
  putBackExperiment(id) {
    Logger.log(`Putting back experiment (${id}) ...`);
    return resetExperimentWidthID(id);
  }

  /**
   * Updates the given experiment on disk without changing its state
   */
  updateExperimentData(experiment) {
    Logger.log(`Updating experiment (${experiment.id}) ...`);
    return updateExperimentOnDisk(experiment);
  }

  /**
   * Updates closed experiment on disk
   */
  appendExperimentData(experiment) {
    Logger.log(`Appending data to experiment (${experiment.id}) ...`);
    return updateClosedExperimentOnDisk(experiment);
  }

  /**
   * Marks the given experiment as done an stores it results for further analysis. The
   * stored experiment will not be available to other participants.
   */
  closeExperiment(experiment) {
    Logger.log(`Closing experiment (${experiment.id}) ...`);
    experiment.state = "closed";
    return updateExperimentOnDisk(experiment);
  }
}

export default new ExperimentManager();