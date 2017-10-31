'use strict';

// -------------------------------------------------------------------------------------------------

// FIXME: replace assert with exception
const assert = require('chai').assert;

const typeUtils = require("./type_utils");
var builtinVariablesModule = require("./builtin_variable_description");
var persistentStorage = require("./persistent_property_storage");
const VariableTypeEnum = builtinVariablesModule.VariableTypeEnum;

// -------------------------------------------------------------------------------------------------

// 1) OUTPUT_LIB = $${LIB_NAME}
var projectVariableExpansionRegex_1 = /\$\$\{([_a-zA-Z][_a-zA-Z0-9]*)+\}/g;
// 2) OUTPUT_LIB = $$LIB_NAME
var projectVariableExpansionRegex_2 = /\$\$([_a-zA-Z][_a-zA-Z0-9]*)+\b/g;
// 3) DESTDIR = $(PWD)
var environmentVariableExpansionRegex_1 = /\$\(([_a-zA-Z][_a-zA-Z0-9]*)+\)/g;
// 4) DESTDIR = $$(PWD)
var environmentVariableExpansionRegex_2 = /\$\$\(([_a-zA-Z][_a-zA-Z0-9]*)+\)/g;
// 5) target.path = $$[QT_INSTALL_PLUGINS]/designer
var qmakePropertyExpansionRegex_1 = /\$\$\[([_a-zA-Z][_a-zA-Z0-9]*)+\]/g;
var qmakePropertyExpansionRegex_2 = /\$\$\[([_a-zA-Z][_a-zA-Z0-9]*)+\/get\]/g;

// -------------------------------------------------------------------------------------------------

function deepClone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepClone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr))
                copy[attr] = deepClone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

// -------------------------------------------------------------------------------------------------

// FIXME: add qmake persistent storage
// FIXME: add environment variables
class ProExecutionContext {

    constructor() {
        this.builtinVariables = deepClone(builtinVariablesModule.builtinVariables());
        this.userVariables = {};

        this.originalBuiltinVariables = deepClone(this.builtinVariables);
    }

    reset() {
        this.builtinVariables = deepClone(this.originalBuiltinVariables);
        this.userVariables = {};
    }

    isBuiltinVariable(name) {
        assert.isString(name);
        assert.isNotEmpty(name);

        return (this.builtinVariables[name] !== undefined);
    }

    isUserDefinedVariable(name) {
        assert.isString(name);
        assert.isNotEmpty(name);

        return (this.userVariables[name] !== undefined);
    }

    getBuiltinVariables() {
        let result = {};
        for (let name in this.builtinVariables) {
            let variableDescription = this.builtinVariables[name];
            result[name] = variableDescription.value;
        }
        return result;
    }

    getUserDefinedVariables() {
        let result = {};
        for (let name in this.userVariables) {
            let variableDescription = this.userVariables[name];
            result[name] = variableDescription.value;
        }
        return result;
    }

    getVariableDescription(name) {
        assert.isString(name);
        assert.isNotEmpty(name);

        let variableDescription = undefined;
        if (this.isBuiltinVariable(name))
            variableDescription = this.builtinVariables[name];
        else if (this.isUserDefinedVariable(name))
            variableDescription = this.userVariables[name];
        else
            throw new Error("Undefined variable '" + name + "'");

        return variableDescription;
    }

    addUserVariableDescription(name, type = VariableTypeEnum.STRING_LIST) {
        assert.isString(name);
        assert.isNotEmpty(name);

        if (this.isBuiltinVariable(name) || this.isUserDefinedVariable(name))
            return true;

        this.userVariables[name] = {
            type: type, //VariableTypeEnum.STRING_LIST by default
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        }
    }

    getBuiltinVariableDefaultRawValue(name) {
        if (!typeUtils.isString(name) || typeUtils.isEmpty(name))
            throw new Error("Built-in variable name must be non-empty string");

        if (this.originalBuiltinVariables[name] === undefined)
            throw new Error("No built-in variable with name '" + name + "' found");

        return this.originalBuiltinVariables[name].value;
    }

    getVariableRawValue(name) {
        assert.isString(name);
        assert.isNotEmpty(name);

        let variableDescription = this.getVariableDescription(name);
        return variableDescription.value;
    }

    getVariableValue(name) {
        assert.isString(name);
        assert.isNotEmpty(name);

        let variableDescription = this.getVariableDescription(name);
        switch (variableDescription.type) {
            case VariableTypeEnum.STRING:
            case VariableTypeEnum.RESTRICTED_STRING:
                return variableDescription.value;
            case VariableTypeEnum.STRING_LIST:
            case VariableTypeEnum.RESTRICTED_STRING_LIST:
                return variableDescription.value.join(" ");
            default: {
                throw new Error("Unsupported variable type " + variableDescription.type);
            }
        }
    }

    // var = value
    assignVariable(name, value) {
        assert.isString(name);
        assert.isNotEmpty(name);
        assert.isTrue(typeUtils.isArray(value) || typeUtils.isString(value));

        // FIXME: currently type is always STRING_LIST, because parser always returns list
        // Determine variable type by specified value
        let variableType;
        if (typeUtils.isArray(value))
            variableType = VariableTypeEnum.STRING_LIST;
        else if (typeUtils.isString(value))
            variableType = VariableTypeEnum.STRING;
        else
            throw new Error("Unknown variable type '" + typeUtils.typeOf(value) + "''");
        /* console.log("Value:", value);
        console.log("IsArray:", typeUtils.isArray(value));
        console.log("IsString:", typeUtils.isString(value));
        console.log("Auto variable type deduced:", variableType); */

        if (!this.isBuiltinVariable(name) && !this.isUserDefinedVariable(name))
            this.addUserVariableDescription(name, variableType);

        this.validateAssignmentOperands(name, value);

        let variableDescription = this.getVariableDescription(name);
        variableDescription.value = value;

        return {name:name, op:"=", value:value};
    }

