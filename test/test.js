'use strict';

const assert = require('chai').assert;
var parser = require("../parser");
var bl = require("../bl");
const typeUtils = require("../type_utils");
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
    let parserOutput = { result: false, context: undefined };
    try {
        let proFileContents = readFileContentsSync(proFileName);

        // NOTE: remove all user variables + set builtin ones to their default values
        bl.context.reset();
        
        let parserOutputObj = parser.parse(proFileContents, {startRule: "Start", tracer: { trace: logPegjsEvent }});
        parserOutput.result = true;
        parserOutput.context = parserOutputObj.context;
    } catch (err) {
        console.log("Qt qmake project file parsing FAILED: ", err.message);
        console.log("Location: ", err.location);
        console.log("Expected: ", err.expected);
        console.log("Found: ", err.found);
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
            assert.equal("123", parserOutput.context.getVariableValue("var1"));
            assert.equal("456", parserOutput.context.getVariableValue("var2"));
        });
    });
    // Enquoted strings
    describe("Enquoted strings", function() {
        it('enquoted values assignment', function() {
            var parserOutput = parseQmakeProjectFile("test/data/enquoted.pro");
            assert.equal(true,  parserOutput.result);

            assert.equal("123", parserOutput.context.getVariableValue("var11"));
            assert.equal("123", parserOutput.context.getVariableValue("var12"));

            assert.deepEqual(parserOutput.context.getVariableValue("var_exp211"), parserOutput.context.getVariableValue("var_exp214"));
            assert.deepEqual(parserOutput.context.getVariableValue("var_exp222"), parserOutput.context.getVariableValue("var_exp225"));
            assert.deepEqual(parserOutput.context.getVariableValue("var_exp233"), parserOutput.context.getVariableValue("var_exp236"));

            assert.equal(5, parserOutput.context.getVariableRawValue("list_var1").length);

            assert.equal("Program Files (x86)/client/release/win32-x86_64 - msvc", parserOutput.context.getVariableValue("INSTALL_DIR"));
        });
    });
    // Escape sequences
    describe("Escape sequences", function() {
        it('generic escape sequences', function() {
            var parserOutput = parseQmakeProjectFile("test/data/escape_sequences.pro");
            assert.equal(true,  parserOutput.result);

            assert.equal('\u2603', parserOutput.context.getVariableRawValue("SNOWMAN_1"));
            assert.equal('\u2603', parserOutput.context.getVariableRawValue("SNOWMAN_2"));

            assert.equal('Z', parserOutput.context.getVariableRawValue("CAPITAL_Z_LETTER_1"));
            assert.equal('Z', parserOutput.context.getVariableRawValue("CAPITAL_Z_LETTER_2"));
            assert.equal('Z', parserOutput.context.getVariableRawValue("CAPITAL_Z_LETTER_3"));
            assert.equal('Z', parserOutput.context.getVariableRawValue("CAPITAL_Z_LETTER_4"));
            assert.equal('Z', parserOutput.context.getVariableRawValue("CAPITAL_Z_LETTER_5"));
            assert.equal('Z', parserOutput.context.getVariableRawValue("CAPITAL_Z_LETTER_6"));
            assert.equal('Z', parserOutput.context.getVariableRawValue("CAPITAL_Z_LETTER_7"));
            assert.equal('Z', parserOutput.context.getVariableRawValue("CAPITAL_Z_LETTER_8"));
            assert.equal('Z', parserOutput.context.getVariableRawValue("CAPITAL_Z_LETTER_9"));
            assert.equal('Z', parserOutput.context.getVariableRawValue("CAPITAL_Z_LETTER_10"));

            assert.equal("\a\b\f\n\r\t\v", parserOutput.context.getVariableRawValue("ESC_SEQ_11")[0]);
            assert.equal("\a\b\f\n\r\t\v", parserOutput.context.getVariableRawValue("ESC_SEQ_12"));
            
            assert.equal("\'test\'", parserOutput.context.getVariableRawValue("ESC_SEQ_21"));
            assert.equal("\'test\'", parserOutput.context.getVariableRawValue("ESC_SEQ_22"));
            assert.equal("\"test\"", parserOutput.context.getVariableRawValue("ESC_SEQ_23"));
            assert.equal("\"test\"", parserOutput.context.getVariableRawValue("ESC_SEQ_24"));
            
            assert.equal("path\\file.txt", parserOutput.context.getVariableRawValue("ESC_SEQ_31"));
            assert.equal("path\\file.txt", parserOutput.context.getVariableRawValue("ESC_SEQ_32"));
            
            assert.equal("file_mask?", parserOutput.context.getVariableRawValue("ESC_SEQ_33"));
            assert.equal("file_mask?", parserOutput.context.getVariableRawValue("ESC_SEQ_34"));
        });
    });
});

