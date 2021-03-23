# allegro.ts

## Emscripten port of allegrots

## [Github](https://github.com/alegemaate/allegro-ts-emscripten) - [API](https://alegemaate.com/allegro-ts/) - [Allegro TS](https://github.com/alegemaate/allegro-ts)

### What is allegro.ts emscripten?

_allegro.ts emscripten_ is a complete mapping of the allegro-ts library to C using emscripten. This allows allegro 4 games to be easily cross compiled to the web.

### Setup

Run the setup script in the root to create a flattened version of allegro-ts to be used by emscripten.

```sh
./setup.sh
```

To build the examples run:

```sh
cd examples
emcmake cmake -G "<makefile type>" .
make
```

To run the examples, you will need to serve up the build directory with something like npm serve.

```sh
npm i -g serve
cd build
serve
```

### Examples

- [colortest](https://alegemaate.com/allegro-ts-emscripten/colortest)
- [exaccel](https://alegemaate.com/allegro-ts-emscripten/exaccel)
- [exbmp](https://alegemaate.com/allegro-ts-emscripten/exbmp)
- [exbounce](https://alegemaate.com/allegro-ts-emscripten/exbounce)
- [exflip](https://alegemaate.com/allegro-ts-emscripten/exflip)
- [exprimitives](https://alegemaate.com/allegro-ts-emscripten/exprimitives)
- [exstress](https://alegemaate.com/allegro-ts-emscripten/exstress)
