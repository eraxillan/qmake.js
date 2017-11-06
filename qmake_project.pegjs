{

var contextModule = require("./pro_execution_context");
var evaluatorModule = require("./pro_expression_evaluator");

}

// -------------------------------------------------------------------------------------------------

Start =
    Statement* { return contextModule; }

Statement
    = EmptyString
    / Comment
    / GenericAssignmentStatementT
    / GenericFunctionCallStatementT
//    / GenericConditionalStatementT

GenericAssignmentStatementT
    = Whitespace* s:GenericAssignmentStatement Whitespace* { return s; }

GenericAssignmentStatement
    = VariableAssignmentStatement
    / VariableAppendingAssignmentStatement
    / VariableAppendingUniqueAssignmentStatement
    / VariableRemovingAssignmentStatement

// -------------------------------------------------------------------------------------------------

// Function call
GenericFunctionCallStatementT
    = Whitespace* expr:GenericFunctionCallStatement Whitespace* { return expr; }

GenericFunctionCallStatement
    = TestFunctionCallStatement

TestFunctionCallStatement
    = id:VariableIdentifier Whitespace* "(" Whitespace* args:(FunctionArgumentString?) Whitespace* ")" Whitespace* !BackslashLiteral LineBreak* {
    if (!args)
        args = "";

    let str = id + "(" + args + ")";

    let evaluator = new evaluatorModule.ExpressionEvaluator(contextModule.context);
    let rpnExpression = evaluator.convertToRPN(str);
    let rpnResult = evaluator.evalRPN(rpnExpression);
    var typeUtils = require("./type_utils");
    let result;
    if (typeUtils.isArray(rpnResult[0]))
        result = rpnResult[0];
    else if (typeUtils.isString(rpnResult[0]))
        result = rpnResult;
    else
        throw new Error("Array or string expected");

    return {result: result, string: str};
}

// FIXME: scope statement

// -------------------------------------------------------------------------------------------------

EmptyString "Empty string"
    = (Whitespace+ LineBreak*) / (Whitespace* LineBreak+) {
    return "";
}

// # Single-line comment
Comment "Comment"
    = Whitespace* HashLiteral rvalue:$(!LineBreak .)* LineBreak+ {
    return "#" + rvalue;
}

// -------------------------------------------------------------------------------------------------

VariableAssignmentStatement
    = lvalue:VariableIdentifier AssignmentOperator rvalue:RvalueExpression {
    return contextModule.context.assignVariable(lvalue, rvalue);
}

VariableAppendingAssignmentStatement
    = lvalue:VariableIdentifier AppendingAssignmentOperator rvalue:RvalueExpression {
    return contextModule.context.appendAssignVariable(lvalue, rvalue);
}

VariableAppendingUniqueAssignmentStatement
    = lvalue:VariableIdentifier AppendingUniqueAssignmentOperator rvalue:RvalueExpression {
    return contextModule.context.appendUniqueAssignVariable(lvalue, rvalue);
}

VariableRemovingAssignmentStatement
    = lvalue:VariableIdentifier RemovingAssignmentOperator rvalue:RvalueExpression {
    return contextModule.context.removeAssignVariable(lvalue, rvalue);
}

// -------------------------------------------------------------------------------------------------

SingleLineExpression
    = Whitespace* v:(RawString?) !BackslashLiteral LineBreak* {
    return v ? v : [""];
}

// 1) \ LB
// 2) v1 v2 \ LB
// 3) v3 v4 LB
// 4) X = Y LB
MultilineExpression_1
    = Whitespace* v:(RawString?) BackslashLiteral LineBreak+ { return v; }
MultilineExpression_2
    = Whitespace* v:(RawString?) !BackslashLiteral LineBreak+ { return v; }
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

// Variables: qmake and user-defined ones
VariableIdentifier
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

RawString
    = chars:NonLinebreakCharacter+ {
    let str = chars.join("");

    console.log("----------------------------------------------------------")
    console.log("RawString:", str)

    let evaluator = new evaluatorModule.ExpressionEvaluator(contextModule.context);
    let rpnExpression = evaluator.convertToRPN(str);
    let rpnResult = evaluator.evalRPN(rpnExpression);
    var typeUtils = require("./type_utils");
    if (typeUtils.isArray(rpnResult[0]))
        return rpnResult[0];
    else if (typeUtils.isString(rpnResult[0]))
        return rpnResult;
    else
        throw new Error("Array or string expected");

    console.log("----------------------------------------------------------")
}

FunctionArgumentString
    = chars:FunctionArgumentCharacter+ {
    return chars.join("");
}

NonLinebreakCharacter
    = !(HashLiteral / BackslashLiteral / LineBreak) char:. { return char; }
    / BackslashLiteral sequence:EscapeSequence { return sequence; }

// FIXME: implement ")" inside enquoted string correct detection;
//        looks like enquoted string detection must be implemented first
FunctionArgumentCharacter
    = !(HashLiteral / BackslashLiteral / LineBreak / ClosingParenthesis) char:. { return char; }
    / BackslashLiteral sequence:EscapeSequence { return sequence; }

EscapeSequence
    = SingleQuoteLiteral            { return "\\'"; }
    / DoubleQuoteLiteral            { return '\\"' }
    / BackslashLiteral              { return "\\\\"; }
    / "?"  { return "\\?";   }
    / "a"  { return "\\a"; }
    / "x" digits:$(HexDigit HexDigit HexDigit HexDigit) {
        return "\\x" + digits;
    }
    / digits:$(OctDigit OctDigit OctDigit) {
        return "\\" + digits;
    }
    / "x" digits:$(HexDigit HexDigit) {
        return "\\x" + digits;
    }
    / "b"  { return "\\b"; }
    / "f"  { return "\\f"; }
    / "n"  { return "\\n"; }
    / "r"  { return "\\r"; }
    / "t"  { return "\\t"; }
    / "v"  { return "\\v"; }

OctDigit = d:[0-7]
DecDigit = d:[0-9]
HexDigit = d:[0-9a-fA-F]

SingleQuoteLiteral = "'"
DoubleQuoteLiteral = '"'
HashLiteral = "#"
BackslashLiteral = "\\"
OpeningParenthesis = "("
ClosingParenthesis = ")"

// Delimeters
LineBreak "Linebreak"
    = [\r\n] {
    return "LB";
}

Whitespace "Whitespace"
    = [ \t] {
   return "WS";
}