describe("qmake built-in variables test", function() {
    // TEMPLATE = app|lib|aux|subdirs|vcsubdirs|vcapp|vclib and invalid
    describe("TEMPLATE", function() {
        it('valid TEMPLATE=app assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-app.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("app", parserOutput.context.getVariableValue("TEMPLATE"));
        });
        it('valid TEMPLATE=lib assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-lib.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("lib", parserOutput.context.getVariableValue("TEMPLATE"));
        });
        it('valid TEMPLATE=aux assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-aux.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("aux", parserOutput.context.getVariableValue("TEMPLATE"));
        });
        it('valid TEMPLATE=subdirs assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-subdirs.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("subdirs", parserOutput.context.getVariableValue("TEMPLATE"));
        });
        it('valid TEMPLATE=vcsubdirs assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-vcsubdirs.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("vcsubdirs", parserOutput.context.getVariableValue("TEMPLATE"));
        });
        it('valid TEMPLATE=vcapp assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-vcapp.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("vcapp", parserOutput.context.getVariableValue("TEMPLATE"));
        });
        it('valid TEMPLATE=vclib assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-vclib.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("vclib", parserOutput.context.getVariableValue("TEMPLATE"));
        });
        it('invalid TEMPLATE=invalid assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/TEMPLATE/template-invalid.pro");
            assert.equal(false,  parserOutput.result);
        });
    });
    
    // CONFIG =/+=/*=/-=
    //     release|debug|debug_and_release|debug_and_release_target(DEFAULT)
    //    |build_all|autogen_precompile_source|ordered|precompile_header
    //    |warn_on|warn_off|exceptions|exceptions_off|rtti|rtti_off|stl|stl_off|thread
    //    |c++11|c++14
    //    |create_prl|link_prl
    //    |qt(DEFAULT)|x11|testcase|insignificant_test
    //    |windows|console|shared|dll|static|staticlib|plugin|designer|no_lflags_merge
    //    |flat|embed_manifest_dll|embed_manifest_exe (Windows-only)
    //    |app_bundle|lib_bundle (macOS-only)
    //    |largefile|separate_debug_info (Unix-only)
    describe("CONFIG", function() {
        // =
        it('valid CONFIG=release assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-release-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("release", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=debug assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-debug-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("debug", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=debug_and_release assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-debugandrelease-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("debug_and_release", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=build_all assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-buildall-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("build_all", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=autogen_precompile_source assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-autogenprecomplilesource-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("autogen_precompile_source", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=ordered assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-ordered-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("ordered", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=precompile_header assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-precompileheader-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("precompile_header", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=warn_on assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-warnon-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("warn_on", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=warn_off assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-warnoff-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("warn_off", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=exceptions assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-exceptions-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("exceptions", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=exceptions_off assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-exceptionsoff-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("exceptions_off", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=rtti assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-rtti-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("rtti", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=rtti_off assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-rttioff-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("rtti_off", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=stl assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-stl-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("stl", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=stl_off assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-stloff-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("stl_off", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=thread assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-thread-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("thread", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=c++11 assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-cpp11-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("c++11", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=c++14 assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-cpp14-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("c++14", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=create_prl assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-createprl-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("create_prl", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=link_prl assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-linkprl-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("link_prl", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=qt assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-qt-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("qt", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=x11 assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-x11-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("x11", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=testcase assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-testcase-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("testcase", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=insignificant_test assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-insignificanttest-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("insignificant_test", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=windows assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-windows-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("windows", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=console assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-console-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("console", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=shared assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-shared-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("shared", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=dll assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-dll-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("dll", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=static assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-static-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("static", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=staticlib assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-staticlib-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("staticlib", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=plugin assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-plugin-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("plugin", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=designer assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-designer-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("designer", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=no_lflags_merge assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-nolflagsmerge-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("no_lflags_merge", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=flat assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-flat-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("flat", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=embed_manifest_dll assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-embedmanifestdll-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("embed_manifest_dll", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=embed_manifest_exe assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-embedmanifestexe-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("embed_manifest_exe", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=app_bundle assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-appbundle-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("app_bundle", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=lib_bundle assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-libbundle-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("lib_bundle", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=largefile assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-largefile-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("largefile", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('valid CONFIG=separate_debug_info assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-separatedebuginfo-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("separate_debug_info", parserOutput.context.getVariableValue("CONFIG"));
        });
        it('invalid CONFIG=invalid assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-invalid-assignment.pro");
            assert.equal(false,  parserOutput.result);
        });
        // +=
        // *=
        // -=
        it('valid CONFIG+=release debug ... separate_debug_info assignment statement', function() {
            let parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-appending-assignment.pro");  
            assert.equal(true,  parserOutput.result);
            assert.sameMembers([
                // Default values
                "lex", "yacc", "debug", "exceptions", "depend_includepath", "testcase_targets", "import_plugins", "import_qpa_plugin",
                "file_copies", "qmake_use", "qt", "warn_on", "release", "link_prl", "incremental", "shared", "linux", "unix", "posix", "gcc", "qml_debug",
                // Project-assigned values
                "build_all", "warn_off", "exceptions_off", "rtti", "stl_off", "c++14", "create_prl", "x11", "testcase", "insignificant_test", "dll",
                "static", "staticlib", "plugin", "designer", "no_lflags_merge", "lib_bundle", "largefile", "ordered", "console",
                //
                "debug_and_release", "debug_and_release_target", "autogen_precompile_source", "precompile_header",
                "rtti_off", "stl", "thread", "c++11", "windows", "flat", "embed_manifest_dll", "embed_manifest_exe", "app_bundle"
                ],
                parserOutput.context.getVariableRawValue("CONFIG"));
        });

    });
    
    // QT =/+=/*=/-=
    //    // Qt Essentials
    //    core gui widgets network multimedia sql testlib multimediawidgets qml quick
    //    // Qt Add-Ons
    //    axcontainer axserver
    //    3dcore 3drender 3dinput 3dlogic 3dextras
    //    enginio androidextras bluetooth concurrent dbus location
    //    macextras nfc opengl positioning printsupport purchasing
    //    quickcontrols2 quickwidgets script scripttools scxml
    //    sensors serialbus serialport svg webchannel webengine websockets webview
    //    winextras x11extras xml xmlpatterns charts datavisualization
    // =
    describe("QT", function() {
        // =
        it('valid QT=core assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-core-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("core", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=gui assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-gui-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("gui", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=widgets assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-widgets-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("widgets", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=network assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-network-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("network", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=multimedia assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-multimedia-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("multimedia", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=sql assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-sql-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("sql", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=testlib assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-testlib-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("testlib", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=multimediawidgets assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-multimediawidgets-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("multimediawidgets", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=qml assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-qml-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("qml",parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=quick assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-quick-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("quick", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=axcontainer assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-axcontainer-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("axcontainer", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=axserver assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-axserver-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("axserver", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=3dcore assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-3dcore-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("3dcore", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=3drender assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-3drender-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("3drender", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=3dinput assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-3dinput-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("3dinput", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=3dlogic assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-3dlogic-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("3dlogic", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=3dextras assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-3dextras-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("3dextras", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=enginio assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-enginio-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("enginio", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=androidextras assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-androidextras-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("androidextras", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=bluetooth assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-bluetooth-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("bluetooth", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=concurrent assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-concurrent-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("concurrent", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=dbus assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-dbus-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("dbus", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=location assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-location-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("location", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=macextras assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-macextras-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("macextras", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=nfc assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-nfc-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("nfc", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=opengl assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-opengl-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("opengl", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=positioning assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-positioning-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("positioning", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=printsupport assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-printsupport-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("printsupport", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=purchasing assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-purchasing-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("purchasing", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=quickcontrols2 assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-quickcontrols2-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("quickcontrols2", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=quickwidgets assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-quickwidgets-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("quickwidgets", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=script assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-script-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("script", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=scripttools assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-scripttools-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("scripttools", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=scxml assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-scxml-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("scxml", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=sensors assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-sensors-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("sensors", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=serialbus assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-serialbus-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("serialbus", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=serialport assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-serialport-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("serialport", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=svg assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-svg-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("svg", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=webchannel assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-webchannel-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("webchannel", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=webengine assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-webengine-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("webengine", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=websockets assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-websockets-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("websockets", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=webview assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-webview-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("webview", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=winextras assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-winextras-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("winextras", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=x11extras assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-x11extras-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("x11extras", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=xml assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-xml-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("xml", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=xmlpatterns assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-xmlpatterns-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("xmlpatterns", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=charts assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-charts-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("charts", parserOutput.context.getVariableValue("QT"));
        });
        it('valid QT=datavisualization assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-datavisualization-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("datavisualization", parserOutput.context.getVariableValue("QT"));
        });
        it('invalid QT=invalid assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-invalid-assignment.pro");
            assert.equal(false,  parserOutput.result);
        });
        // +=
        // *=
        // -=
        it('valid QT+=core gui ... datavisualization assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-appending-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.sameMembers([
                "core", "gui", "widgets", "network", "multimedia", "sql", "testlib", "multimediawidgets", "qml", "quick",
                "axcontainer", "axserver",
                "3dcore", "3drender", "3dinput", "3dlogic", "3dextras",
                "enginio", "androidextras", "bluetooth", "concurrent", "dbus", "location",
                "macextras", "nfc", "opengl", "positioning", "purchasing",
                "quickcontrols2", "quickwidgets", "script", "scripttools", "scxml",
                "sensors", "serialbus", "serialport", "svg", "webchannel", "webengine", "websockets", "webview",
                "winextras", "x11extras", "xml", "xmlpatterns", "charts", "datavisualization"],
                parserOutput.context.getVariableRawValue("QT"));
        });
    });

    // HEADERS =/+=/*=/-= common.h lib1.h lib2.h backend.h
    describe("HEADERS", function() {
        // =
        it('valid HEADERS=... single-line assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/HEADERS/headers-assignment-singleline.pro");
            assert.equal(true,  parserOutput.result);
            assert.sameMembers([
                "common/filedownloader.h", "common/resultcode.h", "website_backend/gumboparserimpl.h",
                "website_backend/qtgumbonode.h", "website_backend/websiteinterface.h",
                "website_backend/html_tag.h", "website_backend/qtgumbodocument.h",
                "qml_frontend/forumreader.h"],
                parserOutput.context.getVariableRawValue("HEADERS"));
        });
        it('valid HEADERS=... multi-line assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/HEADERS/headers-assignment-multiline.pro");
            assert.equal(true,  parserOutput.result);
            assert.sameMembers([
                "common/filedownloader.h", "common/resultcode.h", "website_backend/gumboparserimpl.h",
                "website_backend/qtgumbonode.h", "website_backend/websiteinterface.h",
                "website_backend/html_tag.h", "website_backend/qtgumbodocument.h",
                "qml_frontend/forumreader.h"],
                parserOutput.context.getVariableRawValue("HEADERS"));
        });
        // +=
        // *=
        // -=
        it('valid HEADERS=... multi-line multiple assignment statements', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/HEADERS/headers-appending-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.sameMembers([
                "common/filedownloader.h", "common/resultcode.h", "website_backend/gumboparserimpl.h",
                "website_backend/qtgumbonode.h", "website_backend/websiteinterface.h",
                "website_backend/html_tag.h", "website_backend/qtgumbodocument.h",
                "qml_frontend/forumreader.h"],
                parserOutput.context.getVariableRawValue("HEADERS"));
        });
    });

    // SOURCES =/+=/*=/-= common.cpp backend.cpp
    describe("SOURCES", function() {
    // =
    it('valid SOURCES=... single-line assignment statement', function() {
        var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/SOURCES/sources-assignment-singleline.pro");
        assert.equal(true,  parserOutput.result);
        assert.sameMembers([
            "common/filedownloader.cpp", "common/resultcode.cpp", "website_backend/gumboparserimpl.cpp",
            "website_backend/qtgumbonode.c", "website_backend/websiteinterface.cxx",
            "website_backend/html_tag.cpp", "website_backend/qtgumbodocument.c",
            "qml_frontend/forumreader.cpp"],
            parserOutput.context.getVariableRawValue("SOURCES"));
    });
    it('valid SOURCES=... multi-line assignment statement', function() {
        var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/SOURCES/sources-assignment-multiline.pro");
        assert.equal(true,  parserOutput.result);
        assert.sameMembers([
            "common/filedownloader.cpp", "common/resultcode.c", "website_backend/gumboparserimpl.cpp",
            "website_backend/qtgumbonode.cxx", "website_backend/websiteinterface.cpp",
            "website_backend/html_tag.cpp", "website_backend/qtgumbodocument.cpp",
            "qml_frontend/forumreader.cpp"],
            parserOutput.context.getVariableRawValue("SOURCES"));
    });
    // +=
    // *=
    // -=
    it('valid SOURCES=... multi-line multiple assignment statements', function() {
        var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/SOURCES/sources-appending-assignment.pro");
        assert.equal(true,  parserOutput.result);
        assert.sameMembers([
            "common/filedownloader.cpp", "common/resultcode.cpp", "website_backend/gumboparserimpl.cpp",
            "website_backend/qtgumbonode.cpp", "website_backend/websiteinterface.cpp",
            "website_backend/html_tag.cpp", "website_backend/qtgumbodocument.cpp",
            "qml_frontend/forumreader.cpp"],
            parserOutput.context.getVariableRawValue("SOURCES"));
    });
    });

    // LEXSOURCES =/+=/*=/-= lexer_1.l lexer_2.l lexer_3.l
    // =
    // +=
    // *=
    // -=

    // YACCSOURCES =/+=/*=/-= moc.y js.y
    // =
    // +=
    // *=
    // -=

    // FORMS =/+=/*=/-= mydialog.ui mywidget.ui myconfig.ui
    // =
    // +=
    // *=
    // -=

    // RESOURCES =/+=/*=/-= icons.qrc strings.qrc
    // =
    // +=
    // *=
    // -=

    // TRANSLATIONS =/+=/*=/-= en.ts ru.ts es.ts
    // =
    // +=
    // *=
    // -=
});

