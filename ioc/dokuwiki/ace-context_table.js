define(function() {
  return function(spec) {
    var new_cell, new_row, new_table, parse_row, parse_table;
    new_cell = function(spec) {
      var text, update_layout;
      text = function() {
        return spec.content.replace(/^\ +/, '').replace(/\ +$/, '');
      };
      update_layout = function(layout, offset) {
        var i, min_length, padding, space, target_length, _i, _j, _k, _name, _ref, _ref1, _ref2;
        padding = (function() {
          switch (spec.align) {
            case 'left':
              return {
                left: 1,
                right: 1
              };
            case 'center':
              return {
                left: 2,
                right: 2
              };
            case 'right':
              return {
                left: 2,
                right: 1
              };
          }
        })();
        min_length = text().length + spec.colspan + padding.left + padding.right;
        target_length = 0;
        for (i = _i = 0, _ref = spec.colspan; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          layout[_name = offset + i] || (layout[_name] = 0);
          target_length += layout[offset + i];
        }
        if (min_length < target_length) {
          space = target_length - min_length;
          switch (spec.align) {
            case 'left':
              padding.right += space;
              break;
            case 'right':
              padding.left += space;
              break;
            case 'center':
              padding.left += Math.floor(space / 2);
              padding.right += Math.ceil(space / 2);
          }
        } else {
          space = min_length - target_length;
          for (i = _j = 0, _ref1 = spec.colspan; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            layout[offset + i] += Math.floor(space / spec.colspan);
          }
          for (i = _k = 0, _ref2 = space % space.colspan; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
            layout[offset + i] += 1;
          }
        }
        return padding;
      };
      return {
        cursor_position: function() {
          return 1 + Math.max(1, spec.content.replace(/\ +$/, '').length);
        },
        colspan: function() {
          return spec.colspan;
        },
        format: function(layout, offset, pass) {
          var padding, space;
          if (pass >= 2 || spec.colspan === 1) {
            padding = update_layout(layout, offset);
          }
          if (pass >= 3) {
            space = function(n) {
              return new Array(n + 1).join(' ');
            };
            return spec.content = space(padding.left) + text() + space(padding.right);
          }
        },
        is_header: function() {
          return spec.is_header;
        },
        length: function() {
          return 1 + spec.content.length;
        },
        toggle_header: function() {
          return spec.is_header = !spec.is_header;
        },
        set_align: function(value) {
          return spec.align = value;
        },
        value: function() {
          var sep;
          sep = spec.is_header ? '^' : '|';
          return sep + spec.content + new Array(spec.colspan).join(sep);
        }
      };
    };
    new_row = function(cells) {
      var columns;
      columns = function() {
        var iterator;
        iterator = function(memo, cell) {
          return memo + cell.colspan();
        };
        return _.reduce(cells, iterator, 0);
      };
      return {
        align_cell: function(index, align) {
          return cells[index].set_align(align);
        },
        columns: columns,
        cursor_position: function(index) {
          var iterator;
          iterator = function(memo, cell) {
            return memo + cell.length();
          };
          return _.reduce(cells.slice(0, index), iterator, cells[index].cursor_position());
        },
        cursor_cell: function(column) {
          var cell, i, length, _i, _len;
          length = 0;
          for (i = _i = 0, _len = cells.length; _i < _len; i = ++_i) {
            cell = cells[i];
            length += cell.length();
            if (column < length) {
              return i;
            }
          }
          return cells.length - 1;
        },
        fill: function(n_columns) {
          var i, _i, _ref, _ref1, _results;
          _results = [];
          for (i = _i = _ref = columns(); _ref <= n_columns ? _i < n_columns : _i > n_columns; i = _ref <= n_columns ? ++_i : --_i) {
            _results.push(cells.push(new_cell({
              align: 'left',
              colspan: 1,
              content: '  ',
              is_header: (_ref1 = _.last(cells)) != null ? _ref1.is_header() : void 0
            })));
          }
          return _results;
        },
        format: function(layout, pass) {
          var cell, offset, _i, _len, _results;
          offset = 0;
          _results = [];
          for (_i = 0, _len = cells.length; _i < _len; _i++) {
            cell = cells[_i];
            cell.format(layout, offset, pass);
            _results.push(offset += cell.colspan());
          }
          return _results;
        },
        length: function() {
          return cells.length;
        },
        move_cell_left: function(index) {
          var _ref, _ref1;
          if ((1 <= index && index < cells.length)) {
            return ([].splice.apply(cells, [(_ref = index - 1), index - _ref + 1].concat(_ref1 = cells.slice(index - 1, +index + 1 || 9e9).reverse())), _ref1);
          }
        },
        move_cell_right: function(index) {
          var _ref;
          if ((0 <= index && index < cells.length - 1)) {
            return ([].splice.apply(cells, [index, (index + 1) - index + 1].concat(_ref = cells.slice(index, +(index + 1) + 1 || 9e9).reverse())), _ref);
          }
        },
        remove_cell: function(index) {
          return cells.splice(index, 1);
        },
        toggle_header: function(index) {
          return cells[index].toggle_header();
        },
        value: function() {
          var cell, last_sep;
          last_sep = _.last(cells).is_header() ? '^' : '|';
          return ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = cells.length; _i < _len; _i++) {
              cell = cells[_i];
              _results.push(cell.value());
            }
            return _results;
          })()).join('') + last_sep;
        }
      };
    };
    new_table = function(rows, start_row, end_row, cursor_pos) {
      var cursor_cell, cursor_position, cursor_row, format, has_colspans, normalize, update;
      cursor_row = cursor_pos.row - start_row;
      cursor_cell = rows[cursor_row].cursor_cell(cursor_pos.column);
      cursor_position = function() {
        return {
          row: start_row + cursor_row,
          column: rows[cursor_row].cursor_position(cursor_cell)
        };
      };
      format = function() {
        var layout, pass, row, _i, _j, _len;
        layout = [];
        normalize();
        for (pass = _i = 1; _i <= 3; pass = ++_i) {
          for (_j = 0, _len = rows.length; _j < _len; _j++) {
            row = rows[_j];
            row.format(layout, pass);
          }
        }
        return update();
      };
      has_colspans = function() {
        return _.any(rows, function(row) {
          return row.length() !== row.columns();
        });
      };
      normalize = function() {
        var columns, iterator, row, _i, _len;
        iterator = function(memo, row) {
          return Math.max(memo, row.columns());
        };
        columns = _.reduce(rows, iterator, 0);
        for (_i = 0, _len = rows.length; _i < _len; _i++) {
          row = rows[_i];
          row.fill(columns);
        }
        return cursor_cell = Math.min(cursor_cell, rows[cursor_row].length() - 1);
      };
      update = function() {
        var lines, row;
        lines = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = rows.length; _i < _len; _i++) {
            row = rows[_i];
            _results.push(row.value());
          }
          return _results;
        })();
        spec.ace.replace_lines(start_row, end_row, lines);
        return spec.ace.navigate(cursor_position());
      };
      return {
        align_cell: function(align) {
          rows[cursor_row].align_cell(cursor_cell, align);
          return format();
        },
        move_column_left: function() {
          var row, _i, _len;
          normalize();
          if (!has_colspans() && cursor_cell > 0) {
            for (_i = 0, _len = rows.length; _i < _len; _i++) {
              row = rows[_i];
              row.move_cell_left(cursor_cell);
            }
            cursor_cell -= 1;
          }
          return format();
        },
        move_column_right: function() {
          var row, _i, _len;
          normalize();
          if (!has_colspans() && cursor_cell < rows[cursor_row].length() - 1) {
            for (_i = 0, _len = rows.length; _i < _len; _i++) {
              row = rows[_i];
              row.move_cell_right(cursor_cell);
            }
            cursor_cell += 1;
          }
          return format();
        },
        next_cell: function() {
          cursor_cell += 1;
          if (cursor_cell === rows[cursor_row].length()) {
            cursor_cell = 0;
            cursor_row += 1;
            if (cursor_row === rows.length) {
              rows.push(new_row([]));
            }
          }
          return format();
        },
        next_row: function() {
          cursor_row += 1;
          if (cursor_row === rows.length) {
            rows.push(new_row([]));
          }
          return format();
        },
        previous_cell: function() {
          if (cursor_cell > 0) {
            cursor_cell -= 1;
          } else if (cursor_row > 0) {
            cursor_row -= 1;
            cursor_cell = Infinity;
          }
          return format();
        },
        previous_row: function() {
          if (cursor_row > 0) {
            cursor_row -= 1;
          }
          return format();
        },
        remove_column: function() {
          var row, _i, _len;
          normalize();
          if (!has_colspans() && rows[0].length() > 1) {
            for (_i = 0, _len = rows.length; _i < _len; _i++) {
              row = rows[_i];
              row.remove_cell(cursor_cell);
            }
          }
          return format();
        },
        toggle_header: function() {
          rows[cursor_row].toggle_header(cursor_cell);
          return format();
        }
      };
    };
    parse_row = function(row) {
      var align, cells, colspan, content, contents, index, is_header, line, separators, state, text, word, words, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4;
      line = spec.ace.get_line(row);
      if (!/^[\||\^].*[\||\^][ \t]*$/.test(line)) {
        return;
      }
      cells = [];
      contents = [];
      separators = [];
      _ref = spec.ace.get_line_states(row);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        state = _ref[_i];
        text = line.slice(state.start, state.end);
        if ((_ref1 = state.name) === 'start' || _ref1 === 'table-start') {
          words = text.split(/([\^\|]+)/);
          if (words[0]) {
            contents.push(contents.pop() + words[0]);
          }
          _ref2 = words.slice(2);
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j += 2) {
            word = _ref2[_j];
            contents.push(word);
          }
          _ref3 = words.slice(1);
          for (_k = 0, _len2 = _ref3.length; _k < _len2; _k += 2) {
            word = _ref3[_k];
            separators.push(word);
          }
        } else {
          contents.push((contents.pop() || '') + text);
        }
      }
      if (separators.length === 0) {
        return;
      }
      for (index = _l = 0, _ref4 = contents.length - 1; 0 <= _ref4 ? _l < _ref4 : _l > _ref4; index = 0 <= _ref4 ? ++_l : --_l) {
        content = contents[index];
        is_header = _.last(separators[index]) === '^';
        colspan = separators[index + 1].length;
        align = !/^  +[^ ]/.test(content) ? 'left' : /[^ ]  +$/.test(content) ? 'center' : 'right';
        cells.push(new_cell({
          align: align,
          colspan: colspan,
          content: content,
          is_header: is_header
        }));
      }
      return new_row(cells);
    };
    parse_table = function() {
      var end_row, i, pos, row, rows, start_row, _i, _j, _ref, _ref1, _ref2;
      pos = spec.ace.cursor_position();
      start_row = pos.row;
      end_row = pos.row;
      rows = [];
      row = parse_row(pos.row);
      if (!row) {
        return;
      }
      rows.push(row);
      for (i = _i = _ref = pos.row - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
        row = parse_row(i);
        if (!row) {
          break;
        }
        rows.push(row);
        start_row = i;
      }
      rows.reverse();
      for (i = _j = _ref1 = pos.row + 1, _ref2 = spec.ace.get_length(); _ref1 <= _ref2 ? _j < _ref2 : _j > _ref2; i = _ref1 <= _ref2 ? ++_j : --_j) {
        row = parse_row(i);
        if (!row) {
          break;
        }
        rows.push(row);
        end_row = i;
      }
      return new_table(rows, start_row, end_row, pos);
    };
    return {
      commands: {
        alt_left: function(table) {
          return table.move_column_left();
        },
        alt_right: function(table) {
          return table.move_column_right();
        },
        ctrl_shift_d: function(table) {
          return table.remove_column();
        },
        menu_c: function(table) {
          return table.align_cell('center');
        },
        menu_l: function(table) {
          return table.align_cell('left');
        },
        menu_r: function(table) {
          return table.align_cell('right');
        },
        menu_t: function(table) {
          return table.toggle_header();
        },
        "return": function(table) {
          return table.next_row();
        },
        shift_return: function(table) {
          return table.previous_row();
        },
        shift_tab: function(table) {
          return table.previous_cell();
        },
        tab: function(table) {
          return table.next_cell();
        }
      },
      menu: [
        {
          key: 't',
          label: 'Toggle type'
        }, {
          key: 'l',
          label: 'Align to left'
        }, {
          key: 'c',
          label: 'Align to center'
        }, {
          key: 'r',
          label: 'Align to right'
        }
      ],
      name: 'table',
      parse: parse_table
    };
  };
});

