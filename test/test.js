'use strict';

const assert = require('chai').assert;
const parser = require("../parser.js");
const fs = require("fs");

function readFileContentsSync(fileName) {
    var fileContents = "";
    try {
        fileContents = fs.readFileSync(fileName, "utf8");
    } catch (err) {
        console.log("Unable to read specified project file contents:", fileName);
        throw err;
    }
    return fileContents;
}

// Peg.JS parsing event fields:
// type: (rule.enter | rule.fail | rule.match)
// rule: " (the name of the rule being evaluated) "
// location.start: {offset, line, column}
// location.end: {offset, line, column}
function logPegjsEvent(evt) {
    /*if (evt.type === "rule.enter") {
        // FIXME:
    } else if (evt.type === "rule.fail") {
        // FIXME:
    } else if (evt.type === "rule.match") {
        winston.trace("[line", evt.location.start.line, "col", evt.location.start.column
            + "] - [line", evt.location.end.line,   "col", evt.location.end.column
            + "]", evt.rule);
    }*/
}

function parseQmakeProjectFile(proFileName) {
    var parserOutput = { result: false, qmakeVars: undefined };
    try {
        var proFileContents = readFileContentsSync(proFileName);
        var parserOutputObj = parser.parse(proFileContents, {startRule: "Start", tracer: { trace: logPegjsEvent }});
        parserOutput = { result: true, qmakeVars: parserOutputObj.qmakeVars };
    } catch (err) {
        //console.log("Qt qmake project file parsing FAILED: ", err.message);
        //console.log("Location: ", err.location);
        //console.log("Expected: ", err.expected);
        //console.log("Found: ", err.found);
        //throw err;
    }
    return parserOutput;
}

describe("qmake built-in variables test", function() {
    // TEMPLATE = app|lib|aux|subdirs|vcsubdirs|vcapp|vclib and invalid
    describe("TEMPLATE", function() {
        describe("TEMPLATE=app", function() {
            it('valid TEMPLATE=app assignment statement', function() {
                var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-app.pro");
                assert.equal(true,  parserOutput.result);
                assert.equal("app", parserOutput.qmakeVars["TEMPLATE"]);
            });
        });
        describe("TEMPLATE=lib", function() {
            it('valid TEMPLATE=lib assignment statement', function() {
                var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-lib.pro");
                assert.equal(true,  parserOutput.result);
                assert.equal("lib", parserOutput.qmakeVars["TEMPLATE"]);
            });
        });
        describe("TEMPLATE=aux", function() {
            it('valid TEMPLATE=aux assignment statement', function() {
                var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-aux.pro");
                assert.equal(true,  parserOutput.result);
                assert.equal("aux", parserOutput.qmakeVars["TEMPLATE"]);
            });
        });
        describe("TEMPLATE=subdirs", function() {
            it('valid TEMPLATE=subdirs assignment statement', function() {
                var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-subdirs.pro");
                assert.equal(true,  parserOutput.result);
                assert.equal("subdirs", parserOutput.qmakeVars["TEMPLATE"]);
            });
        });
        describe("TEMPLATE=vcsubdirs", function() {
            it('valid TEMPLATE=vcsubdirs assignment statement', function() {
                var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-vcsubdirs.pro");
                assert.equal(true,  parserOutput.result);
                assert.equal("vcsubdirs", parserOutput.qmakeVars["TEMPLATE"]);
            });
        });
        describe("TEMPLATE=vcapp", function() {
            it('valid TEMPLATE=vcapp assignment statement', function() {
                var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-vcapp.pro");
                assert.equal(true,  parserOutput.result);
                assert.equal("vcapp", parserOutput.qmakeVars["TEMPLATE"]);
            });
        });
        describe("TEMPLATE=vclib", function() {
            it('valid TEMPLATE=vclib assignment statement', function() {
                var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-vclib.pro");
                assert.equal(true,  parserOutput.result);
                assert.equal("vclib", parserOutput.qmakeVars["TEMPLATE"]);
            });
        });

        describe("TEMPLATE=invalid", function() {
            it('invalid TEMPLATE=invalid assignment statement', function() {
                var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-invalid.pro");
                assert.equal(false,  parserOutput.result);
            });
        });
    });
});
