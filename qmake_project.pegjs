{
var env = {};
env.qmakeVars = {};
env.userVars = {};
env.qmakeReplaceFuncs = {};
env.qmakeTestFuncs = {};

env.configValidValues = [];

initBuiltinVars();
initBuiltinReplaceFunctions();
initBuiltinTestFunctions();

function callFunction(name) {
    // FIXME: error check
    return env.qmakeReplaceFuncs[name];
}

function initBuiltinVars() {
    const initializer = require("./qmakeVarsInit");
    env.qmakeVars = initializer.qmakeVars();
    env.configValidValues = initializer.configValidValues();
    env.qtValidValues = initializer.qtValidValues();
}

function initBuiltinReplaceFunctions() {
    const initializer = require("./qmakeFunctionsInit");
    env.qmakeReplaceFuncs = initializer.qmakeFunctions().replaceFunctions;
}

function initBuiltinTestFunctions() {
    const initializer = require("./qmakeFunctionsInit");
    env.qmakeTestFuncs = initializer.qmakeFunctions().testFunctions;
}

function assignVariable(dict, name, value) {
    dict[name] = value;
    return {name:name, op:"=", value:value};
}

function arrayContainsOnly(testArray, referenceArray) {
    // TODO: handle corner cases
    
    if (testArray && (testArray.length > 0)) {
        for (var i = 0; i < testArray.length; i++) {
            var found = false;
            for (var j = 0; j < referenceArray.length; j++) {
                if (testArray[i] == referenceArray[j]) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.log("arrayContainsOnly: absent value " + testArray[i]);
                return false;
            }
        }
    }
    return true;
}

}

// -------------------------------------------------------------------------------------------------

Start =
    Statement* { return env; }

// FIXME: implement function call statement, e.g. include(settings.pri)
Statement
    = EmptyString
    / Comment
    / GenericAssignmentStatementT
//    / GenericConditionalStatementT

GenericAssignmentStatementT
    = Whitespace* s:GenericAssignmentStatement Whitespace* { return s; }

GenericAssignmentStatement
    // TEMPLATE
    = TemplateAssignmentStatement
    // CONFIG
    / ConfigAssignmentStatement
    / ConfigAppendingAssignmentStatement
    / ConfigAppendingUniqueAssignmentStatement
    / ConfigRemovingAssignmentStatement
    // QT
    / QtAssignmentStatement
    / QtAppendingAssignmentStatement
    / QtAppendingUniqueAssignmentStatement
    / QtRemovingAssignmentStatement
    // Input source code
    / HeadersAssignmentStatement       // HEADERS
    / SourcesAssignmentStatement       // SOURCES
    / LexSourcesAssignmentStatement    // LEXSOURCES
    / YaccSourcesAssignmentStatement   // YACCSOURCES
    / FormsAssignmentStatement         // FORMS
    / ResourcesAssignmentStatement     // RESOURCES
    / TranslationsAssignmentStatement  // TRANSLATIONS
    // Output directories for generated files
    / DestdirAssignmentStatement       // DESTDIR
    / UiDirAssignmentStatement         // UI_DIR
    / ObjectsDirAssignmentStatement    // OBJECTS_DIR
    / MocDirAssignmentStatement        // MOC_DIR
    // FIXME: add other qmake variables
    / UserVariableAssignmentStatement
    / UserVariableAppendingAssignmentStatement
    / UserVariableAppendingUniqueAssignmentStatement
    / UserVariableRemovingAssignmentStatement

// -------------------------------------------------------------------------------------------------

// FIXME: scope statement

// -------------------------------------------------------------------------------------------------

EmptyString "Empty string"
    = (Whitespace+ LineBreak*) / (Whitespace* LineBreak+) {
    return "";
}

// # Single-line comment
Comment "Comment"
    = Whitespace* "#" rvalue:$(!LineBreak .)* LineBreak+ {
	return "#" + rvalue;
}

