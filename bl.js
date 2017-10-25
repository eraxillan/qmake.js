'use strict';

// -------------------------------------------------------------------------------------------------

const assert = require('chai').assert;
const typeUtils = require("./type_utils");
var builtinVariablesModule = require("./builtin_variable_description");
//var builtinFunctionsModule = require("./builtin_function_description");
//var persistentStorage = require("./persistent_property_storage");
const VariableTypeEnum = builtinVariablesModule.VariableTypeEnum;

var builtinVariables = builtinVariablesModule.builtinVariables();
var userVariables = {};

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

class ProExecutionContext {

    constructor(builtinVariables, userVariables) {
        this.builtinVariables = builtinVariables;
        this.userVariables = userVariables;
        
        this.originalBuiltinVariables = deepClone(builtinVariables);
        this.originalUserVariables = deepClone(userVariables);
    }
    
    reset() {
        this.builtinVariables = deepClone(this.originalBuiltinVariables);
        this.userVariables = deepClone(this.originalUserVariables);
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
        let variableType = VariableTypeEnum.STRING_LIST;
        if (typeUtils.isString(value))
            variableType = VariableTypeEnum.STRING;
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
                if (!typeUtils.isString(value))
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
}

// Singleton object
var context = new ProExecutionContext(builtinVariables, userVariables);

// -------------------------------------------------------------------------------------------------

module.exports = {
    ProExecutionContext: ProExecutionContext,
    context: context
};

