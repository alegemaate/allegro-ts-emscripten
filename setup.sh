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
echo "Cloning allegro-ts @ latest"
git clone https://github.com/alegemaate/allegro-ts build/allegro-ts

cd build/allegro-ts
latesttag=$(git describe --tags)
git checkout ${latesttag}

echo "Building allegro-ts @ latest"
yarn
yarn build --module es6 --removeComments true --sourceMap false

# Flatten lib
echo "Creating js library from allegro-ts @ latest"
for filename in ./lib/*.js; do
  [ -e "$filename" ] || continue
  cat "$filename" >> ../allegro-ts-flat.js
  echo "" >> ../allegro-ts-flat.js
done

# Replace
if [ "$OSTYPE" == "osx" ]; then
  sed -i "" "s/export.*\*.*from.*$//g" ../allegro-ts-flat.js
  sed -i "" "s/import.*$//g" ../allegro-ts-flat.js
  sed -i "" "s/export [{].*[}];//g" ../allegro-ts-flat.js
  sed -i "" "s/export//g" ../allegro-ts-flat.js
else
  sed -i "s/export.*\*.*from.*$//g" ../allegro-ts-flat.js
  sed -i "s/import.*$//g" ../allegro-ts-flat.js
  sed -i "s/export [{].*[}];//g" ../allegro-ts-flat.js
  sed -i "s/export//g" ../allegro-ts-flat.js
fi

# Done!
echo "Done!"
read -p "Press any key..."
