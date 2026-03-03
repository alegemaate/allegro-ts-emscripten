#!/bin/bash

# Clean up
echo -e "\033[1;35mCleaning up\033[0m"
rm -frv ./build
mkdir ./build
cp -rv ./examples/assets ./build/assets
echo ""

# Build project
echo -e "\033[1;35mInstalling packages\033[0m"
yarn
echo ""

# Build project
echo -e "\033[1;35mBuilding emscripten library\033[0m"
yarn build
echo ""

# Build examples
echo -e "\033[1;35mBuilding examples\033[0m"
cd examples
emcmake cmake --preset debug
cmake --build --preset debug
echo ""

# Done!
echo -e "\033[1;32mDone!\033[0m"
