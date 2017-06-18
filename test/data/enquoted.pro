
var11 = 123
var12 = "123"

# ------------------------------------------------------------------------------

var_exp211 = $$var11
var_exp222 = $${var12}
var_exp233 = abc/$${var11}/xyz/$$var12
var_exp214 = "$$var11"
var_exp225 = "$${var12}"
var_exp236 = "abc/$${var11}/xyz/$$var12"

# ------------------------------------------------------------------------------

list_var1 = 1 "2 3" "4" "5 6 7" "8 9" # length = 5

# ------------------------------------------------------------------------------

buildmode = "release"

APP_PLATFORM = $$first( $$list( $$QMAKE_PLATFORM ) )
APP_ARCH = $$first( $$list( $$QT_ARCH ) )
APP_COMPILER = $$first( $$list( $$QMAKE_COMPILER ) )

INSTALL_DIR = "Program Files (x86)/client/$${buildmode}/$${APP_PLATFORM}-$${APP_ARCH} - $${APP_COMPILER}"
