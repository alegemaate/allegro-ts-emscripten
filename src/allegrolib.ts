import lallegts from "allegro-ts";

// Memory declarations
declare const HEAP32: any[];
declare function _malloc(size: number): number;
declare function _free(ptr: number): void;
declare function stackSave(): number;
declare function stackRestore(ptr: number): void;
declare function dynCall(type: "v", procedure: () => void, unk: null): void;
declare function setValue(addr: number, handle: number, type: "i32"): void;
declare function getValue(addr: number, type: "i32"): number;

// Converters
declare function UTF8ToString(ptr: number): string;
declare const Asyncify: {
  handleAsync: (fun: () => Promise<any>) => Promise<any>;
};

// Library manager
declare function autoAddDeps(param: any, strId: string): void;
declare function mergeInto(lib1: any, lib2: any): void;
declare const LibraryManager: any;

// This
declare const ALLEG: {
  lib: typeof lallegts;
  key: number | null;
  bitmaps: lallegts.BITMAP[];
  bitmap_addrs: number[];
  samples: lallegts.SAMPLE[];
  fonts: lallegts.FONT[];
  screen: lallegts.BITMAP;
  writeArray32ToMemory: (array: (number | boolean)[], buffer: number) => void;
  alloc_pack_bitmap: (ptr: number) => lallegts.BITMAP;
  pack_bitmap: (ptr: number) => void;
  unpack_bitmap: (ptr: number) => number;
  get_bitmap: (index: number) => lallegts.BITMAP;
  readArray32FromMemory: (buffer: number, length: number) => number[];
  post_set_gfx_mode: () => void;
  repack_bitmaps: () => void;
  copy_key_statuses: () => void;
  post_install_keyboard: () => void;
  post_remove_keyboard: () => void;
};

