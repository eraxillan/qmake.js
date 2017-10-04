'use strict';

// -------------------------------------------------------------------------------------------------

const varDescrInit = require("./builtin_variable_description");
const VariableTypeEnum = varDescrInit.VariableTypeEnum;

// -------------------------------------------------------------------------------------------------

function isBuiltinVariable(builtinVariables, name) {
    return (builtinVariables[name] !== undefined);
}

function assignVariable(isBuiltinVariable, dict, name, value, error) {
    if (!(value instanceof Array))
        error("qmake '=' operator rvalue must be a JS Array, but actual type is '" + typeof(value) + "' with value:\n" + value);

    if (isBuiltinVariable)
        dict[name].value = value;
    else
        dict[name] = value;

    return {name:name, op:"=", value:value};
}

function appendAssignVariable(isBuiltinVariable, dict, name, value, error) {
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

function appendUniqueAssignVariable(isBuiltinVariable, dict, name, value, error) {
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

function removeAssignVariable(isBuiltinVariable, dict, name, value, error) {
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

function validateAssignmentOperands(variableDescription, lvalue, rvalue, error) {
    switch (variableDescription[lvalue].type) {
        case VariableTypeEnum.RESTRICTED_STRING: {
            if (rvalue.length !== 1)
                error(lvalue + " assignment rvalue must be a single string token, not a list");

            if (!variableDescription[lvalue].canBeEmpty && !rvalue[0].length)
                error("variable " + lvalue + " can not have empty value");

            if (variableDescription[lvalue].valueRange.indexOf(rvalue[0]) < 0)
                error(lvalue + " assignment rvalue must be one of the strings: " + variableDescription[lvalue].valueRange);

            break;
        }
        case VariableTypeEnum.RESTRICTED_STRING_LIST: {
            if (!variableDescription[lvalue].canBeEmpty && !rvalue.length)
                error("variable " + lvalue + " can not have empty value");

            for (var i = 0; i < rvalue.length; i++) {
                if (variableDescription[lvalue].valueRange.indexOf(rvalue[i]) < 0)
                    error(lvalue + " assignment rvalue must be one of the strings: " + variableDescription[lvalue].valueRange);
            }

            break;
        }
        case VariableTypeEnum.STRING: {
            if (rvalue.length !== 1)
                error(lvalue + " assignment rvalue must be a single string token, not a list");

            break;
        }
        case VariableTypeEnum.STRING_LIST: {
            break;
        }
        default: {
            error("Unsupported variable type " + variableDescription[lvalue].type);
        }
    }
}

function expandVariableValue(variableDescription, error) {
    switch (variableDescription.type) {
        case VariableTypeEnum.STRING:
        case VariableTypeEnum.RESTRICTED_STRING:
            return variableDescription.value;
        case VariableTypeEnum.STRING_LIST:
        case VariableTypeEnum.RESTRICTED_STRING_LIST:
            return variableDescription.value.join(" ");
        default: {
            error("Unsupported variable type " + variableDescription.type);
        }
    }
}

// -------------------------------------------------------------------------------------------------

module.exports = {
    isBuiltinVariable: isBuiltinVariable,
    assignVariable: assignVariable,
    appendAssignVariable: appendAssignVariable,
    appendUniqueAssignVariable: appendUniqueAssignVariable,
    removeAssignVariable: removeAssignVariable,
    validateAssignmentOperands: validateAssignmentOperands,
    expandVariableValue: expandVariableValue
};
