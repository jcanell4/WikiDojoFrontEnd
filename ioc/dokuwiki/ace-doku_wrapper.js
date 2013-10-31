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
    jQuery(window).resize(function(event) {
      if (patching) {
        return spec.on_resize();
      }
    });
    return {
      disable: function() {
        patching = true;
        return jQuery(textarea).hide();
      },
      enable: function() {
        patching = false;
        return jQuery(textarea).show();
      },
      focus: function() {
        return jQuery(textarea).focus();
      },
      get_cookie: function(name) {
        return DokuCookie.getValue(name);
      },
      get_readonly: function() {
        return jQuery(textarea).attr('readonly');
      },
      get_selection: function() {
        var selection;
        selection = doku_get_selection(textarea);
        return {
          start: selection.start,
          end: selection.end
        };
      },
      get_value: function() {
        return jQuery(textarea).val();
      },
      get_wrap: function() {
        return jQuery(textarea).attr('wrap') !== 'off';
      },
      inner_height: function() {
        return jQuery(textarea).innerHeight();
      },
      set_cookie: function(name, value) {
        return DokuCookie.setValue(name, value);
      },
      set_selection: function(start, end) {
        var selection;
        selection = new doku_selection_class();
        selection.obj = textarea;
        selection.start = start;
        selection.end = end;
        return doku_set_selection(selection);
      },
      set_value: function(value) {
        return jQuery(textarea).val(value);
      },
      text_changed: function() {
        window.textChanged = true;
        return summaryCheck();
      }
    };
  };
});

