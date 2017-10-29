'use strict';

// FIXME: replace with exception generation
const assert = require('chai').assert;

const typeUtils = require("./type_utils");
var builtinFunctionsModule = require("./builtin_function_description");

// -------------------------------------------------------------------------------------------------

class ProFunction {

    static getFunctionArgumentType(functionName, argumentIndex) {
        if (builtinFunctionsModule.isReplaceFunction(functionName)) {
            functionName = functionName.substring(builtinFunctionsModule.STR_FUNCTION_EXPAND_MARKER.length);
            assert.exists(builtinFunctionsModule.replaceFunctions[functionName],
                "Function '" + functionName + "' have no description");
            assert.exists(builtinFunctionsModule.replaceFunctions[functionName].operandTypes,
                "Function '" + functionName + "' description have no operandTypes field");

            return builtinFunctionsModule.replaceFunctions[functionName].operandTypes[argumentIndex];
        } else if (builtinFunctionsModule.isTestFunction(functionName)) {
            assert.exists(builtinFunctionsModule.testFunctions[functionName],
                "Function '" + functionName + "' have no description");
            assert.exists(builtinFunctionsModule.testFunctions[functionName].operandTypes,
                "Function '" + functionName + "' description have no operandTypes field");

            return builtinFunctionsModule.testFunctions[functionName].operandTypes[argumentIndex];
        } else {
            throw new Error("Replace/test function not found: " + functionName);
        }
    }
}

// -------------------------------------------------------------------------------------------------

module.exports = {
    ProFunction: ProFunction
};
