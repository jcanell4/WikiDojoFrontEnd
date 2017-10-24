define([
    'ioc/dokuwiki/editors/AbstractIocEditor',
    'ioc/dokuwiki/editors/AceManager/rules/IocRuleSet',
    'ioc/dokuwiki/editors/AceManager/modes/IocAceMode',
    // 'ioc/dokuwiki/editors/AceManager/AceWrapper',
    'ioc/dokuwiki/editors/AceManager/DokuWrapper',
    'ioc/dokuwiki/editors/AceManager/IocCommands',
    'ioc/dokuwiki/editors/AceManager/plugins/LatexPreviewPlugin',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'ioc/dokuwiki/editors/AceManager/state_handler'
], function (AbstractIocEditor, IocRuleSet, IocAceMode, /*AceWrapper, */DokuWrapper, IocCommands, LatexPreviewPlugin, declare, lang, state_handler) {

    var Range = ace.require('ace/range').Range,
        StateHandler = state_handler.StateHandler;

    return declare([AbstractIocEditor],
        /**
         * Classe per la gestió del editor ACE adaptat a la DokuWiki 3.0 del IOC. Aquesta classe hereta de Stateful,
         * no s'han de modificar les propietats manualment si es fa externament, s'han de cridar els mètodes
         * set(propietat) i get(propietat), de manera que es disparin apropiadament els watch().
         *
         * @class IocAceEditor
         * @extends dojo.Stateful
         * @author Xavier García<xaviergaro.dev@gmail.com>
         */
        {
            EDITOR: {
                ACE: 0,
                TEXT_AREA: 1
            },

            /**@type {number} */
            currentEditor: 0,

            /** @type {ace.Editor} @readonly */
            editor: null,

            /** @type {ace.EditSession} @readonly */
            session: null,

            /** @type {boolean} @private - Determina si el editor es de només lectura */
            _readOnly: false,

            /** @type {object} @private - Valors per defecte per inicialitzar l'editor */
            _default: {
                theme: 'textmate',
                containerId: 'editor',
                mode: 'text',
                readOnly: false,
                wrapMode: true,
                wrapLimit: 100,
                tabSize: 2,
                horizontalScrollBar: false,
                undoManager: new ace.UndoManager(),
                plugins: [/*IocCommands, */LatexPreviewPlugin]

            },

            /** @type {Array} conté el llistat de plugins actius **/
            plugins: null,

            /** @type {object} arguments que s'han passat al constructor per configurar-lo */
            _args: {},

            /**
             * Inicialitza l'editor.
             *
             * @param args - un objecte amb la configuració personalitzada per l'editor. Es farà servir la configuració
             * per defecte per totes les propietats no difinides.
             *
             * @see IocAceEditor._default per veure una definició completa del objecte de configuració.
             */
            constructor: function (args) {

                if (args) {
                    args = lang.mixin(this._default, args);

                } else {
                    args = JSON.parse(JSON.stringify(this._default)); // deep clone
                }


                var iocAceMode = new IocAceMode({
                    baseHighlighters: args.langRules || {}, // ALERTA[Xavi] possibilitat d'afegir noves regles per paràmetre. Sense provar!
                    ruleSets: [new IocRuleSet()],
                    xmlTags: args.xmltags // ALERTA[Xavi] marques XML passades per argument, provinent de la wiki original
                });

                args.mode = iocAceMode.getMode();

                // this.aceWrapper = new AceWrapper(this);
                this.dokuWrapper = new DokuWrapper(this, args.textareaId, args.auxId);//TODO[Xavi] A banda de passar la info del JSINFO per paràmetre, s'ha de tenir en compte que el id del text area ja no serà aquest, si no el que nosaltres volgumen (i.e. multi edició)

                this.$textarea = jQuery('#' + args.textareaId);

                this.init(args);

            },

            // Funcions originalment al Container

            initContainer: function (id) {

                var element = jQuery('<div>'),
                    textarea = jQuery(this.dokuWrapper.textarea),
                    wrapper = jQuery('<div>', {
                        "class": 'ace-doku',
                        "id": id
                    }),
                    prop,
                    properties = ['border', 'border-color', 'border-style', 'border-width', 'border-top',
                        'border-top-color', 'border-top-style', 'border-top-width', 'border-right',
                        'border-right-color', 'border-right-style', 'border-right-width', 'border-bottom',
                        'border-bottom-color', 'border-bottom-style', 'border-bottom-width', 'border-left',
                        'border-left-color', 'border-left-style', 'border-left-width', 'margin', 'margin-top',
                        'margin-right', 'margin-bottom', 'margin-left'];

                // Recorre les propietats css del array
                // les afegeix una per una al wrapper
                // afegeix al wrapper un element (div) amb classe 'ace-doku' després del textarea

                for (var i = 0, len = properties.length; i < len; i++) {
                    prop = properties[i];
                    wrapper.css(prop, textarea.css(prop));
                }

                wrapper.append(element).insertAfter(textarea).hide();

                this.$elementContainer = element;
                this.$wrapper = wrapper;
                // this.$textArea = textarea;

                this.editor = ace.edit(id);
                this.session = this.editor.getSession();

            },

            init: function (args) {
                this.currentEditor = this.EDITOR.ACE;


                this.initContainer(args.containerId);
                this.initDwEditor(this.$textarea);

                // this.setContainer(args.containerId);
                this.setTheme(args.theme);
                this.setMode(args.mode);
                this.setReadOnly(args.readOnly);
                this.setWrapMode(args.wrapMode);
                this.setWrapLimit(args.wraplimit);
                this.setUndoManager();
                this.setTabSize(args.tabSize);
                this.setHorizontalScrollBarVisible(args.horizontalScrollBar);

                this.editor.setOptions({
                    fontFamily: "monospace",
                    fontSize: "14px"
                });


                // ALERTA[Xavi] això s'ha de canviar pel sistema de on/emit
                // var preview = acePreview({ace: this.aceWrapper});

                var commands = new IocCommands(this);

                this.initHandlers();
                this.initPlugins(args.plugins);


                this.on('change', function () {
                    if (this.currentEditor === this.EDITOR.TEXT_AREA) {
                        return;
                    }
                    this.setTextareaValue(this.get_value());

                    summaryCheck(); // ALERTA! Funció propia de la Dokuwiki

                    commands.hide_menu(); // ALERTA! es pot moure la subscripcció al propi commands
                    // preview.trigger(); // ALERTA! es pot moure la subscripcció al propi ace-preview
                });

                this.on('changeCursor', function () {
                    commands.hide_menu(); // ALERTA! es pot moure la subscripcció al propi commands
                    // preview.trigger(); // ALERTA! es pot moure la subscripcció al propi ace-preview
                });


                this.setValue(args.originalContent);

            },

            initPlugins: function (plugins) {
                this.plugins = [];

                if (plugins) {
                    this.addPlugins(plugins);
                }
            },

            initHandlers: function () {
                this.$textarea.on('focus', function () {
                    this.emit('focus');
                }.bind(this));

                this.session.on('change', function (e) {
                    if (!this._readOnly) {
                        this.emit('change', e);
                    }
                }.bind(this));

                this.editor.getSelection().on('changeCursor', function (e) {
                    this.emit('changeCursor', e)
                }.bind(this));
            },

            //ALERTA[Xav] Aquest mètode lliga el textarea als events originals de la wiki
            initDwEditor: function ($editor) {
                var self = this;


                $editor.on('input change focus', function (e) {
                    e.newContent = $editor.val();
                    self.emit('change', e);
                });


                if ($editor.length === 0) {
                    return;
                }

                window.dw_editor.initSizeCtl('#size__ctl', $editor);

                if ($editor.attr('readOnly')) {
                    return;
                }

                // in Firefox, keypress doesn't send the correct keycodes,
                // in Opera, the default of keydown can't be prevented
                if (jQuery.browser.opera) {
                    $editor.keypress(window.dw_editor.keyHandler);
                } else {
                    $editor.keydown(window.dw_editor.keyHandler);
                }


            },

            /**
             * Estableix el contenidor al que s'incrustarà l'editor.
             *
             * @param {string?} container - Id del div que contindrá l'editor, si no s'especifica es fa servir el
             * contenidor per defecte.
             */
            // setContainer: function (container) {
            //
            //     var value = container || this._default.containerId;
            //     this.set('editor', ace.edit(value));
            //     this.set('session', this.editor.getSession());
            //
            //
            //
            // },

            /**
             * Estableix el tema que fará servir l'editor.
             *
             * @param {string?} theme - nom del tema, si no s'especifica es fa servir el tema per defecte.
             */
            setTheme: function (theme) {
                this.editor.setTheme("ace/theme/" + theme);
            },

            /**
             * Estableix el mode que fará servir l'editor, pot ser el nom d'un mode del ace, o un mode instanciat.
             *
             * @param {Mode|string?} mode - Nom del mode, o mode instanciat, si no s'especifica es fa servir el mode
             * per defecte.
             */
            setMode: function (mode) {
                if (typeof mode === 'object') {
                    this.session.setMode(mode);
                } else {
                    this.session.setMode("ace/mode/" + mode);
                }
            },

            /**
             * Estableix si el editor es de només lectura.
             *
             * @param {boolean?} readOnly - Cert per fer que sigui de només lectura, si no s'especifica es fa servir el
             * valor per defecte
             */
            setReadOnly: function (readOnly) {
                this._readOnly = readOnly;

                if (readOnly) {
                    this.$textarea.attr('readonly', true);

                } else {
                    this.$textarea.removeAttr('readonly');

                }

                this.editor.setReadOnly(readOnly);
            },

            /**
             * Estableix si es mostra el limit de caràcters per fila i passa a la següent fila al arribar al limit. Si
             * no s'especifica es fa servir el valor per defecte.
             *
             * @param {boolean?} wrapMode - Cert per fer activar els limits.
             * */
            setWrapMode: function (wrapMode) {
                this.editor.setShowPrintMargin(wrapMode);
                this.session.setUseWrapMode(wrapMode);
            },

            /**
             * Estableix el límite de caràcters per fila.
             *
             * @param {int?} wrapLimit - Nombre de caràcters, si no s'especifica es fa servir el valor per defecte.
             */
            setWrapLimit: function (wrapLimit) {
                this.session.setWrapLimitRange(null, wrapLimit);
                this.editor.setPrintMarginColumn(wrapLimit);
            },

            /**
             * Estableix el gestor per desfer canvis, si no es passa cap gestor es fa servir el valor per defecte.
             *
             * @param {ace.UndoManager?} undoManager - El gestor per desfer canvis
             */
            setUndoManager: function (undoManager) {
                this.session.setUndoManager(undoManager);
            },

            /**
             * Estableix si s'ha de mostrar o no la barra de scroll horitzontal.
             *
             * @param {boolean?} visible - Cert si s'ha de mostrar o false si no s'ha de mostrar
             */
            setHorizontalScrollBarVisible: function (visible) {
                this.editor.renderer.setHScrollBarAlwaysVisible(visible);
            },

            /**
             * Estableix la mida en caràcters de la tabulació.
             *
             * @param {int?} tabSize - Mida en nombre de caràcters de les tabulacions, si no s'especifica es fa servir
             * el valor per defecte.
             */
            setTabSize: function (tabSize) {
                this.session.setTabSize(tabSize);
            },

            /**
             * Afegeix la funció que serà cridada quan hi hagin canvis al document.
             *
             * @param {function} args - Funció que es cridada quan hi ha un canvi al document, si no s'especifica es fa
             * servir el valor per defecte
             */
            // setDocumentChangeCallback: function (args) {
            //     var callback = args || this._default.onDocumentChange;
            //     this.session.on('change', lang.hitch(this, function (e) {
            //             if (!this._readOnly) {
            //                 return callback(e);
            //             }
            //         })
            //     );
            // },

            /**
             * Afegeix la funció que serà cridada quan el cursor canvia de posició
             *
             * @param {function} args - Funció que es cridada quan el cursor canvia de posició
             */
            // setChangeCursorCallback: function (args) {
            //
            //     var callback = args || this._default.onCursorChange;
            //     this.editor.getSelection().on('changeCursor', function (e) {
            //         return callback(e);
            //     });
            // },

            // getText: function () {
            //     alert("es fa servir getText");
            //     return this.session.getValue();
            // },

            destroy: function () {
                this.removePlugins();
                this.editor.destroy();


                // ace.edit(this.args.containerId).destroy()
            },

            getReadOnly: function () {
                return this._readOnly;
            },

            setWrap: function (on) {
                var textarea = this.$textarea.get(0);

                if (on) {
                    dw_editor.setWrap(textarea, 'on');
                } else {
                    dw_editor.setWrap(textarea, 'off');
                }

            },

            toggleWrap: function () {
                this.wrap = !this.wrap;
                this.setWrap(this.wrap);
            },

            toggleEditor: function () {
                if (this.currentEditor === this.EDITOR.ACE) {
                    this.currentEditor = this.EDITOR.TEXT_AREA;
                    this.disable();
                } else {
                    this.currentEditor = this.EDITOR.ACE;
                    this.enable();
                }

            },

            enable: function () {

                var selection = this.dokuWrapper.get_selection();

                // this.dokuWrapper.disable();
                this.currentEditor = this.EDITOR.ACE;
                this.$textarea.hide();


                this.set_height(this.$textarea.innerHeight()); // ALERTA! Set_height no es troba aqui si no al facade!
                this.show(); // ALERTA! no es troba aqui si no al facade!
                this.set_value(this.getTextareaValue());
                this.resize();
                this.focus();
                this.set_selection(selection.start, selection.end);

                DokuCookie.setValue('aceeditor', 'on'); // ALERTA[Xavi] Això no ho fem servir, era de la versió anterior


                // this.enabled = true; // ALERTA! això es del facade!
            },

            disable: function () {
                var selection = this.get_selection();

                DokuCookie.setValue('aceeditor', 'off'); // ALERTA[Xavi] Això no ho fem servir, era de la versió anterior

                this.hide();
                // this.dokuWrapper.enable();
                this.currentEditor = this.EDITOR.TEXT_AREA;
                this.$textarea.show();


                this.setTextareaValue(this.get_value());
                // this.dokuWrapper.set_value(this.get_value());
                this.dokuWrapper.set_selection(selection.start, selection.end);
                this.$textarea.focus();

                // this.enabled = false;

            },

            show: function () {
                this.$wrapper.show();
                this.$elementContainer.css('width', this.$wrapper.width() + 'px');
                this.$elementContainer.css('height', this.$wrapper.height() + 'px');
            },

            hide: function () {
                this.$wrapper.hide();
            },

            set_height: function (value) {
                // console.log("IocAceEditor#set_height", value);
                this.$wrapper.css('height', value + 'px');
                return this.$elementContainer.css('height', this.$wrapper.height() + 'px');
            },

            // Funcions mogudes del Facade
            getValue: function () {
                // console.log("IocAceEditor#getValue");
                if (this.currentEditor === this.EDITOR.ACE) {
                    return this.getEditorValue();
                } else {
                    return this.getTextareaValue();
                }
            },

            getEditorValue: function () {
                return this.get_value();
            },

            getTextareaValue: function () {
                return this.$textarea.val();
                // return this.dokuWrapper.get_value();
            },

            setValue: function (value) {
                if (this.currentEditor === this.EDITOR.ACE) {
                    this.setEditorValue(value);
                } else {
                    this.setTextareaValue(value);
                }
            },

            setEditorValue: function (value) {
                this.set_value(value);
            },

            setTextareaValue: function (value) {
                this.$textarea.val(value);
            },

            addPlugins: function (plugins) {

                if (Array.isArray((plugins))) {
                    for (var i = 0; i < plugins.length; i++) {
                        this.initializePlugin(plugins[i]);

                    }
                } else {

                    this.initializePlugin(plugins);
                }

            },

            removePlugins: function () {
                for (var i = 0; i < this.plugins.length; i++) {

                    this.plugins[i].destroy();
                }

                this.plugins.length = 0;
            },

            initializePlugin: function (_plugin) {
                var plugin = new _plugin();
                this.plugins.push(plugin);
                plugin.setEditor(this);
                plugin.init();
            },


            // FUNCIONS ORIGINALMENT AL ACE WRAPPER
            /**
             * Retorna la sessió del editor ace.
             *
             * @returns {ace.EditSession} - sessió creada per l'editor
             * @private
             */
            getSession: function () {
                return this.editor.getSession();
            },

            /**
             * Retorna l'editor ace.
             *
             * @returns {ace.Editor}
             * @private
             */
            getEditor: function () {
                return this.editor;
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
                    row: row,
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
                re.lastIndex = lastIndex = 0;
                states = [
                    {
                        start: 0,
                        name: startState
                    }
                ];

                var previousLastIndex = -1;
                var MAX_ITERATIONS = 200;
                var currentIterations = 0;

                while (match = re.exec(line)) {
                    for (var i = 0, len = match.length - 2; i < len; i++) {
                        if (match[i + 1] !== undefined) {
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
                                    name: currentState
                                });
                            }
                            break;
                        }
                    }

                    if (previousLastIndex !== -1 && previousLastIndex === lastIndex) {
                        currentIterations++;
                    }

                    if (lastIndex === line.length /*|| (previousLastIndex !== -1 && previousLastIndex === lastIndex)*/
                        || currentIterations > MAX_ITERATIONS
                    ) {

                        break;
                    } else {
                        previousLastIndex = lastIndex;
                    }
                }

                _.last(states).end = lastIndex;

                return states;
            },

            /* ALERTA: Duplicat de l'anterior (i modificat) per evitar fer canvis que trenquin a la crida d'altres objectes (el ContextTable i el IocCommand) */
            getLineStatesPreview: function (line, startState, tokenizer, includeFirst) {

                var currentState, lastIndex, mapping, match, re, rule, state, states;

                if (Array.isArray(startState)) {
                    currentState = startState[0];
                } else {
                    currentState = startState
                }
                state = tokenizer.states[currentState];
                mapping = tokenizer.matchMappings[currentState];

                re = tokenizer.regExps[currentState];
                re.lastIndex = lastIndex = 0;
                states = [
                    {
                        start: 0,
                        name: startState
                    }
                ];

                var previousLastIndex = -1;
                var firstMatch = null;
                var MAX_ITERATIONS = 200;
                var currentIterations = 0;

                while (match = re.exec(line)) {
                    for (var i = 0, len = match.length - 2; i < len; i++) {
                        if (match[i + 1] !== undefined) {
                            rule = state[mapping[i]];

                            if (!firstMatch && includeFirst) {
                                firstMatch = match[i + 1];
                                includeFirst = false;
                            }

                            if (rule.next && rule.next !== currentState) {
                                currentState = rule.next;
                                state = tokenizer.states[currentState];
                                mapping = tokenizer.matchMappings[currentState];
                                lastIndex = re.lastIndex;


                                re = tokenizer.regExps[currentState];
                                re.lastIndex = lastIndex;
                                _.last(states).end = lastIndex;

                                // ALERTA! S'augmentan el nombre d'estats afegits, segurament perqué la nova cerca torna a incloure'ls. Això no te efecte en el cas de les línies, però si en els tokens inline
                                if (firstMatch) {
                                    lastIndex -= firstMatch.length;
                                    firstMatch = null;
                                }

                                states.push({
                                    start: lastIndex,
                                    name: currentState
                                });
                            }
                            break;
                        }
                    }

                    if (previousLastIndex !== -1 && previousLastIndex === lastIndex) {
                        currentIterations++;
                    }

                    if (lastIndex === line.length /*|| (previousLastIndex !== -1 && previousLastIndex === lastIndex)*/
                        || currentIterations > MAX_ITERATIONS
                    ) {

                        break;
                    } else {
                        previousLastIndex = lastIndex;
                    }
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
                range = new Range(marker.start_row, marker.start_column, marker.end_row, marker.end_column);
                renderer = function (html, range, left, top, config) {
                    var column;
                    column = range.start.row === range.end.row ? range.start.column : 0;
                    return html.push(marker.on_render({
                        left: Math.round(column * config.characterWidth),
                        top: (range.start.row - config.firstRowScreen) * config.lineHeight,
                        bottom: (range.end.row - config.firstRowScreen + 1) * config.lineHeight,
                        screen_height: config.height,
                        screen_width: config.width,
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
                this.getEditor().duplicateSelection();
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

            get_line_states_preview: function (row, includeFirst) {
                var session = this.getSession(),
                    state = row > 0 ? session.getState(row - 1) : 'start',
                    line = session.getLine(row);


                return this.getLineStatesPreview(line, state, session.getMode().getTokenizer(), includeFirst);
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
                    end: this.pos_to_offset(range.end)
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
                    range = new Range(start.row, start.column, end.row, end.column);

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
                this.getEditor().indent();
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
                this.getEditor().navigateWordLeft();
            },

            /**
             * Mou el cursor al començament de la paraula immediatament a la dreta de la posició actual del cursor.
             *
             * El contexte en el que s'executa aquest mètode correspon al IocContextTable i no pas al AceWrapper.
             */
            navigate_word_right: function () {
                this.getEditor().navigateWordRight();
            },


            /**
             * Elimina el sagnat de la línia actual.
             *
             * El contexte en el que s'executa aquest mètode correspon al IocContextTable i no pas al AceWrapper.
             */
            outdent: function () {
                this.getEditor().blockOutdent();
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
                    range = Range.fromPoints(this.offset_to_pos(start), this.offset_to_pos(end));
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
                this.getEditor().setKeyboardHandler(new StateHandler(states));
            },


            /**
             * Estableix com a text seleccionat al editor el text entre la posició inicial i final passades com argument.
             *
             * @param {int} start - Caràcter inicial a seleccionar
             * @param {int} end - Caràcter final a seleccionar
             */
            set_selection: function (start, end) {
                var editor = this.getEditor(),
                    range = Range.fromPoints(this.offset_to_pos(start), this.offset_to_pos(end));
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
                this.setWrapMode(value);
            },

            /**
             * Retorna el número de línia on es troba el cursor
             *
             * @returns {int} línia a la que es troba el cursor
             */
            getCurrentRow: function () {
                return this.getEditor().getSelectionRange().start.row;
            },

            // Funcions del DokuWrapper

            restoreCachedFunctions: function () {
                // patcher.restoreCachedFunctions(this.id);
                this.dokuWrapper.restoreCachedFunctions(this.id);
            },

            incr_height: function (value) {

                this.$wrapper.css('height', (this.$wrapper.height() + value) + 'px');
                return this.$elementContainer.css('height', this.$wrapper.height() + 'px');
            }



        });
});