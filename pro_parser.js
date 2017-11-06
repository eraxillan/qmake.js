'use strict';

const typeUtils = require("./type_utils");

var commonModule = require("./common");
var QStack = commonModule.QStack;
var ProFunction = require("./pro_function").ProFunction;

var builtinFunctionModule = require("./builtin_function_description");
var builtinVariablesModule = require("./builtin_variable_description");

const VariableTypeEnum = builtinVariablesModule.VariableTypeEnum;

// -------------------------------------------------------------------------------------------------

const STR_HASH = "#";
const STR_BACKSLASH = "\\";

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
            "\\\\": () => {
                console.log("EscapeSequence::getEscapeSequence: '\\' escape sequence");
                return "\\";
            },

            "\\\"": () => {
                console.log("EscapeSequence::getEscapeSequence: '\'' escape sequence");
                return "\"";
            },
            "\\\'": () => {
                console.log("EscapeSequence::getEscapeSequence: '\'' escape sequence");
                return "\'";
            },
            "\\x": (str, indexFrom, length) => {
                console.log("EscapeSequence::getEscapeSequence: '\\xABCD' or '\\xAB' escape sequence");
                let result = "";
                let charCodeStr = commonModule.joinTokens(str, indexFrom + 2, length);
                let charCode = parseInt(charCodeStr, 16);
                if (!isNaN(charCode))
                    result = String.fromCharCode(charCode);
                else {
                    console.log("[ERROR] EscapeSequence::getEscapeSequence: invalid hexadecimal character code '" + charCodeStr + "'");
                    throw new Error();
                }
                return result;
            },
            "\\?": () => {
                console.log("EscapeSequence::getEscapeSequence: '\?' escape sequence");
                return "\?";
            },
            "\\a": () => {
                console.log("EscapeSequence::getEscapeSequence: '\\a' escape sequence");
                return "\a";
            },
            "\\b": () => {
                console.log("EscapeSequence::getEscapeSequence: '\\b' escape sequence");
                return "\b";
            },
            "\\f": () => {
                console.log("EscapeSequence::getEscapeSequence: '\\f' escape sequence");
                return "\f";
            },
            "\\n": () => {
                console.log("EscapeSequence::getEscapeSequence: '\\n' escape sequence");
                return "\n";
            },
            "\\r": () => {
                console.log("EscapeSequence::getEscapeSequence: '\\r' escape sequence");
                return "\r";
            },
            "\\t": () => {
                console.log("EscapeSequence::getEscapeSequence: '\\t' escape sequence");
                return "\t";
            },
            "\\v": () => {
                console.log("EscapeSequence::getEscapeSequence: '\\v' escape sequence");
                return "\v";
            }
        };

        // Add octal character codes: from 0 to 777
        for (let i = 0; i < 777; i++) {
            this.convertMap["\\" + i.toString().padStart(3, "0")] = () => {
                let charCode_8_3 = parseInt(i.toString(), 8);
                return String.fromCharCode(charCode_8_3);
            }
        }

    }

    isEscapeSequence(str, indexFrom) {
        // NOTE: any escape sequence must start with exactly one backslash
        if (str[indexFrom] !== STR_BACKSLASH)
            return { result: false, length: 0 };

        // Escape sequence could contain two, three or four characters
        let twoTokens = commonModule.joinTokens(str, indexFrom, 2);     // \r
        let fourTokens = commonModule.joinTokens(str, indexFrom, 4);    // \123, \xAB

        if (twoTokens === "\\x") {
            // \x can be followed by one, two, three or four hex digits
            let digitCount = 0;
            let index = indexFrom + 1;
            do {
                index++;
                if (!commonModule.isHexNumeric(str[index]))
                    break;

                digitCount++;
            } while (true);

            if (digitCount === 0) {
                console.log("[ERROR] EscapeSequence::isEscapeSequence: invalid sequence \\x: must be followed with hexadecimal character code");
                throw new Error();
            }
            return { result: true, length: digitCount + 2 };
        } else if (fourTokens in this.convertMap)
            return { result: true, length: 4 };
        else if (twoTokens in this.convertMap)
            return { result: true, length: 2 };

        return { result: false, length: 0 };
    }

    getEscapeSequence(str, indexFrom, length) {
        let key = str.substr(indexFrom, length);
        let key_1 = key.substr(0, 4);   // \777
        let key_2 = key.substr(0, 2);   // \r
        if (key_1 in this.convertMap)
            return this.convertMap[key_1](str, indexFrom, length);
        else if (key_2 in this.convertMap)
            return this.convertMap[key_2](str, indexFrom, length);
        else {
            console.log("[ERROR] EscapeSequence::getEscapeSequence: invalid sequence '" + key + "'");
            throw new Error();
        }
    }
}