// -------------------------------------------------------------------------------------------------

// TEMPLATE = app|lib|aux|subdirs|vcsubdirs|vcapp|vclib
SystemTemplateVariable = "TEMPLATE"
SystemTemplateVariableValue = "app" / "lib" / "aux" / "subdirs" / "vcsubdirs" / "vcapp" / "vclib"
TemplateAssignmentStatement = lvalue:SystemTemplateVariable AssignmentOperator rvalue:SystemTemplateVariableValue Whitespace* LineBreak* {
    env.qmakeVars[lvalue] = rvalue;
    return {name:"TEMPLATE", op:"=", value:rvalue};
}

// -------------------------------------------------------------------------------------------------

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
SystemConfigVariable
    = "CONFIG"

ConfigAssignmentStatement
    = lvalue:SystemConfigVariable AssignmentOperator rvalue:RvalueExpression? {
    if (!(rvalue instanceof Array))
        error("qmake '=' operator rvalue must be a list (i.e. JS Array)");

    if (!arrayContainsOnly(rvalue, env.configValidValues))
        error("ConfigAssignmentStatement: invalid CONFIG value");

    return assignVariable(env.qmakeVars, lvalue, rvalue ? rvalue : "");
}

ConfigAppendingAssignmentStatement
    = lvalue:SystemConfigVariable AppendingAssignmentOperator rvalue:RvalueExpression? {
    if (!(rvalue instanceof Array))
        error("qmake '+=' operator rvalue must be a JS Array, but actual type is '" + typeof(rvalue) + "' with value:\n" + rvalue);

    if (!arrayContainsOnly(rvalue, env.configValidValues))
        error("ConfigAppendingAssignmentStatement: invalid CONFIG value");

    env.qmakeVars[lvalue] = env.qmakeVars[lvalue].concat(rvalue);
    return {name:lvalue, op:"+=", value:rvalue};
}

ConfigAppendingUniqueAssignmentStatement
    = lvalue:SystemConfigVariable AppendingUniqueAssignmentOperator rvalue:RvalueExpression? {
    if (!(rvalue instanceof Array))
        error("qmake '*=' operator rvalue must be a list (i.e. JS Array)");

    if (!arrayContainsOnly(rvalue, env.configValidValues))
        error("ConfigAppendingUniqueAssignmentStatement: invalid CONFIG value");

    for (var i = 0; i < rvalue.length; ++i) {
        if (env.qmakeVars[lvalue].indexOf(rvalue[i]) < 0)
            env.qmakeVars[lvalue].push(rvalue[i]);
    }
    return {name:lvalue, op:"*=", value:rvalue};
}

