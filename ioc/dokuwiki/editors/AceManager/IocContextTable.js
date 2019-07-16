define([
    "dojo/Stateful",
    "dojo/_base/declare",
], function (Stateful, declare) {
    return declare([Stateful],
        /**
         * @class IocContextTable
         */
        {
            editor: null,

            constructor: function (aceWrapper) {
                this.aceWrapper = aceWrapper;
            },

            /**
             * @param args
             * @returns {{cursor_position: Function, colspan: Function, format: Function, is_header: Function, length: Function, toggle_header: Function, set_align: Function, value: Function}}
             * @private
             */
            new_cell: function (args) {
                var text = function () {
                        return args.content.replace(/^\ +/, '').replace(/\ +$/, '');
                    },

                    update_layout = function (layout, offset) {
                        var padding = (function () {
                                switch (args.align) {
                                    case 'left':
                                        return {
                                            left:  1,
                                            right: 1
                                        };
                                    case 'center':
                                        return {
                                            left:  2,
                                            right: 2
                                        };
                                    case 'right':
                                        return {
                                            left:  2,
                                            right: 1
                                        };
                                }
                            })(),

                            min_length = text().length + args.colspan + padding.left + padding.right,

                            target_length = 0,

                            space,

                            name;


                        for (var i = 0, len = args.colspan; 0 <= len ? i < len : i > len; 0 <= len ? ++i : --i) {
                            layout[name = offset + i] || (layout[name] = 0);
                            target_length += layout[offset + i];
                        }

                        if (min_length < target_length) {
                            space = target_length - min_length;
                            switch (args.align) {
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

                            for (i = 0, len = args.colspan; 0 <= len ? i < len : i > len; 0 <= len ? ++i : --i) {
                                layout[offset + i] += Math.floor(space / args.colspan);
                            }

                            for (i = 0, len = space % space.colspan; 0 <= len ? i < len : i > len; 0 <= len ? ++i : --i) {
                                layout[offset + i] += 1;
                            }
                        }

                        return padding;
                    };

                return {
                    cursor_position: function () {
                        return 1 + Math.max(1, args.content.replace(/\ +$/, '').length);
                    },

                    colspan: function () {
                        return args.colspan;
                    },

                    format: function (layout, offset, pass) {
                        var padding, space;
                        if (pass >= 2 || args.colspan === 1) {
                            padding = update_layout(layout, offset);
                        }
                        if (pass >= 3) {
                            space = function (n) {
                                return new Array(n + 1).join(' ');
                            };
                            return args.content = space(padding.left) + text() + space(padding.right);
                        }
                    },

                    is_header: function () {
                        return args.is_header;
                    },

                    length: function () {
                        return 1 + args.content.length;
                    },

                    toggle_header: function () {
                        return args.is_header = !args.is_header;
                    },

                    set_align: function (value) {
                        return args.align = value;
                    },

                    value: function () {
                        var sep;
                        sep = args.is_header ? '^' : '|';
                        return sep + args.content + new Array(args.colspan).join(sep);
                    },

                    is_multiline: function () {
                        return args.is_multiline;
                    },
                };
            },

            /**
             *
             * @param cells
             * @returns {{align_cell: Function, columns: Function, cursor_position: Function, cursor_cell: Function, fill: Function, format: Function, length: Function, move_cell_left: Function, move_cell_right: Function, remove_cell: Function, toggle_header: Function, value: Function}}
             * @private
             */
            new_row: function (cells) {
                var columns = function () {
                        var iterator = function (memo, cell) {
                            return memo + cell.colspan();
                        };
                        return _.reduce(cells, iterator, 0);
                    },

                    self = this;

                return {
                    is_multiline: function() {
                      return cells[0].is_multiline();
                    },

                    align_cell: function (index, align) {
                        return cells[index].set_align(align);
                    },

                    columns: columns,

                    cursor_position: function (index) {
                        var iterator = function (memo, cell) {
                            return memo + cell.length();
                        };
                        return _.reduce(cells.slice(0, index), iterator, cells[index].cursor_position());
                    },

                    cursor_cell: function (column) {
                        var cell, length = 0;

                        for (var i = 0, len = cells.length; i < len; ++i) {
                            cell = cells[i];
                            length += cell.length();
                            if (column < length) {
                                return i;
                            }
                        }

                        return cells.length - 1;
                    },

                    fill: function (n_columns) {
                        var i,
                            ref = columns(),
                            aux,
                            results = [];

                        for (i = ref; ref <= n_columns ? i < n_columns : i > n_columns; ref <= n_columns ? ++i : --i) {

                            results.push(cells.push(self.new_cell({
                                align:     'left',
                                colspan:   1,
                                content:   '  ',
                                is_header: (aux = _.last(cells)) != null ? aux.is_header() : void 0
                            })));
                        }
                        return results;
                    },

                    format: function (layout, pass) {
                        var cell,
                            offset = 0,
                            results = [];

                        for (var i = 0, len = cells.length; i < len; i++) {
                            cell = cells[i];
                            cell.format(layout, offset, pass);
                            results.push(offset += cell.colspan());
                        }
                        return results;
                    },

                    length: function () {
                        return cells.length;
                    },

                    move_cell_left: function (index) {
                        var ref1, ref2;
                        if ((1 <= index && index < cells.length)) {
                            return ([].splice.apply(cells, [(ref1 = index - 1), index - ref1 + 1].concat(ref2 = cells.slice(index - 1, +index + 1 || 9e9).reverse())), ref2);
                        }
                    },

                    move_cell_right: function (index) {
                        var ref;
                        if ((0 <= index && index < cells.length - 1)) {
                            return ([].splice.apply(cells, [index, (index + 1) - index + 1].concat(ref = cells.slice(index, +(index + 1) + 1 || 9e9).reverse())), ref);
                        }
                    },

                    remove_cell: function (index) {
                        return cells.splice(index, 1);
                    },

                    toggle_header: function (index) {
                        return cells[index].toggle_header();
                    },

                    value: function () {
                        var cell,
                            last_sep = _.last(cells).is_header() ? '^' : '|';

                        return ((function () {
                            var results = [];

                            for (var i = 0, len = cells.length; i < len; i++) {
                                cell = cells[i];
                                results.push(cell.value());
                            }

                            return results;
                        })()).join('') + last_sep;
                    }
                };
            },

            /**
             * @param rows
             * @param start_row
             * @param end_row
             * @param cursor_pos
             * @returns {{align_cell: Function, move_column_left: Function, move_column_right: Function, next_cell: Function, next_row: Function, previous_cell: Function, previous_row: Function, remove_column: Function, toggle_header: Function}}
             * @private
             */
            new_table: function (rows, start_row, end_row, cursor_pos) {
                var self = this,

                    cursor_row = cursor_pos.row - start_row,

                    cursor_cell = rows[cursor_row].cursor_cell(cursor_pos.column),

                    format = function () {
                        var layout = [],
                            row;

                        normalize();

                        for (var i = 1; i <= 3; ++i) {
                            for (var j = 0, len = rows.length; j < len; j++) {
                                row = rows[j];
                                row.format(layout, i);
                            }
                        }

                        return update();
                    },


                    has_colspans = function () {
                        return _.any(rows, function (row) {
                            return row.length() !== row.columns();
                        });
                    },

                    normalize = function () {
                        var iterator = function (memo, row) {
                                return Math.max(memo, row.columns());
                            },

                            columns = _.reduce(rows, iterator, 0),

                            row;

                        for (var i = 0, len = rows.length; i < len; i++) {
                            row = rows[i];
                            row.fill(columns);
                        }

                        cursor_cell = Math.min(cursor_cell, rows[cursor_row].length() - 1);
                    },

                    update = function () {
                        var lines = (function () {
                            var results = [],
                                row;

                            for (var i = 0, len = rows.length; i < len; i++) {
                                row = rows[i];
                                results.push(row.value());
                            }

                            return results;
                        })();

                        // Només cal comprovar la primera fila, si és multilinia tota la taula ho és
                        var is_multiline = rows[0].is_multiline();

                        if (is_multiline) {
                            lines[0] = '[' + lines[0];
                            lines[lines.length-1] = lines[lines.length-1] + ']';
                        }



                        self.aceWrapper.replace_lines(start_row, end_row, lines);

                        return self.aceWrapper.navigate(cursor_position());
                    },

                    cursor_position = function () {
                        return {
                            row: start_row + cursor_row,
                            column: rows[cursor_row].cursor_position(cursor_cell)
                        };
                    };

                return {
                    align_cell: function (align) {
                        rows[cursor_row].align_cell(cursor_cell, align);
                        return format();
                    },

                    move_column_left: function () {
                        var row;

                        normalize();

                        if (!has_colspans() && cursor_cell > 0) {
                            for (var i = 0, len = rows.length; i < len; i++) {
                                row = rows[i];
                                row.move_cell_left(cursor_cell);
                            }
                            cursor_cell -= 1;
                        }

                        return format();
                    },

                    move_column_right: function () {
                        var row;

                        normalize();

                        if (!has_colspans() && cursor_cell < rows[cursor_row].length() - 1) {
                            for (var i = 0, len = rows.length; i < len; i++) {
                                row = rows[i];
                                row.move_cell_right(cursor_cell);
                            }
                            ++cursor_cell;
                        }

                        return format();
                    },

                    next_cell: function () {
                        cursor_cell += 1;

                        if (cursor_cell === rows[cursor_row].length()) {
                            cursor_cell = 0;
                            ++cursor_row;

                            if (cursor_row === rows.length) {
                                rows.push(self.new_row([]));
                            }
                        }

                        return format();
                    },

                    next_row: function () {
                        ++cursor_row;

                        if (cursor_row === rows.length) {
                            rows.push(self.new_row([]));
                        }

                        return format();
                    },

                    previous_cell: function () {
                        if (cursor_cell > 0) {
                            --cursor_cell;
                        } else if (cursor_row > 0) {
                            --cursor_row;
                            cursor_cell = Infinity;
                        }

                        return format();
                    },

                    previous_row: function () {
                        if (cursor_row > 0) {
                            --cursor_row;
                        }

                        return format();
                    },

                    remove_column: function () {
                        var row;

                        normalize();

                        if (!has_colspans() && rows[0].length() > 1) {
                            for (var i = 0, len = rows.length; i < len; i++) {
                                row = rows[i];
                                row.remove_cell(cursor_cell);
                            }
                        }

                        return format();
                    },

                    toggle_header: function () {
                        rows[cursor_row].toggle_header(cursor_cell);
                        return format();
                    }
                };

            },

            /**
             *
             * Els separadores son | i ^, s'han de fer servir al principi de la fila, al final, i per separarar les
             * cel·les, en cas contrari no es considera una fila vàlida.
             *
             * ^ es fa servir per les capçaleras
             * | es fa servir per les cel·les normals
             *
             * @param row
             * @returns {*}
             * @private
             */
            parse_row: function (row) {
                var align,

                    cells = [],

                    contents = [],

                    separators = [],

                    colspan,

                    content,

                    index,

                    is_header,

                    line = this.aceWrapper.get_line(row),

                    lineStates = this.aceWrapper.get_line_states(row),

                    state,

                    text,

                    word,

                    words,

                    auxWords;


                if (!/^[\[|\||\^].*[\]|\||\^][ \t]*$/.test(line)) {
                    return;
                }

                var is_multiline = false;

                if (line.indexOf('[') === 0) {
                    line = line.substr(1);
                    is_multiline = true;
                } else if (line.indexOf(']') === line.length - 1) {
                    line = line.substr(0, line.length-1);
                    is_multiline = true;
                }

                for (var i = 0, len = lineStates.length; i < len; i++) {

                    state = lineStates[i];

                    text = line.slice(state.start, state.end);

                    if (state.name === 'start' || state.name.indexOf('table-start')>-1) {
                        words = text.split(/(\[?[\^\|]+)/);


                        if (words[0]) {
                            contents.push(contents.pop() + words[0]);
                        }

                        auxWords = words.slice(2);
                        for (var j = 0, len2 = auxWords.length; j < len2; j += 2) {
                            word = auxWords[j];
                            contents.push(word);
                        }

                        auxWords = words.slice(1);
                        for (var k = 0, len3 = auxWords.length; k < len3; k += 2) {
                            word = auxWords[k];
                            separators.push(word);
                        }


                    } else {
                        contents.push((contents.pop() || '') + text);
                    }
                }


                if (separators.length === 0) {
                    return;
                }

                // ALERTA[Xavi] Això es un fix per alguns casos
                if (contents[0]==="") {
                    contents.shift();
                }

                for (i = 0, len = contents.length - 1; 0 <= len ? i < len : i > len; 0 <= len ? ++i : --i) {
                    content = contents[i];
                    is_header = _.last(separators[i]) === '^';

                    if (content.indexOf('^') === 0 || content.indexOf('|') === 0) {
                        // això passa en alguns casos, no es separa correctament
                        separators.push(separators[0]); // Afegim un separador del mateix tipus
                        content = content.substr(1);
                    }

                    if (separators.length < i+1) {
                        colspan = separators[i + 1].length;
                    } else {
                        colspan = separators[i].length;
                    }

                    align = !/^  +[^ ]/.test(content) ? 'left' : /[^ ]  +$/.test(content) ? 'center' : 'right';

                    cells.push(this.new_cell(
                        {
                            align:     align,
                            colspan:   colspan,
                            content:   content,
                            is_header: is_header,
                            is_multiline: is_multiline,
                        }
                    ));
                }

                return this.new_row(cells);
            },

            /**
             *
             * @returns {*}
             * @private
             */
            parse_table: function () {
                var
                    pos = this.aceWrapper.cursor_position(),
                    rows = [],
                    start_row = pos.row,
                    end_row = pos.row,
                    row = this.parse_row(pos.row),
                    start,
                    len;

                if (!row) {
                    return;
                }

                rows.push(row);

                for (var i = len = pos.row - 1; len <= 0 ? i <= 0 : i >= 0; len <= 0 ? ++i : --i) {
                    row = this.parse_row(i);

                    if (!row) {
                        break;
                    }

                    rows.push(row);
                    start_row = i;
                }

                rows.reverse();

                for (i = start = pos.row + 1, len = this.aceWrapper.get_length(); start <= len ? i < len : i > len; start <= len ? ++i : --i) {

                    row = this.parse_row(i);

                    if (!row) {
                        break;
                    }

                    rows.push(row);
                    end_row = i;
                }

                return this.new_table(rows, start_row, end_row, pos);
            },

            commands: {
                alt_left:     function (table) {
                    return table.move_column_left();
                },
                alt_right:    function (table) {
                    return table.move_column_right();
                },
                ctrl_shift_d: function (table) {
                    return table.remove_column();
                },
                menu_c:       function (table) {
                    return table.align_cell('center');
                },
                menu_l:       function (table) {
                    return table.align_cell('left');
                },
                menu_r:       function (table) {
                    return table.align_cell('right');
                },
                menu_t:       function (table) {
                    return table.toggle_header();
                },
                "return":     function (table) {
                    return table.next_row();
                },
                shift_return: function (table) {
                    return table.previous_row();
                },
                shift_tab:    function (table) {
                    return table.previous_cell();
                },
                tab:          function (table) {
                    return table.next_cell();
                }
            },

            menu: [
                {
                    key:   't',
                    label: 'Toggle type'
                }, {
                    key:   'l',
                    label: 'Align to left'
                }, {
                    key:   'c',
                    label: 'Align to center'
                }, {
                    key:   'r',
                    label: 'Align to right'
                },
                {// TODO: Esborrar, només per fer proves
                    key:   'ñ',
                    label: 'test'
                }
            ],

            name: 'table',

            parse: function () {
                return this.parse_table()
            }

        })
});