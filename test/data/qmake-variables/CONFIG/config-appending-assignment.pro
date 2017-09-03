
# FIXME: failed case
#CONFIG += \
#    debug \
#    largefile  #separate_debug_info

CONFIG += \
    build_all  warn_off exceptions_off \
    rtti stl_off c++14 create_prl x11 testcase \
    insignificant_test  dll static staticlib \
    plugin designer no_lflags_merge lib_bundle \
    largefile ordered console

CONFIG *= \
    debug debug_and_release debug_and_release_target \
    build_all autogen_precompile_source  precompile_header \
    warn_on warn_off exceptions exceptions_off rtti rtti_off stl stl_off thread \
    c++11 c++14 \
    create_prl link_prl \
    qt x11 testcase insignificant_test \
    windows  shared dll static staticlib plugin designer no_lflags_merge \
    flat embed_manifest_dll embed_manifest_exe \
    app_bundle lib_bundle \
    largefile

CONFIG += separate_debug_info
CONFIG -= separate_debug_info

TEMPLATE = app
