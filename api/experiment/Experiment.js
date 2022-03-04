/* eslint-env node */

import fs from "fs";

class Experiment {
  constructor(id, state, startedAt, engagement) {
    this.id = id;
    this.state = state;
    this.startedAt = startedAt;
    this.engagement = engagement;
  }

  static fromFile(filePath) {
    let fileContent = fs.readFileSync(filePath),
      values = JSON.parse(fileContent);

    return new Experiment(
      values.id,
      values.state,
      values.startedAt,
      values.engagement,
    );
  }
}

class ExperimentError {
  constructor(error) {
    this.error = error;
    Object.freeze(this);
  }
}

class ExperimentMessage {
  constructor(msg) {
    this.msg = msg;
    Object.freeze(this);
  }
}

export default Experiment;
export {
  Experiment,
  ExperimentError,
  ExperimentMessage,
};