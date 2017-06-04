'use strict';

const parser = require("./parser.js");

const fs = require("fs");
const winston = require("winston");
const env = process.env.NODE_ENV || "development";
const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

winston.setLevels({
    trace: 9,
    input: 8,
    verbose: 7,
    prompt: 6,
    debug: 5,
    info: 4,
    data: 3,
    help: 2,
    warn: 1,
    error: 0
});

winston.addColors({
    trace: 'magenta',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    debug: 'blue',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    error: 'red'
});

winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, {
    level: 'info',
    prettyPrint: true,
    colorize: true,
    silent: false,
    json: false,
    timestamp: false,
    
    handleExceptions: true,
    humanReadableUnhandledException: true
});
winston.add(winston.transports.File, {
    level: "trace",
    //level: env === 'development' ? 'debug' : 'info',    // process.env.LOG_LEVEL
    filename: `${logDir}/results.log`,
    prettyPrint: false,
    silent: false,
    json: false,
    timestamp: false,
    maxFiles: 10,
    maxsize: 1024,
    
    handleExceptions: true,
    humanReadableUnhandledException: true
});

function logSeparatorLine() {
    winston.trace();
    winston.trace("--------------------------------------------------------------------------------");
    winston.trace();
}

// Peg.JS parsing event fields:
// type: (rule.enter | rule.fail | rule.match)
// rule: " (the name of the rule being evaluated) "
// location.start: {offset, line, column}
// location.end: {offset, line, column}
function logPegjsEvent(evt) {
    if (evt.type === "rule.enter") {
        // FIXME:
    } else if (evt.type === "rule.fail") {
        // FIXME:
    } else if (evt.type === "rule.match") {
        winston.trace("[line", evt.location.start.line, "col", evt.location.start.column
            + "] - [line", evt.location.end.line,   "col", evt.location.end.column
            + "]", evt.rule);
    }
}

// -------------------------------------------------------------------------------------------------

if (process.argv.length <= 2) {
    winston.error("Qt qmake project file name required to be parsed");
    throw Error();
}
var projectFileName = process.argv[2];
winston.trace("Qt qmake project file name:", projectFileName);
if (!fs.existsSync(projectFileName)) {
    throw new Error("Qt qmake project file was not found:", projectFileName);
}

var proFileContents = "";
try {
    winston.trace("Reading file contents...");
    proFileContents = fs.readFileSync(projectFileName, "utf8");
    winston.trace("Project file contents was successfully read");
} catch (err) {
    winston.error("Unable to read specified project file contents:");
    throw err;
}

try {
    winston.trace("Parsing Qt qmake project file ", projectFileName, "...");
    logSeparatorLine();
    var parserOutput = parser.parse(proFileContents, {startRule: "Start", tracer: { trace: logPegjsEvent }});
    logSeparatorLine();
    winston.trace("Qt qmake project file was successfully parsed:");
    winston.info("qmake built-in variables:", parserOutput.qmakeVars);
    winston.info("user-defined variables:", parserOutput.userVars);
} catch (err) {
    winston.error("Qt qmake project file parsing FAILED: ", err.message);
    winston.error("Location: ", err.location);
    winston.error("Expected: ", err.expected);
    winston.error("Found: ", err.found);
    throw err;
}
