define([
    "dojo/Stateful",
    "dojo/_base/declare",
    'ioc/dokuwiki/AceManager/state_handler' // TODO: Aquest fitxer no es troba al ACE no conflict, hauria d'estar com ace/keyboard/state_handler al mateix lloc que el de vim i emacs
], function (Stateful, declare, state_handler) {
    return declare([Stateful],
        /**
         * Embolcall per manipular un editor ace.
         *
         * @class AceWrapper
         * @extends dojo.Stateful
         * @author Xavier García<xaviergaro.dev@gmail.com>
         */
        {
            /** @constructor @private */
            Range: ace.require('ace/range').Range,

            /** @constructor @private */
            StateHandler: state_handler.StateHandler,

            /** @type {IocAceEditor} @private*/
            iocAceEditor: null,

            /**
             * Al constructor se li ha de passar com a paràmetre la instancia del editor al que farà d'embolcall.
             *
             * @param {IocAceEditor} iocAceEditor - Editor a embolcallar
             * @constructor
             */
            constructor: function (iocAceEditor) {
                this.iocAceEditor = iocAceEditor;
            },


            /**
             * Retorna la sessió del editor ace.
             *
             * @returns {ace.EditSession} - sessió creada per l'editor
             * @private
             */
            getSession: function () {
                return this.iocAceEditor.get('session');
            },

            /**
             * Retorna l'editor ace.
             *
             * @returns {ace.Editor}
             * @private
             */
            getEditor: function () {
                return this.iocAceEditor.get('editor');
            },

            /**
             * Retorna una posició a partir del offsetset passat com argument.
             *
             * @param {int} offset - Offset a partir del cual es calcula la posició
             * @returns {ace.Range}
             * @private
             */
            offset_to_pos: function (offset) {
                var row,
                    row_length,
                    i,
                    len,
                    session = this.getSession();

                for (row = i = 0, len = session.getLength(); 0 <= len ? i < len : i > len; row = 0 <= len ? ++i : --i) {
                    row_length = session.getLine(row).length + 1;
                    if (offset < row_length) {
                        break;
                    }
                    offset -= row_length;
                }

                return {
                    row:    row,
                    column: offset
                };
            },

            /**
             * Retorna el offset a partir d'una posició
             *
             * @param {ace.Range} pos - posició
             * @returns {int} - offset calculat
             * @private
             */
            pos_to_offset: function (pos) {
                var session = this.getEditor().session,

                    iterator = function (memo, row) {
                        return memo + session.getLine(row).length + 1;
                    },

                    list = function () {
                        var results = [],
                            row = pos.row;

                        for (var i = 0; 0 <= row ? i < row : i > row; 0 <= row ? i++ : i--) {
                            results.push(i);
                        }

                        return results;
                    };

                return _.reduce(list.apply(this), iterator, pos.column);
            },

            /**
             * Retorna un array amb la posició inicial i final i el nom de tots els states aplicats a la línia passada i
             * cercant les regles aplicables al tokenizer.
             *
             * @param {int} line - línia a tractar
             * @param {string} startState - estat inicial
             * @param {ace.Tokenizer} tokenizer - tokenizer a fer servir per cercar els estats
             * @returns {{start: int, end: int, name: string}[]} - Array amb tots els stats retornats.
             * @private
             */
            getLineStates: function (line, startState, tokenizer) {
                var currentState, lastIndex, mapping, match, re, rule, state, states;

                if (Array.isArray(startState)) {
                    currentState = startState[0];
                } else {
                    currentState = startState
                }
                state = tokenizer.states[currentState];
                mapping = tokenizer.matchMappings[currentState];

                re = tokenizer.regExps[currentState];


                re = tokenizer.regExps[currentState];
                re.lastIndex = lastIndex = 0;
                states = [
                    {
                        start: 0,
                        name:  startState
                    }
                ];

                while (match = re.exec(line)) {
                    for (var i = 0, len = match.length - 2; i < len; i++) {
                        if (match[i + 1] != null) {
                            rule = state[mapping[i]];
                            if (rule.next && rule.next !== currentState) {
                                currentState = rule.next;
                                state = tokenizer.states[currentState];
                                mapping = tokenizer.matchMappings[currentState];
                                lastIndex = re.lastIndex;
                                re = tokenizer.regExps[currentState];
                                re.lastIndex = lastIndex;
                                _.last(states).end = lastIndex;
                                states.push({
                                    start: lastIndex,
                                    name:  currentState
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
            },

            /**
             * Afegeix el comandament passat com argument al editor.
             *
             * @param {{name: string, key_win: string, key_mac: string, exec: Function}} command - comandament a afegir
             */
            add_command: function (command) {
                this.getEditor().commands.addCommand(
                    {
                        name: command.name,

                        exec: function (env, args2, request) { // TODO: Aquest arguments no es fan servir, conservar?
                            return command.exec();
                        },

                        bindKey: {
                            win: command.key_win || null,
                            mac: command.key_mac || null,
                            sender: 'editor'
                        }
                    });
            },

            /**
             * Afegeix un marcador.
             *
             * @param {{
             *      start_row: int,
             *      start_column: int,
             *      end_row: int,
             *      end_column: int,
             *      klass: string,
             *      onRender: Function
             *  }} marker - Marcador a afegir
             * @returns int - Identificador del marcador afegit
             */
            add_marker: function (marker) {
                var range, renderer;
                range = new this.Range(marker.start_row, marker.start_column, marker.end_row, marker.end_column);
                renderer = function (html, range, left, top, config) {
                    var column;
                    column = range.start.row === range.end.row ? range.start.column : 0;
                    return html.push(marker.on_render({
                        left:             Math.round(column * config.characterWidth),
                        top: (range.start.row - config.firstRowScreen) * config.lineHeight,
                        bottom: (range.end.row - config.firstRowScreen + 1) * config.lineHeight,
                        screen_height:    config.height,
                        screen_width:     config.width,
                        container_height: config.minHeight
                    }));
                };
                return this.getSession().addMarker(range, marker.klass, renderer, true);
            },

            /**
             * Retorna la posició del cursor dins del editor en forma de pixels.
             *
             * @returns {{x: int, y: int}} - Posició del cursor
             */
            cursor_coordinates: function () {
                var editor = this.getEditor(),
                    pos = editor.getCursorPosition(),
                    screen = editor.renderer.textToScreenCoordinates(pos.row, pos.column);

                return {
                    x: Math.round(screen.pageX),
                    y: Math.round(screen.pageY + editor.renderer.lineHeight / 2)
                };
            },

            /**
             * Retorna la posició del cursor dins del editor en froma de línia i columna
             * @returns {{row: int, col: int}} - Posició del cursor
             */
            cursor_position: function () {
                return this.getEditor().getCursorPosition();
            },

            /**
             * Duplica al costat el text seleccionat al editor.
             */
            duplicate_selection: function () {
                this.get('aceWrapper').getEditor().duplicateSelection();
            },

            /**
             * Estableix el focus al editor.
             */
            focus: function () {
                this.getEditor().focus();
            },

            /**
             * Retorna el nombre de línies al document.
             *
             * @returns {int} - Nombre de línies
             */
            get_length: function () {
                return this.getSession().getLength();
            },

            /**
             * Retorna el contingut de la línia passada com argument.
             *
             * @param {int} row - Fila de la que volem obtenir la copia
             * @returns {string} - Cadena de text amb el contingut de la línia
             */
            get_line: function (row) {
                return this.getSession().getLine(row);
            },

            /**
             * Retorna els estats aplicats a la línia passada com argument.
             *
             * @param {int} row - lína a analitzar
             * @returns {{start: int, end: int, name: string}[]}
             */
            get_line_states: function (row) {
                var session = this.getSession(),
                    state = row > 0 ? session.getState(row - 1) : 'start',
                    line = session.getLine(row);

                return this.getLineStates(line, state, session.getMode().getTokenizer());
            },

            /**
             * Retorna un objecte amb la posició del caràcter inicial i el caràcter final seleccionats. S'ha de tenir en
             * compta que no es tracta de posició de files i columnes si no de caràcters com si fosin un a continuació
             * del altre.
             *
             * @returns {{start: int, end: int}} - Caràcter inciial i final sel·leccionats.
             */
            get_selection: function () {
                var editor = this.getEditor(),
                    range = editor.getSelection().getRange();

                return {
                    start: this.pos_to_offset(range.start),
                    end:   this.pos_to_offset(range.end)
                };
            },

            /**
             * Retorna una cadena amb el text que es troba entre el caràcter inicial i final passats com argument.
             *
             * @param {{row: int, column: int}} start - Posició inicial.
             * @param {{row: int, column: int}} end - Posició final.
             * @returns {string} - Text entre la posició inicial i final.
             */
            get_text_range: function (start, end) {
                var session = this.getSession(),
                    range = new this.Range(start.row, start.column, end.row, end.column);

                return session.getTextRange(range);
            },

            /**
             * Retorna el text complet que es troba al editor.
             *
             * @returns {string} - Text complet que es troba al editor
             */
            get_value: function () {
                return this.getSession().getValue();
            },

            /**
             * Sagna la línia actual del editor.
             */
            indent: function () {
                this.get('aceWrapper').getEditor().indent();
            },

            /**
             * Inserta el text passat com argument a la posició que es trobi el cursor del editor.
             * @param {index} text - Text a insertar
             */
            insert: function (text) {
                return this.getEditor().insert(text);
            },

            /**
             * Mou el cursor a la posició especificada per argument.
             *
             * TODO: No es crida en lloc, corregir el contexte quan es faci servir.
             *
             * @param {{row: int, column: int}} position - Posició a la que es mourà el cursor
             */
            navigate: function (position) {
                this.getEditor().navigateTo(position.row, position.column);
            },

            /**
             * Mou el cursor al final de la línia actual.
             *
             * TODO: No es crida en lloc, corregir el contexte quan es faci servir.
             */
            navigate_line_end: function () {
                this.getEditor().navigateLineEnd();
            },

            /**
             * Mou el cursor al principi de la línia actual.
             *
             * TODO: No es crida en lloc, corregir el contexte quan es faci servir.
             */
            navigate_line_start: function () {
                this.getEditor().navigateLineStart();
            },


            /**
             * Mou el cursor al començament de la paraula immediatament a la esquerra de la posició actual del cursor.
             *
             * El contexte en el que s'executa aquest mètode correspon al IocContextTable i no pas al AceWrapper.
             */
            navigate_word_left: function () {
                this.get('aceWrapper').getEditor().navigateWordLeft();
            },

            /**
             * Mou el cursor al començament de la paraula immediatament a la dreta de la posició actual del cursor.
             *
             * El contexte en el que s'executa aquest mètode correspon al IocContextTable i no pas al AceWrapper.
             */
            navigate_word_right: function () {
                this.get('aceWrapper').getEditor().navigateWordRight();
            },


            /**
             * Elimina el sagnat de la línia actual.
             *
             * El contexte en el que s'executa aquest mètode correspon al IocContextTable i no pas al AceWrapper.
             */
            outdent: function () {
                this.get('aceWrapper').getEditor().blockOutdent();
            },

            /**
             * Retorna la abreviatura de la plataforma en la qual s'està executant l'editor, per exemple 'mac' o 'win'
             *
             * @returns {string} - Nom de la plataforma en la que s'està executant l'editor
             */
            platform: function () {
                return this.getEditor().commands.platform;
            },

            /**
             * Elimina el marcador ambl a id passada com argument.
             *
             * @param {int} marker_id - id del marcador a eliminar
             */
            remove_marker: function (marker_id) {
                this.getSession().removeMarker(marker_id);
            },

            /**
             * Reemplaça el text que es troba entre el caràcter incial i final pel text passat com argument.
             *
             * @param {int} start - Caràcter on es comença a reemplaçar
             * @param {int} end - Caràcter on s'acaba de reemplaçar
             * @param {string} text - Text que s'inserirà
             */
            replace: function (start, end, text) {
                var session = this.getSession(),
                    range = this.Range.fromPoints(this.offset_to_pos(start), this.offset_to_pos(end));
                session.replace(range, text);
            },


            /**
             * Reemoplaça les línies entre la línia inicial i final per l'array de línies passades com argument.
             *
             * @param {int} start - Línia on comença la substitució
             * @param {int} end - Línia on s'acaba de reemplaçar
             * @param {string[]} lines - Array de línies que s'inseriran
             */
            replace_lines: function (start, end, lines) {
                var session = this.getSession(),
                    doc = session.getDocument(),
                    doc_length = end - start + 1,
                    min_length = Math.min(doc_length, lines.length);

                for (var i = 0, len = min_length; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
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
                    doc.insertLines(end + 1, lines.slice(doc_length));
                }
            },

            /**
             * Dispara el ajustament de mida del editor.
             */
            resize: function () {
                this.getEditor().resize(true);
            },

            /**
             * Estableix un nou gestor de tecles, el que permet establir combinacions de tecles que només s'activen
             * bassades en els estats que ens interessin.
             *
             * @param {Object.<string, {key: string, exec: string, then: string}[]>} states - Objecte amb els estats,
             * les tecles, el nom de les funcions que s'executaran, i a quin estat passa a continuació.
             */
            set_keyboard_states: function (states) {
                this.getEditor().setKeyboardHandler(new this.StateHandler(states));
            },


            /**
             * Estableix com a text seleccionat al editor el text entre la posició inicial i final passades com argument.
             *
             * @param {int} start - Caràcter inicial a seleccionar
             * @param {int} end - Caràcter final a seleccionar
             */
            set_selection: function (start, end) {
                var editor = this.getEditor(),
                    range = this.Range.fromPoints(this.offset_to_pos(start), this.offset_to_pos(end));
                editor.getSelection().setSelectionRange(range);
            },

            /**
             * Estableix el contingut del editor.
             *
             * @param {string} value - Text que s'establirà com a contingut del editor
             */
            set_value: function (value) {
                this.getSession().setValue(value);
            },

            /**
             * Estableix si s'han de tallar les paraules al arribar al final de la línia o no.
             *
             * @param {bool} value - Cert si s'han de tallar les paraules si s'arriba al final de la línia o fals
             * en cas contrari.
             */
            set_wrap_mode: function (value) {
                this.iocAceEditor.setWrapMode(value);
            },

            /**
             * Retorna el número de línia on es troba el cursor
             *
             * @returns {int} línia a la que es troba el cursor
             */
            getCurrentRow: function() {
                return this.getEditor().getSelectionRange().start.row;
            }
        });
});
