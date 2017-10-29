'use strict';

// FIXME: replace with exception generation
const assert = require('chai').assert;

var typeUtils = require("./type_utils");
var builtinVariableModule = require("./builtin_variable_description");
var builtinFunctionModule = require("./builtin_function_description");
var executionContextModule = require("./pro_execution_context");

var commonModule = require("./common");
var QStack = commonModule.QStack;

var proParserModule = require("./pro_parser");
var ProParser = proParserModule.ProParser;

// -------------------------------------------------------------------------------------------------

const STR_OPENING_PARENTHESIS = proParserModule.STR_OPENING_PARENTHESIS;
const STR_CLOSING_PARENTHESIS = proParserModule.STR_CLOSING_PARENTHESIS
const STR_OPENING_CURLY_BRACE = proParserModule.STR_OPENING_CURLY_BRACE
const STR_CLOSING_CURLY_BRACE = proParserModule.STR_CLOSING_CURLY_BRACE

const STR_DOUBLE_QUOTE = proParserModule.STR_DOUBLE_QUOTE
const STR_SINGLE_QUOTE = proParserModule.STR_SINGLE_QUOTE

const STR_COMMA = proParserModule.STR_COMMA

const STR_EXCLAMATION_MARK = proParserModule.STR_EXCLAMATION_MARK
const STR_COLON = proParserModule.STR_COLON
const STR_VERTICAL_BAR = proParserModule.STR_VERTICAL_BAR

const STR_EXPAND_MARKER = proParserModule.STR_EXPAND_MARKER

// Assignment operators
const STR_EQUALS = proParserModule.STR_EQUALS
const STR_PLUS_EQUALS = proParserModule.STR_PLUS_EQUALS
const STR_ASTERISK_EQUALS = proParserModule.STR_ASTERISK_EQUALS
const STR_MINUS_EQUALS = proParserModule.STR_MINUS_EQUALS
const STR_TILDE_EQUALS = proParserModule.STR_TILDE_EQUALS

// -------------------------------------------------------------------------------------------------

// Internally used by Shunting-yard RPN converter and interpreter strings
// NOTE: '#' is a line-comment marker in qmake syntax, so it surely absent in expression string
const STR_INTERNAL_MARKER = "#";
const STR_ARITY_MARKER = "#FUNCTION_ARGUMENT_COUNT";
const STR_INVOKE_REPLACE = "#FUNCTION_INVOKE_REPLACE";
const STR_INVOKE_TEST = "#FUNCTION_INVOKE_TEST";
const STR_BLOCK_BEGIN = "#CODE_BLOCK_BEGIN";
const STR_BLOCK_END = "#CODE_BLOCK_END";

//#region Private member functions
function isArityMarker(str) {
    return (str === STR_ARITY_MARKER);
}

function isBooleanOperator(str) {
    return (str === STR_EXCLAMATION_MARK) || (str === STR_COLON) || (str === STR_VERTICAL_BAR);
}

function isStringValue(str) {
    return typeUtils.isString(str) &&
        !isBooleanOperator(str) && !isArityMarker(str) && (str !== STR_EXPAND_MARKER) &&
        (str !== STR_OPENING_PARENTHESIS) && (str !== STR_CLOSING_PARENTHESIS) &&
        (str !== STR_OPENING_CURLY_BRACE) && (str !== STR_CLOSING_CURLY_BRACE) &&
        (str !== STR_COMMA);
}
//#endregion

//#region Assignment operators: =|+=|*=|-=|~=
var assignmentOperators = {
    STR_EQUALS: {
        action: function(name, value, context) {
            context.assignVariable(name, value);
        }
    },
    STR_PLUS_EQUALS: {
        action: function(name, value, context) {
            context.appendAssignVariable(name, value);
        }
    },
    STR_ASTERISK_EQUALS: {
        action: function(name, value, context) {
            context.appendUniqueAssignVariable(name, value);
        }
    },
    STR_MINUS_EQUALS: {
        action: function(name, value, context) {
            context.removeAssignVariable(name, value);
        }
    },
    STR_TILDE_EQUALS: {
        action: function(name, value, context) {
            // FIXME: implement
            throw new Error("'~=' assignment operator not implemented yet");
        }
    }
};
//#endregion