ConfigRemovingAssignmentStatement
    = lvalue:SystemConfigVariable RemovingAssignmentOperator rvalue:RvalueExpression? {
    if (!(rvalue instanceof Array))
        error("qmake '-=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.qmakeVars[lvalue])
        return undefined;

    if (!arrayContainsOnly(rvalue, env.configValidValues))
        error("ConfigRemovingAssignmentStatement: invalid CONFIG value");

    // Search for rvalue in the array and remove all occurences
    for (var i = 0; i < rvalue.length; ++i) {
        env.qmakeVars[lvalue] = env.qmakeVars[lvalue].filter(function(item) { return (item !== rvalue[i]); });
    }
    return {name:lvalue, op:"-=", value:rvalue};
}

// -------------------------------------------------------------------------------------------------

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

SystemQtVariable
    = "QT"

QtAssignmentStatement
    = lvalue:SystemQtVariable AssignmentOperator rvalue:RvalueExpression? {
    if (!(rvalue instanceof Array))
        error("qmake '=' operator rvalue must be a list (i.e. JS Array)");

    if (!arrayContainsOnly(rvalue, env.qtValidValues))
        error("QtAssignmentStatement: invalid QT value");
    
    return assignVariable(env.qmakeVars, lvalue, rvalue ? rvalue : "");
}

QtAppendingAssignmentStatement
    = lvalue:SystemQtVariable AppendingAssignmentOperator rvalue:RvalueExpression {
    if (!(rvalue instanceof Array))
        error("qmake '+=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.qmakeVars[lvalue])
        env.qmakeVars[lvalue] = [];

    if (!arrayContainsOnly(rvalue, env.qtValidValues))
        error("QtAppendingAssignmentStatement: invalid QT value");

    env.qmakeVars[lvalue] = env.qmakeVars[lvalue].concat(rvalue);
    return {name:lvalue, op:"+=", value:rvalue};
}

QtAppendingUniqueAssignmentStatement
    = lvalue:SystemQtVariable AppendingUniqueAssignmentOperator rvalue:RvalueExpression {
    if (!(rvalue instanceof Array))
        error("qmake '*=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.qmakeVars[lvalue])
        env.qmakeVars[lvalue] = rvalue;

    if (!arrayContainsOnly(rvalue, env.qtValidValues))
        error("QtAppendingUniqueAssignmentStatement: invalid QT value");

    for (var i = 0; i < rvalue.length; ++i) {
        if (env.qmakeVars[lvalue].indexOf(rvalue[i]) < 0)
            env.qmakeVars[lvalue].push(rvalue[i]);
    }
    return {name:lvalue, op:"*=", value:rvalue};
}

QtRemovingAssignmentStatement
    = lvalue:SystemQtVariable RemovingAssignmentOperator rvalue:RvalueExpression {
    if (!(rvalue instanceof Array))
        error("qmake '-=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.qmakeVars[lvalue])
        return undefined;

    if (!arrayContainsOnly(rvalue, env.qtValidValues))
        error("QtRemovingAssignmentStatement: invalid QT value");

    // Search for rvalue in the array and remove all occurences
    for (var i = 0; i < rvalue.length; ++i) {
        env.qmakeVars[lvalue] = env.qmakeVars[lvalue].filter(function(item) { return (item !== rvalue[i]); });
    }
    return {name:lvalue, op:"-=", value:rvalue};
}

// -------------------------------------------------------------------------------------------------

// HEADERS =/+=/*=/-= common.h lib1.h lib2.h backend.h

// HEADERS = common.h lib1.h lib2.h backend.h
HeadersBuiltinVariable
    = "HEADERS"
HeadersAssignmentStatement
    = lvalue:HeadersBuiltinVariable AssignmentOperator rvalue:RvalueExpression? {
    if (!(rvalue instanceof Array))
        error("qmake '=' operator rvalue must be a string array");
    return assignVariable(env.qmakeVars, lvalue, rvalue ? rvalue : "");
}

// HEADERS += common.h lib1.h lib2.h backend.h
HeadersAppendingAssignmentStatement
    = lvalue:HeadersBuiltinVariable AppendingAssignmentOperator rvalue:RvalueExpression? {
    if (!(rvalue instanceof Array))
        error("qmake '+=' operator rvalue must be a string array");
    if (!env.qmakeVars[lvalue])
        env.qmakeVars[lvalue] = [];

    env.qmakeVars[lvalue] = env.qmakeVars[lvalue].concat(rvalue);
    return {name:lvalue, op:"+=", value:rvalue};
}

// HEADERS *= common.h lib1.h lib2.h backend.h
HeadersAppendingUniqueAssignmentStatement
    = lvalue:HeadersBuiltinVariable AppendingUniqueAssignmentOperator rvalue:RvalueExpression? {
    if (!(rvalue instanceof Array))
        error("qmake '*=' operator rvalue must be a string array");
    if (!env.qmakeVars[lvalue])
        env.qmakeVars[lvalue] = rvalue;

    for (var i = 0; i < rvalue.length; ++i) {
        if (env.qmakeVars[lvalue].indexOf(rvalue[i]) < 0)
            env.qmakeVars[lvalue].push(rvalue[i]);
    }
    return {name:lvalue, op:"*=", value:rvalue};
}

// HEADERS -= common.h lib1.h lib2.h backend.h
HeadersRemovingUniqueAssignmentStatement
    = lvalue:HeadersBuiltinVariable RemovingAssignmentOperator rvalue:RvalueExpression? {
    if (!(rvalue instanceof Array))
        error("qmake '-=' operator rvalue must be a string array");
    if (!env.qmakeVars[lvalue])
        return undefined;

    // Search for rvalue in the array and remove all occurences
    for (var i = 0; i < rvalue.length; ++i) {
        env.qmakeVars[lvalue] = env.qmakeVars[lvalue].filter(function(item) { return (item !== rvalue[i]); });
    }
    return {name:lvalue, op:"-=", value:rvalue};
}
// SOURCES =/+=/*=/-= common.cpp backend.cpp
// FIXME: implement

// SOURCES = common.cpp backend.cpp
SourcesBuiltinVariable
    = "SOURCES"
SourcesAssignmentStatement
    = lvalue:SourcesBuiltinVariable AssignmentOperator rvalue:RvalueExpression {
    return assignVariable(env.qmakeVars, lvalue, rvalue);
}

// SOURCES += common.cpp backend.cpp
// FIXME: implement

// SOURCES *= common.cpp backend.cpp
// FIXME: implement

// SOURCES -= common.cpp backend.cpp
// FIXME: implement

// LEXSOURCES =/+=/*=/-= lexer_1.l lexer_2.l lexer_3.l

// LEXSOURCES = lexer_1.l lexer_2.l lexer_3.l
LexSourcesBuiltinVariable
    = "LEXSOURCES"
LexSourcesAssignmentStatement
    = lvalue:LexSourcesBuiltinVariable AssignmentOperator rvalue:RvalueExpression {
    return assignVariable(env.qmakeVars, lvalue, rvalue);
}

// LEXSOURCES += lexer_1.l lexer_2.l lexer_3.l
// FIXME: implement

// LEXSOURCES *= lexer_1.l lexer_2.l lexer_3.l
// FIXME: implement

// LEXSOURCES -= lexer_1.l lexer_2.l lexer_3.l
// FIXME: implement

// YACCSOURCES =/+=/*=/-= moc.y js.y
// FIXME: implement

// YACCSOURCES = moc.y js.y
YaccSourcesBuiltinVariable
    = "YACCSOURCES"
YaccSourcesAssignmentStatement
    = lvalue:YaccSourcesBuiltinVariable AssignmentOperator rvalue:RvalueExpression {
    return assignVariable(env.qmakeVars, lvalue, rvalue);
}

// YACCSOURCES += moc.y js.y
// FIXME: implement

// YACCSOURCES *= moc.y js.y
// FIXME: implement

// YACCSOURCES -= moc.y js.y
// FIXME: implement

// FORMS =/+=/*=/-= mydialog.ui mywidget.ui myconfig.ui
// FIXME: implement

// FORMS = mydialog.ui mywidget.ui myconfig.ui
FormsBuiltinVariable
    = "FORMS"
FormsAssignmentStatement
    = lvalue:FormsBuiltinVariable AssignmentOperator rvalue:RvalueExpression {
    return assignVariable(env.qmakeVars, lvalue, rvalue);
}

// FORMS += mydialog.ui mywidget.ui myconfig.ui
// FIXME: implement

// FORMS *= mydialog.ui mywidget.ui myconfig.ui
// FIXME: implement

// FORMS -= mydialog.ui mywidget.ui myconfig.ui

// RESOURCES =/+=/*=/-= icons.qrc strings.qrc
// FIXME: implement

// RESOURCES = icons.qrc strings.qrc
ResourcesBuiltinVariable
    = "RESOURCES"
ResourcesAssignmentStatement
    = lvalue:ResourcesBuiltinVariable AssignmentOperator rvalue:RvalueExpression {
    return assignVariable(env.qmakeVars, lvalue, rvalue);
}

// RESOURCES += icons.qrc strings.qrc
// FIXME: implement

// RESOURCES *= icons.qrc strings.qrc
// FIXME: implement

// RESOURCES -= icons.qrc strings.qrc
// FIXME: implement

// TRANSLATIONS =/+=/*=/-= en.ts ru.ts es.ts
// FIXME: implement

// TRANSLATIONS = en.ts ru.ts es.ts
TranslationsBuiltinVariable
    = "TRANSLATIONS"
TranslationsAssignmentStatement
    = lvalue:TranslationsBuiltinVariable AssignmentOperator rvalue:RvalueExpression {
    return assignVariable(env.qmakeVars, lvalue, rvalue);
}

// TRANSLATIONS += en.ts ru.ts es.ts
// FIXME: implement

// TRANSLATIONS *= en.ts ru.ts es.ts
// FIXME: implement

// TRANSLATIONS -= en.ts ru.ts es.ts
// FIXME: implement

// -------------------------------------------------------------------------------------------------

DirAssignmentRvalueTail
    = AssignmentOperator rvalue:RvalueExpression Whitespace* LineBreak* {
    // FIXME: check directory existance
    return rvalue;
}

// DESTDIR = __BUILD__/client/$${buildmode}/$${APP_PLATFORM}-$${APP_ARCH}-$${APP_COMPILER}
DestdirAssignmentStatement
    = lvalue:"DESTDIR" rvalue:DirAssignmentRvalueTail {
    return assignVariable(env.qmakeVars, lvalue, rvalue);
}

// UI_DIR = $${APP_BUILD_DIR}
UiDirAssignmentStatement
    = lvalue:"UI_DIR" rvalue:DirAssignmentRvalueTail {
    return assignVariable(env.qmakeVars, lvalue, rvalue);
}

// OBJECTS_DIR = $${APP_BUILD_DIR}
ObjectsDirAssignmentStatement
    = lvalue:"OBJECTS_DIR" rvalue:DirAssignmentRvalueTail {
    return assignVariable(env.qmakeVars, lvalue, rvalue);
}

// MOC_DIR = $${APP_BUILD_DIR}
MocDirAssignmentStatement
    = lvalue:"MOC_DIR" rvalue:DirAssignmentRvalueTail {
    return assignVariable(env.qmakeVars, lvalue, rvalue);
}

// -------------------------------------------------------------------------------------------------

UserVariableAssignmentStatement
    = lvalue:UserVariableIdentifier AssignmentOperator rvalue:RvalueExpression {
    if (!(rvalue instanceof Array)) error("qmake '=' operator rvalue must be a list (i.e. JS Array)");
    if (!rvalue)
        rvalue = [];

    return assignVariable(env.userVars, lvalue, rvalue);
}

UserVariableAppendingAssignmentStatement
    = lvalue:UserVariableIdentifier AppendingAssignmentOperator rvalue:RvalueExpression {
    if (!(rvalue instanceof Array)) error("qmake '+=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.userVars[lvalue])
        env.userVars[lvalue] = [];

    env.userVars[lvalue] = env.userVars[lvalue].concat(rvalue);
    return {name:lvalue, op:"+=", value:rvalue};
}

UserVariableAppendingUniqueAssignmentStatement
    = lvalue:UserVariableIdentifier AppendingUniqueAssignmentOperator rvalue:RvalueExpression {
    if (!(rvalue instanceof Array)) error("qmake '*=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.userVars[lvalue])
        env.userVars[lvalue] = rvalue;
    for (var i = 0; i < rvalue.length; ++i) {
        if (env.userVars[lvalue].indexOf(rvalue[i]) < 0)
            env.userVars[lvalue].push(rvalue[i]);
    }
    return {name:lvalue, op:"*=", value:rvalue};
}

UserVariableRemovingAssignmentStatement
    = lvalue:UserVariableIdentifier RemovingAssignmentOperator rvalue:RvalueExpression {
    if (!(rvalue instanceof Array)) error("qmake '-=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.userVars[lvalue])
        return undefined;
    if (!(rvalue instanceof Array)) error("qmake '=' operator rvalue must be a list (i.e. JS Array)");

    // Search for rvalue in the array and remove all occurences
    for (var i = 0; i < rvalue.length; ++i) {
        env.userVars[lvalue] = env.userVars[lvalue].filter(function(item) { return (item !== rvalue[i]); });
    }
    return {name:lvalue, op:"-=", value:rvalue};
}

// -------------------------------------------------------------------------------------------------

SingleLineExpression
    = Whitespace* v:(StringList?) !"\\" LineBreak* {
    return v ? v : [""];
}

// 1) \ LB
// 2) v1 v2 \ LB
// 3) v3 v4 LB
// 4) X = Y LB
MultilineExpression_1
    = Whitespace* v:StringList? "\\" LineBreak+ { return v; }
MultilineExpression_2
    = Whitespace* v:StringList? !"\\" LineBreak+ { return v; }
MultilineExpression
    = v1:MultilineExpression_1* v2:MultilineExpression_2 {
    var result = [];
    for (var i = 0; i < v1.length; ++i) {
        if (v1[i])
            result = result.concat(v1[i]);
    }
    result = result.concat(v2);
    return result;
}

RvalueExpression
    = v:(SingleLineExpression / MultilineExpression) {
    return v;
}

// -------------------------------------------------------------------------------------------------
// qmake variable expansion statement:
// 1) OUTPUT_LIB = $${BUILD_DIR}/mylib.dll
// 2) OUTPUT_LIB = $$LIB_NAME
VariableExpansionExpression
    = VariableExpansionExpressionEmbed / VariableExpansionExpressionLone

VariableExpansionExpressionEmbed
    = "$${" id:VariableIdentifier (!"(") "}" {
    if (env.qmakeVars && env.qmakeVars[id])
        return env.qmakeVars[id].join(" ");
    if (env.userVars && env.userVars[id])
        return env.userVars[id].join(" ");
    error("1) Variable " + id + " was not defined");
    return "";
}

VariableExpansionExpressionLone
    = "$$" id:VariableIdentifier (!"(") {
    if (env.qmakeVars && env.qmakeVars[id])
        return env.qmakeVars[id].join(" ");
    if (env.userVars && env.userVars[id])
        return env.userVars[id].join(" ");
    error("2) Variable " + id + " was not defined");
    return "";
}

// -------------------------------------------------------------------------------------------------
// qmake replace function result expansion statement:
// 1) APP_PLATFORM = $$first($$list($$QMAKE_PLATFORM))
// 2) APP_PLATFORM = $${first($${list($$QMAKE_PLATFORM)})}
FunctionExpansionExpression
    = ReplaceFunctionExpansionExpression / TestFunctionExpansionExpression

ReplaceFunctionExpansionExpression
    = ReplaceFunctionExpansionExpressionEmbed / ReplaceFunctionExpansionExpressionLone

ReplaceFunctionExpansionExpressionEmbed
    = "FIXME: implement"

ReplaceFunctionExpansionExpressionLone
    = "$$" id:FunctionIdentifier Whitespace* args:FunctionArguments {
    return callFunction(id)(args);
}

TestFunctionExpansionExpression
    = "FIXME: implement"

FunctionArguments
    = EmptyFunctionArgumentsList / FunctionArgumentsList
EmptyFunctionArgumentsList
    = "(" Whitespace* ")" { return []; }
//FunctionArgumentsList
//    = "(" Whitespace* s:ExpandedString+ Whitespace* ")" { return s; }
FunctionArgumentsList
    = "(" Whitespace* s:StringListComma Whitespace* ")" { return s; }

// -------------------------------------------------------------------------------------------------

// Variables: qmake and user-defined ones
VariableIdentifier
    = VariableIdentifierT
VariableIdentifierT
    = SystemVariableIdentifier / UserVariableIdentifier

SystemVariableIdentifier
    = id:(SystemTemplateVariable / SystemConfigVariable) ![_a-zA-Z0-9]+ {
   return id;
}
UserVariableIdentifier
    = !SystemVariableIdentifier id:Identifier {
    return id;
}

// Functions: qmake replace and test functions and user-defined ones
FunctionIdentifier
    = FunctionIdentifierT
FunctionIdentifierT
    = SystemReplaceFunctionIdentifier / SystemTestFunctionIdentifier
    / UserReplaceFunctionIdentifier / UserTestFunctionIdentifier

// FIXME: implement using vars and add other qmake functions
SystemReplaceFunctionIdentifier
    = id:("first" / "list") ![_a-zA-Z0-9]+ {
    return id;
}
SystemTestFunctionIdentifier
    = id:(
      "cache"                                                                                       // cache(variablename, [set|add|sub] [transient] [super|stash], [source variablename])

    / "CONFIG"                                                                                      // CONFIG(config, [values set])

    / "unset"                                                                                       // unset(variablename)
    / "export"                                                                                      // export(variablename)

    / "defined"                                                                                     // defined(name[, type])
    / "equals"                                                                                      // equals(variablename, value)
    / "contains"                                                                                    // contains(variablename, value)
    / "count"                                                                                       // count(variablename, number)
    / "infile"                                                                                      // infile(filename, var, val)
    / "isActiveConfig"                                                                              // isActiveConfig
    / "isEmpty"                                                                                     // isEmpty(variablename)
    / "isEqual"                                                                                     // isEqual
    
    / "greaterThan"                                                                                 // greaterThan(variablename, value)
    / "lessThan"                                                                                    // lessThan(variablename, value)
    // Evaluation
    / "eval"                                                                                        // eval(string)
    // Subprojects
    / "include"                                                                                     // include(filename)
    / "load"                                                                                        // load(feature)
    // Execution flow control
    / "requires"                                                                                    // requires(condition)
    / "if"                                                                                          // if(condition)
    / "for"                                                                                         // for(iterate, list)
    // File system management
    / "files"                                                                                       // files(pattern[, recursive=false])
    / "exists"                                                                                      // exists(filename)
    / "mkpath"                                                                                      // mkpath(dirPath)
    / "write_file"                                                                                  // write_file(filename, [variablename, [mode]])
    / "touch"                                                                                       // touch(filename, reference_filename)
    // External commands execution
    / "system"                                                                                      // system(command)
    // Console output
    / "debug"                                                                                       // debug(level, message)
    / "log"                                                                                         // log(message)
    / "message"                                                                                     // message(string)
    / "warning"                                                                                     // warning(string)
    / "error"                                                                                       // error(string)
    
    // Test Function Library
    / "packagesExist"                                                                               // packagesExist(packages)
    / "prepareRecursiveTarget"                                                                      // prepareRecursiveTarget(target)
    / "qtCompileTest"                                                                               // qtCompileTest(test)
    / "qtHaveModule"                                                                                // qtHaveModule(name)
    ) ![_a-zA-Z0-9]+ {
    return id;
}

UserReplaceFunctionIdentifier = "FIXME: implement"
UserTestFunctionIdentifier = "FIXME: implement"

// Assignment operators
AssignmentOperator "assignment operator ('=')"
    = Whitespace* "=" Whitespace*       // TEMPLATE = app
AppendingAssignmentOperator "appending assignment operator ('+=')"
    = Whitespace* "+=" Whitespace*      // DEFINES += USE_MY_STUFF
AppendingUniqueAssignmentOperator "appending unique assignment operator ('*=')"
    = Whitespace* "*=" Whitespace*      // DEFINES *= USE_MY_STUFF
RemovingAssignmentOperator "removing assignment operator ('-=')"
    = Whitespace* "-=" Whitespace*      // DEFINES -= USE_MY_STUFF
// TODO: "~=" qmake operator support
//ReplacingAssignmentOperator = "~="    // DEFINES ~= s/QT_[DT].+/QT

// Identifiers
// NOTE: variable name must start from letter of underscope
Identifier "Identifier"
    = s1:[_a-zA-Z] s2:[_a-zA-Z0-9]* {
    return s1 + s2.join("");
}

// String list (whitespace-separated)
StringList "Whitespace-separated string list"
    = v:StringListItemOrString+ {
    return v;
}

StringListItemOrString "String followed with whitespace OR String"
    = StringListItemWithWS / ExpandedString

StringListItemWithWS "String followed with whitespace"
    = v:ExpandedString Whitespace+ {
    return v;
}

// Function arguments list (comma-separated)
StringListComma "Comma-separated string list"
    = v:StringListCommaItemOrString+ {
    return v;
}

StringListCommaItemOrString
    = StringListCommaItemWithComma / ExpandedString

StringListCommaItemWithComma "String followed with comma"
    = v:ExpandedString Whitespace* Comma Whitespace* {
    return v;
}

// String mixed with variable or function expansion statements, e.g. abc$$first($$list(x, y, z))xyz
ExpandedString
    = EnquotedExpandedString / ExpandedStringRaw

ExpandedStringRaw "Expanded string"
    = v1:(String / FunctionExpansionExpression / VariableExpansionExpression)
      v2:(String / FunctionExpansionExpression / VariableExpansionExpression)* {
    return v1 + v2.join("");
}

// TODO: does qmake support single quotes?
EnquotedExpandedString
    = '"' v1:(EnquotedString / FunctionExpansionExpression / VariableExpansionExpression)
          v2:(EnquotedString / FunctionExpansionExpression / VariableExpansionExpression)* '"' {
    return v1 + v2.join("");
}

String "String without whitespaces"
    = chars:NonWhitespaceCharacter+ { return chars.join(''); }

EnquotedString "String inside quotes"
    = chars:AnyCharacter+ { return chars.join(''); }

//Word = w:Letter+ { return w.join(""); }

// Primitive types
// FIXME:  investigate whether several string types are required - raw, word, file name, etc.
// Any character what can be used inside of whitespace/comma-separated string list item,
// without quotes
NonWhitespaceCharacter
    = !("#" / "," / "$" / ' ' / '\t' / '\r' / '\n' / "\\" / '"' / "'") char:. { return char; }
    / "\\" sequence:EscapeSequence { return sequence; }

AnyCharacter
    = !("#" / "," / "$" / "\\" / '"' / "'") char:. { return char; }
    / "\\" sequence:EscapeSequence { return sequence; }

EscapeSequence
    = "'"
    / '"'
    / "\\"
    / "?"  { return "\?";   }
    / "a"  { return "\a";   }
    / "x" digits:$(HexDigit HexDigit HexDigit HexDigit) {
        return String.fromCharCode(parseInt(digits, 16));
    }
    / digits:$(OctDigit OctDigit OctDigit) {
        return String.fromCharCode(parseInt(digits, 8));
    }
    / "x" digits:$(HexDigit HexDigit) {
        return String.fromCharCode(parseInt(digits, 16));
    }
    / "b"  { return "\b";   }
    / "f"  { return "\f";   }
    / "n"  { return "\n";   }
    / "r"  { return "\r";   }
    / "t"  { return "\t";   }
    / "v"  { return "\x0B"; }

Letter = c:[a-zA-Z]

OctDigit = d:[0-7]
DecDigit = d:[0-9]
HexDigit = d:[0-9a-fA-F]

Comma = ","

// Delimeters
LineBreak "Linebreak"
    = [\r\n] {
    return "LB";
}

Whitespace "Whitespace"
    = [ \t] {
   return "WS";
}
