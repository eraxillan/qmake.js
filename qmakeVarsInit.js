
function getSystemInfo() {
    const os = require('os');
    //env.qmakeVars["QMAKE_HOST"] = {
    //    arch: "x86_64",
    //    os: "Windows",
    //    cpu_count: 8,
    //    name: "ERAXILLAN-PC",
    //   version: "192",
    //    version_string: "Unknown"
    //};

    // FIXME: adopt os module values to qmake ones ("Windows" instead of "win32", etc.)
    return {
        arch:            os.arch(),         // string
        os:              os.platform(),     // string: win32 linux darwin android freebsd openbsd aix sunos
        cpu_count:       os.cpus().length,  // string (FIXME: but actually it is a number?)
        name:            os.hostname(),     // string
        version:         os.release(),      // string
        version_string:  "Unknown",
        // FIXME: new values, qmake-ng specific
        os_type:         os.type(),         // string: Windows_NT, Darwin, Linux
        home_dir:        os.homedir(),      // string
        temp_dir:        os.tmpdir()        // string
    }
}

function init() {
    var qmakeVars = {}

    // System info
    qmakeVars.QMAKE_PLATFORM  = ["win32"];
    qmakeVars.QT_ARCH         = ["x86_64"];
    qmakeVars.QMAKE_COMPILER  = ["msvc"];
    qmakeVars.QMAKE_HOST      = getSystemInfo();

    qmakeVars.QMAKESPEC = "C:/Qt/5.8/msvc2015_64/mkspecs/win32-msvc2015";

    qmakeVars.TEMPLATE = "app";
    qmakeVars.CONFIG   = [
        // FIXME: (Windows + MSVC)-specific values
        "windows", "win32", "msvc",
        "flat", "embed_manifest_dll", "embed_manifest_exe",
        "exceptions", "rtti_off", "warn_on",
        "no_plugin_manifest", "import_qpa_plugin",
        "c++11",
        //
        "debug_and_release_target", "debug_and_release", "release",
        "qmake_use", "qt", "thread",
        // FIXME: macOS-specific values
        "app_bundle",
        "link_prl", "shared",
        "incremental_off", "incremental",
        "file_copies", "copy_dir_files",
        "precompile_header", "autogen_precompile_source",
        "lex", "yacc", "depend_includepath", "testcase_targets", "import_plugins"
    ];
    qmakeVars.QT        = ["core", "gui"];
    qmakeVars.QTPLUGIN  = []; // FIXME: add actual value
    
    // Mac Framework
    // ONLY: macOS, iOS, tvOS, watchOS
    qmakeVars.QMAKE_FRAMEWORK_BUNDLE_NAME  = "$${TARGET}";     // FIXME: eval after TARGET assignment
    qmakeVars.QMAKE_FRAMEWORK_VERSION      = "$${VERSION}";    // FIXME: eval after VERSION assignment
    qmakeVars.QMAKE_BUNDLE_EXTENSION       = ".framework";     // ONLY: macOS, iOS, tvIS, watchOS

    // Windows resources
    qmakeVars.RC_FILE         = "";    // ONLY: Windows
    qmakeVars.RC_ICONS        = "";    // ONLY: Windows
    qmakeVars.RC_CODEPAGE     = "";    // ONLY: Windows
    qmakeVars.RC_DEFINES      = [];    // ONLY: Windows
    qmakeVars.RC_LANG         = [];    // ONLY: Windows
    qmakeVars.RC_INCLUDEPATH  = [];    // ONLY: Windows
    qmakeVars.RES_FILE        = [];    // ONLY: Windows
    
    // Qt resources
    qmakeVars.RESOURCES             = [];
    qmakeVars.QMAKE_RESOURCE_FLAGS  = [];
    
    // Lex, Yacc
    qmakeVars.LEXSOURCES      = [];
    qmakeVars.YACCSOURCES     = [];
    qmakeVars.LEXIMPLS        = [];
    qmakeVars.LEXOBJECTS      = [];
    qmakeVars.QMAKE_EXT_LEX   = "";
    qmakeVars.QMAKE_EXT_YACC  = "";
    
    // Input source code
    // FIXME: SUBDIRS modifiers support
    qmakeVars.SUBDIRS       = [];    // ONLY: TEMPLATE = subdirs
    qmakeVars.HEADERS       = [];
    qmakeVars.SOURCES       = [];
    qmakeVars.OBJECTS       = [];
    qmakeVars.IDLSOURCES    = [];    // ONLY: Windows VS project targets
    qmakeVars.FORMS         = [];
    qmakeVars.TRANSLATIONS  = [];
    // Platform-specific input files
    qmakeVars.DEF_FILE           = "";    // ONLY: Windows, TEMPLATE=app
    qmakeVars.DISTFILES          = [];    // ONLY: UnixMake specs
    qmakeVars.QMAKE_INFO_PLIST   = "";    // ONLY: macOS, iOS, tvOS, watchOS
    qmakeVars.ICON               = "";    // ONLY: macOS
    qmakeVars.QMAKE_BUNDLE_DATA  = [];    // ONLY: macOS, iOS, tvOS, watchOS
    
    // FIXME: implement grammar rules for vars below
    // Input libraries, defines, options
    qmakeVars.TARGET = "";
    qmakeVars.QMAKE_PROJECT_NAME = "$${TARGET}"; // ONLY: Windows + VS
    qmakeVars.TARGET_EXT         = "";
    // FIXME: add TARGET_x, TARGET_x.y.z runtime-generated variables

    qmakeVars.VERSION            = "";
    qmakeVars.VERSION_PE_HEADER  = "";    // ONLY: Windows
    qmakeVars.VER_MAJ            = "";    // ONLY: TEMPLATE = lib
    qmakeVars.VER_MIN            = "";              // ONLY: TEMPLATE = lib
    qmakeVars.VER_PAT            = "";              // ONLY: TEMPLATE = lib
    
    qmakeVars.DEFINES      = [];  // Input compiler flags
    qmakeVars.LIBS         = []
    qmakeVars.INCLUDEPATH  = [];  // Input headers directories
    qmakeVars.DEPENDPATH   = [];   // Input projects directories
    // Rarely-used
    qmakeVars.VPATH        = [];   // Input files directories (e.g. SOURCES items)
    
    qmakeVars.GUID         = ""; // ONLY: Windows VS project targets
    
    qmakeVars.QMAKE_MAC_SDK                   = "";    // ONLY: macOS
    qmakeVars.QMAKE_MACOSX_DEPLOYMENT_TARGET  = "";   // macOS
    
    qmakeVars.QMAKE_SONAME_PREFIX  = "";
    qmakeVars.SIGNATURE_FILE       = []; // ONLY: Windows CE
    // FIXME: add WINRT_MANIFEST variable after properties ("modifiers") will be supported
    
    qmakeVars.QMAKE_TARGET              = "";
    qmakeVars.QMAKE_TARGET_COMPANY      = ""; // ONLY: Windows
    qmakeVars.QMAKE_TARGET_DESCRIPTION  = ""; // ONLY: Windows
    qmakeVars.QMAKE_TARGET_COPYRIGHT    = ""; // ONLY: Windows
    qmakeVars.QMAKE_TARGET_PRODUCT      = ""; // ONLY: Windows
    
    // File extensions
    qmakeVars.QMAKE_EXTENSION_SHLIB      = "";
    qmakeVars.QMAKE_EXTENSION_STATICLIB  = "";
    qmakeVars.QMAKE_EXT_MOC              = "";
    qmakeVars.QMAKE_EXT_UI               = "";
    qmakeVars.QMAKE_EXT_PRL              = "";
    qmakeVars.QMAKE_EXT_OBJ              = "";
    qmakeVars.QMAKE_EXT_CPP              = "";
    qmakeVars.QMAKE_EXT_H                = "";
    
    // Custom build steps
    qmakeVars.QMAKE_CLEAN = [];
    qmakeVars.QMAKE_DISTCLEAN        = [];
    qmakeVars.QMAKE_EXTRA_COMPILERS  = [];
    qmakeVars.QMAKE_EXTRA_TARGETS    = [];
    
    // Requirement management
    qmakeVars.PRE_TARGETDEPS             = [];
    qmakeVars.POST_TARGETDEPS            = [];
    qmakeVars.REQUIRES                   = [];
    qmakeVars.QMAKE_FAILED_REQUIREMENTS  = [];
    
    // Deployment
    qmakeVars.DEPLOYMENT_PLUGIN  = [];    // ONLY: Windows CE
    qmakeVars.INSTALLS           = [];
    qmakeVars.QMAKE_POST_LINK    = "";
    qmakeVars.QMAKE_PRE_LINK     = "";
    
    // Output directories for generated files
    qmakeVars.DESTDIR      = "";
    qmakeVars.DLLDESTDIR   = "";   // ONLY: Windows targets
    qmakeVars.UI_DIR       = "";
    qmakeVars.OBJECTS_DIR  = "";
    qmakeVars.MOC_DIR      = "";
    qmakeVars.RCC_DIR      = "";

    // Compiler stuff
    // Precompiled headers
    qmakeVars.PRECOMPILED_HEADER = "";
    // C
    qmakeVars.QMAKE_CC               = "";
    qmakeVars.QMAKE_CFLAGS           = [];
    qmakeVars.QMAKE_CFLAGS_DEBUG     = [];
    qmakeVars.QMAKE_CFLAGS_RELEASE   = [];
    qmakeVars.QMAKE_CFLAGS_SHLIB     = [];   // ONLY: Unix-like
    qmakeVars.QMAKE_CFLAGS_THREAD    = [];
    qmakeVars.QMAKE_CFLAGS_WARN_OFF  = [];
    qmakeVars.QMAKE_CFLAGS_WARN_ON   = [];
    // C++
    qmakeVars.QMAKE_CXX                = "";
    qmakeVars.QMAKE_CXXFLAGS           = [];
    qmakeVars.QMAKE_CXXFLAGS_DEBUG     = [];
    qmakeVars.QMAKE_CXXFLAGS_RELEASE   = [];
    qmakeVars.QMAKE_CXXFLAGS_SHLIB     = [];   // ONLY: Unix-like
    qmakeVars.QMAKE_CXXFLAGS_THREAD    = [];
    qmakeVars.QMAKE_CXXFLAGS_WARN_OFF  = [];
    qmakeVars.QMAKE_CXXFLAGS_WARN_ON   = [];
    // Objective-C
    qmakeVars.QMAKE_OBJECTIVE_CFLAGS   = [];
    
    // Linker stuff
    qmakeVars.QMAKE_LFLAGS          = [];
    qmakeVars.QMAKE_LFLAGS_CONSOLE  = []; // ONLY: Windows
    qmakeVars.QMAKE_LFLAGS_DEBUG    = [];
    qmakeVars.QMAKE_LFLAGS_PLUGIN   = [];
    qmakeVars.QMAKE_LFLAGS_RELEASE  = [];
    qmakeVars.QMAKE_LFLAGS_APP      = [];
    qmakeVars.QMAKE_LFLAGS_SHLIB    = [];
    qmakeVars.QMAKE_LFLAGS_SONAME   = [];
    qmakeVars.QMAKE_LFLAGS_THREAD   = [];
    qmakeVars.QMAKE_LFLAGS_WINDOWS  = []; // ONLY: Windows

    // Unix RPATH
    qmakeVars.QMAKE_RPATHDIR          = "";
    qmakeVars.QMAKE_RPATHLINKDIR      = [];
    qmakeVars.QMAKE_LFLAGS_RPATH      = [];   // ONLY: Unix-like
    qmakeVars.QMAKE_LFLAGS_REL_RPATH  = []; // ONLY: Unix-like
    qmakeVars.QMAKE_REL_RPATH_BASE    = "";
    qmakeVars.QMAKE_LFLAGS_RPATHLINK  = [];
    
    // Build
    qmakeVars.QMAKE_RUN_CC       = "-c   -Fo$obj $src";
    qmakeVars.QMAKE_RUN_CC_IMP   = "-c   -Fo$@ $<";
    qmakeVars.QMAKE_RUN_CXX      = "-c   -Fo$obj $src";
    qmakeVars.QMAKE_RUN_CXX_IMP  = "-c   -Fo$@ $<";
    
    // Qt info
    qmakeVars.QT_VERSION        = "5.8.0";
    qmakeVars.QT_MAJOR_VERSION  = "5";
    qmakeVars.QT_MINOR_VERSION  = "8";
    qmakeVars.QT_PATCH_VERSION  = "0";

    // qmake directories (READ-ONLY)
    /*
    PWD: C:/Projects/rubankireader_cmake
    OUT_PWD: C:/Projects/rubankireader_cmake
    _PRO_FILE_PWD_: C:/Projects/rubankireader_cmake
    _PRO_FILE_: C:/Projects/rubankireader_cmake/rubankireader.pro
    */
    qmakeVars.PWD = "";  // full path leading to the directory containing the current file being parsed
    
    qmakeVars._PRO_FILE_PWD_ = "";   // path to the directory containing the project file in use
    qmakeVars._PRO_FILE_     = "";   // path to the project file in use

    qmakeVars.QMAKE                 = "";
    qmakeVars.QMAKE_QMAKE           = "";  // READ-ONLY
    qmakeVars.QMAKE_AR_CMD          = "";
    qmakeVars.QMAKE_LIB_FLAG        = "";   // ONLY: TEMPLATE = lib
    qmakeVars.QMAKE_LINK_SHLIB_CMD  = "";
    qmakeVars.QMAKE_LN_SHLIB        = "-install ln -s";

    // Rarely-used variables
    qmakeVars.QMAKE_MAKEFILE      = "";
    qmakeVars.MAKEFILE            = "";
    qmakeVars.MAKEFILE_GENERATOR  = "MSBUILD";
    qmakeVars.OUT_PWD             = "";  // full path leading to the directory where qmake places the generated Makefile
    // FIXME: find and add MSVCPROJ_* variables

    // Utils
    qmakeVars.LITERAL_HASH = "#";

    qmakeVars.QMAKE_INCDIR             = [];
    qmakeVars.QMAKE_INCDIR_EGL         = [];
    qmakeVars.QMAKE_INCDIR_OPENGL      = [];
    qmakeVars.QMAKE_INCDIR_OPENGL_ES2  = [];
    qmakeVars.QMAKE_INCDIR_OPENVG      = [];
    qmakeVars.QMAKE_INCDIR_X11         = [];
    
    qmakeVars.QMAKE_LIBDIR         = [];
    qmakeVars.QMAKE_LIBDIR_FLAGS   = [];   // ONLY: Unix-like
    qmakeVars.QMAKE_LIBDIR_EGL     = [];
    qmakeVars.QMAKE_LIBDIR_OPENGL  = [];
    qmakeVars.QMAKE_LIBDIR_OPENVG  = [];
    qmakeVars.QMAKE_LIBDIR_X11     = []; // ONLY: Unix-like

    qmakeVars.QMAKE_LIBS             = [];
    qmakeVars.QMAKE_LIBS_EGL         = [];
    qmakeVars.QMAKE_LIBS_OPENGL      = [];
    qmakeVars.QMAKE_LIBS_OPENGL_ES1  = [];
    qmakeVars.QMAKE_LIBS_OPENGL_ES2  = [];
    qmakeVars.QMAKE_LIBS_OPENVG      = [];
    qmakeVars.QMAKE_LIBS_THREAD      = [];    // ONLY: Unix-like
    qmakeVars.QMAKE_LIBS_X11         = [];       // ONLY: Unix-like

    return qmakeVars;
}

function initConfigValues() {
    var validValues = [
        "release", "debug", "debug_and_release", "debug_and_release_target",
        "build_all", "autogen_precompile_source", "ordered", "precompile_header",
        "warn_on", "warn_off", "exceptions", "exceptions_off", "rtti", "rtti_off", "stl", "stl_off", "thread",
        "c++11", "c++14",
        "create_prl", "link_prl",
        "qt", "x11", "testcase", "insignificant_test",
        "windows", "console", "shared", "dll", "static", "staticlib", "plugin", "designer", "no_lflags_merge",
        "flat", "embed_manifest_dll", "embed_manifest_exe",
        "app_bundle", "lib_bundle",
        "largefile", "separate_debug_info"
    ];
    return validValues;
}

exports.qmakeVars = init;
exports.configValidValues = initConfigValues;
