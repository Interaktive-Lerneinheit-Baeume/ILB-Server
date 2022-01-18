/* eslint-env node */
import fs from "fs";
import path from "path";
import Config from "./Config.js";

const CONDITIONS = ["viewing", "constructing"];

let experiments;

function loadExperimentsFromDisk(dataPath) {
    let files = fs.readdirSync(dataPath);
    experiments = [];
    files.forEach(file => experiments.push(Experiment.fromFile(path.join(dataPath, file))));
}

/**
 * Updates the corresponding JSON file with the data from the experiment object. 
 * If the objects
 * state was set to "closed", the file will be moved 
 * from Config.dataDir to Config.resultsDir and the 
 * experiment object will be removed from the live array ("experiments");
 */
function updateExperimentOnDisk(experiment) {
    let filePath = path.join(Config.dataDir, experiment.id + ".json"),
        experimentAsJSON = JSON.stringify(experiment);


    experiments.forEach(e => {
        if (e.id === experiment.id) {
            if (experiment.modus === "startDataReceived") {
                e.age = experiment.age;
                e.studentNumber = experiment.studentNumber;
                e.name = experiment.name;
                e.modus = "startDataReceived";
                e.skills = experiment.skills;
                e.gender = experiment.gender;
                e.start_time = experiment.start_time;
                e.another_languages = experiment.another_languages;
                e.java_knowledge = experiment.java_knowledge;

                e.knowl_nodeGraphChecked = experiment.knowl_nodeGraphChecked;
                e.knowl_arrayCheckboxChecked = experiment.knowl_arrayCheckboxChecked;
                e.knowl_binaryTreeChecked = experiment.knowl_binaryTreeChecked;
                e.knowl_binarySearchTreeChecked = experiment.knowl_binarySearchTreeChecked;
                e.knowl_zyklusChecked = experiment.knowl_zyklusChecked;
                e.compr_differenceOfTrees = experiment.compr_differenceOfTrees;
                e.applAnSyn_treeHeightSequence = experiment.applAnSyn_treeHeightSequence;
                e.applAnSyn_sequencesConstructed = experiment.applAnSyn_sequencesConstructed;
                e.applAnSyn_treesSelected = experiment.applAnSyn_treesSelected;
                e.applAnSyn_printMethod = experiment.applAnSyn_printMethod;
                e.checkedTreesAsCorrect = experiment.checkedTreesAsCorrect;
                e.end_time = experiment.end_time;

                if (experiment.engagement === "constructing") {
                    e.counterOfErrorPopUp = experiment.counterOfErrorPopUp;
                }
            }
        }
    });

    fs.writeFileSync(filePath, experimentAsJSON);
    if (experiment.state === "closed") {
        let targetPath = path.join(Config.resultsDir, experiment.id + ".json");
        fs.copyFileSync(filePath, targetPath);
        fs.unlinkSync(filePath);
        for (let i = 0; i < experiments.length; i++) {
            if (experiments[i].id === experiment.id) {
                experiments.splice(i, 1);
                return new ExperimentMessage(`Experiment ${experiment.id} closed and moved to storage.`);
            }
        }
    }

    else if (experiment.state === "open") {
        console.log("Die Zeit der Session ist abgelaufen!");
        return new ExperimentMessage("404");
    }
    return new ExperimentMessage(`Experiment ${experiment.id} updated.`);
}

function updateClosedExperimentOnDisk(experiment) {
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
    let foundExperiments = experiments.filter(experiment => experiment.id === id);
    if (foundExperiments.length !== 0) {
        foundExperiments[0].state = "open";
        foundExperiments[0].startedAt = null;
        foundExperiments[0].name = null;
        foundExperiments[0].age = null;
        foundExperiments[0].studentNumber = null;
        foundExperiments[0].modus = "noStartData";
        foundExperiments[0].start_time = null;
        foundExperiments[0].another_languages = null;
        foundExperiments[0].java_knowledge = 0;

        foundExperiments[0].knowl_zyklusChecked = false;
        foundExperiments[0].knowl_binaryTreeChecked = false;
        foundExperiments[0].knowl_binarySearchTreeChecked = false;
        foundExperiments[0].knowl_nodeGraphChecked = false;
        foundExperiments[0].knowl_arrayCheckboxChecked = false;
        foundExperiments[0].knowl_2_datastructure_checked = null;

        foundExperiments[0].compr_differenceOfTrees = null,

        foundExperiments[0].applAnSyn_treeHeightSequence = null;
        foundExperiments[0].applAnSyn_sequencesConstructed = null;
        foundExperiments[0].applAnSyn_treesSelected = null;
        foundExperiments[0].applAnSyn_printMethod = null;

        foundExperiments[0].checkedTreesAsCorrect = null;
        foundExperiments[0].counterOfErrorPopUp = 0;

        foundExperiments[0].end_time = null;

        return updateExperimentOnDisk(foundExperiments[0]);
    }
    return new ExperimentError(`Unknown ID, could not reset experiment for ${id}`);
}

class Experiment {

