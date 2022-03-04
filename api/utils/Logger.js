/* eslint-env node */
/* eslint-disable no-console */

import chalk from "chalk";

const LEVEL = {
  DEBUG: {
    color: "green",
    output: console.log,
  },
  WARNING: {
    color: "yellow",
    output: console.warn,
  },
  ERROR: {
    color: "red",
    output: console.error,
  },
};

function logMesssage(msg, level) {
  let timestamp = chalk[level.color](new Date().toLocaleTimeString());
  level.output(`[${timestamp}] | ${msg}`);
}

class Logger {

  constructor() {
    throw new Error("Can not instantiate Logger!");
  }

  static log(msg) {
    logMesssage(msg, LEVEL.DEBUG);
  }

  static warning(msg) {
    logMesssage(msg, LEVEL.WARNING);
  }

  static error(msg) {
    logMesssage(msg, LEVEL.ERROR);
  }

}

export default Logger;