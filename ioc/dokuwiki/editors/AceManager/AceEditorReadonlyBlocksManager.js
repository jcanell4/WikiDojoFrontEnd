define([
    'dojo/_base/declare',

], function (declare) {

    var Range = ace.require('ace/range').Range;

    return declare([], {

        constructor: function (editor) {
            this.editor = editor;
            this.session = editor.session;
            this.readOnlyStates = {};
        },

        enableReadonlyBlocks: function () {
            var editor = this.editor.editor;
            var that = this;

            // S'afegeix a la detecció de la pulsació de tecles la comprovació de l'estat
            editor.keyBinding.addKeyboardHandler({
                handleKeyboard: function (data, hash, keyString, keyCode, event) {

                    var cursor = editor.getCursorPosition();
                    var states = that.editor.get_line_states_preview(cursor.row, true);


                    // console.log("Tecla:", keyCode, keyString, hash);
                    if (/*hash === -1 || */(keyCode && keyCode <= 40 && keyCode >= 33)) {
                        // console.log("Es permet:", keyCode, keyString, hash);
                        return false;
                    } else {
                    }

                    if (that.isReadonlySection(states, cursor)) {
                        return {command: "null", passEvent: false};
                    }
                }
            });

            // Es desactiva enganxar i tallar pels blocs
            this.before(editor, 'onPaste', this.preventReadonly.bind(this));
            this.before(editor, 'onCut', this.preventReadonly.bind(this));

            editor.on("click", this._handler.bind(this))

        },

        _handler: function (e) {
            var editor = e.editor;
            var session = editor.session;

            var cursor = this.editor.editor.getCursorPosition();

            var states = this.editor.get_line_states_preview(cursor.row, true);

            if (!this.isReadonlySection(states, cursor)) {

                return;
            }

            var rowStart = cursor.row;
            var rowEnd = cursor.row;
            var colStart = cursor.column;
            var colEnd = cursor.column;

            // console.log("Cursor:", rowStart, rowEnd, colStart, colEnd);


            var currentReadonlyState = null;

            for (var state in this.readOnlyStates) {

                // comprovació per les línies següents
                for (var i = cursor.row; i < session.getLength(); i++) {
                    // console.log("comprovant línia (endavant):", i, "Fins a:",session.getLength());
                    parse = this.parseState(state, i, cursor); // TODO[Xavi] això ha d'estar parametritzat


                    if (!parse) {
                        // console.log("El resultat ha estat null, parem de cercar endavant", parse);
                        break;
                    } else {
                        rowEnd = i;
                        if (i === cursor.row) {
                            colStart = parse.start;
                            currentReadonlyState = state;
                        }

                        if (parse.end === 0) {
                            colEnd = session.getLine(i).length;

                            // } else if (parse.end !== session.getLine(i).length) {
                        //     colEnd = parse.end;
                        //
                        //
                        //     break;
                        } else {
                            colEnd = parse.end;
                        }
                    }
                }

                // comprovació per les línies anteriors
                for (i = cursor.row - 1; i > 0; i--) {
                    // console.log("comprovant línia (enderrere):", i);
                    parse = this.parseState(state, i, cursor, true);

                    if (!parse) {
                        // console.log("El resultat ha estat null, parem de cercar endarrere", parse);
                        break;
                    } else {
                        rowStart = i;
                        colStart = parse.start;

                        // if (parse.start > 0) {
                        //     break;
                        // }
                    }
                }

                if (currentReadonlyState) { // només es cerca un state de tipus readonly, si s'ha trobat no cal continuar
                    break;
                }
            }

            var range = new Range(rowStart, colStart, rowEnd, colEnd);

            if (this.readOnlyStates[currentReadonlyState] && this.readOnlyStates[currentReadonlyState].length > 0) {
                for (i = 0; i < this.readOnlyStates[currentReadonlyState].length; i++) {
                    var callback = this.readOnlyStates[currentReadonlyState][i];

                    if (callback) {
                        callback(range, editor.session.getTextRange(range));
                    }

                }
            }
        },

        addReadonlyBlock: function (state, callback, unique) {
            if (!this.readOnlyStates[state]) {
                this.readOnlyStates[state] = [];
            }

            if (unique && this.readOnlyStates[state].length>0) {
                return;
            }

            this.readOnlyStates[state].push(callback);
        },

        before: function (obj, method, wrapper) {
            var orig = obj[method];
            obj[method] = function () {
                var args = Array.prototype.slice.call(arguments);
                return wrapper.call(this, function () {
                    return orig.apply(obj, args);
                }, args);
            };

            return obj[method];
        },

        preventReadonly: function (next, args) {
            var cursor = this.editor.editor.getCursorPosition();
            var states = this.editor.get_line_states_preview(cursor.row, true);

            if (this.isReadonlySection(states, cursor)) return;
            next();
        },

        isReadonlySection: function (states, cursor) {

            if (!this.enabled) {

                return false;
            }


            if (!cursor) {
                cursor = this.editor.editor.getCursorPosition();
            }

            if (!states) {
                states = this.editor.get_line_states_preview(cursor.row, true);
            }

            for (var state in this.readOnlyStates) {
                for (var j = 0; j < states.length; j++) {
                    if (states[j].name.startsWith(state)
                        && ((states[j].start === states[j].end && cursor.column > states[j].start)
                            || (states[j].start <= cursor.column && states[j].end >= cursor.column ))) {
                        return true;
                    }

                    // console.log(states[j].name);
                }
            }

            return false;

        },

        parseState: function (state, row, cursor, backwards) {
            // console.log("Comprovant", state, row, cursor, backwards);
            var states = this.editor.get_line_states_preview(row, true);
            var session = this.editor.session;

            // si es backwards compta cap enderrera
            var i, expr, inc;

            if (backwards) {
                i = states.length - 1;
                expr = function (a) {
                    return a >= 0
                };
                inc = -1;
            } else {
                i = 0;
                expr = function (a) {
                    return a < states.length
                };
                inc = 1;
            }

            var ret = {};



            for (; expr(i); i += inc) {
                // console.log("Comprovant state", states[i]);

                if (states[i].name.startsWith(state)) {

                    // if (states[i].start === states[i].end && (row !== cursor.row || cursor.column > states[i].start)) {
                    //     console.log(row, "L'estat s'obre però no es tanca en aquesta línia", states[i]);
                    //     return {start: states[i].start, end: session.getLine(row).length}
                    // } else if (row === cursor.row && states[i].start < cursor.column && states[i].end >= cursor.column) { // El cursor es troba dins d'aquest state
                    //     console.log(row, "mateixa fila dins del rang", states[i]);
                        return {start: states[i].start, end: states[i].end}
                    // } else if (row !== cursor.row) {
                    //     console.log(row, "no es la mateixa fila", cursor.row);
                    //     return {start: states[i].start, end: states[i].end}

                    // }
                } else {
                    // console.log("----- fi de la cerca, l'estat no comença", state, states[i]);
                }
            }

            return null; // No s'ha trobat l'estat a aquesta línia
        }

    });
});
