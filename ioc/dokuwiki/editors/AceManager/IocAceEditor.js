define([
    'ioc/dokuwiki/editors/AbstractIocEditor',
    'ioc/dokuwiki/editors/AceManager/rules/IocRuleSet',
    'ioc/dokuwiki/editors/AceManager/modes/IocAceMode',
    'ioc/dokuwiki/editors/AceManager/AceWrapper',
    'ioc/dokuwiki/editors/AceManager/DokuWrapper',
    'ioc/dokuwiki/editors/AceManager/IocCommands',
    'ioc/dokuwiki/editors/AceManager/plugins/LatexPreviewPlugin',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (AbstractIocEditor, IocRuleSet, IocAceMode, AceWrapper, DokuWrapper, IocCommands, LatexPreviewPlugin, declare, lang) {
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

                this.aceWrapper = new AceWrapper(this);
                this.dokuWrapper = new DokuWrapper(this.aceWrapper, args.textareaId, args.auxId);//TODO[Xavi] A banda de passar la info del JSINFO per paràmetre, s'ha de tenir en compte que el id del text area ja no serà aquest, si no el que nosaltres volgumen (i.e. multi edició)

                this.$textarea = jQuery('#' + args.textareaId);

                this.init(args);

            },

            // Funcions originalment al Container

            initContainer: function (id) {

                var element = jQuery('<div>'),
                    textarea = jQuery(this.dokuWrapper.textArea),
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

                var commands = new IocCommands(this.aceWrapper);

                this.initHandlers();
                this.initPlugins(args.plugins);


                this.on('change', function () {
                    if (this.currentEditor === this.EDITOR.TEXT_AREA) {
                        return;
                    }
                    this.dokuWrapper.set_value((this.aceWrapper.get_value()));
                    this.dokuWrapper.text_changed();
                    commands.hide_menu(); // ALERTA! es pot moure la subscripcció al propi commands
                    // preview.trigger(); // ALERTA! es pot moure la subscripcció al propi ace-preview
                });

                this.on('changeCursor', function () {
                    commands.hide_menu(); // ALERTA! es pot moure la subscripcció al propi commands
                    // preview.trigger(); // ALERTA! es pot moure la subscripcció al propi ace-preview
                });


                this.setValue(args.originalContent);

            },

            initPlugins: function(plugins ) {
                if (plugins) {
                    this.addPlugin(plugins);
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

            getText: function () {
                alert("es fa servir getText");
                return this.session.getValue();
            },

            destroy: function () {
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
                    this.currentEditor = this.EDITOR.TEXT_AREA
                } else {
                    this.currentEditor = this.EDITOR.TEXT_AREA;
                }

                if (this.enabled) {
                    this.disable();
                } else {
                    this.enable();
                }
            },

            enable: function () {
                var selection = this.dokuWrapper.get_selection();
                this.dokuWrapper.disable();

                this.set_height(this.dokuWrapper.inner_height()); // ALERTA! Set_height no es troba aqui si no al facade!
                this.show(); // ALERTA! no es troba aqui si no al facade!
                this.aceWrapper.set_value(this.dokuWrapper.get_value());
                this.aceWrapper.resize();
                this.aceWrapper.focus();
                this.aceWrapper.set_selection(selection.start, selection.end);

                this.dokuWrapper.set_cookie('aceeditor', 'on');

                this.enabled = true; // ALERTA! això es del facade!
            },

            disable: function () {
                var selection;

                selection = this.aceWrapper.get_selection();
                this.dokuWrapper.set_cookie('aceeditor', 'off');

                this.hide();
                this.dokuWrapper.enable();
                this.dokuWrapper.set_value(this.aceWrapper.get_value());
                this.dokuWrapper.set_selection(selection.start, selection.end);
                this.dokuWrapper.focus();

                this.enabled = false;

            },

            resize: function() {
                this.aceWrapper.resize();
            },

            show: function () {
                var wrapper = this.$wrapper,
                    element = this.$elementContainer;
                wrapper.show();
                element.css('width', wrapper.width() + 'px');
                return element.css('height', wrapper.height() + 'px');
            },

            hide: function () {
                return this.$wrapper.hide();
            },

            set_height: function (value) {
                // console.log("IocAceEditor#set_height", value);
                this.$wrapper.css('height', value + 'px');
                return this.$elementContainer.css('height', this.$wrapper.height() + 'px');
            },

            // Funcions mogudes del Facade
            getValue: function() {
                // console.log("IocAceEditor#getValue");
                if (this.currentEditor === this.EDITOR.ACE) {
                    return this.getEditorValue();
                } else {
                    return this.getTextareaValue();
                }
            },

            getEditorValue: function () {
                return this.aceWrapper.get_value();
            },

            getTextareaValue: function () {
                return this.dokuWrapper.get_value();
            },

            setValue: function(value) {
                if (this.currentEditor === this.EDITOR.ACE) {
                    this.setEditorValue(value);
                } else {
                    this.setTextareaValue(value);
                }
            },

            setEditorValue: function (value) {
                return this.aceWrapper.set_value(value);
            },

            setTextareaValue: function (value) {
                return this.dokuWrapper.set_value(value);
            },

            addPlugin: function (plugins) {
                if (Array.isArray((plugins))) {
                    for (var i=0; i<plugins.length; i++) {
                        this.initializePlugin(plugins[i]);
                    }
                } else {
                    this.initializePlugin(plugins);
                }
            },

            initializePlugin: function(_plugin) {
                var plugin = new _plugin();
                plugin.setEditor(this);
                plugin.init();
            }
        });
});