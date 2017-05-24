var pegjs = require("./qmake-project-parser.js");

var parserOutput = pegjs.parse("TEMPLATE = app");
console.log("PEG.js parser output:");
console.log(parserOutput);
console.log(parserOutput.TEMPLATE);
//console.log("System variables dict:");
//console.log(pegjs.SystemVariablesDict);
//console.log(pegjs.SystemVariablesDict);
