{

var bl = require("./pro_execution_context");
var persistentStorage = require("./persistent_property_storage");
var builtinFunctionsModule = require("./builtin_function_description");

}

// -------------------------------------------------------------------------------------------------

Start =
    Statement* { return bl; }

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
    return bl.context.assignVariable(lvalue, rvalue);
}

VariableAppendingAssignmentStatement
    = lvalue:VariableIdentifier AppendingAssignmentOperator rvalue:RvalueExpression {
    return bl.context.appendAssignVariable(lvalue, rvalue);
}

VariableAppendingUniqueAssignmentStatement
    = lvalue:VariableIdentifier AppendingUniqueAssignmentOperator rvalue:RvalueExpression {
    return bl.context.appendUniqueAssignVariable(lvalue, rvalue);
}

VariableRemovingAssignmentStatement
    = lvalue:VariableIdentifier RemovingAssignmentOperator rvalue:RvalueExpression {
    return bl.context.removeAssignVariable(lvalue, rvalue);
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
// 3) DESTDIR = $(PWD)
// 4) DESTDIR = $$(PWD)
// 5) target.path = $$[QT_INSTALL_PLUGINS]/designer
VariableExpansionExpression
    = ProjectVariableExpansionExpressionEmbed / ProjectVariableExpansionExpressionLone
    / EnvironmentVariableExpansionExpression / EnvironmentVariableExpansionMakefileExpression
    / PropertyExpansionExpression

// 1) Project variable expansion
ProjectVariableExpansionExpressionEmbed
    = "$${" id:VariableIdentifier (!"(") "}" {
    if (bl.context.isBuiltinVariable(id) || bl.context.isUserDefinedVariable(id))
        return bl.context.getVariableValue(id);

    error("1) Variable " + id + " was not defined");
    return "";
}

// 2) Project variable expansion
ProjectVariableExpansionExpressionLone
    = "$$" id:VariableIdentifier (!"(") {
    if (bl.context.isBuiltinVariable(id) || bl.context.isUserDefinedVariable(id))
        return bl.context.getVariableValue(id);

    error("2) Variable " + id + " was not defined");
    return "";
}

// 3) Environment variable expansion (in makefile)
EnvironmentVariableExpansionExpression
    = "$(" id:VariableIdentifier (!"(") ")" {
    // FIXME: implement
    return process.env[id];
}

// 4) Environment variable expansion (in project)
EnvironmentVariableExpansionMakefileExpression
    = "$$(" id:VariableIdentifier (!"(") ")" {
    return process.env[id];
}

// 5) QMake property expansion
PropertyExpansionExpression
    = "$$[" id:VariableIdentifier (!"(") "]" {
        return persistentStorage.query(id);
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
    return builtinFunctionsModule.replaceFunctions[id].action(args);
}

TestFunctionExpansionExpression
    = "FIXME: implement"

FunctionArguments
    = EmptyFunctionArgumentsList / FunctionArgumentsList
EmptyFunctionArgumentsList
    = "(" Whitespace* ")" { return []; }
FunctionArgumentsList
    = "(" Whitespace* s:(StringListComma / StringList) Whitespace* ")" { return s; }

// -------------------------------------------------------------------------------------------------

// Variables: qmake and user-defined ones
VariableIdentifier
    = Identifier

// Functions: qmake replace and test functions and user-defined ones
FunctionIdentifier
    = Identifier

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
    = v:ExpandedString Whitespace* CommaLiteral Whitespace* {
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

EnquotedExpandedString
    = DoubleQuoteLiteral
      v1:(EnquotedString / FunctionExpansionExpression / VariableExpansionExpression)
      v2:(EnquotedString / FunctionExpansionExpression / VariableExpansionExpression)*
      DoubleQuoteLiteral { return v1 + v2.join(""); }
    / SingleQuoteLiteral
      v1:(EnquotedString / FunctionExpansionExpression / VariableExpansionExpression)
      v2:(EnquotedString / FunctionExpansionExpression / VariableExpansionExpression)*
      SingleQuoteLiteral { return v1 + v2.join(""); }

String "String without whitespaces"
    = chars:NonWhitespaceCharacter+ { return chars.join(''); }

EnquotedString "String inside quotes"
    = chars:AnyCharacter+ { return chars.join(''); }



// Primitive types
// FIXME:  investigate whether several string types are required - raw, word, file name, etc.
// Any character what can be used inside of whitespace/comma-separated string list item,
// without quotes
NonWhitespaceCharacter
    = !(  HashLiteral / CommaLiteral / ExpandLiteral / Whitespace / LineBreak
        / BackslashLiteral / SingleQuoteLiteral / DoubleQuoteLiteral) char:. { return char; }
    / BackslashLiteral sequence:EscapeSequence { return sequence; }

AnyCharacter
    = !(  HashLiteral / CommaLiteral / ExpandLiteral
        / BackslashLiteral / SingleQuoteLiteral / DoubleQuoteLiteral) char:. { return char; }
    / BackslashLiteral sequence:EscapeSequence { return sequence; }

EscapeSequence
    = SingleQuoteLiteral
    / DoubleQuoteLiteral
    / BackslashLiteral
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

SingleQuoteLiteral = "'"
DoubleQuoteLiteral = '"'
ExpandLiteral = "$$"
HashLiteral = "#"
CommaLiteral = ","
BackslashLiteral = "\\"

// Delimeters
LineBreak "Linebreak"
    = [\r\n] {
    return "LB";
}

Whitespace "Whitespace"
    = [ \t] {
   return "WS";
}
