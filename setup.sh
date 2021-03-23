#!/bin/bash

# Clean up
echo "Cleaning up"
rm -f -r ./build
mkdir ./build
cp -r ./examples/assets ./build/assets

# Build project
echo "Installing packages"
yarn

# Build project
echo "Building emscripten library"
yarn build

# Replace
if [ "$OSTYPE" == "osx" ]; then
  sed -i "" "s/lallegts\.//g" ./build/allegrolib.js
  sed -i "" "s/import.*$//g" ./build/allegrolib.js
else
  sed -i "s/lallegts\.//g" ./build/allegrolib.js
  sed -i "s/import.*$//g" ./build/allegrolib.js
fi

# Clone source
echo "Building allegro-ts @ latest"
cd lib
yarn
yarn build --module es6 --removeComments true --sourceMap false

# Flatten lib
echo "Creating js library from allegro-ts @ latest"
for filename in ./lib/*.js; do
  [ -e "$filename" ] || continue
  cat "$filename" >> ../build/allegro-ts-flat.js
  echo "" >> ../build/allegro-ts-flat.js
done

# Replace
if [ "$OSTYPE" == "osx" ]; then
  sed -i "" "s/export.*\*.*from.*$//g" ../build/allegro-ts-flat.js
  sed -i "" "s/import.*$//g" ../build/allegro-ts-flat.js
  sed -i "" "s/export [{].*[}];//g" ../build/allegro-ts-flat.js
  sed -i "" "s/export//g" ../build/allegro-ts-flat.js
else
  sed -i "s/export.*\*.*from.*$//g" ../build/allegro-ts-flat.js
  sed -i "s/import.*$//g" ../build/allegro-ts-flat.js
  sed -i "s/export [{].*[}];//g" ../build/allegro-ts-flat.js
  sed -i "s/export//g" ../build/allegro-ts-flat.js
fi

# Done!
echo "Done!"
read -p "Press any key..."
