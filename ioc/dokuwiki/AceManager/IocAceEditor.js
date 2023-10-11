define([
    "dojo/Stateful",
    "dojo/_base/declare",
    "dojo/_base/lang"
], function (Stateful, declare, lang) {
    return declare([Stateful],
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
            /** @type {ace.Editor} @readonly */
            editor: null,

            /** @type {ace.EditSession} @readonly */
            session: null,

            /** @type {boolean} @private - Determina si el editor es de només lectura */
            _readOnly: false,

            /** @type {object} @private - Valors per defecte per inicialitzar l'editor */
            _default: {
                theme:               'textmate',
                containerId:         'editor',
                mode:                'text',
                readOnly:            false,
                wrapMode:            true,
                wrapLimit:           100,
                tabSize:             2,
                horizontalScrollBar: false,
                undoManager:         new ace.UndoManager(),
                onDocumentChange:    function (e) {
                    //console.log("callback: document change");
                },
                onCursorChange:      function (e) {
                    //console.log("callback: cursor change");
                }
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
                this.args = args || {};
            },

            init: function () {
                var args = this.args;
                this.setContainer(args.containerId);
                this.setTheme(args.theme);
                this.setMode(args.mode);
                this.setReadOnly(args.readOnly);
                this.setWrapMode(args.wrapMode);
                this.setWrapLimit(args.wrapLimit);
                this.setUndoManager();
                this.setTabSize(args.tabSize);
                this.setHorizontalScrollBarVisible(args.horizontalScrollBar);
                this.setDocumentChangeCallback(args.onDocumentChange);
                this.setChangeCursorCallback(args.onCursorChange);


                // ALERTA[Xavi] No esborrar, descomentar per depurar, mostra la informació sobre el token i el estat a la posició del cursor
                // var editor = this.editor;
                // this.editor.on("changeSelection", function() {
                //     var position = editor.getCursorPosition();
                //     var token = editor.session.getTokenAt(position.row, position.column);
                //     var state = editor.session.getState(position.row);
                //     console.log("Token: " , token, "State" , state);
                // });

            },

            /**
             * Estableix el contenidor al que s'incrustarà l'editor.
             *
             * @param {string?} container - Id del div que contindrá l'editor, si no s'especifica es fa servir el
             * contenidor per defecte.
             */
            setContainer: function (container) {
                var value = container || this._default.containerId;
                this.set('editor', ace.edit(value));
                this.set('session', this.editor.getSession());



            },

            /**
             * Estableix el tema que fará servir l'editor.
             *
             * @param {string?} theme - nom del tema, si no s'especifica es fa servir el tema per defecte.
             */
            setTheme: function (theme) {
                this.editor.setTheme("ace/theme/" + (theme || this._default.theme));
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
                    this.session.setMode("ace/mode/" + (mode || this._default.mode));
                }
            },

            /**
             * Estableix si el editor es de només lectura.
             *
             * @param {boolean?} readOnly - Cert per fer que sigui de només lectura, si no s'especifica es fa servir el
             * valor per defecte
             */
            setReadOnly: function (readOnly) {
                var value = readOnly !== null ? readOnly : this._default.readOnly;
                this._readOnly = value;
                this.editor.setReadOnly(value);
            },

            /**
             * Estableix si es mostra el limit de caràcters per fila i passa a la següent fila al arribar al limit. Si
             * no s'especifica es fa servir el valor per defecte.
             *
             * @param {boolean?} wrapMode - Cert per fer activar els limits.
             * */
            setWrapMode: function (wrapMode) {
                var value = wrapMode !== null ? wrapMode : this._default.wrapMode;
                this.editor.setShowPrintMargin(value);
                this.session.setUseWrapMode(value);
            },

            /**
             * Estableix el límite de caràcters per fila.
             *
             * @param {int?} wrapLimit - Nombre de caràcters, si no s'especifica es fa servir el valor per defecte.
             */
            setWrapLimit: function (wrapLimit) {
                var value = (wrapLimit || this._default.wrapLimit);
                this.session.setWrapLimitRange(null, value);
                this.editor.setPrintMarginColumn(value);
            },

            /**
             * Estableix el gestor per desfer canvis, si no es passa cap gestor es fa servir el valor per defecte.
             *
             * @param {ace.UndoManager?} undoManager - El gestor per desfer canvis
             */
            setUndoManager: function (undoManager) {
                this.session.setUndoManager(undoManager || this._default.undoManager);
            },

            /**
             * Estableix si s'ha de mostrar o no la barra de scroll horitzontal.
             *
             * @param {boolean?} visible - Cert si s'ha de mostrar o false si no s'ha de mostrar
             */
            setHorizontalScrollBarVisible: function (visible) {
                this.editor.renderer.setHScrollBarAlwaysVisible(visible || this._default.horizontalScrollBar);
            },

            /**
             * Estableix la mida en caràcters de la tabulació.
             *
             * @param {int?} tabSize - Mida en nombre de caràcters de les tabulacions, si no s'especifica es fa servir
             * el valor per defecte.
             */
            setTabSize: function (tabSize) {
                this.session.setTabSize(tabSize || this._default.tabSize);
            },

            /**
             * Afegeix la funció que serà cridada quan hi hagin canvis al document.
             *
             * @param {function} args - Funció que es cridada quan hi ha un canvi al document, si no s'especifica es fa
             * servir el valor per defecte
             */
            setDocumentChangeCallback: function (args) {
                var callback = args || this._default.onDocumentChange;
                this.session.on('change', lang.hitch(this, function (e) {
                        if (!this._readOnly) {
                            return callback(e);
                        }
                    })
                );
            },

            /**
             * Afegeix la funció que serà cridada quan el cursor canvia de posició
             *
             * @param {function} args - Funció que es cridada quan el cursor canvia de posició
             */
            setChangeCursorCallback: function (args) {
                var callback = args || this._default.onCursorChange;
                this.editor.getSelection().on('changeCursor', function (e) {
                    return callback(e);
                });
            },

            getText: function () {
                return this.get('session').getValue();
            },

            destroy: function () {
                ace.edit(this.args.containerId).destroy()
            }
        });
});