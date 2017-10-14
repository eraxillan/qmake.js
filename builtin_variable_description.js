'use strict';

const ArchitectureEnum = {
    UNKNOWN: "<unknown>",
    x86: "x86",
    x86_64: "x86_64",
    armv7: "armv7",
    armv7le: "armv7le",
    arm64: "arm64"
}

const OsEnum = {
    UNKNOWN: "<unknown>",   // e.g. freebsd openbsd aix sunos
    // Desktop platforms
    WINDOWS: "Windows",     // win32: 7, 8.1, 10 (x32/x64)
    LINUX: "Linux",         // linux: x32/x64
    MACOS: "Darwin",        // darwin: 10.10, 10.11, 10.12
    // Mobile platforms
    ANDROID: "android",     // API Level: 16
    IOS: "ios",             // 8, 9, 10 (armv7, arm64)
    UWP: "uwp",             // Universal Windows Platform
    // Embedded platforms
    EMBEDDED_LINUX: [],
    QNX: ["6.6.0", "7.0"],
    INTEGRITY: ["11.4"]
}

const CompilerEnum = {
    UNKNOWN: "<unknown>",
    // Microsoft Visual Studio
    MSVC: "msvc", //["2017", "2015", "2013"]
    // MinGW (GCC Windows port)
    MINGW: "mingw", // ["5.3"]
    // GCC
    GCC: "gcc", //["4.8", "4.9", "5.3", "5.4"]
    // Clang
    // FIXME: list clang versions in various XCode (6, 7, 8)
    CLANG: "clang" // ["6, 7, 8"]
}

// --------------------------------------------------------------------------------------------------------------------------------------------------

