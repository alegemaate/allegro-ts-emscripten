cmake_minimum_required(VERSION 3.25)

project("AllegroTS Emscripten Examples")

set(HASEMSCRIPTEN "not using emscripten")
if(EMSCRIPTEN)
  set(HASEMSCRIPTEN "using emscripten")
endif()

message("Building examples, ${HASEMSCRIPTEN}")

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Project and out dir
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/../build)

# Executable
file(GLOB EXAMPLE_SOURCES ${CMAKE_CURRENT_SOURCE_DIR}/*.c )

foreach(sourcefile ${EXAMPLE_SOURCES})
  # Remove path and extension
  file(RELATIVE_PATH sourcefile ${CMAKE_CURRENT_SOURCE_DIR} ${sourcefile})
  string(REPLACE ".c" "" sourcefile ${sourcefile} )

  # Log
  message("Configuring example ${sourcefile}")

  # Create executable
  add_executable(${sourcefile} ${sourcefile}.c)

  # Compile options
  target_compile_options(${sourcefile} PUBLIC -Wall -Wextra -pedantic -O2)

  # Link
  if(EMSCRIPTEN)
    set(CMAKE_EXECUTABLE_SUFFIX ".html")

    set_target_properties(
      ${sourcefile}
      PROPERTIES
      LINK_FLAGS
      "--pre-js ${CMAKE_CURRENT_SOURCE_DIR}/../build/allegrolib.js \
      --js-library ${CMAKE_CURRENT_SOURCE_DIR}/../build/allegrolib.js \
      -sASYNCIFY \
      -sSTACK_SIZE=32mb \
      -sEXPORTED_FUNCTIONS=['_malloc','_main']"
    )

  else()
    if(MINGW)
      target_link_libraries(${sourcefile} -lmingw32)
    endif()

    find_library(ALLEGRO_LIBRARY NAMES liballeg44.dll.a liballeg.dll.a liballeg.so liballeg.dylib)
    find_library(ALLEGRO_PNG_LIBRARY NAMES libloadpng.dll.a libloadpng.so libloadpng.dylib)
    target_link_libraries(${sourcefile} -lm ${ALLEGRO_LIBRARY})
    target_link_libraries(${sourcefile} -lm ${ALLEGRO_PNG_LIBRARY})
  endif()
endforeach()