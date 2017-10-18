define(function() {
  return function(spec) {
    var marker, states_iterator, update;
    marker = null;
    states_iterator = function(pos, backwards, test) {
      var index, row, states;
      index = row = states = null;
      return function() {
        var i, state, _i, _len;
        if (index == null) {
          row = pos.row;
          states = spec.ace.get_line_states_preview(row, true);
          for (i = _i = 0, _len = states.length; _i < _len; i = ++_i) {
            state = states[i];
            index = i;
            if (pos.column <= state.end) {
              break;
            }
          }
        } else if (backwards && index > 0) {
          index -= 1;
        } else if (!backwards && index + 1 < states.length) {
          index += 1;
        } else if (backwards && row > 0) {
          row -= 1;
          states = spec.ace.get_line_states_preview(row, true);
          index = states.length - 1;
        } else if (!backwards && row + 1 < spec.ace.get_length()) {
          row += 1;
          states = spec.ace.get_line_states_preview(row, true);
          index = 0;
        } else {
          return;
        }

        states[index].row = row;
        if (test(states[index])) {
          return states[index];
        }
      };
    };
    update = function() {
      var end, end_state, it, pos, start, start_state, state, text, url;
      pos = spec.ace.cursor_position();
      it = states_iterator(pos, false, function(state) {
        return /\blatex\b/.test(state.name);
      });
      while (state = it()) {
        end_state = state;
      }
      it = states_iterator(pos, true, function(state) {
        return /\blatex\b/.test(state.name);
      });
      while (state = it()) {
        start_state = state;
      }

      if (!(start_state && end_state)) {
        return;
      }
      start = {
        row: start_state.row,
        column: start_state.start
      };
      end = {
        row: end_state.row,
        column: end_state.end
      };
      text = spec.ace.get_text_range(start, end);


      console.log(text);

      url = DOKU_BASE + 'lib/plugins/aceeditor/preview.php';


      return jQuery.getJSON(url, {
        text: text
      }, function(data) {
        spec.ace.remove_marker(marker);
        if (!data) {
          return;
        }
        return marker = spec.ace.add_marker({
          start_row: start.row,
          start_column: start.column,
          end_row: end.row,
          end_column: end.column,
          klass: 'preview',
          on_render: function(spec) {
            var attributes, style, vertical_pos;
            vertical_pos = spec.top > spec.screen_height - spec.bottom ? "bottom: " + (spec.container_height - spec.top) + "px;" : "top: " + spec.bottom + "px;";
            style = "left: " + spec.left + "px; " + vertical_pos;
            attributes = "class=\"ace_preview\" style=\"" + style + "\"";
            return "<div " + attributes + "><img src=\"" + (encodeURI(data.url)) + "\"/></div>";
          }
        });
      });
    };
    update = _.debounce(update, 1000);
    return {
      trigger: function() {
        spec.ace.remove_marker(marker);
        return update();
      }
    };
  };
});


