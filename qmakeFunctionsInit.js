
// FIXME: optional and variable function arguments in Node.JS JavaScript

function initReplaceFunctions() {
    var qmakeFuncs = {}

    qmakeFuncs.absolute_path    = function(path, base="") {} // absolute_path(path[, base])
    qmakeFuncs.basename         = function(variableName) {}      // basename(variablename)
    qmakeFuncs.cat              = function(filename, mode="") {}   // cat(filename[, mode])
    qmakeFuncs.clean_path       = function(path) {}    // clean_path(path)
    qmakeFuncs.dirname          = function(file) {}    // dirname(file)
    qmakeFuncs.enumerate_vars   = function() {}    // enumerate_vars
    qmakeFuncs.escape_expand    = function(arg1) {}     // escape_expand(arg1 [, arg2 ..., argn])
    qmakeFuncs.find             = function(variablename, substr) {}    // find(variablename, substr)
    qmakeFuncs.first            = function(variablename) { return (!variablename || !(variablename instanceof Array) || variablename.length == 0) ? "" : variablename[0]; } // first(variablename)
    qmakeFuncs.format_number    = function(number) {} // format_number(number[, options...])
    qmakeFuncs.fromfile         = function(filename, variablename) {}    // fromfile(filename, variablename)
    qmakeFuncs.getenv           = function(variablename) {}  // getenv(variablename)
    qmakeFuncs.join             = function(variablename, glue, before, after) {}  // join(variablename, glue, before, after)
    qmakeFuncs.last             = function(variablename) {}  // last(variablename)
    qmakeFuncs.list             = function(arg1) { return [arg1]; }  // list(arg1 [, arg2 ..., argn])
    qmakeFuncs.lower            = function(arg1) {} // lower(arg1 [, arg2 ..., argn])
    qmakeFuncs.member           = function(variablename, start="", end="") {}    // member(variablename [, start [, end]])
    qmakeFuncs.num_add          = function(arg1) {} // num_add(arg1 [, arg2 ..., argn])
    qmakeFuncs.prompt           = function(question, decorate="") {} // prompt(question [, decorate])
    qmakeFuncs.quote            = function(string) {}   // quote(string)
    qmakeFuncs.re_escape        = function(string) {} // re_escape(string)
    qmakeFuncs.relative_path    = function(filePath, base="") {} // relative_path(filePath[, base])
    qmakeFuncs.replace          = function(string, old_string, new_string) {} // replace(string, old_string, new_string)
    qmakeFuncs.sprintf          = function(string) {} // sprintf(string, arguments...)
    qmakeFuncs.resolve_depends  = function(variablename, prefix) {}   // resolve_depends(variablename, prefix)
    qmakeFuncs.reverse          = function(variablename) {}   // reverse(variablename)
    qmakeFuncs.section          = function(variablename, separator, begin, end) {}    // section(variablename, separator, begin, end)
    qmakeFuncs.shadowed         = function(path) {}  // shadowed(path)
    qmakeFuncs.shell_path       = function(path) {}    // shell_path(path)
    qmakeFuncs.shell_quote      = function(path) {}   // shell_quote(arg)
    qmakeFuncs.size             = function(variablename) {}  // size(variablename)
    qmakeFuncs.sort_depends     = function(variablename, prefix) {}  // sort_depends(variablename, prefix)
    qmakeFuncs.sorted           = function(variablename) {}    // sorted(variablename)
    qmakeFuncs.split            = function(variablename, separator) {}  // split(variablename, separator)
    qmakeFuncs.str_member       = function(arg, start="", end="") {}     // str_member(arg [, start [, end]])
    qmakeFuncs.str_size         = function(arg) {}      // str_size(arg)
    qmakeFuncs.system           = function(command, mode="", stsvar="") {}   // system(command[, mode[, stsvar]])
    qmakeFuncs.system_path      = function(path) {}    // system_path(path)
    qmakeFuncs.system_quote     = function(arg) {}  // system_quote(arg)
    qmakeFuncs.take_first       = function(variablename) {}    // take_first(variablename)
    qmakeFuncs.take_last        = function(variablename) {}     // take_last(variablename)
    qmakeFuncs.unique           = function(variablename) {}        // unique(variablename)
    qmakeFuncs.upper            = function(arg1) {}                 // upper(arg1 [, arg2 ..., argn])
    qmakeFuncs.val_escape       = function(variablename) {}    // val_escape(variablename)

    return qmakeFuncs;
}

