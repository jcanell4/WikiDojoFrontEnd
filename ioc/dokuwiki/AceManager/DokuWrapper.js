define([
    "dojo/Stateful",
    "dojo/_base/declare",
    "ioc/wiki30/dispatcherSingleton",
    "ioc/dokuwiki/AceManager/patcher",
    'ioc/wiki30/GlobalState',
], function (Stateful, declare, dispatcher, patcher, GlobalState) {
    return declare([Stateful],
        /**
         * Embolcall per manipular un textarea.
         *
         * @class DokuWrapper
         * @extends dojo.Stateful
         * @author Xavier García<xaviergaro.dev@gmail.com>
         */
        {
            /** @type {boolean} @private */
            patching: false,

            /** @type {Node} @private */
            textArea: null,

            /**
             * AceWrapper al que està enllaçat actualment el DokuWrapper
             *
             * @type {AceWrapper}
             * @private
             */
            aceWrapper: null,

            /**
             * El contenidor s'estableix automàticament al afegir aquest wrapper a un contenidor
             *
             * @type {Container}
             * @protected
             */
            container: null,


            /**
             * Funció que es cridarà al enviar el formulari
             *
             * @type {function}
             * @private
             */
            doku_submit_handler: null,

            /** @type {function} @private */
            doku_get_selection: null,

            /** @type {function} @private */
            doku_set_selection: null,

            /** @type {selection_class} @private @constructor*/
            doku_selection_class: null,


            /**
             * Al constructor passem el textarea que volem embolcallar i el wrapper del editor ace.
             *
             * @param {AceWrapper} aceWrapper - Embolcall del editor ace enllaçat.
             * @param {string} textArea - Id del textarea que conté el text de la wiki
             */
            constructor: function (aceWrapper, textArea) {
                this.setTextArea(textArea);
                this.setAceWrapper(aceWrapper);
                this._init();
            },

            /**
             * @param {string} textArea - Id del text area a establir
             */
            setTextArea: function (textArea) {
                if (textArea) {
                    this.set('textArea', document.getElementById(textArea));
                } else {
                    this.setTextArea('wiki__text');
                }
            },

            /**
             * @param {AceWrapper} aceWrapper - Embolcall del editor ace que volem enllaçar
             */
            setAceWrapper: function (aceWrapper) {
                this.set('aceWrapper', aceWrapper)
            },


            /**
             * Inicialitza l'embolcall aplicant els parxes necessaris per afegir les noves funcions al editor a sobre
             * de les que ja existeixen.
             *
             * A aquesta funció es troben definides com a funcións privades les que es pasaran al patcher per se afegides,
             * es per això que totes tenen com a primer paràmetre una funció que es la que serà cridada a continuació o
             * segons les condicions establertes.
             *
             * @private
             */
            _init: function () {
                var self = this,

                    id = GlobalState.getCurrentId(),

                    /**
                     * @param {function} func - Funcio a cridar a continuació
                     * @param {string} id - Id del text area
                     * @private
                     */
                    _patchCurrentHeadlineLevel = function (func, id) {
                        if (id === self.textArea.id) {
                            jQuery(self.textArea).val(self.aceGetValue());
                        }

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
                        if (self.patching && selection.obj.id === self.textArea.id) {
                            self.acePasteText(selection.start, selection.end, text);
                            selection.end = selection.start + text.length - (opts.endofs || 0);
                            selection.start += opts.startofs || 0;
                            if (opts.nosel) {
                                selection.start = selection.end;
                            }
                            self.aceSetSelection(selection.start, selection.end);
                        } else {
                            func(selection, text, opts);
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
                        if (obj.id === self.textArea.id) {
                            self.aceSetWrap(value !== 'off');
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

                        var id = (typeof obj.attr === "function" ? obj.attr('id') : void 0) || obj;

                        if (self.patching && id === self.textArea.id) {
                            self.aceSizeCtl(value);
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

                        if (self.patching && obj === self.textArea) {
                            jQuery(self.textArea).val(self.aceGetValue());
                            result = self.aceGetSelection();
                            selection = new self.doku_selection_class();
                            selection.obj = self.textArea;
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

                        this.doku_get_text = this.getText;
                        this.getText = function () {
                            if (self.patching && this.obj === self.textArea) {
                                return self.aceGetText(this.start, this.end);
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
                        if (self.patching && selection.obj.id === self.textArea.id) {
                            self.aceSetSelection(selection.start, selection.end);
                        } else {
                            if (func) {
                                func(selection);
                            }
                        }
                    };

                patcher.patch('currentHeadlineLevel', _patchCurrentHeadlineLevel, id);
                patcher.patch('pasteText', _patchPasteText, id);
                patcher.patch('setWrap', _patchSetWrap, id);
                patcher.patch('sizeCtl', _patchSizeCtl, id);

                this.doku_get_selection = patcher.patch('getSelection', _patchGetSelection, id);
                this.doku_selection_class = patcher.patch('selection_class', _patchSelectionClass, id);
                this.doku_set_selection = patcher.patch('setSelection', _patchSetSelection, id);

                jQuery(this.textArea.form).submit(function (event) {
                    if (this.patching) {
                        return jQuery(self.textArea).val(self.aceGetValue());
                    }
                });

                jQuery(window).resize(function (event) {
                    if (this.patching) {
                        return self.aceOnResize();
                    }
                });

                this.doku_submit_handler = this.textArea.form.onsubmit;
            },

            disable: function () {
                this.patching = true;
                jQuery(this.textArea).hide();
            },

            enable: function () {
                this.patching = false;
                jQuery(this.textArea).show();
            },

            focus: function () {
                jQuery(this.textArea).focus();
            },

            get_cookie: function (name) {
                return DokuCookie.getValue(name);
            },

            get_readonly: function () {
                return jQuery(this.textArea).attr('readonly');
            },

            /**
             * Retorna la posició inical i final de la selecció al textarea.
             *
             * @returns {{start: *, end: *}}
             */
            get_selection: function () {
                var selection;
                selection = this.doku_get_selection(this.textArea);

                return {
                    start: selection.start,
                    end:   selection.end
                };
            },

            /**
             * Retorna el contingut del editor.
             *
             * @returns {String}
             */
            get_value: function () {
                return jQuery(this.textArea).val();
            },

            /**
             * Retorna si les paraules es tallan al final de la línia o no.
             *
             * @returns {boolean}
             */
            get_wrap: function () {
                return jQuery(this.textArea).attr('wrap') !== 'off';
            },

            /**
             * Retorna la alçada interior del textarea.
             *
             * @returns {int}
             */
            inner_height: function () {
                return jQuery(this.textArea).innerHeight();
            },

            set_cookie: function (name, value) {
                DokuCookie.setValue(name, value);
            },

            /**
             * Estableix la selecció entre els punts passats com a inicial i final.
             *
             * @param {int} start - Punt inicial
             * @param {int} end - Punt final
             */
            set_selection: function (start, end) {
                var selection;
                selection = new this.doku_selection_class();
                selection.obj = this.textArea;
                selection.start = start;
                selection.end = end;
                this.doku_set_selection(selection);
            },

            /**
             * Estableix el text al textarea.
             *
             * @param {string} value
             */
            set_value:    function (value) {
                jQuery(this.textArea).val(value);
            },

            // TODO d'on surt el summaryCheck()? de js.php? --> Surt de /lib/scripts/edit.js#summaryCheck()
            text_changed: function () { // TODO[Xavi] No es crida?
                dispatcher.getChangesManager().addDocumentChanged();
                //dispatcher.setUnsavedChangesState(true);
                return summaryCheck();
            },

            /**
             * Obté la selecció del embolcall del ace editor.
             *
             * @returns {selection_class}
             */
            aceGetSelection: function () {
                return this.aceWrapper.get_selection();
            },

            /**
             * Obté el text entre la posició inicial i final del embolcall del ace editor.
             *
             * @param {int} start - Punt inicial
             * @param {int} end - Punt final
             * @returns {string}
             */
            aceGetText: function (start, end) {
                return this.aceWrapper.get_value().substring(start, end);
            },

            /**
             * Obté el text del embolcall del ace editor.
             *
             * @returns {string}
             */
            aceGetValue: function () {
                return this.aceWrapper.get_value();
            },

            /**
             * Enganxa el text entre la posició inicial i final passats com argument.
             *
             * @param {int} start - Punt inicial
             * @param {int} end - Punt final
             * @param {string} text - Text a enganxar
             */
            acePasteText: function (start, end, text) {
                this.aceWrapper.replace(start, end, text);
                this.aceWrapper.set_selection(start, end);
                this.aceWrapper.focus();
            },

            /**
             * Comunica la realització dels canvis al contenidor i el embolcall del ace.
             */
            aceOnResize: function () {
                this.container.on_resize();
                this.aceWrapper.resize();
            },

            /**
             * Estableix com a selecció amb els punts inicial i final passats com argument al embolcall del ace.
             *
             * @param {int} start - Punt inicial
             * @param {int} end - Punt final
             */
            aceSetSelection: function (start, end) {
                this.aceWrapper.set_selection(start, end);
                this.aceWrapper.focus();
            },

            /**
             * Activa o desactiva que es tallin les paraules al final de la línia.
             *
             * @param {string} value -  Els valos vàlids son 'on' i 'off'
             */
            aceSetWrap: function (value) {
                this.aceWrapper.set_wrap_mode(value);
                this.aceWrapper.focus();
            },

            /**
             * Estableix el valor d'alçada al contenidor i actualiza el embolcall del ace.
             *
             * @param {int} value - Nova alçada
             */
            aceSizeCtl: function (value) {
                this.container.incr_height(value);
                this.aceWrapper.resize();
                this.aceWrapper.focus();
            },

            /**
             * Cridat automàticament pel container al afegir-li aquest DokuWrapper
             * @param {Container} container
             * @protected
             */
            setContainer: function (container) {
                this.container = container;
            }


        });
});
