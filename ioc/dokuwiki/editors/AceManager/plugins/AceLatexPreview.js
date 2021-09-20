define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    'ioc/dokuwiki/editors/Renderable',
    'ioc/dokuwiki/editors/Components/LatexPreviewComponent',
    "dojo/string", // string.substitute
], function (declare, AbstractAcePlugin, RenderizablePlugin, LatexPreviewComponent, string) {

    return declare([AbstractAcePlugin, RenderizablePlugin], {

        init: function () {
            this.latexPreviewComponent = new LatexPreviewComponent(this.dispatcher);
            this.addEditorListener('change, changeCursor', this.process.bind(this));
            this._update = _.debounce(this._update, 1000).bind(this);
        },

        process: function () {
            // console.log("LatexPreviewPlugin#process", this);
            this.editor.remove_marker(this.marker);
            this._update();
        },

        _states_iterator: function (pos, backwards, test) {
            var index, row, states;
            index = row = states = null;
            var editor = this.editor;

            return function () {
                var i, state, _i, _len;
                if (index == null) {
                    row = pos.row;
                    states = editor.get_line_states_preview(row, true);
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
                    states = editor.get_line_states_preview(row, true);
                    index = states.length - 1;
                } else if (!backwards && row + 1 < editor.get_length()) {
                    row += 1;
                    states = editor.get_line_states_preview(row, true);
                    index = 0;
                } else {
                    return;
                }

                states[index].row = row;
                if (test(states[index])) {
                    return states[index];
                }
            };
        },

        _update: function () {
            // console.log("AceLatexPreview#_update");
            var context = this;

            var end, end_state, it, pos, start, start_state, state, text, url;
            pos = this.editor.cursor_position();
            it = this._states_iterator(pos, false, function (state) {
                return /\blatex\b/.test(state.name);
            });
            while (state = it()) {
                end_state = state;
            }
            it = this._states_iterator(pos, true, function (state) {
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
            text = this.editor.get_text_range(start, end);

            this.start = start;
            this.end = end;

            this.latexPreviewComponent.send({text:text}).then(function (data) {
                context.editor.remove_marker(this.marker);
                if (!data) {
                    return;
                }

                context.render(data);
            });
        },

        render: function (data) {

            this.marker = this.editor.add_marker({
                start_row: this.start.row,
                start_column: this.start.column,
                end_row: this.end.row,
                end_column: this.end.column,
                klass: 'preview',
                on_render: function (editor) {
                    var attributes, style, vertical_pos;
                    vertical_pos = editor.top > editor.screen_height - editor.bottom ? "bottom: "
                        + (editor.container_height - editor.top) + "px;" : "top: " + editor.bottom + "px;";

                    style = "left: " + editor.left + "px; " + vertical_pos;
                    attributes = "class=\"ace_preview\" style=\"" + style + "\"";

                    return string.substitute(data.htmlTemplate, {attributes: attributes});
                }
            });
        }

    });
});