{
var env = {};
env.userVars = {};

initBuiltinVars();
initBuiltinReplaceFunctions();
initBuiltinTestFunctions();

function callFunction(name) {
    // FIXME: error check
    return env.qmakeReplaceFuncs[name];
}

// FIXME: eval predefined qmake vars instead of hardcoding them
// FIXME: add others
function initBuiltinVars() {
    env.qmakeVars = {}

    env.qmakeVars["TEMPLATE"] = "app";
    env.qmakeVars["CONFIG"] = [
        // FIXME: (Windows + MSVC)-specific values
        "windows", "win32", "msvc",
        "flat", "embed_manifest_dll", "embed_manifest_exe",
        "exceptions", "rtti_off", "warn_on",
        "no_plugin_manifest", "import_qpa_plugin",
        "c++11", "shared",
        //
        "debug_and_release_target", "debug_and_release", "release",
        "qmake_use", "qt", "thread",
        // FIXME: macOS-specific values
        "app_bundle",
        "link_prl", "shared",
        "incremental_off", "incremental",
        "file_copies", "copy_dir_files",
        "precompile_header", "autogen_precompile_source",
        "lex", "yacc", "depend_includepath", "testcase_targets", "import_plugins"
    ];
    env.qmakeVars["QT"] = ["core", "gui"];

    // Input source code
    env.qmakeVars["HEADERS"] = [];
    env.qmakeVars["SOURCES"] = [];
    env.qmakeVars["LEXSOURCES"] = [];
    env.qmakeVars["YACCSOURCES"] = [];
    env.qmakeVars["FORMS"] = [];
    env.qmakeVars["RESOURCES"] = [];
    env.qmakeVars["TRANSLATIONS"] = [];
    
    // Output directories for generated files
    env.qmakeVars["DESTDIR"] = [];
    env.qmakeVars["UI_DIR"] = [];
    env.qmakeVars["OBJECTS_DIR"] = [];
    env.qmakeVars["MOC_DIR"] = [];

    // FIXME: implement and remove stub values
    env.qmakeVars["QMAKE_PLATFORM"] = ["win32"];
    env.qmakeVars["QT_ARCH"] = ["x86_64"];
    env.qmakeVars["QMAKE_COMPILER"] = ["msvc"];

    // FIXME: init other qmake variables
}

function initBuiltinReplaceFunctions() {
    env.qmakeReplaceFuncs = {}
    env.qmakeReplaceFuncs["first"] = function(args) { return args[0]; }
    env.qmakeReplaceFuncs["list"] = function(args) { return [args]; }
}

function initBuiltinTestFunctions() {
    // FIXME: implement
}

function assignVariable(dict, name, value) {
    dict[name] = value;
    return {name:name, op:"=", value:value};
}

}

Start =
    Statement* { return env; }

Statement
    = Comment
    / GenericAssignmentStatementT

GenericAssignmentStatementT = Whitespace* GenericAssignmentStatement Whitespace*
GenericAssignmentStatement
    = EmptyString
    // TEMPLATE
    / TemplateAssignmentStatement
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

// TEMPLATE = app|lib|subdirs|aux|vcapp|vclib
SystemTemplateVariable = "TEMPLATE"
SystemTemplateVariableValue = "app" / "lib" / "subdirs" / "aux" / "vcapp" / "vclib"
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
SystemConfigVariableValueKeyword
    = "debug_and_release_target" / "debug_and_release" / "debug" / "release"
    / "build_all"
    / "autogen_precompile_source" / "ordered" / "precompile_header"
    / "warn_off" / "warn_on" / "exceptions_off" / "exceptions" / "rtti_off" / "rtti"
    / "stl_off" / "stl" / "thread" / "c++11" / "c++14" / "create_prl" / "link_prl"
    / "qt" / "x11" / "testcase" / "insignificant_test"
    / "windows" / "console" / "shared" / "dll" / "static" / "staticlib" / "plugin"
    / "designer" / "no_lflags_merge" / "flat" / "embed_manifest_dll" / "embed_manifest_exe"
    / "app_bundle" / "lib_bundle" / "largefile" / "separate_debug_info"
