SOURCES = \
    common/filedownloader.cpp                 \
    common/resultcode.cpp                     \
    website_backend/gumboparserimpl.cpp       \
    website_backend/qtgumbonode.cpp           \
    website_backend/websiteinterface.cpp      \
    website_backend/html_tag.cpp              \
    website_backend/qtgumbodocument.cpp       \
    qml_frontend/forumreader.cpp

SOURCES += win32/windows_specific.cpp
SOURCES += xml/xml_doc.cpp \
    xml_node.cpp
SOURCES *= win32/windows_specific.cpp
SOURCES *= xml/xml_doc.cpp \
    xml_node.cpp

SOURCES -= win32/windows_specific.cpp
SOURCES -= xml/xml_doc.cpp \
    xml_node.cpp

TEMPLATE = app
