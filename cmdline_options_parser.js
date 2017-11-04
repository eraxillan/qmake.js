
//#region QMake user-friendly name
const QMakeProgram = "QMake";
//#endregion

//#region QMake help text
const qmakeHelpText =
"Usage: ./qmake [mode] [options] [files]\n" +
"\n" +
"QMake has two modes, one mode for generating project files based on\n" +
"some heuristics, and the other for generating makefiles. Normally you\n" +
"shouldn't need to specify a mode, as makefile generation is the default\n" +
"mode for qmake, but you may use this to test qmake on an existing project\n" +
"\n" +
"Mode:\n" +
"  -project       Put qmake into project file generation mode\n" +
"                 In this mode qmake interprets files as files to\n" +
"                 be built,\n" +
"                 defaults to *; *; *; *.ts; *.xlf; *.qrc\n" +
"                 Note: The created .pro file probably will\n" +
"                 need to be edited. For example add the QT variable to\n" +
"                 specify what modules are required.\n" +
"  -makefile      Put qmake into makefile generation mode (default)\n" +
"                 In this mode qmake interprets files as project files to\n" +
"                 be processed, if skipped qmake will try to find a project\n" +
"                 file in your current working directory\n" +
"\n" +
"Warnings Options:\n" +
"  -Wnone         Turn off all warnings; specific ones may be re-enabled by\n" +
"                 later -W options\n" +
"  -Wall          Turn on all warnings\n" +
"  -Wparser       Turn on parser warnings\n" +
"  -Wlogic        Turn on logic warnings (on by default)\n" +
"  -Wdeprecated   Turn on deprecation warnings (on by default)\n" +
"\n" +
"Options:\n" +
"   * You can place any variable assignment in options and it will be *\n" +
"   * processed as if it was in [files]. These assignments will be    *\n" +
"   * processed before [files] by default.                            *\n" +
"  -o file        Write output to file\n" +
"  -d             Increase debug level\n" +
"  -t templ       Overrides TEMPLATE as templ\n" +
"  -tp prefix     Overrides TEMPLATE so that prefix is prefixed into the value\n" +
"  -help          This help\n" +
"  -v             Version information\n" +
"  -early         All subsequent variable assignments will be\n" +
"                 parsed right before default_pre.prf\n" +
"  -before        All subsequent variable assignments will be\n" +
"                 parsed right before [files] (the default)\n" +
"  -after         All subsequent variable assignments will be\n" +
"                 parsed after [files]\n" +
"  -late          All subsequent variable assignments will be\n" +
"                 parsed right after default_post.prf\n" +
"  -norecursive   Don't do a recursive search\n" +
"  -recursive     Do a recursive search\n" +
"  -set <prop> <value> Set persistent property\n" +
"  -unset <prop>  Unset persistent property\n" +
"  -query <prop>  Query persistent property. Show all if <prop> is empty.\n" +
"  -qtconf file   Use file instead of looking for qt.conf\n" +
"  -cache file    Use file as cache           [makefile mode only]\n" +
"  -spec spec     Use spec as QMAKESPEC       [makefile mode only]\n" +
"  -nocache       Don't use a cache file      [makefile mode only]\n" +
"  -nodepend      Don't generate dependencies [makefile mode only]\n" +
"  -nomoc         Don't generate moc targets  [makefile mode only]\n" +
"  -nopwd         Don't look for files in pwd [project mode only]";
//#endregion

//#region Helper functions for version command
function getQMakeVersion() {
    const persistentStorage = require("./persistent_property_storage");
    return persistentStorage.query("QMAKE_VERSION");
}

function getQtSdkLibDirectory() {
    const persistentStorage = require("./persistent_property_storage");
    return persistentStorage.query("QT_HOST_LIBS");
}

function getQtSdkVersion() {
    const persistentStorage = require("./persistent_property_storage");
    return persistentStorage.query("QT_VERSION");
}
//#endregion