const SupportedPlatforms = [
    // Windows 10
    {
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["10"],
        CompilerType: CompilerEnum.MSVC,
        CompilerVersions: ["2013", "2015", "2017"]
    },
    {
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["10"],
        CompilerType: CompilerEnum.MINGW,
        CompilerVersions: ["5.3"]
    },
    {
        Arch: ArchitectureEnum.x86,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["10"],
        CompilerType: CompilerEnum.MSVC,
        CompilerVersions: ["2013", "2015", "2017"]
    },
    {
        Arch: ArchitectureEnum.x86,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["10"],
        CompilerType: CompilerEnum.MINGW,
        CompilerVersions: ["5.3"]
    },
    // Windows 8.1
    {
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["8.1"],
        CompilerType: CompilerEnum.MSVC,
        CompilerVersions: ["2013", "2015", "2017"]
    },
    {
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["8.1"],
        CompilerType: CompilerEnum.MINGW,
        CompilerVersions: ["5.3"]
    },
    {
        Arch: ArchitectureEnum.x86,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["8.1"],
        CompilerType: CompilerEnum.MSVC,
        CompilerVersions: ["2013", "2015", "2017"]
    },
    {
        Arch: ArchitectureEnum.x86,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["8.1"],
        CompilerType: CompilerEnum.MINGW,
        CompilerVersions: ["5.3"]
    },
    // Windows 7
    {
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["7"],
        CompilerType: CompilerEnum.MSVC,
        CompilerVersions: ["2013", "2015", "2017"]
    },
    {
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["7"],
        CompilerType: CompilerEnum.MINGW,
        CompilerVersions: ["5.3"]
    },
    {
        Arch: ArchitectureEnum.x86,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["7"],
        CompilerType: CompilerEnum.MSVC,
        CompilerVersions: ["2013", "2015", "2017"]
    },
    {
        Arch: ArchitectureEnum.x86,
        OsType: OsEnum.WINDOWS,
        OsVersions: ["7"],
        CompilerType: CompilerEnum.MINGW,
        CompilerVersions: ["5.3"]
    },
    // Linux/X11
    {
        Name: "openSUSE 42.1 (64-bit)",
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.LINUX,
        OsVersions: ["42.1"],
        CompilerType: CompilerEnum.GCC,
        CompilerVersions: ["4.8.5"]
    },
    {
        Name: "Red Hat Enterprise Linux 6.6 (64-bit)",
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.LINUX,
        OsVersions: ["6.6"],
        CompilerType: CompilerEnum.GCC,
        CompilerVersions: ["4.9.1"],
        // RedHat-specific
        DevtoolsetVersion: "3"
    },
    {
        Name: "Red Hat Enterprise Linux 7.2 (64-bit)",
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.LINUX,
        OsVersions: ["7.2"],
        CompilerType: CompilerEnum.GCC,
        CompilerVersions: ["5.3.1"],
        // RedHat-specific
        DevtoolsetVersion: "4"
    },
    {
        Name: "Ubuntu 16.04 (64-bit)",
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.LINUX,
        OsVersions: ["16.04"],
        CompilerType: CompilerEnum.GCC,
        CompilerVersions: undefined
    },
    {
        Name: "Generic Linux (64-bit)",
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.LINUX,
        OsVersions: undefined,
        CompilerType: CompilerEnum.GCC,
        CompilerVersions: ["4.8", "4.9", "5.3"]
    },
    {
        Name: "Generic Linux (32-bit)",
        Arch: ArchitectureEnum.x86,
        OsType: OsEnum.LINUX,
        OsVersions: undefined,
        CompilerType: CompilerEnum.GCC,
        CompilerVersions: ["4.8", "4.9", "5.3"]
    },
    // macOS
    {
        Name: "macOS (64-bit)",
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.MACOS,
        OsVersions: ["10.10", "10.11", "10.12"],
        CompilerType: CompilerEnum.CLANG,
        CompilerVersions: undefined
    },
    // FIXME: does macOS-x32 platform exist?
    // Android
    {
        Name: "Android (x86)",
        Arch: ArchitectureEnum.x86,
        OsType: OsEnum.ANDROID,
        OsVersions: ["4.1", "4.2", "4.3", "4.4", "5.0", "5.1", "6.0", "7.0", "7.1"],
        CompilerType: CompilerEnum.GCC,
        CompilerVersions: undefined
    },
    {
        Name: "Android (x86)",
        Arch: ArchitectureEnum.x86,
        OsType: OsEnum.ANDROID,
        OsVersions: ["4.1", "4.2", "4.3", "4.4", "5.0", "5.1", "6.0", "7.0", "7.1"],
        CompilerType: CompilerEnum.MINGW,
        CompilerVersions: ["5.3"]
    },
    // iOS
    {
        Name: "iOS",
        Arch: ArchitectureEnum.armv7,
        OsType: OsEnum.IOS,
        OsVersions: ["8", "9", "10"],
        CompilerType: CompilerEnum.CLANG,
        CompilerVersions: undefined
    },
    {
        Name: "iOS",
        Arch: ArchitectureEnum.arm64,
        OsType: OsEnum.IOS,
        OsVersions: ["8", "9", "10"],
        CompilerType: CompilerEnum.CLANG,
        CompilerVersions: undefined
    },
    // Universal Windows Platform
    {
        Name: "UWP",
        Arch: ArchitectureEnum.x86,
        OsType: OsEnum.UWP,
        OsVersions: undefined,
        CompilerType: CompilerEnum.MSVC,
        CompilerVersions: ["2017", "2015"]
    },
    {
        Name: "UWP",
        Arch: ArchitectureEnum.x86_64,
        OsType: OsEnum.UWP,
        OsVersions: undefined,
        CompilerType: CompilerEnum.MSVC,
        CompilerVersions: ["2017", "2015"]
    },
    {
        Name: "UWP",
        Arch: ArchitectureEnum.armv7,
        OsType: OsEnum.UWP,
        OsVersions: undefined,
        CompilerType: CompilerEnum.MSVC,
        CompilerVersions: ["2017", "2015"]
    },
    // Embedded platforms
    // Embedded Linux
    {
        Name: "Embedded Linux",
        Arch: ArchitectureEnum.armv7,   // FIXME: correct arch list
        OsType: OsEnum.EMBEDDED_LINUX,
        OsVersions: undefined,
        CompilerType: CompilerEnum.GCC,
        CompilerVersions: undefined
    },
    // QNX
    {
        Name: "QNX",
        Arch: ArchitectureEnum.armv7le,
        OsType: OsEnum.QNX,
        OsVersions: ["6.6", "7.0"],
        CompilerType: CompilerEnum.GCC,
        CompilerVersions: undefined
    },
    {
        Name: "QNX",
        Arch: ArchitectureEnum.x86,
        OsType: OsEnum.QNX,
        OsVersions: ["6.6", "7.0"],
        CompilerType: CompilerEnum.GCC,
        CompilerVersions: undefined
    },
    // INTEGRITY
    {
        Name: "INTEGRITY",
        Arch: undefined,  // FIXME: correct arch list
        OsType: OsEnum.INTEGRITY,
        OsVersions: ["11.4"],
        CompilerType: CompilerEnum.GCC,
        CompilerVersions: undefined
    }
];

