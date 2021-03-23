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

# Replace
if [ "$OSTYPE" == "osx" ]; then
  sed -i "" "s/lallegts\.//g" ./build/allegrolib.js
  sed -i "" "s/import.*$//g" ./build/allegrolib.js
else
  sed -i "s/lallegts\.//g" ./build/allegrolib.js
  sed -i "s/import.*$//g" ./build/allegrolib.js
fi

# Build allegro-ts
echo -e "\033[1;35mBuilding allegro-ts\033[0m"
cd lib
yarn
yarn build --module es6 --removeComments true --sourceMap false
echo ""

# Flatten lib
echo -e "\033[1;35mCreating js library from allegro-ts\033[0m"
for filename in ./lib/*.js; do
  [ -e "$filename" ] || continue
  cat "$filename" >> ../build/allegro-ts-flat.js
  echo "" >> ../build/allegro-ts-flat.js
done

# Replace
cd ../build
if [ "$OSTYPE" == "osx" ]; then
  sed -i "" "s/export.*\*.*from.*$//g" allegro-ts-flat.js
  sed -i "" "s/import.*$//g" allegro-ts-flat.js
  sed -i "" "s/export [{].*[}];//g" allegro-ts-flat.js
  sed -i "" "s/export//g" allegro-ts-flat.js
else
  sed -i "s/export.*\*.*from.*$//g" allegro-ts-flat.js
  sed -i "s/import.*$//g" allegro-ts-flat.js
  sed -i "s/export [{].*[}];//g" allegro-ts-flat.js
  sed -i "s/export//g" allegro-ts-flat.js
fi
echo ""

# Done!
echo -e "\033[1;32mDone!\033[0m"
