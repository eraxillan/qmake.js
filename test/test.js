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
    var parserOutput = { result: false, qmakeVars: undefined, userVars: undefined };
    try {
        var proFileContents = readFileContentsSync(proFileName);
        var parserOutputObj = parser.parse(proFileContents, {startRule: "Start", tracer: { trace: logPegjsEvent }});
        parserOutput = { result: true, qmakeVars: parserOutputObj.qmakeVars, userVars: parserOutputObj.userVars };
    } catch (err) {
        //console.log("Qt qmake project file parsing FAILED: ", err.message);
        //console.log("Location: ", err.location);
        //console.log("Expected: ", err.expected);
        //console.log("Found: ", err.found);
        //throw err;
    }
    return parserOutput;
}

describe("qmake core features", function() {
    // Empty project (zero bytes one, whitespace/linebreaks-only)
    describe("Empty project", function() {
        it('valid empty project (zero bytes)', function() {
            var parserOutput = parseQmakeProjectFile("test/data/empty/empty.pro");
            assert.equal(true, parserOutput.result);
        });
        it('valid linebreaks-only project', function() {
            var parserOutput = parseQmakeProjectFile("test/data/empty/empty-linebreaks.pro");
            assert.equal(true, parserOutput.result);
        });
        it('valid whitespace-only project', function() {
            var parserOutput = parseQmakeProjectFile("test/data/empty/empty-whitespaces.pro");
            assert.equal(true, parserOutput.result);
        });
    });
    // Comments
    describe("Comments", function() {
        it('full-line and in-line', function() {
            var parserOutput = parseQmakeProjectFile("test/data/comments.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("123", parserOutput.userVars["var1"]);
            assert.equal("456", parserOutput.userVars["var2"]);
        });
    });
    // Enquoted strings
    describe("Enquoted strings", function() {
        it('enquoted values assignment', function() {
            var parserOutput = parseQmakeProjectFile("test/data/enquoted.pro");
            assert.equal(true,  parserOutput.result);

            assert.equal("123", parserOutput.userVars["var11"]);
            assert.equal("123", parserOutput.userVars["var12"]);

            assert.deepEqual(parserOutput.userVars["var_exp211"], parserOutput.userVars["var_exp214"]);
            assert.deepEqual(parserOutput.userVars["var_exp222"], parserOutput.userVars["var_exp225"]);
            assert.deepEqual(parserOutput.userVars["var_exp233"], parserOutput.userVars["var_exp236"]);

            assert.equal(5, parserOutput.userVars["list_var1"].length);

            assert.equal("Program Files (x86)/client/release/win32-x86_64 - msvc", parserOutput.userVars["INSTALL_DIR"]);
        });
    });
    // Escape sequences
    describe("Escape sequences", function() {
        it('generic escape sequences', function() {
            var parserOutput = parseQmakeProjectFile("test/data/escape_sequences.pro");
            assert.equal(true,  parserOutput.result);

            assert.equal('\u2603', parserOutput.userVars["SNOWMAN_1"]);
            assert.equal('\u2603', parserOutput.userVars["SNOWMAN_2"]);

            assert.equal('Z', parserOutput.userVars["CAPITAL_Z_LETTER_1"]);
            assert.equal('Z', parserOutput.userVars["CAPITAL_Z_LETTER_2"]);
            assert.equal('Z', parserOutput.userVars["CAPITAL_Z_LETTER_3"]);
            assert.equal('Z', parserOutput.userVars["CAPITAL_Z_LETTER_4"]);
            assert.equal('Z', parserOutput.userVars["CAPITAL_Z_LETTER_5"]);
            assert.equal('Z', parserOutput.userVars["CAPITAL_Z_LETTER_6"]);
            assert.equal('Z', parserOutput.userVars["CAPITAL_Z_LETTER_7"]);
            assert.equal('Z', parserOutput.userVars["CAPITAL_Z_LETTER_8"]);
            assert.equal('Z', parserOutput.userVars["CAPITAL_Z_LETTER_9"]);
            assert.equal('Z', parserOutput.userVars["CAPITAL_Z_LETTER_10"]);

            assert.equal("\a\b\f\n\r\t\v", parserOutput.userVars["ESC_SEQ_11"]);
            assert.equal("\a\b\f\n\r\t\v", parserOutput.userVars["ESC_SEQ_12"]);
            
            assert.equal("\'test\'", parserOutput.userVars["ESC_SEQ_21"]);
            assert.equal("\'test\'", parserOutput.userVars["ESC_SEQ_22"]);
            assert.equal("\"test\"", parserOutput.userVars["ESC_SEQ_23"]);
            assert.equal("\"test\"", parserOutput.userVars["ESC_SEQ_24"]);
            
            assert.equal("path\\file.txt", parserOutput.userVars["ESC_SEQ_31"]);
            assert.equal("path\\file.txt", parserOutput.userVars["ESC_SEQ_32"]);
            
            assert.equal("file_mask?", parserOutput.userVars["ESC_SEQ_33"]);
            assert.equal("file_mask?", parserOutput.userVars["ESC_SEQ_34"]);
        });
    });
});

describe("qmake built-in variables test", function() {
    // TEMPLATE = app|lib|aux|subdirs|vcsubdirs|vcapp|vclib and invalid
    describe("TEMPLATE", function() {
        it('valid TEMPLATE=app assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-app.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("app", parserOutput.qmakeVars["TEMPLATE"]);
        });
        it('valid TEMPLATE=lib assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-lib.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("lib", parserOutput.qmakeVars["TEMPLATE"]);
        });
        it('valid TEMPLATE=aux assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-aux.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("aux", parserOutput.qmakeVars["TEMPLATE"]);
        });
        it('valid TEMPLATE=subdirs assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-subdirs.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("subdirs", parserOutput.qmakeVars["TEMPLATE"]);
        });
        it('valid TEMPLATE=vcsubdirs assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-vcsubdirs.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("vcsubdirs", parserOutput.qmakeVars["TEMPLATE"]);
        });
        it('valid TEMPLATE=vcapp assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-vcapp.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("vcapp", parserOutput.qmakeVars["TEMPLATE"]);
        });
        it('valid TEMPLATE=vclib assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-vclib.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("vclib", parserOutput.qmakeVars["TEMPLATE"]);
        });
        it('invalid TEMPLATE=invalid assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-invalid.pro");
            assert.equal(false,  parserOutput.result);
        });
    });
});
