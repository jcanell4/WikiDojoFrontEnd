define([
    'dojo/_base/declare',

], function (declare) {

    var Range = ace.require('ace/range').Range;


    var FIXED_COL_END = 99999;
    var FIXED_COL_START = 0;

    var instanceCounter = 0;

    return declare([], {

        constructor: function (editor) {
            this.editor = editor;
            this.session = editor.session;
            this.readOnlyStates = {};

            this.counterId = instanceCounter++;
            this.enabled = true;
        },

        toggle: function() {
            this.enabled = !this.enabled;
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

            // Editor es l'editor ACE, no el IocAceEditor ni el AceFacade
            editor.on("click", this._handler.bind(this));

            // Aquest és el IocAceEditor
            this.editor.on("update", this._handler.bind(this))

        },

        /**
         *
         * @param e Object<{editor: editor, start:number, end:number, block: bool}> start i end corresponen a la
         * posició de la fila. Block indica si s'ha de tractar com un block a l'hora de calcular la posició inicial i
         * final de les columnes.
         * @private
         */
        _handler: function (e) {
            var editor = e.editor;


            if (editor === undefined) {
                // Si mostrem e, te les propietats data i editor, però e.editor es undefined O.o
                console.error("No s'ha rebut l'editor", e, editor, e.editor);
                return;
            }

            var session = editor.session;

            var cursor = this.editor.editor.getCursorPosition();

            var states = this.editor.get_line_states_preview(cursor.row, true);

            if (!this.isReadonlySection(states, cursor)) {

                return;
            }

            var rowStart =  cursor.row;
            var rowEnd = cursor.row;
            var colStart, colEnd;

            if (e.block) {
                colStart = FIXED_COL_START;
            } else {
                colStart = cursor.column;
            }


            // console.log("Cursor:", rowStart, rowEnd, colStart, colEnd);


            var currentReadonlyState = null;

            for (var state in this.readOnlyStates) {

                // comprovació per les línies següents
                for (var i = cursor.row; i < session.getLength(); i++) {
                    // console.log("comprovant línia (endavant):", i, "Fins a:",session.getLength());
                    parse = this.parseState(state, i, cursor);


                    if (!parse) {
                        // console.log("El resultat ha estat null, parem de cercar endavant", parse, "línia:" , i);
                        break;
                    } else {
                        rowEnd = i;
                        if (i === cursor.row) {
                            colStart = parse.start;
                            currentReadonlyState = state;
                        }

                        if (parse.end === 0) {
                            colEnd = session.getLine(i).length;

                        } else {
                            colEnd = parse.end;
                        }
                    }
                }

                // comprovació per les línies anteriors
                for (i = cursor.row - 1; i >= 0; i--) {
                    // console.log("comprovant línia (enderrere):", i);
                    parse = this.parseState(state, i, cursor, true);

                    if (!parse) {
                        // console.log("El resultat ha estat null, parem de cercar endarrere", parse);
                        break;
                    } else {
                        rowStart = i;
                        colStart = parse.start;

                    }
                }

                if (currentReadonlyState) { // només es cerca un state de tipus readonly, si s'ha trobat no cal continuar
                    break;
                }
            }




            // var range = new Range(e.start || rowStart, colStart, e.end || rowEnd, colEnd);

            if (e.block) {
                colEnd = FIXED_COL_END;
            }

            var range = new Range(e.start || rowStart, colStart, e.end || rowEnd, colEnd);

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

            if (this.isReadonlySection(states, cursor)) {
                console.log("No es pot escriure, retornant");
                return;
            }
            next();
        },

        isReadonlySection: function (states, cursor) {

            if (!this.enabled) {
                // console.log("FALSE: no està activat");
                return false;
            }


            if (!cursor) {
                cursor = this.editor.editor.getCursorPosition();
            }

            if (!states) {
                states = this.editor.get_line_states_preview(cursor.row, true);

            }

            var ret = false;

            for (var state in this.readOnlyStates) {
                for (var j = 0; j < states.length; j++) {
                    // if (states[j].name.startsWith(state)
                    if (states[j].name.indexOf(state)!== -1
                        && ((states[j].start === states[j].end && cursor.column > states[j].start)
                            || (states[j].start <= cursor.column && states[j].end >= cursor.column ))) {
                        ret = true;
                        break;
                    }

                }

                if (ret) {
                    break;
                }
            }

            // Comprovem que la última línia no contingui l'estat readonly, això permet escriure fins que afegim l'etiqueta de tancament
            var lastLineStates = this.editor.get_last_line_states();

            for (var state in this.readOnlyStates) {
                for (var i = 0; i < lastLineStates.length; i++) {
                    // if (lastLineStates[i].name.startsWith(state)) {
                    if (lastLineStates[i].name.indexOf(state) !== -1) {
                        // console.log("FALSE: la última línia conté l'estat readonly:", state, lastLineStates[i].name);
                        return false;
                    }
                }
            }



            return ret;

        },

        parseState: function (state, row, cursor, backwards) {
            // console.log("Comprovant", state, row, cursor, backwards);
            var states = this.editor.get_line_states_preview(row, true);
            // var session = this.editor.session;

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

            // var ret = {};



            for (; expr(i); i += inc) {
                // console.log("Comprovant state", states[i]);

                // if (states[i].name.startsWith(state)) {
                if (states[i].name.indexOf(state)!== -1) {

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

                }
            }

            // console.log( "No s'ha trobat l'estat" + state + " a la línia amb stats", states);
            return null; // No s'ha trobat l'estat a aquesta línia
        }

    });
});
