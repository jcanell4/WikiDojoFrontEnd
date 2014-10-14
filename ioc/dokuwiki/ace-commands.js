define([
    'ioc/dokuwiki/ace-context_table'
], function(new_context_table) {
    return function(spec) {
        var add_menu_marker, callback, contexts, hide_menu, menu_marker, show_menu;
        contexts = [
            new_context_table({
                 ace: spec.ace
            })
        ];
        menu_marker = null;
        add_menu_marker = function(context) {
              var pos;
              pos = spec.ace.cursor_position();
              return menu_marker = spec.ace.add_marker({
                    start_row: pos.row,
                    start_column: pos.column,
                    end_row: pos.row,
                    end_column: pos.column + 1,
                    klass: 'menu',
                    on_render: function(spec) {
                          var attributes, item, items, style, vertical_pos;
                          vertical_pos = spec.top > spec.screen_height - spec.bottom ? "bottom: " 
                                            + (spec.container_height - spec.top) + "px;" : "top: " + spec.bottom + "px;";
                          style = "position: absolute; left: " + spec.left + "px; " + vertical_pos;
                          attributes = "class=\"ace_menu\" style=\"" + style + "\"";
                          items = (function() {
                                var _i, _len, _ref, _results;
                                _ref = context.menu;
                                _results = [];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                      item = _ref[_i];
                                      _results.push("<div><strong>" + item.key + "</strong> " + item.label + "</div>");
                                }
                                return _results;
                          })();
                          return "<div " + attributes + ">" + (items.join('')) + "</div>";
                    }
            });
        };
        callback = function(name, fallback) {
              return function() {
                var context, data, exec, platform, _base, _i, _len;
                for (_i = 0, _len = contexts.length; _i < _len; _i++) {
                      context = contexts[_i];
                      if (data = context.parse()) {
                        if (typeof (_base = context.commands)[name] === "function") {
                              _base[name](data);
                        }               
                        hide_menu();
                        return;
                    }
                }
                if (fallback) {
                      platform = spec.ace.platform();
                      exec = fallback[platform] || fallback;
                      return typeof exec === "function" ? exec() : void 0;
                }
          };
      };
      hide_menu = function() {
            if (menu_marker) {
              spec.ace.remove_marker(menu_marker);
            }
            return menu_marker = null;
      };
     show_menu = function() {
          var context, _i, _len;
          hide_menu();
      for (_i = 0, _len = contexts.length; _i < _len; _i++) {
        context = contexts[_i];
        if (context.parse()) {
          add_menu_marker(context);
          return;
        }
      }
    };
    spec.ace.add_command({
      name: 'doku-alt-left',
      key_win: 'Alt-Left',
      key_mac: 'Option-Left',
      exec: callback('alt_left', {
        win: spec.ace.navigate_line_start,
        mac: spec.ace.navigate_word_left
      })
    });
    spec.ace.add_command({
      name: 'doku-alt-right',
      key_win: 'Alt-Right',
      key_mac: 'Option-Right',
      exec: callback('alt_right', {
        win: spec.ace.navigate_line_end,
        mac: spec.ace.navigate_word_right
      })
    });
    spec.ace.add_command({
      name: 'doku-ctrl-shift-d',
      key_win: 'Ctrl-Shift-D',
      key_mac: 'Command-Shift-D',
      exec: callback('ctrl_shift_d', spec.ace.duplicate_selection)
    });
    spec.ace.add_command({
      name: 'doku-hide-menu',
      exec: hide_menu
    });
    spec.ace.add_command({
      name: 'doku-menu',
      exec: show_menu
    });
    spec.ace.add_command({
      name: 'doku-menu-c',
      exec: callback('menu_c')
    });
    spec.ace.add_command({
      name: 'doku-menu-l',
      exec: callback('menu_l')
    });
    spec.ace.add_command({
      name: 'doku-menu-r',
      exec: callback('menu_r')
    });
    spec.ace.add_command({
      name: 'doku-menu-t',
      exec: callback('menu_t')
    });
    spec.ace.add_command({
      name: 'doku-return',
      key_win: 'Return',
      key_mac: 'Return',
      exec: callback('return', function() {
        return spec.ace.insert('\n');
      })
    });
    spec.ace.add_command({
      name: 'doku-shift-return',
      key_win: 'Shift-Return',
      key_mac: 'Shift-Return',
      exec: callback('shift_return', function() {
        return spec.ace.insert('\n');
      })
    });
    spec.ace.add_command({
      name: 'doku-shift-tab',
      key_win: 'Shift-Tab',
      key_mac: 'Shift-Tab',
      exec: callback('shift_tab', spec.ace.outdent)
    });
    spec.ace.add_command({
      name: 'doku-tab',
      key_win: 'Tab',
      key_mac: 'Tab',
      exec: callback('tab', spec.ace.indent)
    });
    spec.ace.set_keyboard_states({
      'start': [
        {
          key: 'ctrl-space',
          exec: 'doku-menu',
          then: 'doku-menu'
        }
      ],
      'doku-menu': [
        {
          key: 'ctrl-space',
          exec: 'doku-menu'
        }, {
          key: 'esc',
          exec: 'doku-hide-menu',
          next: 'start'
        }, {
          key: 'c',
          exec: 'doku-menu-c',
          then: 'start'
        }, {
          key: 'l',
          exec: 'doku-menu-l',
          then: 'start'
        }, {
          key: 'r',
          exec: 'doku-menu-r',
          then: 'start'
        }, {
          key: 't',
          exec: 'doku-menu-t',
          then: 'start'
        }, {
          then: 'start'
        }
      ]
    });
    return {
      hide_menu: hide_menu
    };
  };
});

