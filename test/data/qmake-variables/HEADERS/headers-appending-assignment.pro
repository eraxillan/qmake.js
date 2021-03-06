HEADERS = \
    common/filedownloader.h                 \
    common/resultcode.h                     \
    website_backend/gumboparserimpl.h       \
    website_backend/qtgumbonode.h           \
    website_backend/websiteinterface.h      \
    website_backend/html_tag.h              \
    website_backend/qtgumbodocument.h       \
    qml_frontend/forumreader.h

HEADERS += win32/windows_specific.h
HEADERS += xml/xml_doc.h \
    xml_node.h
HEADERS *= win32/windows_specific.h
HEADERS *= xml/xml_doc.h \
    xml_node.h

HEADERS -= win32/windows_specific.h
HEADERS -= xml/xml_doc.h \
    xml_node.h

TEMPLATE = app
