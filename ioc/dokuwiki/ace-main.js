var __slice = [].slice;
define([
     'ioc/dokuwiki/ace-loader'
    ,'ioc/dokuwiki/ace-wrapper'
    ,'ioc/dokuwiki/ace-commands'
    ,'ioc/dokuwiki/ace-container'
    ,'ioc/dokuwiki/ace-doku_wrapper'
    ,'ioc/dokuwiki/ace-preview'
    ,'ioc/dokuwiki/ace-toggle'
    ,'ioc/dokuwiki/underscore'
], function() {
  var ace, container, deps, disable, doku, enable, init, new_ace, new_commands, new_container, new_doku, new_preview, new_toggle, toggle, user_editing;
  deps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  new_ace = deps[1], new_commands = deps[2], new_container = deps[3], new_doku = deps[4], new_preview = deps[5], new_toggle = deps[6];
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
//  return typeof jQuery === "function" ? jQuery(document).ready(function() {
//    return _.defer(init);
//  }) : void 0;
  return init;
});

