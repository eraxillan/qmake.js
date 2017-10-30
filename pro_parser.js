'use strict';

const typeUtils = require("./type_utils");

var QStack = require("./common").QStack;
var ProFunction = require("./pro_function").ProFunction;

var builtinFunctionModule = require("./builtin_function_description");
var builtinVariablesModule = require("./builtin_variable_description");

const VariableTypeEnum = builtinVariablesModule.VariableTypeEnum;

// -------------------------------------------------------------------------------------------------

const STR_HASH = "#";

const STR_OPENING_PARENTHESIS = "(";
const STR_CLOSING_PARENTHESIS = ")";
const STR_OPENING_CURLY_BRACE = "{";
const STR_CLOSING_CURLY_BRACE = "}";

const STR_DOUBLE_QUOTE = "\"";
const STR_SINGLE_QUOTE = "'";

const STR_COMMA = ",";

const STR_EXCLAMATION_MARK = "!";
const STR_COLON = ":";
const STR_VERTICAL_BAR = "|";

const STR_EXPAND_MARKER = "$$";

// Assignment operators
const STR_EQUALS = "=";             // TEMPLATE = app
const STR_PLUS_EQUALS = "+=";       // DEFINES += USE_MY_STUFF
const STR_ASTERISK_EQUALS = "*=";   // DEFINES *= USE_MY_STUFF
const STR_MINUS_EQUALS = "-=";      // DEFINES -= USE_MY_STUFF
const STR_TILDE_EQUALS = "~=";      // DEFINES ~= s/QT_[DT].+/QT

// -------------------------------------------------------------------------------------------------

class EscapeSequence {
    constructor() {
        this.convertMap = {
            "#\"": "\"",
            "#\'": "\'",
            "#a": "\a",
            "#b": "\b",
            "#f": "\f",
            "#n": "\n",
            "#r": "\r",
            "#t": "\t",
            "#v": "\v"
        };
    }

    isEscapeSequence(str) {
        return (str in this.convertMap);
    }

    getEscapeSequence(str) {
        return this.convertMap[str];
    }
}



// FIXME: implement boolean expression support
class ProParser {
    static getEnquotedString(startIndex, str, quoteChar) {
        if (str[startIndex] !== quoteChar) {
            throw new Error("String must begin with quote character: " + str[startIndex]);
        }

        let count = 1;
        let i = startIndex;
        let enquotedStr = "";
        do {
            i++;
            if (i >= str.length)
                break;

            let token = str[i];
            console.log("ProParser::getEnquotedString: token: '" + token + "'");

            if (token === STR_HASH) {
                console.log("ProParser::tokenizeString: Internal token: '" + token + "'");
                
                let nextToken = str[i + 1];
                let twoTokens = token + nextToken;
                let es = new EscapeSequence();
                if (es.isEscapeSequence(twoTokens)) {
                    let twoTokensExpanded = es.getEscapeSequence(twoTokens);
                    console.log("ProParser::getEnquotedString: Escape sequence:", twoTokensExpanded);
                    enquotedStr += twoTokensExpanded;
                    i++;
                } else
                    enquotedStr += token;
            } else if (token === quoteChar) {
                console.log("ProParser::getEnquotedString: closing quote char found");

                count ++;
                i ++;
                break;
            } else {
                enquotedStr += token;
            }
        } while (true);

        if (count !== 2) {
            throw new Error("Unpaired double quote character found; count = " + count);
        }

        return {string: enquotedStr, length: i};
    }