//#region Boolean operators: AND, OR, NOT
var booleanOperators = {
    STR_EXCLAMATION_MARK: {
        precedence: 4,
        associativity: "Left",
        operandCount: 1,
        action: function(val1) {
            if (!isBoolean(val1))
                throw new Error("Logical NOT operator '!' requires exactly one boolean operand");

            return (!val1);
        }
    },
    STR_COLON: {
        precedence: 3,
        associativity: "Left",
        operandCount: 2,
        action: function(val1, val2) {
            if (!isBoolean(val1))
                throw new Error("Logical AND operator ':' requires two boolean operands");

            return (val1 && val2);
        }
    },
    STR_VERTICAL_BAR: {
        precedence: 3,
        associativity: "Left",
        operandCount: 2,
        action: function(val1, val2) {
            if (!isBoolean(val1))
                throw new Error("Logical OR operator '|' requires two boolean operands");

            return (val1 || val2);
        }
    }
}
//#endregion

// -------------------------------------------------------------------------------------------------

class ExpressionEvaluator {

    constructor(context) {
        // FIXME: replace one context object with stack of contexts (to parse code blocks)
        //this.executionContext = new executionContextModule.ProExecutionContext();
        this.executionContext = context;
    }

    convertToRPN(expr) {

        let outputQueue = [];
        let operatorStack = new QStack();
        let arityStack = [];

        let exprArray = ProParser.tokenizeString(expr);
//        console.log("    Raw expression:", expr)
//        console.log("Tokenized expression:", exprArray);

        let pushOperator = () => {
            let op = operatorStack.pop();
            if (builtinFunctionModule.isReplaceFunction(op) || builtinFunctionModule.isTestFunction(op)) {
                let functionArity = arityStack.pop();
                outputQueue.push(STR_INTERNAL_MARKER + functionArity.toString());
                outputQueue.push(STR_ARITY_MARKER);
                if (builtinFunctionModule.isReplaceFunction(op)) {
                    let functionName = op.substring(STR_EXPAND_MARKER.length);
                    console.log("ExpressionEvaluator::convertToRPN: replace function call (2): '" + functionName + "' with " + functionArity + " arguments");
                    outputQueue.push(STR_INTERNAL_MARKER + functionName);
                    outputQueue.push(STR_INVOKE_REPLACE);
                } else {
                    console.log("ExpressionEvaluator::convertToRPN: test function call (2): '" + op + "' with " + functionArity + " arguments");
                    outputQueue.push(STR_INTERNAL_MARKER + op);
                    outputQueue.push(STR_INVOKE_TEST);
                }
            } else {
                console.log("ExpressionEvaluator::convertToRPN: operand: '" + op + "'");
                outputQueue.push(op);
            }
        };

        for (let i = 0; i < exprArray.length; i++) {
            let token = exprArray[i];
//            console.log("TOKEN:", token);

            if (builtinFunctionModule.isReplaceFunction(token) && (exprArray[i + 1] === STR_OPENING_PARENTHESIS)) {
                console.log("ExpressionEvaluator::convertToRPN: replace function call (1): '" + token.substring(STR_EXPAND_MARKER.length) + "'");
                var o1 = token;
                var o2 = operatorStack[operatorStack.length - 1];
                while (o2 && builtinFunctionModule.isReplaceFunction(o2)) {
                    pushOperator();
                    o2 = operatorStack[operatorStack.length - 1];
                }

                operatorStack.push(o1);
                arityStack.push(1);
            } else if (builtinFunctionModule.isTestFunction(token) && (exprArray[i + 1] === STR_OPENING_PARENTHESIS)) {
                console.log("ExpressionEvaluator::convertToRPN: test function call (1): '" + token + "'");

                var o1 = token;
                var o2 = operatorStack[operatorStack.length - 1];
                while (o2 && builtinFunctionModule.isTestFunction(o2)) {
                    pushOperator();
                    o2 = operatorStack[operatorStack.length - 1];
                }

                operatorStack.push(o1);
                arityStack.push(1);
            } else if (token === STR_OPENING_PARENTHESIS) {
                console.log("ExpressionEvaluator::convertToRPN: opening parenthesis");

                operatorStack.push(token);
            } else if (token === STR_CLOSING_PARENTHESIS) {
                console.log("ExpressionEvaluator::convertToRPN: closing parenthesis");

                while (operatorStack[operatorStack.length - 1] !== STR_OPENING_PARENTHESIS) {
                    pushOperator();
                }
                operatorStack.pop();
            } else if (token === STR_COMMA) {
                console.log("ExpressionEvaluator::convertToRPN: comma");

                arityStack[arityStack.length - 1] ++;

                while (operatorStack[operatorStack.length - 1] !== STR_OPENING_PARENTHESIS) {
                    pushOperator();
                }
            } else if (token === STR_COLON) {
                console.log("ExpressionEvaluator::convertToRPN: colon");

                while (operatorStack.length > 0) {
                    pushOperator();
                }
                outputQueue.push(STR_BLOCK_BEGIN);
                operatorStack.push(STR_BLOCK_END);
            } else if (token === STR_OPENING_CURLY_BRACE) {
                console.log("ExpressionEvaluator::convertToRPN: opening curly brace");

                while (operatorStack.length > 0) {
                    pushOperator();
                }
                operatorStack.push(STR_BLOCK_BEGIN);
            } else if (token === STR_CLOSING_CURLY_BRACE) {
                console.log("ExpressionEvaluator::convertToRPN: closing curly brace");

                while (operatorStack.length > 0) {
                    pushOperator();
                }
                operatorStack.push(STR_BLOCK_END);
            } else if (isStringValue(token)) {
                console.log("ExpressionEvaluator::convertToRPN: string operand: '" + token + "'");

                outputQueue.push(token);
            } else {
                throw new Error("Invalid token '" + token + "'");
            }
        }

        while (operatorStack.length > 0) {
            pushOperator();
        }

        console.log();
        console.log("RPN:", outputQueue);
        console.log();

        return outputQueue;
    }

