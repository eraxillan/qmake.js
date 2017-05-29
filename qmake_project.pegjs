{
var env = {};
}

Start =
    Statement* {return env; }

Statement
    = Comment
    / GenericAssignmentStatementT

GenericAssignmentStatementT = Whitespace* GenericAssignmentStatement Whitespace*
GenericAssignmentStatement
    // TEMPLATE
    = TemplateAssignmentStatement
    // CONFIG
    / ConfigAssignmentStatement
    / ConfigAppendingAssignmentStatement
    / ConfigAppendingUniqueAssignmentStatement
    / ConfigRemovingAssignmentStatement
    // FIXME: add other qmake variables
    / UserVariableAssignmentStatement
    / UserVariableAppendingAssignmentStatement
    / UserVariableAppendingUniqueAssignmentStatement
    / UserVariableRemovingAssignmentStatement

// -------------------------------------------------------------------------------------------------

// # Single-line comment
Comment "Comment string" = Whitespace* "#" rvalue:$(!LineBreak .)* LineBreak+ {
	return "#" + rvalue;
}

// -------------------------------------------------------------------------------------------------

// TEMPLATE = app|lib|subdirs|aux|vcapp|vclib
SystemTemplateVariable = "TEMPLATE"
SystemTemplateVariableValue = "app" / "lib" / "subdirs" / "aux" / "vcapp" / "vclib"
TemplateAssignmentStatement = lvalue:SystemTemplateVariable AssignmentOperator rvalue:SystemTemplateVariableValue Whitespace* LineBreak* {
    if (!env.qmakeVars)
        env.qmakeVars = {};
    env.qmakeVars[lvalue] = rvalue;
    return {name:"TEMPLATE", op:"=", value:rvalue};
}

// -------------------------------------------------------------------------------------------------

// CONFIG = release|debug|debug_and_release|debug_and_release_target(DEFAULT)|build_all|autogen_precompile_source
//          |ordered|precompile_header|warn_on|warn_off|exceptions|exceptions_off|rtti|rtti_off|stl|stl_off|thread
//          |c++11|c++14
//			|create_prl|link_prl
//			|qt(DEFAULT)|x11|testcase|insignificant_test
//			|windows|console|shared|dll|static|staticlib|plugin|designer|no_lflags_merge
//			|flat|embed_manifest_dll|embed_manifest_exe (Windows-only)
//			|app_bundle|lib_bundle (macOS-only)
//			|largefile|separate_debug_info (Unix-only)
SystemConfigVariable = "CONFIG"
SystemConfigVariableValue
    = "debug_and_release_target" / "debug_and_release" / "debug" / "release"
    / "build_all"
    / "autogen_precompile_source" / "ordered" / "precompile_header"
    / "warn_off" / "warn_on" / "exceptions_off" / "exceptions" / "rtti_off" / "rtti"
    / "stl_off" / "stl" / "thread" / "c++11" / "c++14" / "create_prl" / "link_prl"
    / "qt" / "x11" / "testcase" / "insignificant_test"
    / "windows" / "console" / "shared" / "dll" / "static" / "staticlib" / "plugin"
    / "designer" / "no_lflags_merge" / "flat" / "embed_manifest_dll" / "embed_manifest_exe"
    / "app_bundle" / "lib_bundle" / "largefile" / "separate_debug_info"

ConfigAssignmentStatement = lvalue:SystemConfigVariable AssignmentOperator rvalue:SystemConfigVariableValue? Whitespace* LineBreak* {
    if (!env.qmakeVars)
        env.qmakeVars = {};
    env.qmakeVars[lvalue] = [rvalue];
    return {name:"CONFIG", op:"=", value:rvalue};
}

ConfigAppendingAssignmentStatement = lvalue:SystemConfigVariable AppendingAssignmentOperator rvalue:SystemConfigVariableValue Whitespace* LineBreak* {
    if (!env.qmakeVars)
        env.qmakeVars = {};
    if (!env.qmakeVars[lvalue])
        env.qmakeVars[lvalue] = [];
    env.qmakeVars[lvalue].push(rvalue);
    return {name:"CONFIG", op:"+=", value:rvalue};
}

ConfigAppendingUniqueAssignmentStatement = lvalue:SystemConfigVariable AppendingUniqueAssignmentOperator rvalue:SystemConfigVariableValue Whitespace* LineBreak* {
    if (!env.qmakeVars)
        env.qmakeVars = {};
    if (!env.qmakeVars[lvalue])
        env.qmakeVars[lvalue] = [rvalue];
    if (env.qmakeVars[lvalue].indexOf(rvalue) < 0)
    	env.qmakeVars[lvalue].push(rvalue);
    return {name:"CONFIG", op:"*=", value:rvalue};
}

ConfigRemovingAssignmentStatement = lvalue:SystemConfigVariable RemovingAssignmentOperator rvalue:SystemConfigVariableValue Whitespace* LineBreak* {
    if (!env.qmakeVars)
        env.qmakeVars = {};
    if (!env.qmakeVars[lvalue])
    	return undefined;
    
    // Search for rvalue in the array and remove all occurences
	env.qmakeVars[lvalue] = env.qmakeVars[lvalue].filter(function(element) { return (element !== rvalue); });
    return {name:"CONFIG", op:"-=", value:rvalue};
}

