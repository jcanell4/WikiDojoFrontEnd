define([
    'ioc/dokuwiki/editors/AbstractIocEditor',
    'ioc/dokuwiki/editors/AceManager/rules/IocRuleSet',
    'ioc/dokuwiki/editors/AceManager/modes/IocAceMode',
    'ioc/dokuwiki/editors/AceManager/IocCommands',
    // 'ioc/dokuwiki/editors/AceManager/plugins/LatexPreviewPlugin',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'ioc/dokuwiki/editors/AceManager/state_handler',
    'ioc/dokuwiki/editors/AceManager/AceEditorReadonlyBlocksManager'

], function (AbstractIocEditor, IocRuleSet, IocAceMode, IocCommands, /*LatexPreviewPlugin,*/ declare, lang, state_handler, AceEditorReadonlyBlocksManager) {

    var Range = ace.require('ace/range').Range,
        StateHandler = state_handler.StateHandler;

    /**
     * Registre dels editors actius, serveix per fer els canvis de context als botons parxejats
     */
    var editorRegistry = {};


    var patcher = (function () {
        var originalFunctions = {},
            cachedFunctions = {},
            /**
             * Afegeix una funció al objecte dw_editor si existeix alguna amb aquest nom o al objecte window si no s'ha
             * trobat cap coincidencia amb el nom.
             *
             * Aquesta funció no reemplaça l'anterior, si no que s'afegeix a la original de manera que es criden totes.
             *
             * @param {string} name - nom de la funció
             * @param {function} func - funció per afegir
             * @param {string} id - id corresponent a la pestanya que s'està editant
             * @returns {function|null} - La referéncia a la funció parxejada
             */
            patch = function (name, func, id, editor) {

                if (!id) {
                    throw new Error("No s'ha especificat la id per afegir al cache");
                }

                var obj = (dw_editor && dw_editor[name]) ? dw_editor : window,
                    orig_func;

                if (originalFunctions[name]) {
                    orig_func = originalFunctions[name];
                } else {
                    orig_func = obj[name];
                    originalFunctions[name] = orig_func;
                }

                obj[name] = function () {
                    var args, aux;

                    if (arguments.length > 0) {
                        args = [].slice.call(arguments, 0);
                    } else {
                        args = []
                    }

                    aux = [this, orig_func].concat([].slice.call(args));

                    return func.call.apply(func, aux);
                };

                // Afegim la nova funció al cache
                if (id) {
                    cacheFunction(id, name);
                }


                this.lastPatchedId = id;

                return obj[name];
            },

            cacheFunction = function (id, name) {
                // console.log("cacheFunction:", id, name);
                var func = (dw_editor && dw_editor[name]) ? dw_editor[name] : window[name];

                if (!cachedFunctions[id]) {
                    cachedFunctions[id] = [];
                }
                cachedFunctions[id].push({name: name, func: func});

            },

            /**
             * Aquesta funció **sembla** que ja no es crida mai, ara es fa el canvi de context automàticament
             * @deprecated
             * @param id
             */
            restoreCachedFunctions = function (id) {

                if (id === this.lastPatchedId) {
                    return; // No cal restaurar
                }

                if (!cachedFunctions[id]) {
                    return;
                }

                var functions = cachedFunctions[id],
                    name, func;

                for (var i = 0, len = functions.length; i < len; i++) {
                    name = functions[i]['name'];
                    func = functions[i]['func'];

                    if (dw_editor && dw_editor[name]) {
                        dw_editor[name] = func
                    } else {
                        window[name] = func;
                    }
                }


                this.lastPatchedId = id;
            };

        return {
            patch: patch,

            restoreCachedFunctions: restoreCachedFunctions
        }
    }());


    return declare([AbstractIocEditor],
        /**
         * Classe per la gestió del editor ACE adaptat a la DokuWiki 3.0 del IOC. Aquesta classe hereta de Stateful,
         * no s'han de modificar les propietats manualment si es fa externament, s'han de cridar els mètodes
         * set(propietat) i get(propietat), de manera que es disparin apropiadament els watch().
         *
         * @extends dojo.Stateful
         * @author Xavier García<xaviergaro.dev@gmail.com>
         */
        {
            name: 'IocAceEditor', // ALERTA[Xavi] no se si això es fa servir enlloc

            editorType: 'ACE',

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
                // undoManager: new ace.UndoManager(),
                plugins: [
                    // LatexPreviewPlugin,
                    // IocSoundFormatButtonPlugin,
                    // DocumentPreviewButtonPlugin,
                    // WrapTogglePlugin,
                    // ACETogglePlugin,
                    // SaveButtonPlugin,
                    // CancelButtonPlugin
                ]

            },

            /** @type {Array} conté el llistat de plugins actius **/
            plugins: null,

            /** @type {object} arguments que s'han passat al constructor per configurar-lo */
            _args: {},

            editorType: 'ACE',

            /**
             * Aquests plugins es carregaran per tots els editors
             */
            defaultPlugins: [
                'ReadonlyBlocksToggle'
            ],

            ALLOW_SWITCH_EDITOR: null,

            /**
             * Inicialitza l'editor.
             *
             * @param args - un objecte amb la configuració personalitzada per l'editor. Es farà servir la configuració
             * per defecte per totes les propietats no difinides.
             *
             * @see IocAceEditor._default per veure una definició completa del objecte de configuració.
             */
            constructor: function (args) {

                this.ALLOW_SWITCH_EDITOR = args.ALLOW_SWITCH_EDITOR;

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

                this.$textarea = jQuery('#' + args.textareaId);
                this.textareaId = args.textareaId;

                this._patch(args.auxId);


                this.init(args);

            },

            _patch: function (id) {
                var context = this,

                    /**
                     * Cridat automàticament en fer clic a un botó parxejat
                     *
                     * @param textareaId
                     * @private
                     */
                    _switchContext = function (textareaId) {

                        var $textarea = jQuery('#' + textareaId);
                        var docId = $textarea.attr('data-doc-id');
                        var headerId = $textarea.attr('data-header-id');

                        if (docId) {
                            context.dispatcher.getGlobalState().setCurrentId(docId);
                        }

                        if (headerId) {
                            context.dispatcher.getGlobalState().setCurrentElement(headerId);
                        }

                        if (!editorRegistry[textareaId]) {
                            // ALERTA! això es normal en el cas dels popups
                            console.warn("Error: can't find an editor with textarea id: " + textareaId);
                        } else {
                            context = editorRegistry[textareaId];
                        }

                    },

                    /**
                     * @param {function} func - Funcio a cridar a continuació
                     * @param {string} id - Id del text area
                     * @private
                     */
                    _patchCurrentHeadlineLevel = function (func, id) {
                        return func(id);
                    },

                    /**
                     * @param {function} func - Funció que es crida si la selecció es troba al editor de la wiki i
                     * s'esta parxejant.
                     *
                     * @param {selection_class} selection
                     * @param {string} text
                     * @param opts
                     * @private
                     */
                    _patchPasteText = function (func, selection, text, opts) {

                        if (!opts) {
                            opts = {};
                        }

                        _switchContext(selection.obj.id);
                        if (context && context.currentEditor === context.EDITOR.ACE && selection.obj.id === context.$textarea.attr('id')) {

                            // ALERTA[Xavi] això no es pot aplicar al textarea perquè la posició del cursor al textarea no està sincornitzada amb l'editor, només s'actualitza quan es fa el canvi de mode ACE/textarea
                            if (context.readOnlyBlocksManager.isReadonlySection()) {
                                console.warn("Secció de només lectura!");
                                return;
                            }

                            context.replace(selection.start, selection.end, text);
                            context.setEditorSelection(selection.start, selection.end);
                            context.focus();


                            selection.end = selection.start + text.length - (opts.endofs || 0);
                            selection.start += opts.startofs || 0;
                            if (opts.nosel) {
                                selection.start = selection.end;
                            }
                            context.setEditorSelection(selection.start, selection.end);
                            context.focus();
                        } else {
                            func(selection, text, opts);
                        }

                        if (context) {
                            context.$textarea.trigger('change', {newContent: context.$textarea.val()});
                        }

                    },

                    /**
                     * Activa o desactiva que les paraules es tallin al final de la línia.
                     *
                     * @param {function} func - Funció que es crida en qualsevol cas
                     * @param {Node} obj - Serveix per discriminar si es tracta del editor de la doku o no.
                     * @param {string} value - Si el valor es 'off' es desactiva
                     * @private
                     */
                    _patchSetWrap = function (func, obj, value) {
                        func(obj, value);

                        _switchContext(obj.id);

                        if (obj.id === context.$textarea.attr('id')) {
                            context.set_wrap_mode(value !== 'off');
                            context.focus();
                        }
                    },

                    /**
                     * Estableix la llargada dels marges.
                     *
                     * @param {function} func - Funció que es crida en qualsevol cas
                     * @param {object} obj
                     * @param {int} value - Llargada dels marges.
                     * @private
                     */
                    _patchSizeCtl = function (func, obj, value) {
                        func(obj, value);

                        _switchContext(obj.id);

                        var id = (typeof obj.attr === "function" ? obj.attr('id') : void 0) || obj;

                        if (context.currentEditor === context.EDITOR.ACE && id === context.$textarea.attr('id')) {
                            context.incr_height(value);
                            context.resize();
                            context.focus();
                        }
                    },

                    /**
                     * Retorna la informació del text seleccionat al editor formada per l'objecte del que es tracta,
                     * la posició inicial i la posició final.
                     *
                     * @param {function} func - Funciò a cridar en cas de que no s'estigui parxejant
                     * @param {node} obj - Node a comparar amb el text area de edició.
                     * @returns {selection_class} - Informació del text seleccionat.
                     * @private
                     */
                    _patchGetSelection = function (func, obj) {
                        var result, selection;

                        _switchContext(obj.id);

                        if (context && context.currentEditor === context.EDITOR.ACE && obj === context.$textarea.get(0)) {
                            // jQuery(context.textarea).val(context.aceGetValue());
                            context.$textarea.val(context.getEditorValue());
                            result = context.getEditorSelection();


                            // this.editor.get_selection()

                            selection = new context.doku_selection_class();
                            selection.obj = context.$textarea.get(0);
                            selection.start = result.start;
                            selection.end = result.end;
                            return selection;

                        } else {
                            return func(obj);
                        }
                    },

                    /**
                     * Classe per recuperar el text selecionat, segons de quin objecte es tracti emmagatzemarà les dades
                     * del editor de la DokuWiki o el ace.
                     *
                     * @param {function?} func - No es fa servir, importat del original
                     * @class selection_class
                     * @constructor
                     * @private
                     */
                    _patchSelectionClass = function (func) {
                        if (func) {
                            func.apply(this);
                        }

                        this.doku_get_text = this.getText; // ALERTA[Xavi] Això no ha estat mai correcte? s'hauria de desar i recuperar del context i no del this!?

                        this.getText = function () {
                            if (context && context.currentEditor === context.EDITOR.ACE && this.obj === context.$textarea.get(0)) {
                                // return context.aceGetText(this.start, this.end);

                                return context.getEditorValue().substring(this.start, this.end);
                            } else {

                                return this.doku_get_text();
                            }
                        };
                    },

                    /**
                     * Estableix els punts de selecció inicial i final al editor de la DokuWiki o el ace.
                     *
                     * @param func - funció a cridar quan no està activat l'editor ace
                     * @param {selection_class} selection - selecció actual
                     * @private
                     */
                    _patchSetSelection = function (func, selection) {
                        _switchContext(selection.obj.id);

                        if (context && context.currentEditor === context.EDITOR.ACE && selection.obj.id === context.$textarea.attr('id')) {
                            context.setEditorSelection(selection.start, selection.end);
                            context.focus();
                        } else if (func) {
                            func(selection);
                        }
                    };

                patcher.patch('currentHeadlineLevel', _patchCurrentHeadlineLevel, id);
                patcher.patch('pasteText', _patchPasteText, id);
                patcher.patch('setWrap', _patchSetWrap, id);
                patcher.patch('sizeCtl', _patchSizeCtl, id);

                this.doku_get_selection = patcher.patch('DWgetSelection', _patchGetSelection, id);     //[wiki2015->  this.doku_get_selection = patcher.patch('getSelection', _patchGetSelection, id);]
                this.doku_selection_class = patcher.patch('selection_class', _patchSelectionClass, id);
                this.doku_setEditorSelection = patcher.patch('DWsetSelection', _patchSetSelection, id);  //[wiki2015->  this.doku_setEditorSelection = patcher.patch('DWsetSelection', _patchSetSelection, id);]
            },

            // Funcions originalment al Container

            initContainer: function (id, textareaId) {
                // console.log("IocAceEditor#initContainer", id, textareaId);

                var element = jQuery('<div>'),
                    // textarea = jQuery(this.dokuWrapper.textarea),
                    textarea = jQuery(document.getElementById(textareaId)),
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
                this.containerId = id;

                this.editor = ace.edit(id);




                this.session = this.editor.getSession();


            },

            init: function (args) {

                this.currentEditor = this.EDITOR.ACE;
                this.dispatcher = args.dispatcher;
                this.TOOLBAR_ID = args.TOOLBAR_ID;
                this.readOnlyBlocksManager = new AceEditorReadonlyBlocksManager(this);

                this.initContainer(args.containerId, args.textareaId);
                this.initDwEditor(this.$textarea);

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


                // var preview = acePreview({ace: this.aceWrapper}); // Convertit en plugin

                var commands = new IocCommands(this);

                this.initHandlers();
                // this.initPlugins(args.plugins);


                var plugins;
                var pluginNames = this.defaultPlugins;


                if (args.plugins) {
                    pluginNames = pluginNames.concat(args.plugins);
                    plugins = this.getPlugins(pluginNames);

                } else {
                    pluginNames = pluginNames.concat(
                        [
                            'IocSoundFormatButton',
                            'IocVideoFormatButton',
                            'IocGifFormatButton',
                            'DocumentPreviewButton',
                            'LatexPreview',
                            'TestReadonlyPlugin',
                            'TableEditor',
                            'TableEditorMultiline',
                            'TableEditorAccounting',
                            'EnableACE',
                            'EnableWrapper',
                            'SaveButton',
                            'CancelButton',
                            'SwitchEditorButton'
                        ]
                    );
                    plugins = this.getPlugins(pluginNames)
                }

                this.initPlugins(plugins);

                // ALERTA[Xavi] això s'ha de cridar desprès d'inicialitzar els plugins, ja que aquests poden afegir nous estas de només lectura

                this.readOnlyBlocksManager.enableReadonlyBlocks();

                this.id = args.id;

                // this.on('change', function (e) {
                //     if (this.currentEditor === this.EDITOR.TEXT_AREA) {
                //         return;
                //     }
                //
                //     if (e.type === "focus") { // disparar el focus com a canvi ho vam afegir nosaltres?
                //         return;
                //     }
                //
                //     console.log("- detectat canvi",e);
                //
                //
                //
                //
                //     // PROVA, no fem res, esta el textarea sincronitzat automàticament amb l'editor?
                //
                //     // // ALERTA sembla que el focus no es rellevant per solucionar el problema
                //     // if (e.type === "change" || e.type === "focus") { // Alerta[Xavi], originalment en fer focus s'actualitzava el textarea però ara sembla que sempre está sincronitzat
                //     //     console.log("- al textarea, establim el contingut a l'editor");
                //     //     // es un canvi disparat pel textarea
                //     //     this.setValue(this.getTextareaValue());
                //     // }
                //     //else {
                //     //     console.log("- a l'editor, establim el contingut al textaarea");
                //     //     this.setTextareaValue(this.get_value());
                //     // }
                //
                //     summaryCheck(); // ALERTA! Funció propia de la Dokuwiki
                //
                //     commands.hide_menu(); // ALERTA! es pot moure la subscripcció al propi commands
                //
                // });

                this.on('change', function () {
                    if (this.currentEditor === this.EDITOR.TEXT_AREA) {
                        return;
                    }
                    this.setTextareaValue(this.get_value());

                    doku_summaryCheck(); // ALERTA! Funció propia de la Dokuwiki      [wiki2015->  summaryCheck();]

                    commands.hide_menu(); // ALERTA! es pot moure la subscripcció al propi commands

                });

                this.on('changeCursor', function () {
                    commands.hide_menu(); // ALERTA! es pot moure la subscripcció al propi commands

                });

                this.setValue(args.content);

                // console.log("IocAceEditor.originalContent", args.originalContent);
                this.originalContent = args.originalContent;


                this.addToRegistry(this);
            },

            addToRegistry: function (editor) {
                if (editorRegistry[editor.textareaId]) {
                    console.warn("Warning: already registered an editor with textarea id: ", editor.textareaId);
                }

                editorRegistry[editor.textareaId] = editor;
            },

            removeFromRegistry: function (editor) {
                delete(editorRegistry[editor.textareaId]);
            },

            initPlugins: function (plugins) {
                this.plugins = [];

                if (plugins) {
                    this.addPlugins(plugins);
                }

                // console.log("plugins inicialitzats:", this.plugins);
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
                //[Josep] Alerta jQuery.browser està deprecated!
                 if (navigator.userAgent.search("Opera") >= 0) {    //[WIKI2015 -> if (jQuery.browser.opera) { ]
                    $editor.keypress(window.dw_editor.keyHandler);
                } else {
                    $editor.keydown(window.dw_editor.keyHandler);
                }


            },

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
                // console.log("#### Establert el undomanager");
                this.session.setUndoManager(new ace.UndoManager());
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

            destroy: function () {
                this.removeFromRegistry(this);
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
                    // this.currentEditor = this.EDITOR.TEXT_AREA;
                    this.disable();
                } else {
                    // this.currentEditor = this.EDITOR.ACE;
                    this.enable();
                }
            },

            enable: function () {

                var selection = this.getTextareaSelection();

                // this.dokuWrapper.disable();
                this.currentEditor = this.EDITOR.ACE;
                this.$textarea.hide();


                this.set_height(this.$textarea.innerHeight());
                this.show(); // ALERTA! no es troba aqui si no al facade!
                this.setEditorValue(this.getTextareaValue());
                this.resize();
                this.focus();
                this.setEditorSelection(selection.start, selection.end);

                DokuCookie.setValue('aceeditor', 'on'); // ALERTA[Xavi] Això no ho fem servir, era de la versió anterior


                // this.enabled = true; // ALERTA! això es del facade!
            },

            disable: function () {
                var selection = this.getEditorSelection();

                DokuCookie.setValue('aceeditor', 'off'); // ALERTA[Xavi] Això no ho fem servir, era de la versió anterior

                this.hide();
                // this.dokuWrapper.enable();
                this.currentEditor = this.EDITOR.TEXT_AREA;
                this.$textarea.show();


                this.setTextareaValue(this.get_value());
                // this.dokuWrapper.set_value(this.get_value());
                // this.dokuWrapper.setEditorSelection(selection.start, selection.end);
                this.setTextareaSelection(selection.start, selection.end);
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
                this.$wrapper.css('height', value + 'px');
                return this.$elementContainer.css('height', this.$wrapper.height() + 'px');
            },

            // Funcions mogudes del Facade
            getValue: function () {
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

            /**
             * Estableix el contingut del editor.
             *
             * @param {string} value - Text que s'establirà com a contingut del editor
             */
            setEditorValue: function (value) {
                this.getSession().setValue(value);
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

                // console.log("IocAceEditor#initializePlugin#_plugin", _plugin.config);
                var plugin = new _plugin.plugin();
                this.plugins.push(plugin);
                plugin.setEditor(this);
                plugin.init(_plugin.config);
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
                                if (!re) {
                                    console.error("Error:", currentState, tokenizer.regExps);
                                }
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

                while (re && (match = re.exec(line))) {
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
                                if (!re) {
                                    // currentState és una funció
                                    //console.error("Error:", currentState, tokenizer.regExps);
                                    continue;
                                }

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

            get_last_line_states: function () {
                var session = this.getSession(),
                    row = session.getLength()-1;
                    // state = row > 0 ? session.getState(row - 1) : 'start',
                    // state = 'start',
                    // line = session.getLine(session.getLength()-1);


                return this.get_line_states_preview(row, true);
            },


            /**
             * Retorna un objecte amb la posició del caràcter inicial i el caràcter final seleccionats. S'ha de tenir en
             * compta que no es tracta de posició de files i columnes si no de caràcters com si fosin un a continuació
             * del altre.
             *
             * @returns {{start: int, end: int}} - Caràcter inciial i final sel·leccionats.
             */
            getEditorSelection: function () {
                var editor = this.getEditor(),
                    range = editor.getSelection().getRange();

                return {
                    start: this.pos_to_offset(range.start),
                    end: this.pos_to_offset(range.end)
                };
            },

            /**
             * Retorna la posició inical i final de la selecció al textarea.
             *
             * @returns {{start: int, end: int}}
             */
            getTextareaSelection: function () {
                var selection = this.doku_get_selection(this.$textarea.get(0));

                return {
                    start: selection.start,
                    end: selection.end
                };
            },

            /**
             * Estableix la selecció entre els punts passats com a inicial i final.
             *
             * @param {int} start - Punt inicial
             * @param {int} end - Punt final
             */
            setTextareaSelection: function (start, end) {
                var selection;
                selection = new this.doku_selection_class();
                selection.obj = this.$textarea.get(0);
                selection.start = start;
                selection.end = end;
                this.doku_setEditorSelection(selection);
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
                // console.log(start, end, lines, this);
                var session = this.getSession(),
                    doc = session.getDocument(),
                    doc_length = end - start + 1,
                    min_length = Math.min(doc_length, lines.length);

                for (var i = 0, len = min_length; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
                    // console.log(doc);
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
            setEditorSelection: function (start, end) {
                var editor = this.getEditor(),
                    range = Range.fromPoints(this.offset_to_pos(start), this.offset_to_pos(end));
                editor.getSelection().setSelectionRange(range);
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


            restoreCachedFunctions: function () {
                patcher.restoreCachedFunctions(this.id);
            },

            incr_height: function (value) {
                this.$wrapper.css('height', (this.$wrapper.height() + value) + 'px');
                return this.$elementContainer.css('height', this.$wrapper.height() + 'px');
            },

            isChanged: function () {
                //console.log("IocAceEditor#isChanged", this.getValue().length, this.originalContent.length);

                console.log("|" + this.getValue() + "|");
                console.log("|" + this.originalContent + "|");

                return this.originalContent !== this.getValue();
            },

            resetOriginalContentState: function () {
                // console.log("IocAceEditor#resetOriginalContentState");
                this.originalContent = this.getValue();
            },


            addReadonlyBlock: function (state, callback, unique) {
                this.readOnlyBlocksManager.addReadonlyBlock(state, callback, unique);
            },

            isReadonlySection: function () {
                return this.readOnlyBlocksManager.isReadonlySection();
            },

        });


});