function parseArguments(stringArgs) {
    function isOption(str) {
        return str.startsWith("-") || str.startsWith("--");
    }

    function isKnownOption(key, knownOptions) {
        for (var i = 0; i < knownOptions.length; i++) {
            for (var j = 0; j < knownOptions[i].key.length; j++) {
                if (knownOptions[i].key[j] === key)
                    return knownOptions[i];
            }
        }
        return undefined;
    }

    // FIXME: implement mutually exclusive groups

    // QMake Mode
    var projectModeOption = {key: ["-project"], kind: "flag", defaultValue: false, dest: "projectMode"};
    var makefileModeOption = {key: ["-makefile"], kind: "flag", defaultValue: true, dest: "makefileMode"};
//    var modeGroup = {options: [projectModeOption, makefileModeOption], mutualExclusive: true};

    // Warnings Options
    var wNoneOption = { key: [ "-Wnone" ], kind: "flag", defaultValue: false, dest: "turnOffAllWarnings" };
    var wAllOption = { key: [ "-Wall" ], kind: "flag", defaultValue: false, dest: "turnOnAllWarnings" };
    var wParserOption = { key: [ "-Wparser" ], kind: "flag", defaultValue: false, dest: "turnOnParserWarnings" };
    var wLogicOption = { key: [ "-Wlogic" ], kind: "flag", defaultValue: true, dest: "turnOnLogicWarnings" };
    var wDeprecatedOption = { key: [ "-Wdeprecated" ], kind: "flag", defaultValue: true, dest: "turnOnDeprecationWarnings" };
//    var warningsOptionsGroup = { options: [wNoneOption, wAllOption, wParserOption, wLogicOption, wDeprecatedOption ], mutualExclusive: false };

    var outputFileOption = { key: ["-o"], kind: "value", valueCount: 1, defaultValue: "", dest: "outputFileName" };
    var debugLevelOption = { key: ["-d"], kind: "count", defaultValue: 0, dest: "debugLevel" };

    var templateOption = { key: ["-t"], kind: "value", valueCount: 1, defaultValue: "", dest: "projectTemplate"};
    var templatePrefixOption = { key: ["-tp"], kind: "value", valueCount: 1, defaultValue: "", dest: "projectTemplatePrefix"};

    var showHelpOption = { key: ["-h", "-help", "--help"], kind: "help" };
    var showVersionOption = { key: ["-v", "-version", "--version"], kind: "version" };

    var earlyOption = { key: ["-early"], kind: "flag", defaultValue: false, dest: "earlyAssingmentsParsing" };
    var beforeOption = { key: ["-before"], kind: "flag", defaultValue: true, dest: "beforeAssingmentsParsing" };
    var afterOption = { key: ["-after"], kind: "flag", defaultValue: false, dest: "afterAssingmentsParsing" };
    var lateOption = { key: ["-late"], kind: "flag", defaultValue: false, dest: "lateAssingmentsParsing" };
//    var variableAssignmenOrderGroup = { options: [ earlyOption, beforeOption, afterOption, lateOption ], mutualExclusive: true };

    var noRecursiveOption = { key: ["-norecursive"], kind: "flag", defaultValue: false, dest: "noRecursiveSearch" };
    var recursiveOption = { key: ["-recursive"], kind: "flag", defaultValue: true, dest: "recursiveSearch" };
//    var fileSearchGroup = { options: [noRecursiveOption, recursiveOption], mutualExclusive: true };

    var setPropertyCommand = { key: ["-set"], kind: "command", valueCount: 2, defaultValue: undefined, dest: "setPropertyCommand" };
    var unsetPropertyCommand = { key: ["-unset"], kind: "command", valueCount: 1, defaultValue: undefined, dest: "unsetPropertyCommand" };
    var queryPropertyCommand = { key: ["-query"], kind: "command", valueCount: 1, defaultValue: undefined, dest: "queryPropertyCommand" };

    var qtConfFileOption = { key: ["-qtconf"], kind: "value", valueCount: 1, defaultValue: "", dest: "qtConfFilePath" };
    var cacheFileOption = { key: ["-cache"], kind: "value", valueCount: 1, defaultValue: "", dest: "cacheFilePath" };

    var specOption = { key: [ "-spec" ], kind: "value", valueCount: 1, defaultValue: "", dest: "mkspec" };

    var noCacheFileOption = { key: ["-nocache"], kind: "flag", defaultValue: false, dest: "dontUseCacheFile" };
    var noDependencyGenerationOption = { key: ["-nodepend"], kind: "flag", defaultValue: false, dest: "dontGenerateDependencies" };
    var noMocTargetsGenerationOption = { key: ["-nomoc"], kind: "flag", defaultValue: false, dest: "dontGenerateMocTargets" };
    var noLookForFilesInPwdOption = { key: ["-nopwd"], kind: "flag", defaultValue: false, dest: "dontLookForFilesInPwd" };

    var knownOptions = [
        projectModeOption, makefileModeOption,
        wNoneOption, wAllOption, wParserOption, wLogicOption, wDeprecatedOption,
        outputFileOption, debugLevelOption, templateOption, templatePrefixOption,
        showHelpOption, showVersionOption,
        earlyOption, beforeOption, afterOption, lateOption,
        noRecursiveOption, recursiveOption,
        setPropertyCommand, unsetPropertyCommand, queryPropertyCommand,
        qtConfFileOption, cacheFileOption,
        specOption,
        noCacheFileOption, noDependencyGenerationOption, noMocTargetsGenerationOption, noLookForFilesInPwdOption
    ];

    var positionalResult = [];
    var optionsResult = {};
    for (var i = 0; i < stringArgs.length; i++) {
        var opt = stringArgs[i];
        if (isOption(opt)) {
            var optDescr = isKnownOption(opt, knownOptions);
            if (optDescr === undefined) {
                console.error("Unknown option " + opt);
                continue;
            }

            switch (optDescr.kind) {
                case "help": {
                    console.log(qmakeHelpText);
                    process.exit(0);
                    break;
                }
                case "version": {
                    console.log(QMakeProgram + " version " + getQMakeVersion() + "\n" +
                        "Using Qt version " + getQtSdkVersion() + " in " + getQtSdkLibDirectory());
                    process.exit(0);
                    break;
                }
                case "count": {
                    if (optionsResult[optDescr.dest] === undefined)
                        optionsResult[optDescr.dest] = optDescr.defaultValue;

                    optionsResult[optDescr.dest] ++;
                    break;
                }
                case "flag": {
                    optionsResult[optDescr.dest] = !optDescr.defaultValue;
                    break;
                }
                case "value": {
                    optionsResult[optDescr.dest] = stringArgs.slice(i + 1, i + 1 + optDescr.valueCount);
                    if (optDescr.valueCount === 1)
                        optionsResult[optDescr.dest] = optionsResult[optDescr.dest].toString();
                    i += optDescr.valueCount;
                    break;
                }
                case "command": {
                    throw new Error("set/unset/query command are not implemented yet");
                    break;
                }
                default: throw new Error("Invalid command line argument type");
            }

            //console.log("OPTION: " + JSON.stringify(optDescr, null, 2));
        } else {
            //console.log("POSITIONAL: " + opt);
            positionalResult.push(opt);
        }
    }

    // Merge unused options with explicitly specified
    for (var i = 0; i < knownOptions.length; i++) {
        var knownOpt = knownOptions[i];
        if ((knownOpt.dest !== undefined) && (optionsResult[knownOpt.dest] === undefined))
            optionsResult[knownOpt.dest] = knownOpt.defaultValue;
    }

    // Postprocess positional arguments
    var variableAssignments = [];
    var projectFilePaths = [];
    for (var i = 0; i < positionalResult.length; i++) {
        // Split positional arguments to files and variable assignments
        var arg = positionalResult[i];
        if (arg.includes("=") || arg.includes("+=") || arg.includes("*=") || arg.includes("-=") || arg.includes("~="))
            variableAssignments.push(arg);
        else if (arg.endsWith(".pro") || arg.endsWith(".pri") || arg.endsWith(".prf"))
            projectFilePaths.push(arg);
        else
            throw new Error("Unknown positional argument type");
    }

    /*console.log("----------------------------------------------------");
    console.log("QMake options:");
    console.log(optionsResult);
    console.log("QMake project files to be parsed:");
    console.log(projectFilePaths);
    console.log("Variable assignments:");
    console.log(variableAssignments); */

    return { options: optionsResult, projectFilePaths: projectFilePaths, variableAssignments: variableAssignments };
}

// -------------------------------------------------------------------------------------------------

// E.g.
// node frontend.js /home/eraxillan/Projects/qmake-test/qmake-test.pro qmake2.pro -spec linux-g++ CONFIG+=debug CONFIG+=qml_debug
// node frontend.js test/data/comments.pro -spec linux-g++ CONFIG+=debug CONFIG+=qml_debug
// node frontend.js -v
// node frontend.js -help

// --------------------------------------------------------------------------------------------------------------------------------------------------

module.exports = {
    parseArguments: parseArguments
};