// -------------------------------------------------------------------------------------------------

UserVariableAssignmentStatement = lvalue:UserVariableIdentifier AssignmentOperator rvalue:RvalueExpression {
    if (!env.userVars)
        env.userVars = {};
    if (!rvalue)
        rvalue = "";
    env.userVars[lvalue] = rvalue;
    return {name:lvalue, op:"=", value:rvalue};
}

UserVariableAppendingAssignmentStatement = lvalue:UserVariableIdentifier AppendingAssignmentOperator rvalue:RvalueExpression {
    if (!env.userVars)
        env.userVars = {};
    if (!env.userVars[lvalue])
        env.userVars[lvalue] = [];
    env.userVars[lvalue].push(rvalue);
    return {name:lvalue, op:"+=", value:rvalue};
}

UserVariableAppendingUniqueAssignmentStatement = lvalue:UserVariableIdentifier AppendingUniqueAssignmentOperator rvalue:RvalueExpression {
    if (!env.userVars)
        env.userVars = {};
    if (!env.userVars[lvalue])
        env.userVars[lvalue] = [rvalue];
    if (env.userVars[lvalue].indexOf(rvalue) < 0)
    	env.userVars[lvalue].push(rvalue);
    return {name:lvalue, op:"*=", value:rvalue};
}

UserVariableRemovingAssignmentStatement = lvalue:UserVariableIdentifier RemovingAssignmentOperator rvalue:RvalueExpression {
    if (!env.userVars)
        env.userVars = {};
    if (!env.userVars[lvalue])
    	return undefined;
    
    // Search for rvalue in the array and remove all occurences
	env.userVars[lvalue] = env.userVars[lvalue].filter(function(element) { return (element !== rvalue); });
    return {name:lvalue, op:"-=", value:rvalue};
}

// -------------------------------------------------------------------------------------------------

// FIXME: implement variables expansion and replace functions support
// FIXME: fix the left recursion issue
SingleLineExpression = Whitespace* v:(StringExpression?) Whitespace* LineBreak+ {
    return [v ? v : ""];
}

MultilineExpression_1 = Whitespace* v:StringExpression? Whitespace* "\\" LineBreak+ { return v; }
MultilineExpression_2 = Whitespace* v:StringExpression? Whitespace* "\\"? LineBreak+ { return v; }
MultilineExpression = v1:MultilineExpression_1
                      v2:MultilineExpression_2* {
    return [v1].concat(v2);
}

StringExpression = v1:(String / VariableExpansionExpression) v2:(String / VariableExpansionExpression)* {
    return v1 + v2.join("");
}

RvalueExpression = v:(SingleLineExpression / MultilineExpression) {
    return v;
}

// -------------------------------------------------------------------------------------------------

// qmake variable expansion statement:
// 1) OUTPUT_LIB = $${BUILD_DIR}/mylib.dll
// 2) OUTPUT_LIB = $$LIB_NAME
VariableExpansionExpression = VariableExpansionExpressionEmbed / VariableExpansionExpressionLone

VariableExpansionExpressionEmbed = "$${" id:VariableIdentifier "}" {
    if (env.qmakeVars && env.qmakeVars[id])
        return env.qmakeVars[id].join(" ");
    if (env.userVars && env.userVars[id])
        return env.userVars[id].join(" ");
    //throw new ParseError("Variable " + id + " was not found");
    return "";
}

VariableExpansionExpressionLone = "$$" id:VariableIdentifier {
    if (env.qmakeVars && env.qmakeVars[id])
        return env.qmakeVars[id].join(" ");
    if (env.userVars && env.userVars[id])
        return env.userVars[id].join(" ");
    //throw new ParseError("Variable " + id + " was not found");
    return "";
}

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

// Assignment operators
AssignmentOperator = Whitespace* "=" Whitespace*
AppendingAssignmentOperator = Whitespace* "+=" Whitespace*              // DEFINES += USE_MY_STUFF
AppendingUniqueAssignmentOperator = Whitespace*  "*=" Whitespace*       // DEFINES *= USE_MY_STUFF
RemovingAssignmentOperator = Whitespace* "-=" Whitespace*               // DEFINES -= USE_MY_STUFF
// TODO: "~=" qmake operator support
//ReplacingAssignmentOperator = "~="            // DEFINES ~= s/QT_[DT].+/QT

// Identifiers
// NOTE: variable name must start from letter of underscope
Identifier = s1:[_a-zA-Z] s2:[_a-zA-Z0-9]* {
    return s1 + s2.join("");
}

// FIXME: add String rule; think about quoted strings
String = Word
Word = w:Letter+ { return w.join(""); }

// Primitive types
AnyCharacter = c:[^\r\n\t\"]
Letter = c:[a-zA-Z0-9]
Digit = d:[0-9]

// Delimeters
LineBreak = [\r\n] {
    return "LB";
}

Whitespace = [ \t] {
   return "WS";
}

//OpenBracket  = Whitespace '(' Whitespace
//CloseBracket = Whitespace ')' Whitespace
//QuoteExpr = Whitespace quote:("\"" / "$quot;" / "\xA0") Whitespace