    static tokenizeString(str) {
        let result = new QStack();
        let currentStr = "";
        let parenthesisStack = new QStack();

        let pushOperand = () => {
            if (!typeUtils.isEmpty(currentStr)) {
                console.log("  ProParser::tokenizeString: token: '" + currentStr + "'");

                result.push(currentStr);
            }
            currentStr = "";
        }

        for (let i = 0; i < str.length; i++) {
            let token = str[i];

            // Escape sequence: #' or #" means \' or \" respectively
            if (token === STR_HASH) {
                console.log("ProParser::tokenizeString: Internal token: '" + token + "'");

                let nextToken = str[i + 1];
                let twoTokens = token + nextToken;
                let es = new EscapeSequence();
                if (es.isEscapeSequence(twoTokens)) {
                    let twoTokensExpanded = es.getEscapeSequence(twoTokens);
                    console.log("ProParser::getEnquotedString: Escape sequence:", twoTokensExpanded);
                    currentStr += twoTokensExpanded;
                    i++;
                } else
                    currentStr += token;
            } else if ((token === STR_DOUBLE_QUOTE) || (token === STR_SINGLE_QUOTE)) {
                console.log("ProParser::tokenizeString: Special token: '" + token + "'");

                let enquotedStrObj = ProParser.getEnquotedString(i, str, token);
                console.log("  ProParser::tokenizeString: enquoted string: '" + enquotedStrObj.string + "', length: " + enquotedStrObj.length);
                result.push(enquotedStrObj.string);
                i = enquotedStrObj.length;
            } else if (token === STR_OPENING_PARENTHESIS) {
                console.log("ProParser::tokenizeString: Special token: '" + token + "'");

                // NOTE: "(" can be either syntax item (function call) or just part of arbitrary string value;
                //       however, it must have corresponding ")" or syntax error will be thrown
                let functionName = currentStr;
                if (builtinFunctionModule.isReplaceFunction(functionName) || builtinFunctionModule.isTestFunction(functionName)) {
                    pushOperand();

                    console.log("  ProParser::tokenizeString: function name: '" + functionName + "'");
                    console.log("  ProParser::tokenizeString: opening parenthesis");

                    result.push(token);
                } else {
                    functionName = undefined;
                    currentStr += token;
                }

                parenthesisStack.push({functionName: functionName, argumentIndex: 0});
            } else if (token === STR_CLOSING_PARENTHESIS) {
                console.log("ProParser::tokenizeString: Special token: '" + token + "'");

                if (!parenthesisStack.isEmpty() && (parenthesisStack.top.functionName !== undefined)) {
                    pushOperand();

                    console.log("  ProParser::tokenizeString: closing parenthesis");
                    result.push(token);
                } else {
                    currentStr += token;
                }

                parenthesisStack.pop();
            } else if (token === STR_OPENING_CURLY_BRACE) {
                console.log("ProParser::tokenizeString: Special token: '" + token + "'");

                // NOTE: "{" can be either code block begin or part of variable expansion statement e.g. "$${MY_VAR}"
                let prefix = str.substring(i - 2, i);
                if (prefix === STR_EXPAND_MARKER) {
                    currentStr += STR_OPENING_CURLY_BRACE;

                    do {
                        i ++;
                        if (i >= str.length)
                            break;

                        token = str[i];
                        console.log("ProParser::tokenizeString: token: '" + token + "'");

                        currentStr += token;
                        if (token === STR_CLOSING_CURLY_BRACE)
                            break;
                    } while (true);

                    if ((currentStr[currentStr.length - 1]) !== STR_CLOSING_CURLY_BRACE) {
                        throw new Error("Absent closing curly brace in $${<VARIABLE_NAME>} statement: '" + currentStr[currentStr.length - 1] + "' found");
                    }

                    // TODO: syntax validation
                    /* if (currentStr.length === STR_EXPAND_MARKER.length + STR_OPENING_CURLY_BRACE.length + STR_CLOSING_CURLY_BRACE.length) {
                        throw new Error("Empty VARIABLE_NAME in $${<VARIABLE_NAME>} statement");
                    }
                    if (!/[a-zA-Z]/.test(currentStr[3])) {
                        throw new Error("Invalid VARIABLE_NAME in $${<VARIABLE_NAME>} statement");
                    } */
                } else {
                    pushOperand();

                    console.log("  ProParser::tokenizeString: closing parenthesis");
                    result.push(token);
                }
            } else if (token === STR_CLOSING_CURLY_BRACE) {
                console.log("ProParser::tokenizeString: Special token: '" + token + "'");

                result.push(token);
            } else if (token === STR_COMMA) {
                console.log("ProParser::tokenizeString: Special token: '" + token + "'");

                if ((!parenthesisStack.isEmpty()) && (parenthesisStack.top.functionName !== undefined) &&
                    (ProFunction.getFunctionArgumentType(parenthesisStack.top.functionName, parenthesisStack.top.argumentIndex) !== VariableTypeEnum.RAW_STRING)) {
                    pushOperand();

                    console.log("  ProParser::tokenizeString: comma as function argument separator");
                    result.push(token);

                    // NOTE: only in this case argument index should be increased
                    parenthesisStack.top.argumentIndex ++;
                } else {
                    currentStr += token;
                }
            } else if (/\s/.test(token)) {
                console.log("ProParser::tokenizeString: Whitespace token");

                // Add comma to whitespace-separated list for corresponding functions
                if ((!parenthesisStack.isEmpty()) && (parenthesisStack.top.functionName !== undefined) &&
                    (ProFunction.getFunctionArgumentType(parenthesisStack.top.functionName, parenthesisStack.top.argumentIndex) === VariableTypeEnum.STRING_LIST)) {
                    let shouldAddComma = (currentStr.length > 0);

                    pushOperand();

                    // Check whether this argument is the last one (next non-whitespace character must be ')')
                    if (shouldAddComma) {
                        do {
                            i ++;
                            if (i >= str.length)
                                break;

                            token = str[i];
                            if (!/\s/.test(token))
                                break;
                            console.log("ProParser::tokenizeString: Whitespace token");
                        } while (true);

                        shouldAddComma = (token !== STR_CLOSING_PARENTHESIS);
                        if (shouldAddComma) {
                            console.log("  ProParser::tokenizeString: comma as function argument separator (added instead of whitespace)");

                            result.push(STR_COMMA);
                        }
                        else
                            i --;
                    }
                // Do not split strings by whitespace inside functions with raw string arguments
                } else if ((!parenthesisStack.isEmpty()) && (parenthesisStack.top.functionName !== undefined) &&
                    (ProFunction.getFunctionArgumentType(parenthesisStack.top.functionName, parenthesisStack.top.argumentIndex) === VariableTypeEnum.RAW_STRING)) {
                    currentStr += token;
                } else {
                    pushOperand();
                }
            } else if (token === STR_COLON) {
                console.log("ProParser::tokenizeString: Special token: '" + token + "'");

                if ((!parenthesisStack.isEmpty()) && (parenthesisStack.top.functionName !== undefined) &&
                    (ProFunction.getFunctionArgumentType(parenthesisStack.top.functionName, parenthesisStack.top.argumentIndex) === VariableTypeEnum.RAW_STRING)) {
                    currentStr += token;
                } else {
                    pushOperand();

                    console.log("  ProParser::tokenizeString: colon (as single-line code block start marker)");
                    result.push(STR_COLON);
                }
            } else {
                console.log("ProParser::tokenizeString: Other token: '" + token + "'");

                currentStr += token;
            }
        }

        // NOTE: corner case "string without quotes at all"
        pushOperand();

        if (!parenthesisStack.isEmpty()) {
            throw new Error("ProParser::tokenizeString: Unbalanced parenthesis in expression");
        }

        return result;
    }
}

