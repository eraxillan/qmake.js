{
var env = {};

env.builtinVariables = {};
env.VariableTypeEnum = {};

env.userVars = {};
env.qmakeReplaceFuncs = {};
env.qmakeTestFuncs = {};

initBuiltinVars();
initBuiltinReplaceFunctions();
initBuiltinTestFunctions();

function callFunction(name) {
    // FIXME: error check
    return env.qmakeReplaceFuncs[name];
}

function initBuiltinVars() {
    const varDescrInit = require("./builtin_variable_description");
    env.VariableTypeEnum = varDescrInit.VariableTypeEnum;
    env.builtinVariables = varDescrInit.builtinVariables();
}

function initBuiltinReplaceFunctions() {
    const initializer = require("./qmakeFunctionsInit");
    env.qmakeReplaceFuncs = initializer.qmakeFunctions().replaceFunctions;
}

function initBuiltinTestFunctions() {
    const initializer = require("./qmakeFunctionsInit");
    env.qmakeTestFuncs = initializer.qmakeFunctions().testFunctions;
}

function isBuiltinVariable(name) {
    return (env.builtinVariables[name] !== undefined);
}

function assignVariable(isBuiltinVariable, dict, name, value) {
    if (!(value instanceof Array))
        error("qmake '=' operator rvalue must be a JS Array, but actual type is '" + typeof(value) + "' with value:\n" + value);

    if (isBuiltinVariable)
        dict[name].value = value;
    else
        dict[name] = value;

    return {name:name, op:"=", value:value};
}

function appendAssignVariable(isBuiltinVariable, dict, name, value) {
    if (!(value instanceof Array))
        error("qmake '+=' operator rvalue must be a JS Array, but actual type is '" + typeof(value) + "' with value:\n" + value);

    if (!dict[name]) {
        if (isBuiltinVariable)
            dict[name].value = [];
        else
            dict[name] = [];
    }

    if (isBuiltinVariable)
        dict[name].value = dict[name].value.concat(value);
    else
        dict[name] = dict[name].concat(value);
    return {name:name, op:"+=", value:value};
}

function appendUniqueAssignVariable(isBuiltinVariable, dict, name, value) {
    if (!(value instanceof Array))
        error("qmake '*=' operator rvalue must be a JS Array, but actual type is '" + typeof(value) + "' with value:\n" + value);

    if (!dict[name]) {
        if (isBuiltinVariable)
            dict[name].value = [];
        else
            dict[name] = [];
    }

    for (var i = 0; i < value.length; ++i) {
        if (isBuiltinVariable) {
            if (dict[name].value.indexOf(value[i]) < 0)
                dict[name].value.push(value[i]);
        }
        else {
            if (dict[name].indexOf(value[i]) < 0)
                dict[name].push(value[i]);
        }
    }
    return {name:name, op:"*=", value:value};
}

function removeAssignVariable(isBuiltinVariable, dict, name, value) {
    if (!(value instanceof Array))
        error("qmake '-=' operator rvalue must be a JS Array, but actual type is '" + typeof(value) + "' with value:\n" + value);

    if (!dict[name])
        return undefined;

    // Search for value in the array and remove all occurences
    for (var i = 0; i < value.length; ++i) {
        if (isBuiltinVariable)
            dict[name].value = dict[name].value.filter(function(item) { return (item !== value[i]); });
        else
            dict[name] = dict[name].filter(function(item) { return (item !== value[i]); });
    }
    return {name:name, op:"-=", value:value};
}

function validateAssignmentOperands(variableDescription, rvalue) {
    switch (variableDescription.type) {
        case env.VariableTypeEnum.RESTRICTED_STRING: {
            if (rvalue.length !== 1)
                error(lvalue + " assignment rvalue must be a single string token, not a list");

            if (!variableDescription.canBeEmpty && !rvalue[0].length)
                error("variable " + lvalue + " can not have empty value");

            if (variableDescription.valueRange.indexOf(rvalue[0]) < 0)
                error(lvalue + " assignment rvalue must be one of the strings: " + variableDescription.valueRange);

            break;
        }
        case env.VariableTypeEnum.RESTRICTED_STRING_LIST: {
            if (!variableDescription.canBeEmpty && !rvalue.length)
                error("variable " + lvalue + " can not have empty value");

            for (var i = 0; i < rvalue.length; i++) {
                if (variableDescription.valueRange.indexOf(rvalue[i]) < 0)
                    error(lvalue + " assignment rvalue must be one of the strings: " + variableDescription.valueRange);
            }

            break;
        }
        case env.VariableTypeEnum.STRING: {
            if (rvalue.length !== 1)
                error(lvalue + " assignment rvalue must be a single string token, not a list");

            break;
        }
        case env.VariableTypeEnum.STRING_LIST: {
            break;
        }
        default: {
            error("Unsupported variable type " + variableDescription.type);
        }
    }
}

function expandVariableValue(variableDescription) {
    switch (variableDescription.type) {
        case env.VariableTypeEnum.STRING:
        case env.VariableTypeEnum.RESTRICTED_STRING:
            return variableDescription.value;
        case env.VariableTypeEnum.STRING_LIST:
        case env.VariableTypeEnum.RESTRICTED_STRING_LIST:
            return variableDescription.value.join(" ");
        default: {
            error("Unsupported variable type " + variableDescription.type);
        }
    }
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

Statement
    = EmptyString
    / Comment
    / GenericAssignmentStatementT
//    / GenericFunctionCallStatementT
//    / GenericConditionalStatementT

GenericAssignmentStatementT
    = Whitespace* s:GenericAssignmentStatement Whitespace* { return s; }

GenericAssignmentStatement
    = VariableAssignmentStatement
    / VariableAppendingAssignmentStatement
    / VariableAppendingUniqueAssignmentStatement
    / VariableRemovingAssignmentStatement

// -------------------------------------------------------------------------------------------------

// FIXME: function call
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

VariableAssignmentStatement
    = lvalue:VariableIdentifier AssignmentOperator rvalue:RvalueExpression {
    if (isBuiltinVariable(lvalue))
       validateAssignmentOperands(env.builtinVariables[lvalue], rvalue);

    return assignVariable(isBuiltinVariable(lvalue), isBuiltinVariable(lvalue) ? env.builtinVariables: env.userVars, lvalue, rvalue);
}

VariableAppendingAssignmentStatement
    = lvalue:VariableIdentifier AppendingAssignmentOperator rvalue:RvalueExpression {
    if (isBuiltinVariable(lvalue))
        validateAssignmentOperands(env.builtinVariables[lvalue], rvalue);

    return appendAssignVariable(isBuiltinVariable(lvalue), isBuiltinVariable(lvalue) ? env.builtinVariables : env.userVars, lvalue, rvalue);
}

VariableAppendingUniqueAssignmentStatement
    = lvalue:VariableIdentifier AppendingUniqueAssignmentOperator rvalue:RvalueExpression {
    if (isBuiltinVariable(lvalue))
        validateAssignmentOperands(env.builtinVariables[lvalue], rvalue);

    return appendUniqueAssignVariable(isBuiltinVariable(lvalue), isBuiltinVariable(lvalue) ? env.builtinVariables : env.userVars, lvalue, rvalue);
}

VariableRemovingAssignmentStatement
    = lvalue:VariableIdentifier RemovingAssignmentOperator rvalue:RvalueExpression {
    if (isBuiltinVariable(lvalue))
        validateAssignmentOperands(env.builtinVariables[lvalue], rvalue);

    return removeAssignVariable(isBuiltinVariable(lvalue), isBuiltinVariable(lvalue) ? env.builtinVariables : env.userVars, lvalue, rvalue);
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
    if (isBuiltinVariable(id))
        return expandVariableValue(env.builtinVariables[id]);

    if (env.userVars && env.userVars[id]) {
        return env.userVars[id].join(" ");
    }

    error("1) Variable " + id + " was not defined");
    return "";
}

VariableExpansionExpressionLone
    = "$$" id:VariableIdentifier (!"(") {   
    if (isBuiltinVariable(id))
        return expandVariableValue(env.builtinVariables[id]);

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
    = id:Identifier {
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