// --------------------------------------------------------------------------------------------------------------------------------------------------

const VariableTypeEnum = {
    STRING: "string",
    STRING_LIST: "string_list",
    RESTRICTED_STRING: "restricted_string",
    RESTRICTED_STRING_LIST : "restricted_string_list",
    OBJECT: "object",   // object with properties (e.g. host.arch)
    OBJECT_LIST: "object_list"  // list of objects with properties described above
//    FILE_PATH,
//    DIR_PATH
};

// --------------------------------------------------------------------------------------------------------------------------------------------------

function initConfigVariableValue() {
    return [
        "lex", "yacc", "debug", "exceptions", "depend_includepath", "testcase_targets",
        "import_plugins", "import_qpa_plugin", "file_copies", "qmake_use", "qt", "warn_on",
        "release", "link_prl", "incremental", "shared", "linux", "unix", "posix",
        "gcc", "qml_debug"
    ];
}

function initConfigVariableRange() {
    return [
        "release", "debug", "debug_and_release", "debug_and_release_target", "qml_debug",
        "qmake_use", "build_all", "autogen_precompile_source", "ordered", "precompile_header", "depend_includepath",
        "warn_on", "warn_off", "exceptions", "exceptions_off",
        "rtti", "rtti_off", "stl", "stl_off", "thread",
        "c++11", "c++14",
        "lex", "yacc",
        "create_prl", "link_prl", "incremental",
        "qt", "x11", "testcase", "testcase_targets", "insignificant_test",
        "windows", "console", "shared", "dll", "static", "staticlib",
        "linux", "unix", "posix", "gcc",
        "plugin", "import_plugins", "import_qpa_plugin",
        "designer", "no_lflags_merge", "file_copies",
        "flat", "embed_manifest_dll", "embed_manifest_exe",
        "app_bundle", "lib_bundle",
        "largefile", "separate_debug_info"
    ];
}

function initQtVariableValue() {
    return ["core", "gui"];
}

function initQtVariableRange() {
    return [
        "core", "gui", "widgets", "network", "multimedia", "sql", "testlib", "multimediawidgets", "qml", "quick",
        "axcontainer", "axserver",
        "3dcore", "3drender", "3dinput", "3dlogic", "3dextras",
        "enginio", "androidextras", "bluetooth", "concurrent", "dbus", "location",
        "macextras", "nfc", "opengl", "positioning", "printsupport", "purchasing",
        "quickcontrols2", "quickwidgets", "script", "scripttools", "scxml",
        "sensors", "serialbus", "serialport", "svg", "webchannel", "webengine", "websockets", "webview",
        "winextras", "x11extras", "xml", "xmlpatterns", "charts", "datavisualization"
    ];
}

function initTemplateVariableRange() {
    return ["app", "lib", "aux", "subdirs", "vcsubdirs", "vcapp", "vclib"];
}

function initTemplateVariableValue() {
    return "app";
}

// --------------------------------------------------------------------------------------------------------------------------------------------------
// qmake built-in var:
// name
// type (string or list)
// value range
// default value
// is rare