    constructor(id, state, startedAt, name, age, studentNumber, engagement, modus, skills, gender, start_time, java_knowledge, another_languages,
        zyklusChecked, binaryTreeChecked, binarySearchTreeChecked, nodeGraphChecked, arrayCheckboxChecked,
        knowl_2_datastructure_checked, compr_differenceOfTrees, applAnSyn_treeHeightSequence, applAnSyn_sequencesConstructed, applAnSyn_treesSelected, applAnSyn_printMethod,
        checkedTreesAsCorrect, counterOfErrorPopUp, end_time) {

        this.id = id;
        this.state = state;
        this.startedAt = startedAt;
        this.name = name;
        this.age = age;
        this.studentNumber = studentNumber;
        this.engagement = engagement;
        this.modus = modus;
        this.skills = skills;
        this.gender = gender;
        this.start_time = start_time;
        this.java_knowledge = java_knowledge;
        this.another_languages = another_languages;

        this.knowl_arrayCheckboxChecked = arrayCheckboxChecked;
        this.knowl_binaryTreeChecked = binaryTreeChecked;
        this.knowl_binarySearchTreeChecked = binarySearchTreeChecked;
        this.knowl_nodeGraphChecked = nodeGraphChecked;
        this.knowl_zyklusChecked = zyklusChecked;
        this.knowl_2_datastructure_checked = knowl_2_datastructure_checked;

        this.compr_differenceOfTrees = compr_differenceOfTrees;

        this.applAnSyn_treeHeightSequence = applAnSyn_treeHeightSequence;
        this.applAnSyn_sequencesConstructed = applAnSyn_sequencesConstructed;
        this.applAnSyn_treesSelected = applAnSyn_treesSelected;
        this.applAnSyn_printMethod = applAnSyn_printMethod;

        this.checkedTreesAsCorrect = checkedTreesAsCorrect;
        this.counterOfErrorPopUp = counterOfErrorPopUp;

        this.end_time = end_time;
    }

    static fromFile(filePath) {
        let fileContent = fs.readFileSync(filePath),
            values = JSON.parse(fileContent);

        return new Experiment(values.id, values.state, values.startedAt,
            values.name, values.age, values.studentNumber,
            values.engagement, values.modus, values.skills, values.gender,
            values.start_time,
            values.java_knowledge,
            values.another_languages,

            values.knowl_zyklusChecked, 
            values.knowl_binaryTreeChecked, 
            values.knowl_binarySearchTreeChecked,
            values.knowl_nodeGraphChecked, 
            values.knowl_arrayCheckboxChecked,
            values.knowl_2_datastructure_checked,

            values.compr_differenceOfTrees,

            values.applAnSyn_treeHeightSequence,
            values.applAnSyn_sequencesConstructed,
            values.applAnSyn_treesSelected,
            values.applAnSyn_printMethod,

            values.checkedTreesAsCorrect, 
            values.counterOfErrorPopUp,

            values.end_time)
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

class ExperimentManager {

    constructor() {
        loadExperimentsFromDisk(Config.dataDir);
        // Regularly checks for idle experiments
        // 1 Minute = 60 Sek = 60 * 1000 mSek = 60000
        setInterval(this.resetIdleExperiments, Config.idleExperimentsCheckInterval * 60000);
    }

    /**
     * Resets all currently started experiments wich where not finished within the expected time frame. Called
     * regularly to prevent prepared cases getting lost when users start but not finish experiments.
     */
    resetIdleExperiments() {
        // let now = Date(Date.now()).toString(),
        let now = Date.now(),
            idleExperiments = experiments.filter(
                experiment => experiment.state === "in-use"
                    &&
                    ((now - experiment.startedAt) > Config.experimentResetTime * 60000));
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
        let availableExperiments, pick;
        if (experiments.length === 0) {
            return new ExperimentError("No more experiments available");
        }
        availableExperiments = experiments.filter(experiment => experiment.state === "open");
        if (availableExperiments.length === 0) {
            return new ExperimentError("No open experiment currently available");
        }
        pick = this.pickRandomExperimentWithConditionBias(availableExperiments);
        pick.state = "in-use";
        pick.startedAt = Date.now();
        updateExperimentOnDisk(pick);
        return pick;
    }

    pickRandomExperimentWithConditionBias(availableExperiments) {
        let filteredExperiments = {},
            experimentsForPick;
        CONDITIONS.forEach(condition =>
            filteredExperiments[condition] = availableExperiments.filter(experiment =>
                experiment.engagement === condition));

        experimentsForPick = filteredExperiments[CONDITIONS[0]];
        for (let i = 1; i < CONDITIONS.length; i++) {
            let condition = CONDITIONS[i],
                experimentsForConditions = filteredExperiments[condition];
            if (experimentsForConditions.length > experimentsForPick.length) {
                experimentsForPick = experimentsForConditions;
            }
        }
        let randomNumber = Math.floor(Math.random() * experimentsForPick.length);
        return experimentsForPick[randomNumber];
    }

    /**
     * 
     * Returns the experiment, identified by the given id, without changing its state
     */
    getExperiment(id) {
        let foundExperiments = experiments.filter(experiment => experiment.id === id);

        if (foundExperiments.length !== 0) {
            return foundExperiments[0];
        }
        return new ExperimentError(`Could not retrieve experiment for ${id}`);
    }

    /**
     * Resets the state of the given experiments so that it can be reused by another
     * participant. 
     */
    putBackExperiment(id) {
        return resetExperimentWidthID(id);
    }

    /**
     * Updates the given experiment on disk without changing its state
     */
    updateExperimentData(experiment) {
        return updateExperimentOnDisk(experiment);
    }

    /**
     * Updates closed experiment on disk
     */
    appendExperimentData(experiment) {
        return updateClosedExperimentOnDisk(experiment);
    }

    /**
     * Marks the given experiment as done an stores it results for further analysis. The 
     * stored experiment will not be available to other participants. 
     */
    closeExperiment(experiment) {
        if (experiment.state === "open") {
            return new ExperimentMessage("404");
        }
        else if (experiment.state = "closed") {
            return updateExperimentOnDisk(experiment);
        }
    }
}

export default new ExperimentManager();