#include <stdlib.h>

#ifdef __EMSCRIPTEN__
#include "../src/allegrots.h"
#else
#include <allegro.h>
#endif

// Globally declared bitmap object
BITMAP* logo;

int counter = 0;

void draw_color(int color, const char* name) {
  textprintf_ex(screen, font, 0, counter * 10, color, -1, "COLOR: %s, %i", name,
                color);
  counter += 1;
}

int main(void) {
// Setup canvas
#ifdef __EMSCRIPTEN__
  init_allegro_ts("canvas");
#endif

  // Initialises allegrots
  allegro_init();
  set_color_depth(32);
  set_gfx_mode(GFX_AUTODETECT_WINDOWED, 640, 480, 0, 0);
  install_keyboard();

  BITMAP* magic = load_bmp("assets/magicpink.bmp", NULL);
#ifdef __EMSCRIPTEN__
  allegro_ready();
#endif

  draw_sprite(screen, magic, SCREEN_W - 30, 10);

  draw_color(makecol(0, 0, 0), "black");
  draw_color(makecol(255, 255, 255), "white");
  draw_color(makecol(255, 0, 0), "red");
  draw_color(makecol(0, 255, 0), "lime");
  draw_color(makecol(0, 0, 255), "blue");
  draw_color(makecol(255, 255, 0), "yellow");
  draw_color(makecol(0, 255, 255), "cyan");
  draw_color(makecol(255, 0, 255), "magenta");
  draw_color(makecol(192, 192, 192), "silver");
  draw_color(makecol(128, 128, 128), "gray");
  draw_color(makecol(128, 0, 0), "maroon");
  draw_color(makecol(128, 128, 0), "olive");
  draw_color(makecol(0, 128, 0), "green");
  draw_color(makecol(128, 0, 128), "purple");
  draw_color(makecol(0, 128, 128), "teal");
  draw_color(makecol(0, 0, 128), "navy");

  // Loop
  while (!key[KEY_ESC]) {
    rest(10);
  }

  return 0;
}
END_OF_MAIN()