function initBuiltinVariables() {
    var result = {
        "CONFIG": {
            type: VariableTypeEnum.RESTRICTED_STRING_LIST,
            valueRange: initConfigVariableRange(),
            value: initConfigVariableValue(),
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "DEFINES": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "DEF_FILE": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: OsEnum.WINDOWS,
            template: "app",
            isReadOnly: false,
            isRare: false
        },
        "DEPENDPATH": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "DESTDIR": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "DISTFILES": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.LINUX, OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "DLLDESTDIR": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: OsEnum.WINDOWS,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "FORMS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "GUID": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: CompilerEnum.MSVC,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "HEADERS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "ICON": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: OsEnum.MACOS,
            template: "app",
            isReadOnly: false,
            isRare: false
        },
        "IDLSOURCES": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: CompilerEnum.MSVC,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "INCLUDEPATH": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "INSTALLS": {
            type: VariableTypeEnum.OBJECT_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "LEXIMPLS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "LEXOBJECTS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "LEXSOURCES": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "LIBS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "LITERAL_HASH": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: ["#"],
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: false
        },
        "MAKEFILE": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "MAKEFILE_GENERATOR": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "UNIX",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: implement
//        "MSVCPROJ_*"
        "MOC_DIR": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "OBJECTS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "OBJECTS_DIR": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "POST_TARGETDEPS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "PRE_TARGETDEPS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "PRECOMPILED_HEADER": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "PWD": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: false
        },
        "OUT_PWD": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: false
        },
        "QMAKE": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKESPEC": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",  // e.g. /home/john/Qt/5.9.1/gcc_64/mkspecs/linux-g++
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: false
        },
