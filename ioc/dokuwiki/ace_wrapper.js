var __slice = [].slice;

define([
      'ace/editor'
    , 'ace/keyboard/state_handler'
    , 'ace/lib/fixoldbrowsers'
    , 'ace/mode/markdown'
    , 'ace/range'
    , 'ace/theme/textmate'
    , 'ace/undomanager'
    , 'ace/virtual_renderer'
    , 'cs!mode'
    , 'require'], function() {
          var deps;
          deps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return function(spec) {
            var Editor, Range, StateHandler, UndoManager, VirtualRenderer, editor, fixoldbrowsers, getLineStates, markdown
            , new_mode, offset_to_pos, pos_to_offset, require, session, theme, _ref, _ref1, _ref2, _ref3, _ref4;
            (_ref = deps[0], Editor = _ref.Editor), 
            (_ref1 = deps[1], StateHandler = _ref1.StateHandler), 
            fixoldbrowsers = deps[2], markdown = deps[3], 
            (_ref2 = deps[4], Range = _ref2.Range), 
            theme = deps[5], 
            (_ref3 = deps[6], 
            UndoManager = _ref3.UndoManager), 
            (_ref4 = deps[7], 
            VirtualRenderer = _ref4.VirtualRenderer), 
            new_mode = deps[8], 
            require = deps[9];

            editor = null;
            session = null;
            offset_to_pos = function(offset) {
                  var row, row_length, _i, _ref5;
                  for (row = _i = 0, _ref5 = session.getLength(); 0 <= _ref5 ? _i < _ref5 : _i > _ref5; row = 0 <= _ref5 ? ++_i : --_i) {
                        row_length = session.getLine(row).length + 1;
                        if (offset < row_length) {
                                  break;
                        }
                        offset -= row_length;
                  }
                  return {
                    row: row,
                    column: offset
                  };
            };

            pos_to_offset = function(pos) {
                  var iterator, _i, _ref5, _results;
                  iterator = function(memo, row) {
                        return memo + session.getLine(row).length + 1;
                  };
                  return _.reduce((function() {
                        _results = [];
                        for (var _i = 0, _ref5 = pos.row; 0 <= _ref5 ? _i < _ref5 : _i > _ref5; 0 <= _ref5 ? _i++ : _i--){
                             _results.push(_i); 
                        }
                        return _results;
                  }).apply(this), iterator, pos.column);
            };
            getLineStates = function(line, startState) {
                  var currentState, i, lastIndex, mapping, match, re, rule, state, states, _i, _ref5;
                  currentState = startState;
                  state = this.rules[currentState];
                  mapping = this.matchMappings[currentState];
                  re = this.regExps[currentState];
                  re.lastIndex = lastIndex = 0;
                  states = [
                        {
                              start: 0,
                              name: startState
                        }
                  ];
                  while (match = re.exec(line)) {
                        for (i = _i = 0, _ref5 = match.length - 2; _i < _ref5; i = _i += 1) {
                              if (match[i + 1] != null) {
                                    rule = state[mapping[i].rule];
                                    if (rule.next && rule.next !== currentState) {
                                          currentState = rule.next;
                                          state = this.rules[currentState];
                                          mapping = this.matchMappings[currentState];
                                          lastIndex = re.lastIndex;
                                          re = this.regExps[currentState];
                                          re.lastIndex = lastIndex;
                                          _.last(states).end = lastIndex;
                                          states.push({
                                                start: lastIndex,
                                                name: currentState
                                          });
                                    }
                                    break;
                              }
                        }
                        if (lastIndex === line.length) {
                              break;
                        }
                        lastIndex = re.lastIndex;
                  }
                  _.last(states).end = lastIndex;
                  return states;
            };
            (function() {
                  var renderer;
                  renderer = new VirtualRenderer(spec.element, theme);
                  require(["ace/theme/" + spec.colortheme], function(theme) {
                          return renderer.setTheme(theme);
                  });
                  editor = new Editor(renderer);
                  editor.setReadOnly(spec.readonly);
                  session = editor.getSession();
                  session.setUndoManager(new UndoManager());
                  session.setTabSize(2);
                  if (spec.markdown && spec.mdpage) {
                        session.setMode(new markdown.Mode);
                  } else {
                        session.setMode(new_mode({
                              latex: spec.latex,
                              markdown: spec.markdown,
                              xmltags: spec.xmltags
                        }));
                  }
                  editor.setShowPrintMargin(spec.wrapmode);
                  session.setUseWrapMode(spec.wrapmode);
                  session.setWrapLimitRange(null, spec.wraplimit);
                  editor.setPrintMarginColumn(spec.wraplimit);
                  renderer.setHScrollBarAlwaysVisible(false);
                  session.on('change', function() {
                        if (!spec.readonly) {
                            return spec.on_document_change();
                        }
                  });
                  return editor.getSelection().on('changeCursor', function() {
                        return spec.on_cursor_change();
                  });
            })();
            return {
                  add_command: function(spec) {
                  return editor.commands.addCommand({
                      name: spec.name,
                      exec: function(env, args, request) {
                            return spec.exec();
                      },
                      bindKey: {
                          win: spec.key_win || null,
                          mac: spec.key_mac || null,
                          sender: 'editor'
                      }
                  });
            },
            add_marker: function(spec) {
                  var range, renderer;
                  range = new Range(spec.start_row, spec.start_column, spec.end_row, spec.end_column);
                  renderer = function(html, range, left, top, config) {
                      var column;
                      column = range.start.row === range.end.row ? range.start.column : 0;
                      return html.push(spec.on_render({
                            left: Math.round(column * config.characterWidth),
                            top: (range.start.row - config.firstRowScreen) * config.lineHeight,
                            bottom: (range.end.row - config.firstRowScreen + 1) * config.lineHeight,
                            screen_height: config.height,
                            screen_width: config.width,
                            container_height: config.minHeight
                      }));
                  };
                 return session.addMarker(range, spec.klass, renderer, true);
            },
            cursor_coordinates: function() {
                var pos, screen;
                pos = editor.getCursorPosition();
                screen = editor.renderer.textToScreenCoordinates(pos.row, pos.column);
                return {
                      x: Math.round(screen.pageX),
                      y: Math.round(screen.pageY + editor.renderer.lineHeight / 2)
                };
            },
            cursor_position: function() {
                return editor.getCursorPosition();
            },
            duplicate_selection: function() {
                return editor.duplicateSelection();
            },
            focus: function() {
                return editor.focus();
            },
            get_length: function() {
                return session.getLength();
            },
            get_line: function(row) {
                return session.getLine(row);
            },
            get_line_states: function(row) {
                var line, state;
                state = row > 0 ? session.getState(row - 1) : 'start';
                line = session.getLine(row);
                return getLineStates.call(session.getMode().getTokenizer(), line, state);
            },
            get_selection: function() {
                var range;
                range = editor.getSelection().getRange();
                return {
                      start: pos_to_offset(range.start),
                      end: pos_to_offset(range.end)
                };
            },
            get_text_range: function(start, end) {
                var range;
                range = new Range(start.row, start.column, end.row, end.column);
                return session.getTextRange(range);
            },
            get_value: function() {
                return session.getValue();
            },
            indent: function() {
                return editor.indent();
            },
            insert: function(text) {
                return editor.insert(text);
            },
            navigate: function(position) {
                return editor.navigateTo(position.row, position.column);
            },
            navigate_line_end: function() {
                return editor.navigateLineEnd();
            },
            navigate_line_start: function() {
                return editor.navigateLineStart();
            },
            navigate_word_left: function() {
                return editor.navigateWordLeft();
            },
            navigate_word_right: function() {
                return editor.navigateWordRight();
            },
            outdent: function() {
                return editor.blockOutdent();
            },
            platform: function() {
                return editor.commands.platform;
            },
            remove_marker: function(marker_id) {
                return session.removeMarker(marker_id);
            },
            replace: function(start, end, text) {
                  var range;
                  range = Range.fromPoints(offset_to_pos(start), offset_to_pos(end));
                  return session.replace(range, text);
            },
            replace_lines: function(start, end, lines) {
                  var doc, doc_length, i, min_length, _i;
                  doc = session.getDocument();
                  doc_length = end - start + 1;
                  min_length = Math.min(doc_length, lines.length);
                  for (i = _i = 0; 0 <= min_length ? _i < min_length : _i > min_length; i = 0 <= min_length ? ++_i : --_i) {
                      if (doc.getLine(start + i) !== lines[i]) {
                            doc.removeInLine(start + i, 0, Infinity);
                            doc.insertInLine({
                                row: start + i,
                                column: 0
                            }, lines[i]);
                      } 
                 }
                 if (doc_length > lines.length) {
                  doc.removeLines(start + lines.length, end);
                }
                if (doc_length < lines.length) {
                  return doc.insertLines(end + 1, lines.slice(doc_length));
                }
            },
            resize: function() {
                return editor.resize();
            },
            set_keyboard_states: function(states) {
                  return editor.setKeyboardHandler(new StateHandler(states));
            },
            set_selection: function(start, end) {
                var range;
                range = Range.fromPoints(offset_to_pos(start), offset_to_pos(end));
                return editor.getSelection().setSelectionRange(range);
            },
            set_value: function(value) {
                return session.setValue(value);
            },
            set_wrap_mode: function(value) {
                editor.setShowPrintMargin(value);
                return session.setUseWrapMode(value);
            }
        };
  };
});
