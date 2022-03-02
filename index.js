/* eslint-env node */
//https://github.com/alexanderbazo/ExperimentManager.git
import express from "express";
import Config from "./api/Config.js";
import cors from "cors";
import ExperimentManager from "./api/ExperimentManager.js";

let app;

const HTTP = {
  OK: 200,
  FILE_NOT_FOUND: 404,
};

function start() {
  startServer();
}

function startServer() {
  app = express();
  // TODO:
  app.use(cors());
  app.use(express.json()); //express.json - sending data in the form of some json data object = POST or PUT

  app.get("/api/experiment/:id", onExperimentRequested); // Returns current state of given experiment from server
  app.get("/api/experiments/random", onRandomExperimentRequested); // Returns current state of a random pick from all available experiments

  app.post("/update", onClientUpdateRequested); // Invokes client update and server restart
  app.post("/api/experiment/:id", onExperimentUpdated); // Stores current state of given experiment on server
  app.post("/api/experiment/:id/append", onExperimentDataAppended); // Stores current state of given experiment on server
  app.post("/api/experiment/:id/cancel", onExperimentCanceled); // Resets given experiment on server
  app.post("/api/experiment/:id/close", onExperimentClosed); // Sets experiment state to closed and stores it on server

  app.listen(Config.port);
  console.log(
    "Server runs on the port http://localhost:" + Config.port + "/app"
  );
}

function onClientUpdateRequested(request, response) {
  //app.post("/update"
  setImmediate(() => exec(Config.updateScript));
  response.json({
    msg: "Trying to update client code, server will now shutdown ...",
  });
}

function onExperimentUpdated(request, response) {
  //app.post("/api/experiment/:id"
  let result = ExperimentManager.updateExperimentData(request.body); //updateExperimentOnDisk
  response.json(result);
}

function onExperimentDataAppended(request, response) {
  //app.post("/api/experiment/:id/append"
  let result = ExperimentManager.appendExperimentData(request.body); //updateClosedExperimentOnDisk
  response.json(result);
}

function onExperimentRequested(request, response) {
  //app.get("/api/experiment/:id"
  let result = ExperimentManager.getExperiment(request.params.id); //getExperiment(id)
  console.log("id " + request.params.id);
  response.status(HTTP.OK).json(result);
}

function onRandomExperimentRequested(request, response) {
  //app.get("/api/experiments/random"
  let experiment = ExperimentManager.pickRandomExperiment(); //pickRandomExperiment()
  response.json(experiment);
}

function onExperimentClosed(request, response) {
  //app.post("/api/experiment/:id/close"

  let result = ExperimentManager.closeExperiment(request.body); //updateExperimentOnDisk
  if (result.msg === "404") {
    console.log("Aber error doch!");
  }

  response.json(result);
}

function onExperimentCanceled(request, response) {
  //app.post("/api/experiment/:id/cancel"
  let result = ExperimentManager.putBackExperiment(request.params.id); //resetExperimentWidthID(id)
  response.json(result);
}

start();
