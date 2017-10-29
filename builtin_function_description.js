'use strict';

const STR_FUNCTION_EXPAND_MARKER = "$$";

// FIXME: replace assert with exceptions
const assert = require('chai').assert;

const typeUtils = require("./type_utils");
const builtinVariables = require("./builtin_variable_description");
const VariableTypeEnum = builtinVariables.VariableTypeEnum;

function initBuiltinReplaceFunctions() {
    var result = {
        // absolute_path(path[, base])
        "absolute_path": {
            operandCount: {required: 1, optional: 1},
            action: function() {
                return "Not implemented";
            }
        },
        // basename(variablename)
        "basename": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // cat(filename[, mode])
        "cat": {
            operandCount: {required: 1, optional: 1},
            action: function() {
                return "Not implemented";
            }
        },
        // clean_path(path)
        "clean_path": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // dirname(file)
        "dirname": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // enumerate_vars
        "enumerate_vars": {
            operandCount: {required: 0, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // escape_expand(arg1 [, arg2 ..., argn])
        "escape_expand": {
            operandCount: undefined,
            action: function() {
                return "Not implemented";
            }
        },
        // find(variablename, substr)
        "find": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // files(pattern[, recursive=false])
        "files": {
            operandCount: {required: 1, optional: 1},
            action: function() {
                return "Not implemented";
            }
        },
        // first(variablename)
        "first": {
            operandCount: {required: 1, optional: 0},
            operandTypes: {0: VariableTypeEnum.STRING_LIST},
            action: function() {
                const args = Array.from(arguments);

                // FIXME: think about argument data type
                /*if ((args.length !== 1) || (args[0].length === 0))
                    throw new RangeError("'first' replace function requires exactly one non-empty list");

                return args[0][0];*/

                return args[0];
            }
        },
        // format_number(number[, options...])
        "format_number": {
            operandCount: {required: 1, optional: undefined},
            action: function() {
                return "Not implemented";
            }
        },
        // fromfile(filename, variablename)
        "fromfile": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // getenv(variablename)
        "getenv": {
            operandCount: {required: 0, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // join(variablename, glue, before, after)
        "join": {
            operandCount: {required: 4, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // last(variablename)
        "last": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        "list": {
            operandCount: undefined,
            operandTypes: {0: VariableTypeEnum.STRING_LIST},
            action: function() {
                return new Array(...arguments);
            }
        },
        // lower(arg1 [, arg2 ..., argn])
        "lower": {
            operandCount: {required: 1, optional: undefined},
            action: function() {
                return "Not implemented";
            }
        },
        // member(variablename [, start [, end]])
        "member": {
            operandCount: {required: 1, optional: 2},
            action: function() {
                return "Not implemented";
            }
        },
        // num_add(arg1 [, arg2 ..., argn])
        "num_add": {
            operandCount: {required: 1, optional: undefined},
            action: function() {
                return "Not implemented";
            }
        },
        // prompt(question [, decorate])
        "prompt": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // quote(string)
        "quote": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // re_escape(string)
        "re_escape": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // relative_path(filePath[, base])
        "relative_path": {
            operandCount: {required: 1, optional: 1},
            action: function() {
                return "Not implemented";
            }
        },
        // replace(string, old_string, new_string)
        "replace": {
            operandCount: {required: 3, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // sprintf(string, arguments...)
        "sprintf": {
            operandCount: {required: 1, optional: undefined},
            action: function() {
                return "Not implemented";
            }
        },
        // resolve_depends(variablename, prefix)
        "resolve_depends": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // reverse(variablename)
        "reverse": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // section(variablename, separator, begin, end)
        "section": {
            operandCount: {required: 4, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // shadowed(path)
        "shadowed": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // shell_path(path)
        "shell_path": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // shell_quote(arg)
        "shell_quote": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // size(variablename)
        "size": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // sort_depends(variablename, prefix)
        "sort_depends": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // sorted(variablename)
        "sorted": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // split(variablename, separator)
        "split": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // str_member(arg [, start [, end]])
        "str_member": {
            operandCount: {required: 1, optional: 2},
            action: function() {
                return "Not implemented";
            }
        },
        // str_size(arg)
        "str_size": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // system(command[, mode[, stsvar]])
        "last": {
            operandCount: {required: 1, optional: 2},
            action: function() {
                return "Not implemented";
            }
        },
        // system_path(path)
        "system_path": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // system_quote(arg)
        "system_quote": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // take_first(variablename)
        "take_first": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // take_last(variablename)
        "take_last": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // unique(variablename)
        "unique": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // upper(arg1 [, arg2 ..., argn])
        "upper": {
            operandCount: {required: 1, optional: undefined},
            action: function() {
                return "Not implemented";
            }
        },
        // val_escape(variablename)
        "val_escape": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        }
    }
    return result;
}

// --------------------------------------------------------------------------------------------------------------------------------------------------

function initBuiltinTestFunctions() {
    var result = {
        // cache(variablename, [set|add|sub] [transient] [super|stash], [source variablename])
        "cache": {
            operandCount: {required: 1, optional: 2},
            action: function() {
                return "Not implemented";
            }
        },
        // CONFIG(config [, condition])
        "CONFIG": {
            operandCount: {required: 1, optional: 1},
            action: function() {
                return true;
            }
        },
        // contains(variablename, value)
        "contains": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return true;
            }
        },
        // count(variablename, number)
        "count": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return true;
            }
        },
        // debug(level, message)
        "debug": {
            operandCount: {required: 2, optional: 0},
            // FIXME: check
            //operandTypes: {0: VariableTypeEnum.NUMBER, 1: VariableTypeEnum.RAW_STRING},
            action: function() {
                return true;
            }
        },
        // defined(name[, type])
        "defined": {
            operandCount: {required: 1, optional: 1},
            action: function() {
                return true;
            }
        },
        // equals(variablename, value)
        "equals": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return true;
            }
        },
        // error(string)
        "error": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // eval(string)
        "eval": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return true;
            }
        },
        // exists(filename)
        "exists": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return true;
            }
        },
        // export(variablename)
        "export": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        //#region for(iterate, list)
        "for": {
            operandCount: {required: 2, optional: 0},
            operandTypes: {0: VariableTypeEnum.STRING, 1: VariableTypeEnum.STRING_LIST},
            isGenerator: true,
            action: function() {
                // Starts a loop that iterates over all values in list, setting iterate to each value in turn.
                // As a convenience, if list is 1..10 then iterate will iterate over the values 1 through 10.

                const args = Array.from(arguments);
                let iteratorVariableName = args[0];
                let iterableList = args[1];
                let callback = args[2];
                let context = args[3];

                assert.isString(iteratorVariableName);
                assert.isArray(iterableList);
                assert.isFunction(callback);
                assert.isNotEmpty(context);

                context.addUserVariableDescription(iteratorVariableName, VariableTypeEnum.STRING);

                for (let i = 0; i < iterableList.length; i++) {
                    // FIXME: implement string type support in assignVariable (currently only lists are supported)
                    context.assignVariable(iteratorVariableName, [iterableList[i]]);
                    //console.log("VAR '" + iteratorVariableName + "' = " + context.getVariableValue(iteratorVariableName));

                    callback();
                }

                return true;
            }
        },
        //#endregion
        // greaterThan(variablename, value)
        "greaterThan": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return true;
            }
        },
        // if(condition)
        "if": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return true;
            }
        },
        // include(filename)
        "include": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return true;
            }
        },
        // infile(filename, var, val)
        "infile": {
            operandCount: {required: 3, optional: 0},
            action: function() {
                return true;
            }
        },
        // isActiveConfig
        "isActiveConfig": {
            operandCount: {required: 0, optional: 0},
            action: function() {
                return true;
            }
        },
        // isEmpty(variablename)
        "isEmpty": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return true;
            }
        },
        // isEqual(variablename, value)
        // NOTE: alias for "equals"
        "isEqual": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return true;
            }
        },
        // lessThan(variablename, value)
        "lessThan": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return true;
            }
        },
        // load(feature)
        "load": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // log(message)
        "log": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // message(string)
        "message": {
            operandCount: {required: 1, optional: 0},
            operandTypes: {0: VariableTypeEnum.RAW_STRING},
            action: function() {
                console.log("Project MESSAGE:", ...arguments);
                return true;
            }
        },
        // mkpath(dirPath)
        "mkpath": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // requires(condition)
        "requires": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // system(command)
        "system": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return true;
            }
        },
        // touch(filename, reference_filename)
        "touch": {
            operandCount: {required: 2, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // unset(variablename)
        "unset": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // warning(string)
        "warning": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return true;
            }
        },
        // write_file(filename, [variablename, [mode]])
        "write_file": {
            operandCount: {required: 1, optional: 2},
            action: function() {
                return "Not implemented";
            }
        },
        // Test Function Library
        // packagesExist(packages...)
        "packagesExist": {
            operandCount: undefined,
            action: function() {
                return true;
            }
        },
        // prepareRecursiveTarget(target)
        "prepareRecursiveTarget": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return "Not implemented";
            }
        },
        // qtCompileTest(test)
        "qtCompileTest": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return true;
            }
        },
        // qtHaveModule(name)
        "qtHaveModule": {
            operandCount: {required: 1, optional: 0},
            action: function() {
                return true;
            }
        }
    }
    return result;
}

