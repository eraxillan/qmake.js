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
            assert.equal("release", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=debug assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-debug-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("debug", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=debug_and_release assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-debugandrelease-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("debug_and_release", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=build_all assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-buildall-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("build_all", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=autogen_precompile_source assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-autogenprecomplilesource-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("autogen_precompile_source", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=ordered assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-ordered-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("ordered", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=precompile_header assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-precompileheader-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("precompile_header", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=warn_on assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-warnon-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("warn_on", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=warn_off assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-warnoff-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("warn_off", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=exceptions assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-exceptions-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("exceptions", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=exceptions_off assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-exceptionsoff-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("exceptions_off", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=rtti assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-rtti-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("rtti", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=rtti_off assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-rttioff-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("rtti_off", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=stl assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-stl-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("stl", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=stl_off assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-stloff-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("stl_off", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=thread assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-thread-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("thread", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=c++11 assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-cpp11-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("c++11", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=c++14 assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-cpp14-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("c++14", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=create_prl assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-createprl-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("create_prl", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=link_prl assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-linkprl-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("link_prl", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=qt assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-qt-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("qt", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=x11 assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-x11-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("x11", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=testcase assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-testcase-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("testcase", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=insignificant_test assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-insignificanttest-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("insignificant_test", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=windows assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-windows-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("windows", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=console assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-console-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("console", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=shared assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-shared-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("shared", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=dll assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-dll-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("dll", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=static assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-static-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("static", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=staticlib assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-staticlib-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("staticlib", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=plugin assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-plugin-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("plugin", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=designer assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-designer-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("designer", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=no_lflags_merge assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-nolflagsmerge-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("no_lflags_merge", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=flat assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-flat-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("flat", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=embed_manifest_dll assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-embedmanifestdll-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("embed_manifest_dll", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=embed_manifest_exe assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-embedmanifestexe-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("embed_manifest_exe", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=app_bundle assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-appbundle-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("app_bundle", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=lib_bundle assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-libbundle-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("lib_bundle", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=largefile assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-largefile-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("largefile", parserOutput.qmakeVars["CONFIG"]);
        });
        it('valid CONFIG=separate_debug_info assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-separatedebuginfo-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("separate_debug_info", parserOutput.qmakeVars["CONFIG"]);
        });

        // +=
        // *=
        // -=
        it('valid CONFIG+=release debug ... separate_debug_info assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/CONFIG/config-appending-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.sameMembers([
                "win32", "msvc", "no_plugin_manifest", "import_qpa_plugin", "qmake_use",
                "incremental_off", "incremental", "file_copies", "copy_dir_files", "lex", "yacc",
                "depend_includepath", "testcase_targets", "import_plugins",
                "release", "debug", "debug_and_release", "debug_and_release_target",
                "build_all", "autogen_precompile_source", "ordered", "precompile_header",
                "warn_on", "warn_off", "exceptions", "exceptions_off", "rtti", "rtti_off", "stl", "stl_off", "thread",
                "c++11", "c++14",
                "create_prl", "link_prl",
                "qt", "x11", "testcase", "insignificant_test",
                "windows", "console", "shared", "dll", "static", "staticlib", "plugin", "designer", "no_lflags_merge",
                "flat", "embed_manifest_dll", "embed_manifest_exe",
                "app_bundle", "lib_bundle",
                "largefile" /*, "separate_debug_info"*/ ],
                parserOutput.qmakeVars["CONFIG"]);
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
            assert.equal("core", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=gui assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-gui-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("gui", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=widgets assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-widgets-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("widgets", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=network assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-network-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("network", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=multimedia assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-multimedia-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("multimedia", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=sql assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-sql-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("sql", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=testlib assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-testlib-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("testlib", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=multimediawidgets assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-multimediawidgets-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("multimediawidgets", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=qml assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-qml-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("qml", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=quick assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-quick-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("quick", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=axcontainer assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-axcontainer-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("axcontainer", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=axserver assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-axserver-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("axserver", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=3dcore assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-3dcore-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("3dcore", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=3drender assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-3drender-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("3drender", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=3dinput assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-3dinput-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("3dinput", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=3dlogic assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-3dlogic-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("3dlogic", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=3dextras assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-3dextras-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("3dextras", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=enginio assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-enginio-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("enginio", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=androidextras assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-androidextras-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("androidextras", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=bluetooth assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-bluetooth-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("bluetooth", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=concurrent assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-concurrent-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("concurrent", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=dbus assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-dbus-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("dbus", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=location assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-location-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("location", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=macextras assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-macextras-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("macextras", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=nfc assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-nfc-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("nfc", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=opengl assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-opengl-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("opengl", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=positioning assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-positioning-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("positioning", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=printsupport assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-printsupport-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("printsupport", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=purchasing assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-purchasing-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("purchasing", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=quickcontrols2 assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-quickcontrols2-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("quickcontrols2", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=quickwidgets assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-quickwidgets-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("quickwidgets", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=script assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-script-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("script", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=scripttools assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-scripttools-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("scripttools", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=scxml assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-scxml-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("scxml", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=sensors assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-sensors-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("sensors", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=serialbus assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-serialbus-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("serialbus", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=serialport assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-serialport-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("serialport", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=svg assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-svg-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("svg", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=webchannel assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-webchannel-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("webchannel", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=webengine assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-webengine-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("webengine", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=websockets assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-websockets-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("websockets", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=webview assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-webview-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("webview", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=winextras assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-winextras-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("winextras", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=x11extras assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-x11extras-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("x11extras", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=xml assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-xml-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("xml", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=xmlpatterns assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-xmlpatterns-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("xmlpatterns", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=charts assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-charts-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("charts", parserOutput.qmakeVars["QT"]);
        });
        it('valid QT=datavisualization assignment statement', function() {
            var parserOutput = parseQmakeProjectFile("test/data/qmake-variables/QT/qt-datavisualization-assignment.pro");
            assert.equal(true,  parserOutput.result);
            assert.equal("datavisualization", parserOutput.qmakeVars["QT"]);
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
                "macextras", "nfc", "opengl", "positioning", /*"printsupport"*/ "purchasing",
                "quickcontrols2", "quickwidgets", "script", "scripttools", "scxml",
                "sensors", "serialbus", "serialport", "svg", "webchannel", "webengine", "websockets", "webview",
                "winextras", "x11extras", "xml", "xmlpatterns", "charts", "datavisualization"],
                parserOutput.qmakeVars["QT"]);
        });
    });

    // HEADERS =/+=/*=/-= common.h lib1.h lib2.h backend.h
    // =
    // +=
    // *=
    // -=

    // SOURCES =/+=/*=/-= common.cpp backend.cpp
    // =
    // +=
    // *=
    // -=

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
