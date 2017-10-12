// FIXME: implement and remove this stub

var builtinProperties = {
    QT_SYSROOT: "",
    QT_INSTALL_PREFIX: "/home/eraxillan/Qt/5.9.1/gcc_64",
    QT_INSTALL_ARCHDATA: "/home/eraxillan/Qt/5.9.1/gcc_64",
    QT_INSTALL_DATA: "/home/eraxillan/Qt/5.9.1/gcc_64",
    QT_INSTALL_DOCS: "/home/eraxillan/Qt/Docs/Qt-5.9.1",
    QT_INSTALL_HEADERS: "/home/eraxillan/Qt/5.9.1/gcc_64/include",
    QT_INSTALL_LIBS: "/home/eraxillan/Qt/5.9.1/gcc_64/lib",
    QT_INSTALL_LIBEXECS: "/home/eraxillan/Qt/5.9.1/gcc_64/libexec",
    QT_INSTALL_BINS: "/home/eraxillan/Qt/5.9.1/gcc_64/bin",
    QT_INSTALL_TESTS: "/home/eraxillan/Qt/5.9.1/gcc_64/tests",
    QT_INSTALL_PLUGINS: "/home/eraxillan/Qt/5.9.1/gcc_64/plugins",
    QT_INSTALL_IMPORTS: "/home/eraxillan/Qt/5.9.1/gcc_64/imports",
    QT_INSTALL_QML: "/home/eraxillan/Qt/5.9.1/gcc_64/qml",
    QT_INSTALL_TRANSLATIONS: "/home/eraxillan/Qt/5.9.1/gcc_64/translations",
    QT_INSTALL_CONFIGURATION: "/home/eraxillan/Qt/5.9.1/gcc_64",
    QT_INSTALL_EXAMPLES: "/home/eraxillan/Qt/Examples/Qt-5.9.1",
    QT_INSTALL_DEMOS: "/home/eraxillan/Qt/Examples/Qt-5.9.1",
    QT_HOST_PREFIX: "/home/eraxillan/Qt/5.9.1/gcc_64",
    QT_HOST_DATA: "/home/eraxillan/Qt/5.9.1/gcc_64",
    QT_HOST_BINS: "/home/eraxillan/Qt/5.9.1/gcc_64/bin",
    QT_HOST_LIBS: "/home/eraxillan/Qt/5.9.1/gcc_64/lib",
    QMAKE_SPEC: "linux-g++",
    QMAKE_XSPEC: "linux-g++",
    QMAKE_VERSION: "3.1",
    QT_VERSION: "5.9.1"
};

var userDefinedProperties = {};

// --------------------------------------------------------------------------------------------------------------------------------------------------

function setPersistentProperty(name, value) {
    userDefinedProperties[name] = value;
}

function unsetPersistentProperty(name) {
    if (name in builtinProperties)
        throw new Error("Unable to unset built-in QMake persistent property");
    
    delete userDefinedProperties[name];
}

function queryPersistentProperty(name) {
    if (name in userDefinedProperties)
        return userDefinedProperties[name];
    if (name in builtinProperties)
        return builtinProperties[name];
    throw new Error("Unknown persistent property '" + name + "'");
}

// --------------------------------------------------------------------------------------------------------------------------------------------------

module.exports = {
    set: setPersistentProperty,
    unset: unsetPersistentProperty,
    query: queryPersistentProperty
};
