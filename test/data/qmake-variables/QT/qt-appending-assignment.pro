# FIXME: failed case
#QT += \
#    gui \
#    opengl  #nfc

QT += \
   widgets network multimedia sql testlib multimediawidgets qml quick \
   axcontainer axserver \
   3dcore 3drender 3dinput 3dlogic 3dextras \
   enginio androidextras bluetooth concurrent dbus location \
   macextras nfc opengl positioning       purchasing \
   quickcontrols2 quickwidgets script scripttools scxml \
   sensors serialbus serialport svg webchannel webengine websockets webview \
   winextras x11extras xml xmlpatterns charts datavisualization

QT *= \
   core gui widgets network multimedia sql testlib multimediawidgets qml quick \
   axcontainer axserver \
   3dcore 3drender 3dinput 3dlogic 3dextras \
   enginio androidextras bluetooth concurrent dbus location \
   macextras nfc opengl positioning      purchasing \
   quickcontrols2 quickwidgets script scripttools scxml \
   sensors serialbus serialport svg webchannel webengine websockets webview \
   winextras x11extras xml xmlpatterns charts datavisualization

QT += printsupport
QT -= printsupport

TEMPLATE = app
