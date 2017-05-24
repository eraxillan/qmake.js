{
var SystemVariablesDict = {};
}

Start = Statement* {return SystemVariablesDict; }
Statement = Comment / GenericAssignmentStatementT
// FIXME: add other system vars and user-defined
GenericAssignmentStatementT = Whitespace GenericAssignmentStatement Whitespace
GenericAssignmentStatement   = TemplateAssignmentStatement
                             / ConfigAssignmentStatement
                             / ConfigAppendingAssignmentStatement
                             / ConfigAppendingUniqueAssignmentStatement
                             / ConfigRemovingAssignmentStatement

// -------------------------------------------------------------------------------------------------

Comment "Comment string" = Whitespace "#" rvalue:([^\n])* {
	return "#" + rvalue.join("");
}

// -------------------------------------------------------------------------------------------------

// TEMPLATE = app|lib|subdirs|aux|vcapp|vclib
SystemTemplateVariable = "TEMPLATE"
SystemTemplateVariableValue = "app" / "lib" / "subdirs" / "aux" / "vcapp" / "vclib"
TemplateAssignmentStatement = lvalue:SystemTemplateVariable AssignmentOperator rvalue:SystemTemplateVariableValue
{
    SystemVariablesDict[lvalue] = rvalue;
    return undefined;
}

// -------------------------------------------------------------------------------------------------

// CONFIG = release|debug|debug_and_release|debug_and_release_target(DEFAULT)|build_all|autogen_precompile_source
//          |ordered|precompile_header|warn_on|warn_off|exceptions|exceptions_off|rtti|rtti_off|stl|stl_off|thread
//          |c++11|c++14
//			|create_prl|link_prl
//			|qt(DEFAULT)|x11|testcase|insignificant_test
//			|windows|console|shared|dll|static|staticlib|plugin|designer|no_lflags_merge
//			|flat|embed_manifest_dll|embed_manifest_exe (Windows-only)
//			|app_bundle|lib_bundle (macOS-only)
//			|largefile|separate_debug_info (Unix-only)
SystemConfigVariable = "CONFIG"
SystemConfigVariableValue =   "release" / "debug" / "debug_and_release" / "debug_and_release_target" / "build_all"
                            / "autogen_precompile_source" / "ordered" / "precompile_header"
                            / "warn_on" / "warn_off" / "exceptions" / "exceptions_off" / "rtti" / "rtti_off"
                            / "stl" / "stl_off" / "thread" / "c++11" / "c++14" / "create_prl" / "link_prl"
                            / "qt" / "x11" / "testcase" / "insignificant_test"
                            / "windows" / "console" / "shared" / "dll" / "static" / "staticlib" / "plugin"
                            / "designer" / "no_lflags_merge" / "flat" / "embed_manifest_dll" / "embed_manifest_exe"
                            / "app_bundle" / "lib_bundle" / "largefile" / "separate_debug_info"

ConfigAssignmentStatement = lvalue:SystemConfigVariable AssignmentOperator rvalue:SystemConfigVariableValue
{
    SystemVariablesDict[lvalue] = rvalue;
    return undefined;
}

ConfigAppendingAssignmentStatement = lvalue:SystemConfigVariable AppendingAssignmentOperator rvalue:SystemConfigVariableValue
{
    if (!SystemVariablesDict[lvalue])
        SystemVariablesDict[lvalue] = [];
    SystemVariablesDict[lvalue].push(rvalue);
    return undefined;
}

ConfigAppendingUniqueAssignmentStatement = lvalue:SystemConfigVariable AppendingUniqueAssignmentOperator rvalue:SystemConfigVariableValue
{
    if (!SystemVariablesDict[lvalue])
        SystemVariablesDict[lvalue] = [rvalue];

    if (SystemVariablesDict[lvalue].indexOf(rvalue) < 0)
    	SystemVariablesDict[lvalue].push(rvalue);
    
    return undefined;
}

ConfigRemovingAssignmentStatement = lvalue:SystemConfigVariable RemovingAssignmentOperator rvalue:SystemConfigVariableValue
{
    if (!SystemVariablesDict[lvalue])
    	return undefined;
    
    // Search for rvalue in the array and remove all occurences
	SystemVariablesDict[lvalue] = SystemVariablesDict[lvalue].filter(function(element) { return (element !== rvalue); });
    return undefined;
}

// -------------------------------------------------------------------------------------------------

Variable = SystemVariable / UserVariable
SystemVariable = SystemTemplateVariable / SystemConfigVariable

UserVariable = Word

AssignmentOperator = Whitespace "=" Whitespace
AppendingAssignmentOperator = Whitespace "+=" Whitespace              // DEFINES += USE_MY_STUFF
AppendingUniqueAssignmentOperator = Whitespace  "*=" Whitespace       // DEFINES *= USE_MY_STUFF
RemovingAssignmentOperator = Whitespace "-=" Whitespace               // DEFINES -= USE_MY_STUFF
// TODO: -=, *=
//ReplacingAssignmentOperator = "~="            // DEFINES ~= s/QT_[DT].+/QT

Word = w:Character+ { return w.join(""); }
Character = c:[^\r\n\t\"]
//Letter = c:[a-zA-Z0-9]
Whitespace = [ \t\r\n]*


//OpenBracket  = Whitespace '(' Whitespace
//CloseBracket = Whitespace ')' Whitespace
//QuoteExpr = Whitespace quote:("\"" / "$quot;" / "\xA0") Whitespace