function initTestFunctions() {
    var qmakeFuncs = {};
    
    // Built-in Test Functions
    
    // NOTE: internal and rarely used function
    qmakeFuncs.cache           = function(variablename) {}                                          // cache(variablename, [set|add|sub] [transient] [super|stash], [source variablename])

    qmakeFuncs.CONFIG          = function(config) {}                                                // CONFIG(config [, set of values to consider]), e.g. CONFIG(release, debug|release)
    qmakeFuncs.contains        = function(variablename, value) {}                                   // contains(variablename, value)
    qmakeFuncs.count           = function(variablename, number) {}                                  // count(variablename, number)
    qmakeFuncs.debug           = function(level, message) {}                                        // debug(level, message)
    qmakeFuncs.defined         = function(name, type="") {}                                         // defined(name[, type])
    qmakeFuncs.equals          = function(variablename, value) {}                                   // equals(variablename, value)
    qmakeFuncs.error           = function(string) {}                                                // error(string)
    qmakeFuncs.eval            = function(string) {}                                                // eval(string)
    qmakeFuncs.exists          = function(filename) {}                                              // exists(filename)
    qmakeFuncs.export          = function(variablename) {}                                          // export(variablename)
    qmakeFuncs.files           = function(pattern, recursive=false) {}                              // files(pattern[, recursive=false])
    qmakeFuncs.for             = function(iterate, list) {}                                         // for(iterate, list)
    qmakeFuncs.greaterThan     = function(variablename, value) {}                                   // greaterThan(variablename, value)
    qmakeFuncs.if              = function(condition) {}                                             // if(condition)
    qmakeFuncs.include         = function(filename) {}                                              // include(filename)
    qmakeFuncs.infile          = function(filename, variablename, val) {}                           // infile(filename, var, val)
    qmakeFuncs.isActiveConfig  = function(config) {}                                                // NOTE: alias to "CONFIG" function
    qmakeFuncs.isEmpty         = function(variablename) {}                                          // isEmpty(variablename); NOTE: equivalent to count(variablename, 0)
    qmakeFuncs.isEqual         = function(variablename, value) {}                                   // NOTE: alias to "equals" function
    qmakeFuncs.lessThan        = function(variablename, value) {}                                   // lessThan(variablename, value); NOTE: works as "greaterThan"
    qmakeFuncs.load            = function(feature) {}                                               // load(feature)
    qmakeFuncs.log             = function(message) {}                                               // log(message)
    qmakeFuncs.message         = function(string) { console.log(string); }                          // message(string)
    qmakeFuncs.mkpath          = function(dirPath) {}                                               // mkpath(dirPath)
    qmakeFuncs.requires        = function(condition) {}                                             // requires(condition)
    qmakeFuncs.system          = function(command) {}                                               // system(command)
    qmakeFuncs.touch           = function(filename, reference_filename) {}                          // touch(filename, reference_filename)
    qmakeFuncs.unset           = function(variablename) {}                                          // unset(variablename)
    qmakeFuncs.warning         = function(string) {}                                                // warning(string)
    qmakeFuncs.write_file      = function(filename, variablename="", mode="") {}                    // write_file(filename, [variablename, [mode]])
    
    // Test Function Library
    qmakeFuncs.packagesExist           = function(packagesList) {}                                  // packagesExist(packages)
    qmakeFuncs.prepareRecursiveTarget  = function(target) {}                                        // prepareRecursiveTarget(target)
    qmakeFuncs.qtCompileTest           = function(test) {}                                          // qtCompileTest(test)
    qmakeFuncs.qtHaveModule            = function(name) {}                                          // qtHaveModule(name)
    
    return qmakeFuncs;
}

function init() {
    return {
        replaceFunctions: initReplaceFunctions(), 
        testFunctions:    initTestFunctions()
    };
}

exports.qmakeFunctions = init;