// FIXME: undocumented
        "QMAKE_AR": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: false,
            platform: [OsEnum.LINUX, OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_AR_CMD": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: false,
            platform: [OsEnum.LINUX, OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_BUNDLE_DATA": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.MACOS, OsEnum.IOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_BUNDLE_EXTENSION": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: ".framework",
            canBeEmpty: true,
            platform: [OsEnum.MACOS, OsEnum.IOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_CC": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",  // e.g. gcc
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_CFLAGS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CFLAGS_DEBUG": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_CFLAGS_PIC": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_CFLAGS_PRECOMPILE": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CFLAGS_RELEASE": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CFLAGS_SHLIB": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CFLAGS_THREAD": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_CFLAGS_USE_PRECOMPILE": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CFLAGS_WARN_OFF": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CFLAGS_WARN_ON": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CLEAN": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_COMPILER": {
            type: VariableTypeEnum.RESTRICTED_STRING_LIST,
            valueRange: [
                "dummy_compiler",
                "msvc", "gcc",
                "clang", "llvm", "clang_cl",
                "intel_icc", "intel_icl",
                "rim_qcc", "ghs", "sun_cc",
                // unsupported
                "wr_dcc"
            ],
            value: [ "msvc" ],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_CXX": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",  // e.g. g++
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_CXXFLAGS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_CXXFLAGS_CXX11": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_CXXFLAGS_CXX14": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_CXXFLAGS_CXX1Z": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CXXFLAGS_DEBUG": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_CXXFLAGS_GNUCXX11": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_CXXFLAGS_GNUCXX14": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_CXXFLAGS_GNUCXX1Z": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CXXFLAGS_RELEASE": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_CXXFLAGS_PRECOMPILE": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CXXFLAGS_SHLIB": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CXXFLAGS_THREAD": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_CXXFLAGS_USE_PRECOMPILE": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CXXFLAGS_WARN_OFF": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_CXXFLAGS_WARN_ON": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_DEFINES_WAYLAND": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_DEVELOPMENT_TEAM": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.MACOS, OsEnum.IOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_DISTCLEAN": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.LINUX, OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_EXTENSION_SHLIB": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",  // e.g. "so"
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_EXTENSION_STATICLIB": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",  // e.g. "a"
            canBeEmpty: true,
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_EXT_MOC": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [".moc"],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_EXT_UI": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [".ui"],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_EXT_PRL": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [".prl"],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_EXT_LEX": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [".l"],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_EXT_YACC": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [".y"],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_EXT_OBJ": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [".o"],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_EXT_CPP": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [".cpp", ".cc", ".cxx", ".C"],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_EXT_H": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [".h", ".hpp", ".hh", ".hxx", ".H"],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_EXTRA_COMPILERS": {
            type: VariableTypeEnum.OBJECT_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_EXTRA_TARGETS": {
            type: VariableTypeEnum.OBJECT_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_FAILED_REQUIREMENTS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: false
        },
        "QMAKE_FRAMEWORK_BUNDLE_NAME": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            // Default value: $$TARGET
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.MACOS, OsEnum.IOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_FRAMEWORK_VERSION": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            // Default value: $$VERSION
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.MACOS, OsEnum.IOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_HOST": {
            type: VariableTypeEnum.OBJECT,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            // Default value: $$VERSION
            value: {
                "arch": "", "os": "", "cpu_count": 0, "name": "",
                "version": "", "version_string": ""
            },
            canBeEmpty: false,
            platform: [OsEnum.MACOS, OsEnum.IOS],
            template: undefined,
            isReadOnly: true,
            isRare: false
        },
        "QMAKE_INCDIR": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [""],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_INCDIR_EGL": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [""],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_INCDIR_OPENGL": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [""],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_INCDIR_OPENGL_ES2": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [""],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_INCDIR_OPENVG": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [""],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_INCDIR_WAYLAND": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [""],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_INCDIR_X11": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [""],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_INCREMENTAL_STYLE": {
            type: VariableTypeEnum.RESTRICTED_STRING,
            valueRange: [ "sublib", "sublibs" ],
            // NOTE: runtime-evaluated
            value: [ "sublib" ],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_INFO_PLIST": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "Info.plist",
            canBeEmpty: true,
            platform: [OsEnum.MACOS, OsEnum.IOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
// FIXME: undocumented
        "QMAKE_LEX": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LEXFLAGS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LFLAGS_CXX11": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LFLAGS_CXX14": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LFLAGS_CXX1Z": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LFLAGS_BSYMBOLIC_FUNC": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_CONSOLE": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: OsEnum.WINDOWS,
            template: "app",
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_DEBUG": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LFLAGS_DYNAMIC_LIST": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LFLAGS_GCSECTIONS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LFLAGS_NEW_DTAGS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LFLAGS_NOUNDEF": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_PLUGIN": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_RPATH": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.LINUX, OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_REL_RPATH": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.LINUX, OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_REL_RPATH_BASE": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.LINUX, OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_RPATHLINK": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.LINUX, OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_RELEASE": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_APP": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: "app",
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_SHLIB": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: "lib",
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_SONAME": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_THREAD": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LFLAGS_VERSION_SCRIPT": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LFLAGS_USE_GOLD": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LFLAGS_WINDOWS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.WINDOWS],
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBDIR": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBDIR_FLAGS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBDIR_EGL": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBDIR_OPENGL": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LIBDIR_OPENGL_ES2": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBDIR_OPENVG": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LIBDIR_WAYLAND": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBDIR_X11": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LIBS_DYNLOAD": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBS_EGL": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LIBS_NIS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBS_OPENGL": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBS_OPENGL_ES1": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBS_OPENGL_ES2": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBS_OPENVG": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBS_THREAD": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LIBS_WAYLAND_CLIENT": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LIBS_WAYLAND_SERVER": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIBS_X11": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LIB_FLAG": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LINK": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LINK_C": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LINK_C_SHLIB": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_LINK_SHLIB": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LINK_SHLIB_CMD": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_LN_SHLIB": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_NM": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_OBJCOPY": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_OBJECTIVE_CFLAGS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
// FIXME: undocumented
        "QMAKE_PCH_OUTPUT_EXT": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_PLATFORM": {
            type: VariableTypeEnum.RESTRICTED_STRING_LIST,
            valueRange: [
                "dummy_platform",
                "unix", "posix",
                "mingw", "cygwin",
                "win32", "winrt",
                "mac", "macos", "osx", "macx", "darwin",
                "ios", "tvos", "watchos", "uikit",
                "android",
                "linux",
                "nacl",
                "bsd", "freebsd", "openbsd", "netbsd",
                "aix", "solaris", "hpux",
                "vxworks", "qnx", "integrity",
                "lynxos", "haiku", "boot2qt", "hurd",
                ],
            value: [ "win32" ],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_POST_LINK": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_PRE_LINK": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
// FIXME: undocumented
        "QMAKE_PREFIX_SHLIB": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_PREFIX_STATICLIB": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_PROJECT_NAME": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            // Default value: $$TARGET
            value: [],
            canBeEmpty: true,
            platform: [CompilerEnum.MSVC],
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_PROVISIONING_PROFILE": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            platform: [OsEnum.MACOS, OsEnum.IOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
// FIXME: undocumented
        "QMAKE_RANLIB": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_STRIP": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_STRIPFLAGS_LIB": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_MAC_SDK": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_MACOSX_DEPLOYMENT_TARGET": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_MAKEFILE": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_QMAKE": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: true
        },
        "QMAKE_RESOURCE_FLAGS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_RPATHDIR": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.LINUX, OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_RPATHLINKDIR": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.LINUX, OsEnum.MACOS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_RUN_CC": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_RUN_CC_IMP": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_RUN_CXX": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_RUN_CXX_IMP": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_SONAME_PREFIX": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform:[OsEnum.MACOS, OsEnum.IOS],
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_TARGET": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QMAKE_TARGET_COMPANY": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.WINDOWS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_TARGET_DESCRIPTION": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.WINDOWS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_TARGET_COPYRIGHT": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.WINDOWS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QMAKE_TARGET_PRODUCT": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.WINDOWS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
// FIXME: undocumented
        "QMAKE_WAYLAND_SCANNER": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_YACC": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_YACCFLAGS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_YACCFLAGS_MANGLE": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_YACC_HEADER": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: undocumented
        "QMAKE_YACC_SOURCE": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "QT": {
            type: VariableTypeEnum.RESTRICTED_STRING_LIST,
            valueRange: initQtVariableRange(),
            value: initQtVariableValue(),
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QTPLUGIN": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
// FIXME: undocumented
        "QT_ARCH": {
            type: VariableTypeEnum.RESTRICTED_STRING,
            valueRange: undefined,
            value: "x86_64",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "QT_VERSION": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: false
        },
        "QT_MAJOR_VERSION": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: false
        },
        "QT_MINOR_VERSION": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: false
        },
        "QT_PATCH_VERSION": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: false
        },
        "RC_FILE": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "RC_CODEPAGE": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.WINDOWS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "RC_DEFINES": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.WINDOWS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "RC_ICONS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: [OsEnum.WINDOWS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "RC_LANG": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.WINDOWS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "RC_INCLUDEPATH": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "RCC_DIR": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "REQUIRES": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "RESOURCES": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "RES_FILE": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.WINDOWS],
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
        "SOURCES": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "SUBDIRS": {
            type: VariableTypeEnum.OBJECT_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "TARGET": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            // Default value: the name of project file
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "TARGET_EXT": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: true
        },
