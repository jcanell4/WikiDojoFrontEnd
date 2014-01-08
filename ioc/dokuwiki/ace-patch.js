var __slice = [].slice;

define(function() {
  return function(spec) {
    var doku_get_selection, doku_selection_class, doku_set_selection, doku_submit_handler, patch, patching, textarea;
    patching = false;
    textarea = document.getElementById('wiki__text');
    patch = function(name, func) {
      var obj, orig_func;
      obj = (typeof dw_editor !== "undefined" && dw_editor !== null ? dw_editor[name] : void 0) != null ? dw_editor : window;
      orig_func = obj[name];
      obj[name] = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return func.call.apply(func, [this, orig_func].concat(__slice.call(args)));
      };
      return orig_func;
    };
    patch('currentHeadlineLevel', function(func, id) {
      if (id === textarea.id) {
        jQuery(textarea).val(spec.get_value());
      }
      return func(id);
    });
    doku_get_selection = patch('getSelection', function(func, obj) {
      var result, selection;
      if (patching && obj === textarea) {
        jQuery(textarea).val(spec.get_value());
        result = spec.get_selection();
        selection = new selection_class();
        selection.obj = textarea;
        selection.start = result.start;
        selection.end = result.end;
        return selection;
      } else {
        return func(obj);
      }
    });
    patch('pasteText', function(func, selection, text, opts) {
      if (opts == null) {
        opts = {};
      }
      if (patching && selection.obj === textarea) {
        spec.paste_text(selection.start, selection.end, text);
        selection.end = selection.start + text.length - (opts.endofs || 0);
        selection.start += opts.startofs || 0;
        if (opts.nosel) {
          selection.start = selection.end;
        }
        return spec.set_selection(selection.start, selection.end);
      } else {
        return func(selection, text, opts);
      }
    });
    doku_selection_class = patch('selection_class', function(func) {
      func.apply(this);
      this.doku_get_text = this.getText;
      this.getText = function() {
        if (patching && this.obj === textarea) {
          return spec.get_text(this.start, this.end);
        } else {
          return this.doku_get_text();
        }
      };
      return null;
    });
    doku_set_selection = patch('setSelection', function(func, selection) {
      if (patching && selection.obj === textarea) {
        return spec.set_selection(selection.start, selection.end);
      } else {
        return func(selection);
      }
    });
    patch('setWrap', function(func, obj, value) {
      func(obj, value);
      if (obj === textarea) {
        return spec.set_wrap(value !== 'off');
      }
    });
    patch('sizeCtl', function(func, obj, value) {
      var id;
      func(obj, value);
      id = (typeof obj.attr === "function" ? obj.attr('id') : void 0) || obj;
      if (patching && id === textarea.id) {
        return spec.size_ctl(value);
      }
    });
    doku_submit_handler = textarea.form.onsubmit;
    jQuery(textarea.form).submit(function(event) {
      if (patching) {
        return jQuery(textarea).val(spec.get_value());
      }
    });
    return jQuery(window).resize(function(event) {
      if (patching) {
        return spec.on_resize();
      }
    });
  };
});

define(['ace-wrapper', 'ace-commands', 'ace-container', 'ace-doku_wrapper', 'ace-preview', 'ace-toggle', 'underscore'], function() {
  var ace, container, deps, disable, doku, enable, init, new_ace, new_commands, new_container, new_doku, new_preview, new_toggle, toggle, user_editing;
  deps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  new_ace = deps[0], new_commands = deps[1], new_container = deps[2], new_doku = deps[3], new_preview = deps[4], new_toggle = deps[5];
  ace = container = doku = toggle = null;
  user_editing = false;
  disable = function() {
    var selection;
    selection = ace.get_selection();
    user_editing = false;
    doku.set_cookie('aceeditor', 'off');
    container.hide();
    toggle.off();
    doku.enable();
    doku.set_value(ace.get_value());
    doku.set_selection(selection.start, selection.end);
    return doku.focus();
  };
  enable = function() {
    var selection;
    selection = doku.get_selection();
    doku.disable();
    container.set_height(doku.inner_height());
    container.show();
    toggle.on();
    ace.set_value(doku.get_value());
    ace.resize();
    ace.focus();
    ace.set_selection(selection.start, selection.end);
    user_editing = true;
    return doku.set_cookie('aceeditor', 'on');
  };
  init = function() {
    var commands, preview;
    if (/MSIE [0-8]\./.test(navigator.userAgent)) {
      return;
    }
    if (!(window.JSINFO && document.getElementById('wiki__text'))) {
      return;
    }
    doku = new_doku({
      get_selection: function() {
        return ace.get_selection();
      },
      get_text: function(start, end) {
        return ace.get_value().substring(start, end);
      },
      get_value: function() {
        return ace.get_value();
      },
      paste_text: function(start, end, text) {
        ace.replace(start, end, text);
        ace.set_selection(start, end);
        return ace.focus();
      },
      on_resize: function() {
        container.on_resize();
        return ace.resize();
      },
      set_selection: function(start, end) {
        ace.set_selection(start, end);
        return ace.focus();
      },
      set_wrap: function(value) {
        ace.set_wrap_mode(value);
        return ace.focus();
      },
      size_ctl: function(value) {
        container.incr_height(value);
        ace.resize();
        return ace.focus();
      }
    });
    container = new_container();
    toggle = new_toggle({
      on_enable: enable,
      on_disable: disable
    });
    ace = new_ace({
      colortheme: JSINFO.plugin_aceeditor.colortheme,
      element: container.element(),
      latex: JSINFO.plugin_aceeditor.latex,
      markdown: JSINFO.plugin_aceeditor.markdown,
      mdpage: JSINFO.plugin_aceeditor.mdpage,
      on_cursor_change: function() {
        preview.trigger();
        return commands.hide_menu();
      },
      on_document_change: function() {
        if (user_editing) {
          doku.text_changed();
          preview.trigger();
          return commands.hide_menu();
        }
      },
      readonly: doku.get_readonly(),
      wraplimit: JSINFO.plugin_aceeditor.wraplimit,
      wrapmode: doku.get_wrap(),
      xmltags: JSINFO.plugin_aceeditor.xmltags
    });
    preview = new_preview({
      ace: ace
    });
    commands = new_commands({
      ace: ace
    });
    if (doku.get_cookie('aceeditor') != null) {
      if (doku.get_cookie('aceeditor') !== 'off') {
        return enable();
      }
    } else {
      if (JSINFO.plugin_aceeditor["default"]) {
        return enable();
      }
    }
  };
  return typeof jQuery === "function" ? jQuery(document).ready(function() {
    return _.defer(init);
  }) : void 0;
});

