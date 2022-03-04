/* eslint-env node */
import express from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import Config from "./api/Config.js";
import Logger from "./api/utils/Logger.js";
import ExperimentManager from "./api/experiment/ExperimentManager.js";

const app = express();

function start() {
  startServer();
}

function startServer() {
  app.use(cors());
  app.use(express.json()); //express.json - sending data in the form of some json data object = POST or PUT
  app.get("/api/experiment/:id", onExperimentRequested); // Returns current state of given experiment from server
  app.get("/api/experiments/random", onRandomExperimentRequested); // Returns current state of a random pick from all available experiments
  app.post("/api/experiment/:id", onExperimentUpdated); // Stores current state of given experiment on server
  app.post("/api/experiment/:id/append", onExperimentDataAppended); // Stores current state of given experiment on server
  app.post("/api/experiment/:id/cancel", onExperimentCanceled); // Resets given experiment on server
  app.post("/api/experiment/:id/close", onExperimentClosed); // Sets experiment state to closed and stores it on server
  app.listen(Config.port);
  Logger.log(`ILB-Server is running on port ${Config.port} ...`);
}

function onExperimentUpdated(request, response) {
  // Called from route: app.post("/api/experiment/:id"
  let result = ExperimentManager.updateExperimentData(request.body); //updateExperimentOnDisk
  response.status(StatusCodes.OK).json(result);
}

function onExperimentDataAppended(request, response) {
  // Called from route: app.post("/api/experiment/:id/append"
  let result = ExperimentManager.appendExperimentData(request.body); //updateClosedExperimentOnDisk
  response.status(StatusCodes.OK).json(result);
}

function onExperimentRequested(request, response) {
  // Called from route: app.get("/api/experiment/:id"
  let result = ExperimentManager.getExperiment(request.params.id); //getExperiment(id)
  response.status(StatusCodes.OK).json(result);
}

function onRandomExperimentRequested(request, response) {
  // Called from route: app.get("/api/experiments/random"
  let experiment = ExperimentManager.pickRandomExperiment(); //pickRandomExperiment()
  response.status(StatusCodes.OK).json(experiment);
}

function onExperimentClosed(request, response) {
  // Called from route: app.post("/api/experiment/:id/close"
  let result = ExperimentManager.closeExperiment(request.body); //updateExperimentOnDisk
  response.status(StatusCodes.OK).json(result);
}

function onExperimentCanceled(request, response) {
  // Called from route: app.post("/api/experiment/:id/cancel"
  let result = ExperimentManager.putBackExperiment(request.params.id); //resetExperimentWidthID(id)
  response.status(StatusCodes.OK).json(result);
}

start();