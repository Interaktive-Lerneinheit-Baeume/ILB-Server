/* eslint-env node */

import fs from "fs";

const DEFAULT_CONFIG_PATH = "config.json";

class Config {
  constructor(values) {
    this.port = values.port;
    this.appDir = values.appDir;
    this.dataDir = values.dataDir;
    this.resultsDir = values.resultsDir;
    this.updateScript = values.updateScript;
    this.idleExperimentsCheckInterval = values.idleExperimentsCheckInterval;
    this.experimentResetTime = values.experimentResetTime;
    Object.freeze(this);
  }

  static fromFile(file) {
    //for reading the file and returning its content in a synchronous way (blocking other parallel processes)
    let valuesAsJSON = fs.readFileSync(file);

    return new Config(JSON.parse(valuesAsJSON));
  }
}

let defaultConfig = Config.fromFile(DEFAULT_CONFIG_PATH);

export { Config };

export default defaultConfig;