// --------------------------------------------------------------------------------------------------------------------------------------------------

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
                console.log("ProParser::getEnquotedString: hash token (start comment)");

                break;
            } else if (token === STR_BACKSLASH) {
                console.log("ProParser::getEnquotedString: backslash (escape sequence)");

                let es = new EscapeSequence();
                let result = es.isEscapeSequence(str, i);
                if (result.result) {
                    console.log("ProParser::getEnquotedString: escape sequence length = " + result.length);
                    let esStrExpanded = es.getEscapeSequence(str, i, result.length);
                    enquotedStr += esStrExpanded;
                    i += result.length - 1;
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
        console.log("ProParser::tokenizeString: input: '" + str + "'");

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

        let hasTopFunction = () => {
            return !parenthesisStack.isEmpty() && (parenthesisStack.top.functionName !== undefined);
        }

        let getTopFunctionName = () => {
            return parenthesisStack.top.functionName;
        }

        let getTopFunctionArgumentType = () => {
            return ProFunction.getFunctionArgumentType(parenthesisStack.top.functionName, parenthesisStack.top.argumentIndex);
        }

        for (let i = 0; i < str.length; i++) {
            let token = commonModule.joinTokens(str, i, 1);

            // Single-line comment
            if (token === STR_HASH) {
                console.log("ProParser::tokenizeString: hash token (start comment)");

                break;
            } else if (token === STR_BACKSLASH) {
                console.log("ProParser::tokenizeString: backslash (escape sequence)");

                let es = new EscapeSequence();
                let result = es.isEscapeSequence(str, i);
                if (result.result) {
                    console.log("ProParser::tokenizeString: escape sequence length = " + result.length);
                    let esStrExpanded = es.getEscapeSequence(str, i, result.length);
                    currentStr += esStrExpanded;
                    i += result.length - 1;
                } else
                    currentStr += token;
            } else if ((token === STR_DOUBLE_QUOTE) || (token === STR_SINGLE_QUOTE)) {
                console.log("ProParser::tokenizeString: Special token: '" + token + "'");

                let enquotedStrObj = ProParser.getEnquotedString(i, str, token);
                console.log("  ProParser::tokenizeString: enquoted string: '" + enquotedStrObj.string + "', length: " + (enquotedStrObj.length - i - 2));
                result.push(enquotedStrObj.string);
                i = enquotedStrObj.length - 1;  // NOTE: 'i' will be incremented in 'for'
            } else if (token === STR_OPENING_PARENTHESIS) {
                console.log("ProParser::tokenizeString: opening parenthesis token");

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
                console.log("ProParser::tokenizeString: closing parenthesis token");

                if (hasTopFunction()) {
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

                if (hasTopFunction() && (getTopFunctionArgumentType() !== VariableTypeEnum.RAW_STRING)) {
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
                if (hasTopFunction() && (getTopFunctionArgumentType() === VariableTypeEnum.STRING_LIST)) {
                    console.log("ProParser::tokenizeString: processing function '" + getTopFunctionName() + "' argument list...");

                    let shouldAddComma = (currentStr.length > 0);

                    pushOperand();

                    // Check whether this argument is the last one (next non-whitespace character must be ')')
                    if (shouldAddComma) {
                        do {
                            i ++;
                            if (i >= str.length)
                                break;

                            token = str[i];
                            if (/\s/.test(token))
                                console.log("ProParser::tokenizeString: Whitespace token");
                            else
                                break;
                        } while (true);

                        if (token === STR_HASH) {
                            console.log("ProParser::tokenizeString: Hash token");
                            break;
                        }

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
                    // NOTE: whitespaces after comma, function arguments separator, must be skipped
                    if (result.top !== STR_COMMA)
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
    STR_HASH: STR_HASH,
    STR_BACKSLASH: STR_BACKSLASH,
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