// -------------------------------------------------------------------------------------------------

module.exports = {
    STR_OPENING_PARENTHESIS: STR_OPENING_PARENTHESIS,
    STR_CLOSING_PARENTHESIS: STR_CLOSING_PARENTHESIS,
    STR_OPENING_CURLY_BRACE: STR_OPENING_CURLY_BRACE,
    STR_CLOSING_CURLY_BRACE: STR_CLOSING_CURLY_BRACE,
    STR_DOUBLE_QUOTE: STR_DOUBLE_QUOTE,
    STR_SINGLE_QUOTE: STR_SINGLE_QUOTE,
    STR_COMMA: STR_COMMA,
    STR_EXCLAMATION_MARK: STR_EXCLAMATION_MARK,
    STR_COLON: STR_COLON,
    STR_VERTICAL_BAR: STR_VERTICAL_BAR,
    STR_EXPAND_MARKER: STR_EXPAND_MARKER,
    STR_EQUALS: STR_EQUALS,
    STR_PLUS_EQUALS: STR_PLUS_EQUALS,
    STR_ASTERISK_EQUALS: STR_ASTERISK_EQUALS,
    STR_MINUS_EQUALS: STR_MINUS_EQUALS,
    STR_TILDE_EQUALS: STR_TILDE_EQUALS,

    ProParser: ProParser
};
