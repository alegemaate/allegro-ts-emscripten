# allegro.ts

## Emscripten port of allegrots

---

## [GitHub](https://github.com/alegemaate/allegro-ts) - [API](https://alegemaate.com/allegro-ts/)

### What is allegro.ts?

_allegro.ts_ is a project which attempts to map the entire allegro 4 api to javascript in as close of a manner as possible.

This is based on [allegro.js](https://github.com/TheSos/allegrojs) an earlier project to bring the allegro 4 library to the browser. This differs by attempting to make a 1 to 1 mapping from allegro 4 to the browser which allows for the use as an emscripten library.

### Note

This project is wip! Really one big hack, hope to iterate on it more.

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