// --------------------------------------------------------------------------------------------------------------------------------------------------

// NOTE: 'system' function has both replace and test versions
function isTestFunction(str) {
    let functionNames = [
        "cache", "CONFIG", "contains", "count", "debug",
        "defined", "equals", "error", "eval", "exists",
        "export", "for", "greaterThan", "if", "include",
        "infile", "isActiveConfig", "isEmpty", "isEqual",
        "lessThan", "load", "log", "message", "mkpath",
        "requires", "system", "touch", "unset", "warning",
        "write_file",
        "packagesExist", "prepareRecursiveTarget", "qtCompileTest", "qtHaveModule"
    ];

    return functionNames.indexOf(str) >= 0;
}

function isReplaceFunction(str) {
    let functionNames = [
        "absolute_path", "basename", "cat", "clean_path", "dirname",
        "enumerate_vars", "escape_expand", "find", "files", "first",
        "format_number", "fromfile", "getenv", "join", "last", "list",
        "lower", "member", "num_add", "prompt", "quote", "re_escape",
        "relative_path", "replace", "sprintf", "resolve_depends",
        "reverse", "section", "shadowed", "shell_path", "shell_quote",
        "size", "sort_depends", "sorted", "split", "str_member", "str_size",
        "system", "system_path", "system_quote", "take_first", "take_last",
        "unique", "upper", "val_escape"
    ];

    if (!str.startsWith(STR_FUNCTION_EXPAND_MARKER))
        return false;

    return functionNames.indexOf(str.substring(STR_FUNCTION_EXPAND_MARKER.length)) >= 0;
}

// --------------------------------------------------------------------------------------------------------------------------------------------------

exports.STR_FUNCTION_EXPAND_MARKER = STR_FUNCTION_EXPAND_MARKER;
exports.replaceFunctions = initBuiltinReplaceFunctions();
exports.testFunctions = initBuiltinTestFunctions();
exports.isReplaceFunction = isReplaceFunction;
exports.isTestFunction = isTestFunction;