    evalRPN(rpnExpr) {
        if (!typeUtils.isArray(rpnExpr) || (rpnExpr.length <= 0)) {
            throw new Error("Empty RPN expression");
        }

        let values = rpnExpr;
        let array = new Array();
        let operandCount = -1;
        for (let i = 0; i < values.length; i++) {
            let token = values[i];
            console.log("ProParser::evalRPN: RPN[" + i + "] = '" + token + "'");

            if (token.startsWith(STR_INTERNAL_MARKER)) {
//                console.log("CMD:", token);

                switch (token) {
                    case STR_ARITY_MARKER: {
                        throw new Error("Must be processed earlier");
                    }
                    case STR_INVOKE_REPLACE: {
                        console.log("Invoking replace function '" + array[array.length - 1] + "'");

                        // Get replace function name
                        let funcName = array.pop();
                        if (!funcName || !typeUtils.isString(funcName) || typeUtils.isEmpty(funcName)) {
                            throw new Error("Invalid replace function name");
                        }

                        // Validate replace function description
                        if (!builtinFunctionModule.replaceFunctions[funcName] || (builtinFunctionModule.replaceFunctions[funcName] === undefined))
                            throw new Error("Unsupported replace function '" + funcName + "'");

                        // Get replace function actual argument count
                        let operandCountStr = array.pop();
                        if (!commonModule.isNumeric(operandCountStr)) {
                            throw new Error("Invalid replace function argument count value '" + operandCountStr + "'");
                        }
                        let operandCount = parseInt(operandCountStr);
                        if ((operandCount === undefined) || (operandCount < 0)) {
                            throw new Error("Invalid replace function argument count value '" + operandCountStr + "'");
                        }
                        console.log("Operand count: " + operandCountStr);

                        let val = [];
                        for (let j = 0; j < operandCount; j++) {
                            val.push(array.pop());  // val = val.concat(array.pop());
                        }
                        val = val.reverse();
                        console.log("Operand values:", val);

                        // Validate arguments count for non-variadic functions
                        if (builtinFunctionModule.replaceFunctions[funcName].operandCount !== undefined) {
                            if ((builtinFunctionModule.replaceFunctions[funcName].operandCount === undefined) || (builtinFunctionModule.replaceFunctions[funcName].operandCount < 0)) {
                                throw new Error("Invalid replace function '" + funcName + "' argument count description");
                            }

                            if (builtinFunctionModule.replaceFunctions[funcName].operandCount.optional === undefined) {
                                if (operandCount < builtinFunctionModule.replaceFunctions[funcName].operandCount.required) {
                                    throw new RangeError("Invalid number of arguments for replace function '" + funcName + "': " +
                                        builtinFunctionModule.replaceFunctions[funcName].operandCount.required + " expected, but " + operandCount + " given");
                                }
                            } else {
                                let minArgCount = builtinFunctionModule.replaceFunctions[funcName].operandCount.required;
                                let maxArgCount = minArgCount + builtinFunctionModule.replaceFunctions[funcName].operandCount.optional;
                                if ((operandCount < minArgCount) || (operandCount > maxArgCount)) {
                                    throw new RangeError("Invalid number of arguments for replace function '" + funcName + "': from " +
                                        minArgCount + " to " + maxArgCount + " expected, but " + operandCount + " given");
                                }
                            }
                        }

                        // Call function
                        let result = builtinFunctionModule.replaceFunctions[funcName].action(...val);

                        // Validate and save execution result
                        if (!typeUtils.isArray(result)) {
                            result = [result];
                        }
                        array.push(result);

                        console.log("Result:", result);
                        break;
                    }
                    case STR_INVOKE_TEST: {
                        console.log("Invoking test function '" + array[array.length - 1] + "'");

                        // Get test function name
                        let funcName = array.pop();
                        if (!funcName || !typeUtils.isString(funcName) || typeUtils.isEmpty(funcName)) {
                            throw new Error("Invalid test function name");
                        }

                        // Validate test function description
                        if (!builtinFunctionModule.testFunctions[funcName] || (builtinFunctionModule.testFunctions[funcName] === undefined))
                            throw new Error("Unsupported test function '" + funcName + "'");

                        // Get test function actual argument count
                        let operandCountStr = array.pop();
                        if (!commonModule.isNumeric(operandCountStr)) {
                            throw new Error("Invalid test function argument count value '" + operandCountStr + "'");
                        }
                        let operandCount = parseInt(operandCountStr);
                        if ((operandCount === undefined) || (operandCount < 0)) {
                            throw new Error("Invalid test function argument count value '" + operandCountStr + "'");
                        }
                        console.log("OPERAND COUNT: " + operandCountStr);

                        let val = [];
                        for (let j = 0; j < operandCount; j++) {
                            val.push(array.pop());
                        }
                        val = val.reverse();
                        console.log("OPERANDS:", val);

                        // Validate arguments count for non-variadic functions
                        if (builtinFunctionModule.testFunctions[funcName].operandCount !== undefined) {
                            if ((builtinFunctionModule.testFunctions[funcName].operandCount === undefined) || (builtinFunctionModule.testFunctions[funcName].operandCount < 0)) {
                                throw new Error("Invalid test function '" + funcName + "' argument count description");
                            }

                            if (builtinFunctionModule.testFunctions[funcName].operandCount.optional === undefined) {
                                if (operandCount < builtinFunctionModule.testFunctions[funcName].operandCount.required) {
                                    throw new RangeError("Invalid number of arguments for test function '" + funcName + "': " +
                                        builtinFunctionModule.testFunctions[funcName].operandCount.required + " expected, but " + operandCount + " given");
                                }
                            } else {
                                let minArgCount = builtinFunctionModule.testFunctions[funcName].operandCount.required;
                                let maxArgCount = minArgCount + builtinFunctionModule.testFunctions[funcName].operandCount.optional;
                                if ((operandCount < minArgCount) || (operandCount > maxArgCount)) {
                                    throw new RangeError("Invalid number of arguments for function '" + funcName + "': from " +
                                        minArgCount + " to " + maxArgCount + " expected, but " + operandCount + " given");
                                }
                            }
                        }

                        // Add code block
                        if (builtinFunctionModule.testFunctions[funcName].isGenerator) {
                            i ++;
                            if (i >= values.length) {
                                throw new Error("Code block is absent");
                            }
                            token = values[i];
                            if (token !== STR_BLOCK_BEGIN) {
                                throw new Error("Code block is absent");
                            }
                            i ++;

                            let codeBlockArray = [];
                            while ((i < values.length) && (values[i] !== STR_BLOCK_END)) {
                                codeBlockArray.push(values[i]);
                                i ++;
                            }
                            /* console.log("-------------------------");
                            console.log("CODE BLOCK:", codeBlockArray)
                            console.log("-------------------------"); */

                            let ev = new ExpressionEvaluator(this.executionContext);
                            val.push(function() {
                                ev.evalRPN(codeBlockArray);
                            });

                            val.push(this.executionContext);
                        }

                        // Call function
                        // NOTE: test function can return boolean or void
                        let result = builtinFunctionModule.testFunctions[funcName].action(...val);

                        // Validate and save execution result
                        if (!(result instanceof Array)) {
                            result = [result];
                        }
                        array.push(result);
                        break;
                    }
                    case STR_BLOCK_BEGIN: {
                        // FIXME: implement
                        break;
                    }
                    case STR_BLOCK_END: {
                        // FIXME: implement
                        break;
                    }
                    default: {
                        // Currently supported operand types: function arity number, replace/test function name
                        let operand = token.substring(STR_INTERNAL_MARKER.length);
                        if (commonModule.isNumeric(operand)) {
                            // 1) Function arity number
                            array.push(operand);

                            i ++;
                            if (i >= values.length) {
                                throw new Error("Function arity command is absent");
                            }
                            token = values[i];
                            if (token !== STR_ARITY_MARKER) {
                                throw new Error("Function arity command is absent");
                            }
                        } else if (builtinFunctionModule.isReplaceFunction(STR_EXPAND_MARKER + operand) || builtinFunctionModule.isTestFunction(operand)) {
                            // 2) Replace/test function name
                            array.push(operand);
                        } else {
                            throw new Error("Invalid operand '" + operand + "'");
                        }
                    }
                }
            } else if (isStringValue(token)) {
//                assert.isNotEmpty(this.executionContext);
                let tokenExpanded = this.executionContext.expandVariables(token);
                if (token !== tokenExpanded)
                    token = tokenExpanded;

                array.push(token);
			      } else {
                throw new Error("Unknown token '" + token + "'");
			  }
		}

        /*if (array.length !== 1) {
            console.log("RESULT:", array);
            throw new Error("Invalid RPN expression");
        }*/

        console.log("RPN expression: ", rpnExpr);
        console.log("RPN result: ", array);
        return array;
    }
}

// -------------------------------------------------------------------------------------------------

module.exports = {
    ExpressionEvaluator: ExpressionEvaluator
};