    // var += value
    appendAssignVariable(name, value) {
        assert.isString(name);
        assert.isNotEmpty(name);
        assert.isArray(value);

        if (!this.isBuiltinVariable(name) && !this.isUserDefinedVariable(name))
            this.addUserVariableDescription(name);

        this.validateAssignmentOperands(name, value);

        let variableDescription = this.getVariableDescription(name);
        variableDescription.value = variableDescription.value.concat(value);

        return {name:name, op:"+=", value:value};
    }

    // var *= value
    appendUniqueAssignVariable(name, value) {
        assert.isString(name);
        assert.isNotEmpty(name);
        assert.isArray(value);

        if (!this.isBuiltinVariable(name) && !this.isUserDefinedVariable(name))
            this.addUserVariableDescription(name);

        this.validateAssignmentOperands(name, value);

        let variableDescription = this.getVariableDescription(name);
        for (let i = 0; i < value.length; i++) {
            if (variableDescription.value.indexOf(value[i]) < 0)
                variableDescription.value.push(value[i]);
        }
        return {name:name, op:"*=", value:value};
    }

    // var -= value
    removeAssignVariable(name, value) {
        assert.isString(name);
        assert.isNotEmpty(name);
        assert.isArray(value);

        if (!this.isBuiltinVariable(name) && !this.isUserDefinedVariable(name))
            throw new Error("Variable '" + name + "' must be defined before usage of the '-=' operator");

        this.validateAssignmentOperands(name, value);

        // Search for value in the array and remove all occurences
        let variableDescription = this.getVariableDescription(name);
        for (let i = 0; i < value.length; i++) {
            variableDescription.value = variableDescription.value.filter(function(item) { return (item !== value[i]); });
        }
        return {name:name, op:"-=", value:value};
    }

    validateAssignmentOperands(name, value) {
        assert.isString(name);
        assert.isNotEmpty(name);
        assert.isTrue(typeUtils.isArray(value) || typeUtils.isString(value));

        let variableDescription = this.getVariableDescription(name);
        switch (variableDescription.type) {
            case VariableTypeEnum.RESTRICTED_STRING: {
                if (value.length !== 1)
                    throw new Error(name + " assignment value must be a single string token, not a list");

                if (!variableDescription.canBeEmpty && !value[0].length)
                    throw new Error("variable " + name + " can not have empty value");

                if (variableDescription.valueRange.indexOf(value[0]) < 0)
                    throw new Error(name + " assignment value must be one of the strings: " + variableDescription.valueRange);

                break;
            }
            case VariableTypeEnum.RESTRICTED_STRING_LIST: {
                if (!variableDescription.canBeEmpty && !value.length)
                    throw new Error("variable " + name + " can not have empty value");

                for (var i = 0; i < value.length; i++) {
                    if (variableDescription.valueRange.indexOf(value[i]) < 0)
                        throw new Error(name + " assignment rvalue must be one of the strings: " + variableDescription.valueRange);
                }

                break;
            }
            case VariableTypeEnum.STRING: {
                // NOTE: currently all rvalues in PEG grammar stored as list for convenience
                if (!typeUtils.isString(value) && !typeUtils.isArray(value))
                    throw new Error(name + " assignment value type mismatch: '" + typeUtils.typeOf(value) + "' but string expected");

                break;
            }
            case VariableTypeEnum.STRING_LIST: {
                break;
            }
            default: {
                throw new Error("Unsupported variable type " + variableDescription.type);
            }
        }
    }

    expandVariables(strSource) {
        assert.isString(strSource);
        assert.isNotEmpty(strSource);

        let replaceProVarFunc = function(getVariableValue, match, variableName, offset, string) {
            assert.isString(variableName);
            assert.isNotEmpty(variableName);
            assert.isFunction(getVariableValue);
            return this.getVariableValue(variableName);
        }

        let replaceEnvVarFunc = function(match, variableName, offset, string) {
            assert.isString(variableName);
            assert.isNotEmpty(variableName);

            return (process.env[variableName] !== undefined) ? process.env[variableName] : "";
        }

        let replacePropertyFunc = function(match, variableName, offset, string) {
            assert.isString(variableName);
            assert.isNotEmpty(variableName);

            return persistentStorage.query(variableName);
        }

        let strExpanded = strSource;
        let replaceProVarFuncWrapper = replaceProVarFunc.bind(this, this.getVariableValue);

        strExpanded = strExpanded.replace(projectVariableExpansionRegex_1, replaceProVarFuncWrapper);
        strExpanded = strExpanded.replace(projectVariableExpansionRegex_2, replaceProVarFuncWrapper);
        strExpanded = strExpanded.replace(environmentVariableExpansionRegex_2, replaceEnvVarFunc);
        strExpanded = strExpanded.replace(environmentVariableExpansionRegex_1, replaceEnvVarFunc);
        strExpanded = strExpanded.replace(qmakePropertyExpansionRegex_1, replacePropertyFunc);
        strExpanded = strExpanded.replace(qmakePropertyExpansionRegex_2, replacePropertyFunc);

        return strExpanded;
    }
}

// Singleton object
var context = new ProExecutionContext();

// -------------------------------------------------------------------------------------------------

module.exports = {
    ProExecutionContext: ProExecutionContext,
    context: context
};

