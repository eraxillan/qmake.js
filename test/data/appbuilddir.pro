#Variable and function expansion test (single-line)
var = 123

empty_var = 

f1 = $$first(  )
f2 = $$first( xyz, abc )
f3 = $$first( $$var )
g1 = $$list( )
g2 = $$list( abc, 123, xyz )
g3 = $$list( $$var )

buildmode = release

APP_PLATFORM = $$first( $$list( $$QMAKE_PLATFORM ) )
APP_ARCH = $$first( $$list( $$QT_ARCH ) )
APP_COMPILER = $$first( $$list( $$QMAKE_COMPILER ) )

APP_BUILD_DIR = __BUILD__/client
APP_BUILD_DIR = __BUILD__/client/$${buildmode}/$${APP_PLATFORM}-$${APP_ARCH}-$${APP_COMPILER}