// FIXME: implement
//"TARGET_x",
//"TARGET_x.y.z",
        "TEMPLATE": {
            type: VariableTypeEnum.RESTRICTED_STRING,
            valueRange: initTemplateVariableRange(),
            value: initTemplateVariableValue(),
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "TRANSLATIONS": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "UI_DIR": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "VERSION": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "VERSION_PE_HEADER": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: [OsEnum.WINDOWS],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "VER_MAJ": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: "lib",
            isReadOnly: false,
            isRare: false
        },
        "VER_MIN": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: "lib",
            isReadOnly: false,
            isRare: false
        },
        "VER_PAT": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            value: "",
            canBeEmpty: true,
            platform: undefined,
            template: "lib",
            isReadOnly: false,
            isRare: false
        },
        "VPATH": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "WINRT_MANIFEST": {
            type: VariableTypeEnum.OBJECT,
            valueRange: undefined,
            value: undefined,
            canBeEmpty: true,
            platform: [OsEnum.UWP],
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "YACCSOURCES": {
            type: VariableTypeEnum.STRING_LIST,
            valueRange: undefined,
            value: [],
            canBeEmpty: true,
            platform: undefined,
            template: undefined,
            isReadOnly: false,
            isRare: false
        },
        "_PRO_FILE_": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: false
        },
        "_PRO_FILE_PWD_": {
            type: VariableTypeEnum.STRING,
            valueRange: undefined,
            // NOTE: runtime-evaluated
            value: "",
            canBeEmpty: false,
            platform: undefined,
            template: undefined,
            isReadOnly: true,
            isRare: false
        }
    };
    return result;
}

// --------------------------------------------------------------------------------------------------------------------------------------------------

exports.ArchitectureEnum = ArchitectureEnum;
exports.OsEnum = OsEnum;
exports.CompilerEnum = CompilerEnum;
exports.VariableTypeEnum = VariableTypeEnum;

exports.builtinVariables = initBuiltinVariables;