SystemConfigVariableValueKeywordWithWS
    = v:SystemConfigVariableValueKeyword Whitespace+ {
    return v;
}
SystemConfigVariableSingleValueOrList
    = SystemConfigVariableValueKeywordWithWS / SystemConfigVariableValueKeyword

SystemConfigVariableValueList
    = v:SystemConfigVariableSingleValueOrList+ LineBreak+ {
    return v;
}

ConfigAssignmentStatement = lvalue:SystemConfigVariable AssignmentOperator rvalue:SystemConfigVariableValueList? Whitespace* LineBreak* {
    if (!(rvalue instanceof Array)) error("qmake '=' operator rvalue must be a list (i.e. JS Array)");

    env.qmakeVars[lvalue] = rvalue ? rvalue : "";
    return {name:lvalue, op:"=", value:rvalue};
}

ConfigAppendingAssignmentStatement = lvalue:SystemConfigVariable AppendingAssignmentOperator rvalue:SystemConfigVariableValueList {
    if (!(rvalue instanceof Array)) error("qmake '+=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.qmakeVars[lvalue])
        env.qmakeVars[lvalue] = [];
    
    env.qmakeVars[lvalue] = env.qmakeVars[lvalue].concat(rvalue);
    return {name:lvalue, op:"+=", value:rvalue};
}

ConfigAppendingUniqueAssignmentStatement = lvalue:SystemConfigVariable AppendingUniqueAssignmentOperator rvalue:SystemConfigVariableValueList {
    if (!(rvalue instanceof Array)) error("qmake '*=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.qmakeVars[lvalue])
        env.qmakeVars[lvalue] = rvalue;

    for (var i = 0; i < rvalue.length; ++i) {
        if (env.qmakeVars[lvalue].indexOf(rvalue[i]) < 0)
            env.qmakeVars[lvalue].push(rvalue[i]);
    }
    return {name:lvalue, op:"*=", value:rvalue};
}

ConfigRemovingAssignmentStatement = lvalue:SystemConfigVariable RemovingAssignmentOperator rvalue:SystemConfigVariableValueList {
    if (!(rvalue instanceof Array)) error("qmake '-=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.qmakeVars[lvalue])
        return undefined;
    
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
SystemQtVariableValueKeyword
    = "core" / "gui" / "widgets" / "network" / "sql" / "testlib"
    / "quickcontrols2" / "quickwidgets" / "qml" / "quick"
    / "multimediawidgets" / "multimedia"
    / "axcontainer" / "axserver"
    / "3dcore" / "3drender" / "3dinput" / "3dlogic" / "3dextras"
    / "enginio" / "androidextras" / "bluetooth" / "concurrent" / "dbus" / "location"
    / "macextras" / "nfc" / "opengl" / "positioning" / "printsupport" / "purchasing"
    / "scripttools" / "script" / "scxml"
    / "sensors" / "serialport" / "serialbus" / "svg"
    / "webchannel" / "webengine" / "websockets" / "webview"
    / "winextras" / "x11extras" / "xmlpatterns" / "xml"
    / "charts" / "datavisualization"
SystemQtVariableValueKeywordWithWS
    = v:SystemQtVariableValueKeyword Whitespace+ {
    return v;
}
SystemQtVariableSingleValueOrList
    = SystemQtVariableValueKeywordWithWS / SystemQtVariableValueKeyword

SystemQtVariableValueList
    = v:SystemQtVariableSingleValueOrList+ LineBreak+ {
    return v;
}

QtAssignmentStatement = lvalue:SystemQtVariable AssignmentOperator rvalue:SystemQtVariableValueList? Whitespace* LineBreak* {
    if (!(rvalue instanceof Array)) error("qmake '=' operator rvalue must be a list (i.e. JS Array)");

    env.qmakeVars[lvalue] = rvalue ? rvalue : "";
    return {name:lvalue, op:"=", value:rvalue};
}

QtAppendingAssignmentStatement = lvalue:SystemQtVariable AppendingAssignmentOperator rvalue:SystemQtVariableValueList {
    if (!(rvalue instanceof Array)) error("qmake '+=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.qmakeVars[lvalue])
        env.qmakeVars[lvalue] = [];
    
    env.qmakeVars[lvalue] = env.qmakeVars[lvalue].concat(rvalue);
    return {name:lvalue, op:"+=", value:rvalue};
}

QtAppendingUniqueAssignmentStatement = lvalue:SystemQtVariable AppendingUniqueAssignmentOperator rvalue:SystemQtVariableValueList {
    if (!(rvalue instanceof Array)) error("qmake '*=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.qmakeVars[lvalue])
        env.qmakeVars[lvalue] = rvalue;

    for (var i = 0; i < rvalue.length; ++i) {
        if (env.qmakeVars[lvalue].indexOf(rvalue[i]) < 0)
            env.qmakeVars[lvalue].push(rvalue[i]);
    }
    return {name:lvalue, op:"*=", value:rvalue};
}

QtRemovingAssignmentStatement = lvalue:SystemQtVariable RemovingAssignmentOperator rvalue:SystemQtVariableValueList {
    if (!(rvalue instanceof Array)) error("qmake '-=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.qmakeVars[lvalue])
        return undefined;
    
    // Search for rvalue in the array and remove all occurences
    for (var i = 0; i < rvalue.length; ++i) {
        env.qmakeVars[lvalue] = env.qmakeVars[lvalue].filter(function(item) { return (item !== rvalue[i]); });
    }
    return {name:lvalue, op:"-=", value:rvalue};
}

// -------------------------------------------------------------------------------------------------

// HEADERS =/+=/*=/-= common.h lib1.h lib2.h backend.h

// HEADERS = common.h lib1.h lib2.h backend.h
HeadersBuiltinVariable = "HEADERS"
HeadersAssignmentStatement
    = lvalue:HeadersBuiltinVariable AssignmentOperator rvalue:RvalueExpression {
    return assignVariable(env.qmakeVars, lvalue, rvalue);
}

// HEADERS += common.h lib1.h lib2.h backend.h
// FIXME: implement

// HEADERS *= common.h lib1.h lib2.h backend.h
// FIXME: implement

// HEADERS -= common.h lib1.h lib2.h backend.h
// FIXME: implement

// SOURCES =/+=/*=/-= common.cpp backend.cpp
// FIXME: implement

// SOURCES = common.cpp backend.cpp
SourcesBuiltinVariable = "SOURCES"
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
LexSourcesBuiltinVariable = "LEXSOURCES"
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
YaccSourcesBuiltinVariable = "YACCSOURCES"
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
FormsBuiltinVariable = "FORMS"
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
ResourcesBuiltinVariable = "RESOURCES"
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
TranslationsBuiltinVariable = "TRANSLATIONS"
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

UserVariableAssignmentStatement = lvalue:UserVariableIdentifier AssignmentOperator rvalue:RvalueExpression {
    if (!(rvalue instanceof Array)) error("qmake '=' operator rvalue must be a list (i.e. JS Array)");
    if (!rvalue)
        rvalue = [];

    return assignVariable(env.userVars, lvalue, rvalue);
}

UserVariableAppendingAssignmentStatement = lvalue:UserVariableIdentifier AppendingAssignmentOperator rvalue:RvalueExpression {
    if (!(rvalue instanceof Array)) error("qmake '+=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.userVars[lvalue])
        env.userVars[lvalue] = [];

    env.userVars[lvalue] = env.userVars[lvalue].concat(rvalue);
    return {name:lvalue, op:"+=", value:rvalue};
}

UserVariableAppendingUniqueAssignmentStatement = lvalue:UserVariableIdentifier AppendingUniqueAssignmentOperator rvalue:RvalueExpression {
    if (!(rvalue instanceof Array)) error("qmake '*=' operator rvalue must be a list (i.e. JS Array)");
    if (!env.userVars[lvalue])
        env.userVars[lvalue] = rvalue;
    for (var i = 0; i < rvalue.length; ++i) {
        if (env.userVars[lvalue].indexOf(rvalue[i]) < 0)
            env.userVars[lvalue].push(rvalue[i]);
    }
    return {name:lvalue, op:"*=", value:rvalue};
}

UserVariableRemovingAssignmentStatement = lvalue:UserVariableIdentifier RemovingAssignmentOperator rvalue:RvalueExpression {
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

SingleLineExpression = Whitespace* v:(StringList?) !"\\" LineBreak* {
    return v ? v : [""];
}

MultilineExpression_1 = Whitespace* v:StringList? "\\"  LineBreak+ { return v; }
MultilineExpression_2 = Whitespace* v:StringList  "\\"? LineBreak* { return v; }
MultilineExpression = v1:MultilineExpression_1
                      v2:MultilineExpression_2* {
    var result = v1;
    if (!result)
        result = [];
    for (var i = 0; i < v2.length; ++i)
        result = result.concat(v2[i]);
    return result;
}

RvalueExpression = v:(SingleLineExpression / MultilineExpression) {
    return v;
}

// -------------------------------------------------------------------------------------------------
// qmake variable expansion statement:
// 1) OUTPUT_LIB = $${BUILD_DIR}/mylib.dll
// 2) OUTPUT_LIB = $$LIB_NAME
VariableExpansionExpression = VariableExpansionExpressionEmbed / VariableExpansionExpressionLone

VariableExpansionExpressionEmbed = "$${" id:VariableIdentifier (!"(") "}" {
    if (env.qmakeVars && env.qmakeVars[id])
        return env.qmakeVars[id].join(" ");
    if (env.userVars && env.userVars[id])
        return env.userVars[id].join(" ");
    error("1) Variable " + id + " was not defined");
    return "";
}

VariableExpansionExpressionLone = "$$" id:VariableIdentifier (!"(") {
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
	//return args;
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
VariableIdentifier = VariableIdentifierT
VariableIdentifierT = SystemVariableIdentifier / UserVariableIdentifier

SystemVariableIdentifier = id:(SystemTemplateVariable / SystemConfigVariable) ![_a-zA-Z0-9]+ {
   return id;
}
UserVariableIdentifier
    = !SystemVariableIdentifier id:Identifier {
    return id;
}

// Functions: qmake replace and test functions and user-defined ones
FunctionIdentifier = FunctionIdentifierT
FunctionIdentifierT
    = SystemReplaceFunctionIdentifier / SystemTestFunctionIdentifier
    / UserReplaceFunctionIdentifier / UserTestFunctionIdentifier

// FIXME: implement using vars and add other qmake functions
SystemReplaceFunctionIdentifier = id:("first" / "list") ![_a-zA-Z0-9]+ {
    return id;
}
SystemTestFunctionIdentifier = "FIXME: implement"
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
Identifier "Identifier" = s1:[_a-zA-Z] s2:[_a-zA-Z0-9]* {
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
ExpandedString "Expanded string"
    = v1:(String / FunctionExpansionExpression / VariableExpansionExpression)
      v2:(String / FunctionExpansionExpression / VariableExpansionExpression)* {
    return v1 + v2.join("");
}

// FIXME: implement enquoted string support
String "String" = $AnyCharacter+
Word = w:Letter+ { return w.join(""); }

// Primitive types
// FIXME:  investigate whether several string types are required - raw, word, file name, etc.
AnyCharacter = [^,$ \t\r\n\"\\]

Letter = c:[a-zA-Z0-9]
Digit = d:[0-9]

Comma = ","

// Delimeters
LineBreak "Linebreak" = [\r\n] {
    return "LB";
}

Whitespace "Whitespace" = [ \t] {
   return "WS";
}