const AllegroJS = {
  // PRIVATE STUFF
  $ALLEG: {
    // HANDLERS
    // Index 0 is reserved for default values
    bitmaps: [null],
    bitmap_addrs: [null],
    samples: [null],
    fonts: [null],
    // POINTER TO SCREEN
    screen: null,
    // C ARRAY POINTERS
    key: null,

    // PRIVATE FUNCTIONS
    // Writes `array`(array of integers) to memory at address `buffer`
    writeArray32ToMemory: function (array: number[], buffer: number) {
      for (let i = 0; i < array.length; i++) {
        HEAP32[(buffer + i * 4) >> 2] = array[i];
      }
    },
    // Reads `length` integers from memory at address `buffer`
    readArray32FromMemory: function (buffer: number, length: number) {
      const res = [];
      for (let i = 0; i < length; i++) {
        res.push(HEAP32[(buffer + i * 4) >> 2]);
      }
      return res;
    },
    // Creates C arrays storing key statuses
    post_install_keyboard: function () {
      ALLEG.key = _malloc(4 * lallegts.key.length);
    },
    // Deletes C arrays storing key statuses
    post_remove_keyboard: function () {
      if (!ALLEG.key) {
        return;
      }
      _free(ALLEG.key);
      ALLEG.key = null;
    },
    // Writes JS key arrays to C memory
    copy_key_statuses: function () {
      if (!ALLEG.key) {
        return;
      }
      ALLEG.writeArray32ToMemory(lallegts.key, ALLEG.key);
    },
    // Creates `screen` and `font` C globals
    post_set_gfx_mode: function () {
      ALLEG.bitmaps[0] = lallegts.screen;
      ALLEG.fonts[0] = lallegts.font;
      ALLEG.screen = ALLEG.alloc_pack_bitmap(0);
    },
    // Stores bitmap infomations in a C bitmap struct
    pack_bitmap: function (handle: number) {
      const addr = ALLEG.bitmap_addrs[handle];
      setValue(addr, handle, "i32");
      setValue(addr + 4, ALLEG.bitmaps[handle].w, "i32");
      setValue(addr + 8, ALLEG.bitmaps[handle].h, "i32");
    },
    // Allocates and packs a bitmap for C
    alloc_pack_bitmap: function (handle: number) {
      const res = _malloc(3 * 4);
      ALLEG.bitmap_addrs[handle] = res;
      ALLEG.pack_bitmap(handle);
      return res;
    },
    // Repacks every bitmaps (because bitmap loading is asynchronous) called by _ready
    repack_bitmaps: function (): void {
      for (let it = 1; it < ALLEG.bitmaps.length; it++) {
        ALLEG.pack_bitmap(it);
      }
    },
    // Returns the handle (array index for ALLEG.bitmaps) for the given bitmap struct pointed by `ptr`
    unpack_bitmap: function (ptr: number): number {
      return getValue(ptr, "i32");
    },
    // Helper which unpacks and gets a bitmap
    get_bitmap: function (ptr: number): lallegts.BITMAP {
      return ALLEG.bitmaps[ALLEG.unpack_bitmap(ptr)];
    },
  },

  // Bitmap.ts
  screen: function () {
    return ALLEG.screen;
  },
  create_bitmap: function (width: number, height: number) {
    return ALLEG.alloc_pack_bitmap(
      ALLEG.bitmaps.push(lallegts.create_bitmap(width, height)) - 1
    );
  },
  create_bitmap_ex: function (
    color_depth: number,
    width: number,
    height: number
  ) {
    return ALLEG.alloc_pack_bitmap(
      ALLEG.bitmaps.push(
        lallegts.create_bitmap_ex(color_depth, width, height)
      ) - 1
    );
  },
  create_sub_bitmap: function (
    parent: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const bmp = lallegts.create_sub_bitmap(
      ALLEG.get_bitmap(parent),
      x,
      y,
      width,
      height
    );

    if (!bmp) {
      return null;
    }

    return ALLEG.alloc_pack_bitmap(ALLEG.bitmaps.push(bmp) - 1);
  },
  create_video_bitmap: function (width: number, height: number) {
    return ALLEG.alloc_pack_bitmap(
      ALLEG.bitmaps.push(lallegts.create_video_bitmap(width, height)) - 1
    );
  },
  create_system_bitmap: function (width: number, height: number) {
    return ALLEG.alloc_pack_bitmap(
      ALLEG.bitmaps.push(lallegts.create_system_bitmap(width, height)) - 1
    );
  },
  destroy_bitmap: function (bmp: number) {
    return lallegts.destroy_bitmap(ALLEG.get_bitmap(bmp));
  },
  lock_bitmap: function (bitmap: number) {
    return lallegts.lock_bitmap(ALLEG.get_bitmap(bitmap));
  },
  bitmap_color_depth: function (bmp: number) {
    return lallegts.bitmap_color_depth(ALLEG.get_bitmap(bmp));
  },
  bitmap_mask_color: function (bmp: number) {
    return lallegts.bitmap_mask_color(ALLEG.get_bitmap(bmp));
  },
  is_same_bitmap: function (bmp1: number, bmp2: number) {
    return lallegts.is_same_bitmap(
      ALLEG.get_bitmap(bmp1),
      ALLEG.get_bitmap(bmp2)
    );
  },
  is_planar_bitmap: function (bmp: number) {
    return lallegts.is_planar_bitmap(ALLEG.get_bitmap(bmp));
  },
  is_linear_bitmap: function (bmp: number) {
    return lallegts.is_linear_bitmap(ALLEG.get_bitmap(bmp));
  },
  is_memory_bitmap: function (bmp: number) {
    return lallegts.is_memory_bitmap(ALLEG.get_bitmap(bmp));
  },
  is_screen_bitmap: function (bmp: number) {
    return lallegts.is_screen_bitmap(ALLEG.get_bitmap(bmp));
  },
  is_video_bitmap: function (bmp: number) {
    return lallegts.is_video_bitmap(ALLEG.get_bitmap(bmp));
  },
  is_system_bitmap: function (bmp: number) {
    return lallegts.is_system_bitmap(ALLEG.get_bitmap(bmp));
  },
  is_sub_bitmap: function (bmp: number) {
    return lallegts.is_sub_bitmap(ALLEG.get_bitmap(bmp));
  },
  acquire_bitmap: function (bmp: number) {
    return lallegts.acquire_bitmap(ALLEG.get_bitmap(bmp));
  },
  release_bitmap: function (bmp: number) {
    return lallegts.release_bitmap(ALLEG.get_bitmap(bmp));
  },
  acquire_screen: lallegts.acquire_screen,
  release_screen: lallegts.release_screen,
  set_clip_rect: function (
    bitmap: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    return lallegts.set_clip_rect(ALLEG.get_bitmap(bitmap), x1, y1, x2, y2);
  },
  get_clip_rect: function (bitmap: number) {
    return lallegts.get_clip_rect(ALLEG.get_bitmap(bitmap));
  },
  add_clip_rect: function (
    bitmap: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    return lallegts.add_clip_rect(ALLEG.get_bitmap(bitmap), x1, y1, x2, y2);
  },
  set_clip_state: function (bitmap: number, state: boolean) {
    return lallegts.set_clip_state(ALLEG.get_bitmap(bitmap), state);
  },
  get_clip_state: function (bitmap: number) {
    return lallegts.get_clip_state(ALLEG.get_bitmap(bitmap));
  },
  is_inside_bitmap: function (bmp: number, x: number, y: number, clip: number) {
    return lallegts.is_inside_bitmap(ALLEG.get_bitmap(bmp), x, y, clip);
  },
  load_bitmap: function (filename: number, pal: lallegts.RGB | undefined) {
    const filename_s = UTF8ToString(filename);
    return ALLEG.alloc_pack_bitmap(
      ALLEG.bitmaps.push(lallegts.load_bitmap(filename_s, pal)) - 1
    );
  },
  load_bmp: function (filename: number) {
    const filename_s = UTF8ToString(filename);
    return ALLEG.alloc_pack_bitmap(
      ALLEG.bitmaps.push(lallegts.load_bmp(filename_s)) - 1
    );
  },
  load_bmp_pf: function (f: any, pal: any) {
    return null;
    // return ALLEG.alloc_pack_bitmap(
    //   ALLEG.bitmaps.push(lallegts.load_bmp_pf(f, pal)) - 1
    // );
  },
  load_lbm: function (filename: number, pal: lallegts.RGB | undefined) {
    const filename_s = UTF8ToString(filename);
    return ALLEG.alloc_pack_bitmap(
      ALLEG.bitmaps.push(lallegts.load_lbm(filename_s, pal)) - 1
    );
  },
  load_pcx: function (filename: number, pal: lallegts.RGB | undefined) {
    const filename_s = UTF8ToString(filename);
    return ALLEG.alloc_pack_bitmap(
      ALLEG.bitmaps.push(lallegts.load_pcx(filename_s, pal)) - 1
    );
  },
  load_pcx_pf: function (f: any, pal: any) {
    return null;
    // return ALLEG.alloc_pack_bitmap(
    //   ALLEG.bitmaps.push(lallegts.load_pcx_pf(f, pal)) - 1
    // );
  },
  load_tga: function (filename: number, pal: lallegts.RGB | undefined) {
    const filename_s = UTF8ToString(filename);
    return ALLEG.alloc_pack_bitmap(
      ALLEG.bitmaps.push(lallegts.load_tga(filename_s, pal)) - 1
    );
  },
  load_tga_pf: function (f: any, pal: any) {
    return null;
    // return ALLEG.alloc_pack_bitmap(
    //   ALLEG.bitmaps.push(lallegts.load_tga_pf(f, pal)) - 1
    // );
  },
  save_bitmap: function (
    filename: number,
    bmp: number,
    pal: lallegts.RGB | undefined
  ) {
    const filename_s = UTF8ToString(filename);
    return lallegts.save_bitmap(filename_s, ALLEG.get_bitmap(bmp), pal);
  },
  save_bmp: function (
    filename: number,
    bmp: number,
    pal: lallegts.RGB | undefined
  ) {
    const filename_s = UTF8ToString(filename);
    return lallegts.save_bmp(filename_s, ALLEG.get_bitmap(bmp), pal);
  },
  save_bmp_pf: function (
    f: lallegts.PACKFILE,
    bmp: number,
    pal: lallegts.RGB | undefined
  ) {
    return lallegts.save_bmp_pf(f, ALLEG.get_bitmap(bmp), pal);
  },
  save_pcx: function (
    filename: number,
    bmp: number,
    pal: lallegts.RGB | undefined
  ) {
    const filename_s = UTF8ToString(filename);
    return lallegts.save_pcx(filename_s, ALLEG.get_bitmap(bmp), pal);
  },
  save_pcx_pf: function (
    f: lallegts.PACKFILE,
    bmp: number,
    pal: lallegts.RGB | undefined
  ) {
    return lallegts.save_pcx_pf(f, ALLEG.get_bitmap(bmp), pal);
  },
  save_tga: function (
    filename: number,
    bmp: number,
    pal: lallegts.RGB | undefined
  ) {
    const filename_s = UTF8ToString(filename);
    return lallegts.save_tga(filename_s, ALLEG.get_bitmap(bmp), pal);
  },
  save_tga_pf: function (
    f: lallegts.PACKFILE,
    bmp: number,
    pal: lallegts.RGB | undefined
  ) {
    return lallegts.save_tga_pf(f, ALLEG.get_bitmap(bmp), pal);
  },
  register_bitmap_file_type: function (
    ext: number,
    load: (
      filename: string,
      pal?: lallegts.RGB | undefined
    ) => lallegts.BITMAP | undefined,
    save: (filename: string, pal?: lallegts.RGB | undefined) => number
  ) {
    const ext_s = UTF8ToString(ext);
    return lallegts.register_bitmap_file_type(ext_s, load, save);
  },
  set_color_conversion: lallegts.set_color_conversion,
  loadpng_init: lallegts.loadpng_init,

  // Color.ts
  makecol8: lallegts.makecol8,
  makecol15: lallegts.makecol15,
  makecol16: lallegts.makecol16,
  makecol24: lallegts.makecol24,
  makecol32: lallegts.makecol32,
  makeacol32: lallegts.makeacol32,
  makecol: lallegts.makecol,
  makecol_depth: lallegts.makecol_depth,
  makeacol_depth: lallegts.makeacol_depth,
  makeacol: lallegts.makeacol,
  makecol15_dither: lallegts.makecol15_dither,
  getr8: lallegts.getr8,
  getr15: lallegts.getr15,
  getr16: lallegts.getr16,
  getr24: lallegts.getr24,
  getr32: lallegts.getr32,
  getg8: lallegts.getg8,
  getg15: lallegts.getg15,
  getg16: lallegts.getg16,
  getg24: lallegts.getg24,
  getg32: lallegts.getg32,
  getb8: lallegts.getb8,
  getb15: lallegts.getb15,
  getb16: lallegts.getb16,
  getb24: lallegts.getb24,
  getb32: lallegts.getb32,
  geta32: lallegts.geta32,
  getr: lallegts.getr,
  getg: lallegts.getg,
  getb: lallegts.getb,
  geta: lallegts.geta,
  getr_depth: lallegts.getr_depth,
  getg_depth: lallegts.getg_depth,
  getb_depth: lallegts.getb_depth,
  geta_depth: lallegts.geta_depth,

  // Config.ts
  install_allegro: lallegts.install_allegro,
  allegro_init: lallegts.allegro_init,
  allegro_exit: lallegts.allegro_exit,
  END_OF_MAIN: lallegts.END_OF_MAIN,
  allegro_id: function () {
    return lallegts.allegro_id;
  },
  allegro_error: function () {
    return lallegts.allegro_error;
  },
  ALLEGRO_VERSION: function () {
    return lallegts.ALLEGRO_VERSION;
  },
  ALLEGRO_SUB_VERSION: function () {
    return lallegts.ALLEGRO_SUB_VERSION;
  },
  ALLEGRO_WIP_VERSION: function () {
    return lallegts.ALLEGRO_WIP_VERSION;
  },
  ALLEGRO_VERSION_STR: function () {
    return lallegts.ALLEGRO_VERSION_STR;
  },
  ALLEGRO_DATE_STR: function () {
    return lallegts.ALLEGRO_DATE_STR;
  },
  ALLEGRO_DATE: function () {
    return lallegts.ALLEGRO_DATE;
  },
  AL_ID: function (a: number, b: number, c: number, d: number) {
    return lallegts.AL_ID(
      UTF8ToString(a),
      UTF8ToString(b),
      UTF8ToString(c),
      UTF8ToString(d)
    );
  },
  MAKE_VERSION: function (a: number, b: number, c: number) {
    return lallegts.MAKE_VERSION(
      UTF8ToString(a),
      UTF8ToString(b),
      UTF8ToString(c)
    );
  },
  os_type: function () {
    return lallegts.os_type;
  },
  os_version: function () {
    return lallegts.os_version;
  },
  os_multitasking: function () {
    return lallegts.os_multitasking;
  },
  _allegro_message: function (str: number) {
    lallegts.allegro_message(UTF8ToString(str));
  },
  set_window_title: function (name: number) {
    lallegts.set_window_title(UTF8ToString(name));
  },
  set_close_button_callback: lallegts.set_close_button_callback,
  desktop_color_depth: lallegts.desktop_color_depth,
  get_desktop_resolution: lallegts.get_desktop_resolution,
  check_cpu: lallegts.check_cpu,
  cpu_vendor: function () {
    return lallegts.cpu_vendor;
  },
  cpu_family: function () {
    return lallegts.cpu_family;
  },
  cpu_model: function () {
    return lallegts.cpu_model;
  },
  cpu_capabilities: function () {
    return lallegts.cpu_capabilities;
  },

  // Configuration.ts
  set_config_file: lallegts.set_config_file,
  set_config_data: lallegts.set_config_data,
  override_config_data: lallegts.override_config_data,
  push_config_state: lallegts.push_config_state,
  pop_config_state: lallegts.pop_config_state,
  flush_config_state: lallegts.flush_config_state,
  reload_config_texts: lallegts.reload_config_texts,
  hook_config_section: lallegts.hook_config_section,
  config_is_hooked: lallegts.config_is_hooked,
  get_config_string: lallegts.get_config_string,
  get_config_int: lallegts.get_config_int,
  get_config_hex: lallegts.get_config_hex,
  get_config_float: lallegts.get_config_float,
  get_config_id: lallegts.get_config_id,
  get_config_argv: lallegts.get_config_argv,
  get_config_text: lallegts.get_config_text,
  set_config_string: lallegts.set_config_string,
  set_config_int: lallegts.set_config_int,
  set_config_hex: lallegts.set_config_hex,
  set_config_float: lallegts.set_config_float,
  set_config_id: lallegts.set_config_id,
  list_config_entries: lallegts.list_config_entries,
  list_config_sections: lallegts.list_config_sections,
  free_config_entries: lallegts.free_config_entries,

  // Core.ts
  init_allegro_ts: function (canvas_id: number) {
    const cid_s = UTF8ToString(canvas_id);
    lallegts.init_allegro_ts(cid_s);
    ALLEG.post_set_gfx_mode();
  },
  loading_bar: lallegts.loading_bar,
  allegro_ready: function () {
    Asyncify.handleAsync(async () => {
      await lallegts.allegro_ready();
      ALLEG.repack_bitmaps();
    });
  },

  // Debug.ts
  enable_debug: function (debug_id: number) {
    lallegts.enable_debug(UTF8ToString(debug_id));
  },

  // Font.ts
  register_font_file_type: lallegts.register_font_file_type,
  load_font: function (filename: number) {
    const filename_s = UTF8ToString(filename);
    return ALLEG.fonts.push(lallegts.load_font(filename_s)) - 1;
  },
  destroy_font: function (f: number) {
    return lallegts.destroy_font(ALLEG.fonts[f]);
  },
  make_trans_font: lallegts.make_trans_font,
  is_color_font: function (f: number) {
    return lallegts.is_color_font(ALLEG.fonts[f]);
  },
  is_mono_font: function (f: number) {
    return lallegts.is_mono_font(ALLEG.fonts[f]);
  },
  is_compatible_font: function (f: number) {
    return lallegts.is_compatible_font(ALLEG.fonts[f]);
  },
  get_font_ranges: lallegts.get_font_ranges,
  get_font_range_begin: lallegts.get_font_range_begin,
  get_font_range_end: lallegts.get_font_range_end,
  extract_font_range: lallegts.extract_font_range,
  transpose_font: lallegts.transpose_font,
  merge_fonts: lallegts.merge_fonts,
  text_length: function (f: number, s: number) {
    return lallegts.text_length(ALLEG.fonts[f], UTF8ToString(s));
  },
  text_height: function (f: number) {
    return lallegts.text_height(ALLEG.fonts[f]);
  },
  textout_ex: function (
    bitmap: number,
    f: number,
    s: number,
    x: number,
    y: number,
    color: number,
    bg: number
  ) {
    const str = UTF8ToString(s);
    lallegts.textout_ex(
      ALLEG.get_bitmap(bitmap),
      ALLEG.fonts[f],
      str,
      x,
      y,
      color,
      bg
    );
  },
  textout_centre_ex: function (
    bitmap: number,
    f: number,
    s: number,
    x: number,
    y: number,
    color: number,
    bg: number
  ) {
    const str = UTF8ToString(s);
    lallegts.textout_centre_ex(
      ALLEG.get_bitmap(bitmap),
      ALLEG.fonts[f],
      str,
      x,
      y,
      color,
      bg
    );
  },
  textout_right_ex: function (
    bitmap: number,
    f: number,
    s: number,
    x: number,
    y: number,
    color: number,
    bg: number
  ) {
    const str = UTF8ToString(s);
    lallegts.textout_right_ex(
      ALLEG.get_bitmap(bitmap),
      ALLEG.fonts[f],
      str,
      x,
      y,
      color,
      bg
    );
  },
  textout_justify_ex: function (
    bitmap: number,
    f: number,
    s: number,
    x: number,
    y: number,
    color: number,
    bg: number
  ) {
    const str = UTF8ToString(s);
    lallegts.textout_justify_ex(
      ALLEG.get_bitmap(bitmap),
      ALLEG.fonts[f],
      str,
      x,
      y,
      color,
      bg
    );
  },
  _textprintf_ex: function (
    bitmap: number,
    f: number,
    x: number,
    y: number,
    color: number,
    bg: number,
    s: number
  ) {
    const str = UTF8ToString(s);
    lallegts.textprintf_ex(
      ALLEG.get_bitmap(bitmap),
      ALLEG.fonts[f],
      x,
      y,
      color,
      bg,
      str
    );
  },
  _textprintf_centre_ex: function (
    bitmap: number,
    f: number,
    x: number,
    y: number,
    color: number,
    bg: number,
    s: number
  ) {
    const str = UTF8ToString(s);
    lallegts.textprintf_centre_ex(
      ALLEG.get_bitmap(bitmap),
      ALLEG.fonts[f],
      x,
      y,
      color,
      bg,
      str
    );
  },
  _textprintf_right_ex: function (
    bitmap: number,
    f: number,
    x: number,
    y: number,
    color: number,
    bg: number,
    s: number
  ) {
    const str = UTF8ToString(s);
    lallegts.textprintf_right_ex(
      ALLEG.get_bitmap(bitmap),
      ALLEG.fonts[f],
      x,
      y,
      color,
      bg,
      str
    );
  },
  _textprintf_justify_ex: function (
    bitmap: number,
    f: number,
    x: number,
    y: number,
    color: number,
    bg: number,
    s: number
  ) {
    const str = UTF8ToString(s);
    lallegts.textprintf_justify_ex(
      ALLEG.get_bitmap(bitmap),
      ALLEG.fonts[f],
      x,
      y,
      color,
      bg,
      str
    );
  },

  // Graphics.ts
  gfx_driver: function () {
    return lallegts.gfx_driver;
  },
  SCREEN_W: function () {
    return lallegts.SCREEN_W;
  },
  SCREEN_H: function () {
    return lallegts.SCREEN_H;
  },
  set_color_depth: lallegts.set_color_depth,
  get_color_depth: lallegts.get_color_depth,
  request_refresh_rate: lallegts.request_refresh_rate,
  get_refresh_rate: lallegts.get_refresh_rate,
  get_gfx_mode_list: lallegts.get_gfx_mode_list,
  destroy_gfx_mode_list: lallegts.destroy_gfx_mode_list,
  set_gfx_mode: function (
    card: number,
    w: number,
    h: number,
    v_w: number | undefined,
    v_h: number | undefined
  ) {
    lallegts.set_gfx_mode(card, w, h, v_w, v_h);
    ALLEG.post_set_gfx_mode();
  },
  gfx_capabilities: function () {
    return lallegts.gfx_capabilities;
  },
  set_display_switch_mode: lallegts.set_display_switch_mode,
  set_display_switch_callback: lallegts.set_display_switch_callback,
  remove_display_switch_callback: lallegts.remove_display_switch_callback,
  get_display_switch_mode: lallegts.get_display_switch_mode,
  is_windowed_mode: lallegts.is_windowed_mode,
  enable_triple_buffer: lallegts.enable_triple_buffer,
  scroll_screen: lallegts.scroll_screen,
  request_scroll: lallegts.request_scroll,
  poll_scroll: lallegts.poll_scroll,
  show_video_bitmap: function (bmp: number) {
    lallegts.show_video_bitmap(ALLEG.get_bitmap(bmp));
  },
  request_video_bitmap: lallegts.request_video_bitmap,
  vsync: lallegts.vsync,
  font: function () {
    return 0;
  },

  // Keyboard.ts
  install_keyboard_hooks: lallegts.install_keyboard_hooks,
  poll_keyboard: lallegts.poll_keyboard,
  keyboard_needs_poll: lallegts.keyboard_needs_poll,
  keypressed: lallegts.keypressed,
  readkey: function () {
    return Asyncify.handleAsync(async () => {
      return await lallegts.readkey();
    });
  },
  ureadkey: lallegts.ureadkey,
  scancode_to_ascii: lallegts.scancode_to_ascii,
  scancode_to_name: lallegts.scancode_to_name,
  simulate_keypress: lallegts.simulate_keypress,
  simulate_ukeypress: lallegts.simulate_ukeypress,
  keyboard_callback: lallegts.keyboard_callback,
  keyboard_ucallback: lallegts.keyboard_ucallback,
  keyboard_lowlevel_callback: lallegts.keyboard_lowlevel_callback,
  set_leds: lallegts.set_leds,
  set_keyboard_rate: lallegts.set_keyboard_rate,
  clear_keybuf: lallegts.clear_keybuf,

  key: function () {
    ALLEG.copy_key_statuses();
    return ALLEG.key;
  },
  install_keyboard: function () {
    lallegts.install_keyboard();
    ALLEG.post_install_keyboard();
  },
  remove_keyboard: function () {
    lallegts.remove_keyboard();
    ALLEG.post_remove_keyboard();
  },

  // Mouse.ts
  install_mouse: lallegts.install_mouse,
  remove_mouse: lallegts.remove_mouse,
  poll_mouse: lallegts.poll_mouse,
  mouse_needs_poll: lallegts.mouse_needs_poll,
  enable_hardware_cursor: lallegts.enable_hardware_cursor,
  disable_hardware_cursor: lallegts.disable_hardware_cursor,
  select_mouse_cursor: lallegts.select_mouse_cursor,
  set_mouse_cursor_bitmap: lallegts.set_mouse_cursor_bitmap,
  show_mouse: function (bmp: number) {
    lallegts.show_mouse(ALLEG.get_bitmap(bmp));
  },
  scare_mouse: lallegts.scare_mouse,
  scare_mouse_area: lallegts.scare_mouse_area,
  show_os_cursor: lallegts.show_os_cursor,
  position_mouse: lallegts.position_mouse,
  position_mouse_z: lallegts.position_mouse_z,
  set_mouse_range: lallegts.set_mouse_range,
  set_mouse_speed: lallegts.set_mouse_speed,
  set_mouse_sprite: lallegts.set_mouse_sprite,
  set_mouse_sprite_focus: lallegts.set_mouse_sprite_focus,
  get_mouse_mickeys: lallegts.get_mouse_mickeys,
  mouse_callback: lallegts.mouse_callback,
  mouse_x: function () {
    return lallegts.mouse_x;
  },
  mouse_y: function () {
    return lallegts.mouse_y;
  },
  mouse_z: function () {
    return lallegts.mouse_z;
  },
  mouse_w: function () {
    return lallegts.mouse_w;
  },
  mouse_b: function () {
    return lallegts.mouse_b;
  },

  // Palette.ts
  set_palette: function (pal: lallegts.RGB | lallegts.PALETTE) {
    lallegts.set_palette(pal);
  },

  // Primitives.ts
  clear_bitmap: function (bitmap: number) {
    lallegts.clear_bitmap(ALLEG.get_bitmap(bitmap));
  },
  clear_to_color: function (bitmap: number, color: number) {
    lallegts.clear_to_color(ALLEG.get_bitmap(bitmap), color);
  },
  putpixel: function (bmp: number, x: number, y: number, c: number) {
    lallegts.putpixel(ALLEG.get_bitmap(bmp), x, y, c);
  },
  _putpixel: function (bmp: number, x: number, y: number, c: number) {
    lallegts._putpixel(ALLEG.get_bitmap(bmp), x, y, c);
  },
  _putpixel15: function (bmp: number, x: number, y: number, c: number) {
    lallegts._putpixel15(ALLEG.get_bitmap(bmp), x, y, c);
  },
  _putpixel16: function (bmp: number, x: number, y: number, c: number) {
    lallegts._putpixel16(ALLEG.get_bitmap(bmp), x, y, c);
  },
  _putpixel24: function (bmp: number, x: number, y: number, c: number) {
    lallegts._putpixel24(ALLEG.get_bitmap(bmp), x, y, c);
  },
  _putpixel32: function (bmp: number, x: number, y: number, c: number) {
    lallegts._putpixel32(ALLEG.get_bitmap(bmp), x, y, c);
  },
  getpixel: function (bitmap: number, x: number, y: number) {
    return lallegts.getpixel(ALLEG.get_bitmap(bitmap), x, y);
  },
  _getpixel: function (bitmap: number, x: number, y: number) {
    return lallegts._getpixel(ALLEG.get_bitmap(bitmap), x, y);
  },
  _getpixel15: function (bitmap: number, x: number, y: number) {
    return lallegts._getpixel(ALLEG.get_bitmap(bitmap), x, y);
  },
  _getpixel16: function (bitmap: number, x: number, y: number) {
    return lallegts._getpixel(ALLEG.get_bitmap(bitmap), x, y);
  },
  _getpixel24: function (bitmap: number, x: number, y: number) {
    return lallegts._getpixel(ALLEG.get_bitmap(bitmap), x, y);
  },
  _getpixel32: function (bitmap: number, x: number, y: number) {
    return lallegts._getpixel(ALLEG.get_bitmap(bitmap), x, y);
  },
  vline: function (
    bitmap: number,
    x: number,
    y1: number,
    y2: number,
    color: number
  ) {
    lallegts.vline(ALLEG.get_bitmap(bitmap), x, y1, y2, color);
  },
  hline: function (
    bitmap: number,
    x1: number,
    y: number,
    x2: number,
    color: number
  ) {
    lallegts.hline(ALLEG.get_bitmap(bitmap), x1, y, x2, color);
  },
  line: function (
    bitmap: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number
  ) {
    lallegts.line(ALLEG.get_bitmap(bitmap), x1, y1, x2, y2, color);
  },
  fastline: function (
    bitmap: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number
  ) {
    lallegts.fastline(ALLEG.get_bitmap(bitmap), x1, y1, x2, y2, color);
  },
  triangle: function (
    bitmap: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    color: number
  ) {
    lallegts.triangle(ALLEG.get_bitmap(bitmap), x1, y1, x2, y2, x3, y3, color);
  },
  polygon: function (
    bitmap: number,
    vertices: number,
    points: number,
    color: number
  ) {
    const points_arr = ALLEG.readArray32FromMemory(points, vertices * 2);
    lallegts.polygon(ALLEG.get_bitmap(bitmap), vertices, points_arr, color);
  },
  rect: function (
    bitmap: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number
  ) {
    lallegts.rect(ALLEG.get_bitmap(bitmap), x1, y1, x2, y2, color);
  },
  rectfill: function (
    bitmap: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number
  ) {
    lallegts.rectfill(ALLEG.get_bitmap(bitmap), x1, y1, x2, y2, color);
  },
  circle: function (
    bitmap: number,
    x: number,
    y: number,
    radius: number,
    color: number
  ) {
    lallegts.circle(ALLEG.get_bitmap(bitmap), x, y, radius, color);
  },
  circlefill: function (
    bitmap: number,
    x: number,
    y: number,
    radius: number,
    color: number
  ) {
    lallegts.circlefill(ALLEG.get_bitmap(bitmap), x, y, radius, color);
  },
  ellipse: function (
    bitmap: number,
    x: number,
    y: number,
    rx: number,
    ry: number,
    color: number
  ) {
    lallegts.ellipse(ALLEG.get_bitmap(bitmap), x, y, rx, ry, color);
  },
  ellipsefill: function (
    bitmap: number,
    x: number,
    y: number,
    rx: number,
    ry: number,
    color: number
  ) {
    lallegts.ellipsefill(ALLEG.get_bitmap(bitmap), x, y, rx, ry, color);
  },
  arc: function (
    bitmap: number,
    x: number,
    y: number,
    ang1: number,
    ang2: number,
    radius: number,
    color: number
  ) {
    lallegts.arc(ALLEG.get_bitmap(bitmap), x, y, ang1, ang2, radius, color);
  },
  spline: function (bitmap: number, points: number, color: number) {
    const points_arr = ALLEG.readArray32FromMemory(points, 8);
    lallegts.spline(ALLEG.get_bitmap(bitmap), points_arr, color);
  },
  floodfill: function (bmp: number, x: number, y: number, color: number) {
    lallegts.floodfill(ALLEG.get_bitmap(bmp), x, y, color);
  },

  // Sample.ts
  digi_driver: function () {
    return lallegts.digi_driver;
  },
  install_sound: lallegts.install_sound,
  set_volume: lallegts.set_volume,
  get_volume: lallegts.get_volume,
  load_sample: function (filename: number) {
    return Asyncify.handleAsync(async () => {
      const filename_s = UTF8ToString(filename);
      const sample = await lallegts.load_sample(filename_s);
      const index = ALLEG.samples.push(sample) - 1;
      return index;
    });
  },
  destroy_sample: function (sample: number) {
    lallegts.destroy_sample(ALLEG.samples[sample]);
  },
  play_sample: function (
    sample: number,
    vol: number | undefined,
    pan: number | undefined,
    freq: number | undefined,
    loop: boolean | undefined
  ) {
    lallegts.play_sample(ALLEG.samples[sample], vol, pan, freq, loop);
  },
  adjust_sample: function (
    sample: number,
    vol: number,
    pan: number,
    freq: number,
    loop: boolean
  ) {
    lallegts.adjust_sample(ALLEG.samples[sample], vol, pan, freq, loop);
  },
  stop_sample: function (sample: number) {
    lallegts.stop_sample(ALLEG.samples[sample]);
  },

  // Sprites.ts
  draw_sprite_h_flip: function (
    bmp: number,
    sprite: number,
    x: number,
    y: number
  ) {
    lallegts.draw_sprite_h_flip(
      ALLEG.get_bitmap(bmp),
      ALLEG.get_bitmap(sprite),
      x,
      y
    );
  },
  stretch_sprite: function (
    bmp: number,
    sprite: number,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    lallegts.stretch_sprite(
      ALLEG.get_bitmap(bmp),
      ALLEG.get_bitmap(sprite),
      x,
      y,
      w,
      h
    );
  },
  draw_sprite: function (bmp: number, sprite: number, x: number, y: number) {
    lallegts.draw_sprite(ALLEG.get_bitmap(bmp), ALLEG.get_bitmap(sprite), x, y);
  },
  rotate_sprite: function (
    bmp: number,
    sprite: number,
    x: number,
    y: number,
    angle: number
  ) {
    lallegts.rotate_sprite(
      ALLEG.get_bitmap(bmp),
      ALLEG.get_bitmap(sprite),
      x,
      y,
      angle
    );
  },
  pivot_sprite: function (
    bmp: number,
    sprite: number,
    x: number,
    y: number,
    cx: number,
    cy: number,
    angle: number
  ) {
    lallegts.pivot_sprite(
      ALLEG.get_bitmap(bmp),
      ALLEG.get_bitmap(sprite),
      x,
      y,
      cx,
      cy,
      angle
    );
  },
  rotate_scaled_sprite: function (
    bmp: number,
    sprite: number,
    x: number,
    y: number,
    angle: number,
    scale: number
  ) {
    lallegts.rotate_scaled_sprite(
      ALLEG.get_bitmap(bmp),
      ALLEG.get_bitmap(sprite),
      x,
      y,
      angle,
      scale
    );
  },
  pivot_scaled_sprite: function (
    bmp: number,
    sprite: number,
    x: number,
    y: number,
    cx: number,
    cy: number,
    angle: number,
    scale: number
  ) {
    lallegts.pivot_scaled_sprite(
      ALLEG.get_bitmap(bmp),
      ALLEG.get_bitmap(sprite),
      x,
      y,
      cx,
      cy,
      angle,
      scale
    );
  },
  blit: function (
    source: number,
    dest: number,
    sx: number,
    sy: number,
    dx: number,
    dy: number,
    w: number,
    h: number
  ) {
    lallegts.blit(
      ALLEG.get_bitmap(source),
      ALLEG.get_bitmap(dest),
      sx,
      sy,
      dx,
      dy,
      w,
      h
    );
  },
  stretch_blit: function (
    source: number,
    dest: number,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ) {
    lallegts.stretch_blit(
      ALLEG.get_bitmap(source),
      ALLEG.get_bitmap(dest),
      sx,
      sy,
      sw,
      sh,
      dx,
      dy,
      dw,
      dh
    );
  },

  // Timer.ts
  install_timer: lallegts.install_timer,
  install_int: function (p: () => void, msec: number) {
    const procedure = () => {
      const stack = stackSave();
      dynCall("v", p, null);
      stackRestore(stack);
    };
    lallegts.install_int(procedure, msec);
  },
  install_int_ex: function (p: () => void, speed: number) {
    const procedure = () => {
      const stack = stackSave();
      dynCall("v", p, null);
      stackRestore(stack);
    };
    lallegts.install_int_ex(procedure, speed);
  },
  remove_int: function (p: any) {
    // FIXME: how is this supposed to work!?
  },
  rest: function (time: number) {
    Asyncify.handleAsync(async () => {
      await lallegts.rest(time);
    });
  },
  retrace_count: function () {
    return lallegts.retrace_count;
  },
};

autoAddDeps(AllegroJS, "$ALLEG");

mergeInto(LibraryManager.library, AllegroJS);
