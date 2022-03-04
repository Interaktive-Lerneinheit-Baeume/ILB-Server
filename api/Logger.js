/* eslint-env node */

import chalk from "chalk";

const LEVEL = {
    DEBUG: {
        color: "green"
    },
    WARNING: {
        color: "yellow"
    },
    ERROR: {
        color: "red"
    }
}

function logMesssage(msg, level) {
    let timestamp = chalk[level.color](new Date().toLocaleTimeString());
    console.log(`[${timestamp}] | ${msg}`);
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