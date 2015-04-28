/**
 * Aquest mòdul exposa la creació i decoració de objectes ContentTool a través dels métodes públics les propietats
 * que exposa.
 *
 * Tots els tipus de ContentTool seran creats i decorats a travès d'aquesta factoria, sent les classes específiques tant
 * per instancar-los com per decorar-los privades a aquest mòdul.
 *
 * Encara que actualment el codi d'un o mès d'aquestes classes es trobi en un fitxer independent s'ha de considerar
 * que son privats a aquesta classe i així s'han anotat.
 *
 * No es pot garantir que les classes marcades com a privades siguien accessibles en el futur.
 *
 * @module contentToolFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/dom-attr",
    "dojo/dom",
    "dojo/on",
    "ioc/gui/content/ContentTool",
    "ioc/gui/content/DocumentContentTool",
], function (declare, lang, event, att, dom, on, ContentTool, DocumentContentTool) {

    var MetaContentToolDecoration = declare(null,
            /**
             * Aquesta classe es una decoració i requereix que es faci un mixin amb un ContentTool per poder funcionar.
             *
             * Afegeix els métodes per observar a un altre document el que permet que reaccioni als seus esdeveniments
             * de la següent manera:
             *      - Si el document es seleccionat es fa visible
             *      - Si el document es des-seleccionat s'amaga
             *      - Si el document es tanca es destrueix
             *
             * Requereix una propietat docId quan es fa el mixin per determinar a quin document ha de observar.
             *
             * @class MetaContentToolDecoration
             * @extends ContentTool
             * @private
             */
            {
                /**
                 * Accions a realitza desprès de carregar.
                 *
                 * S'enregistra al document a observar.
                 * @override
                 * @protected
                 */
                postLoad: function () {
                    var observed = this.dispatcher.getContentCache(this.docId).getMainContentTool();

                    this.registerToEvent(observed, "document_closed", lang.hitch(this, this._onDocumentClosed));
                    this.registerToEvent(observed, "document_selected", lang.hitch(this, this._onDocumentSelected));
                    this.registerToEvent(observed, "document_unselected", lang.hitch(this, this._onDocumentUnselected));

                    this.watch("selected", function (name, oldValue, newValue) {
                        var contentCache = this.dispatcher.getContentCache(this.docId);
                        if (contentCache) {
                            contentCache.setCurrentId("metadataPane", this.id)
                        }
                    })
                },

                /**
                 * Aquest ContentTool s'elimina
                 *
                 * @private
                 */
                _onDocumentClosed: function (data) {
                    if (data.id == this.docId) {
                        this.removeContentTool();
                    }
                },

                /**
                 * Aquest ContentTool es fa visible.
                 *
                 * @private
                 */
                _onDocumentSelected: function (data) {
                    var selectedPane,
                        parent;

                    if (data.id == this.docId && this.domNode) {

                        this.showContent();
                        selectedPane = this.dispatcher.getContentCache(this.docId).getCurrentId('metadataPane');

                        if (selectedPane == this.id) {
                            parent = this.getContainer();
                            parent.selectChild(this);
                        }
                    }
                },

                /**
                 * Aquest ContentTool s'amaga.
                 *
                 * @private
                 */
                _onDocumentUnselected: function (data) {
                    if (data.id == this.docId && this.domNode) {
                        this.hideContent();
                    }
                }
            }),

        RequestContentToolDecoration = declare(null,
            /**
             * Aquesta classe es una decoració i requereix que es faci un mixin amb un ContentTool per poder funcionar.
             *
             * Aquesta decoració substitueix el codi html dels enllaços que es trobin en el contingut per crides
             * AJAX fent servir un objecte de tipus Request.
             *
             * Aquesta decoració requereix que sigui present també una decoració de tipus RenderContentToolDecoration,
             * que es afegida automàticament pel mòdul en cas de no trobar-se.
             *
             * @class RequestContentToolDecoration
             * @extends ContentTool
             * @private
             * @see RenderContentToolDecoration
             */
            {
                /** @type Request */
                requester: null,

                /**
                 * Carrega el objecte request en diferit per evitar conflictes
                 */
                constructor: function () {
                    require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                        this.requester = new Request();
                        this.requester.urlBase = "lib/plugins/ajaxcommand/ajax.php?call=page";
                    }));
                },

                /**
                 * Aquest métode realitza la renderització de els dades i la substitució dels enllaços per crides AJAX.
                 * @protected
                 */
                render: function () {
                    this.set('content', this.renderEngine(this.data));
                    this.replaceLinksWithRequest();
                },

                /**
                 * Afegeix un listener als enllaços trobats en aquest ContentTool per realitzar la crida via AJAX.
                 *
                 * @private
                 */
                replaceLinksWithRequest: function () {
                    var q = null,
                        self = this,
                        node = dom.byId(this.id);

                    on(node, "a:click", function (e) {
                        var arr = att.get(this, "href").split("?");

                        if (arr.length > 1) {
                            q = arr[1];
                        }

                        self.requester.sendRequest(q);
                        event.stop(e);
                    });
                }
            }),

        EditorContentToolDecorator = declare(null,
            /**
             * Aquesta classe es una decoració i requereix que es faci un mixin amb un ContentTool per poder funcionar.
             *
             * Aquesta decoració modifica el ContentTool per fer la comprovació de canvis abans de tancar-se i canviar
             * el color de la pestanya a vermell si es produeixen canvis.
             *
             * Aquesta decoració s'ha d'aplicar a un DocumentContentTool o que afegeixi un métode closeDocument() per poder
             * realitzar la comprovació de canvis abans de tancar-se.
             *
             * @class EditorContentTool
             * @extends DocumentContentTool
             * @private
             */
            {
                /**
                 * Es registra com observador de si mateix per modificar el estat quan es produeixen canvis.
                 *
                 * @override
                 */
                postLoad: function () {
                    // TODO[Xavi] Reactivar quan es mogui el ChangesManager
                    this.registerToEvent(this, "document_changed", lang.hitch(this, this.onDocumentChanged));
                    this.registerToEvent(this, "document_changes_reset", lang.hitch(this, this.onDocumentChangesReset));
                },

                /**
                 * Accio a realitzar quan hi han canvis al document.
                 *
                 * @param {object} data - Dades amb informació sobre l'esdeveniment
                 * @protected
                 */
                onDocumentChanged: function (data) {
                    if (data.id == this.id) {
                        if (this.controlButton) {
                            this.controlButton.containerNode.style.color = 'red';
                        }
                    }
                },

                /**
                 * Acció a realitzar quan es reinicialitza el document.
                 *
                 * @param {object} data - Dades amb informació sobre l'esdeveniment
                 * @protected
                 */
                onDocumentChangesReset: function (data) {
                    if (data.id == this.id) {
                        if (this.controlButton) {
                            this.controlButton.containerNode.style.color = 'black';
                        }
                    }
                },

                /**
                 * Acció a realitzar quan es tanca el document. Si detecta canvis demana confirmació i en cas de que no hi hagin
                 * o es descartin el canvis retorna cert i es procedeix al tancament del document.
                 *
                 * @returns {boolean}
                 */
                onClose: function () {
                    var changesManager = this.dispatcher.getChangesManager(),
                        confirmation = true;

                    if (changesManager.isChanged(this.id)) {
                        confirmation = this.dispatcher.discardChanges();
                    }

                    if (confirmation) {
                        this.closeDocument();
                    }

                    return confirmation;
                }
            }),

        DocumentContentToolDecoration = declare(null,
            /**
             * Aquesta classe es una decoració i requereix que es faci un mixin amb un ContentTool per poder funcionar.
             *
             * Aquesta decoració modifica el ContentTool per disparar els esdeveniments corresponents a documents.
             *
             * @class DocumentContentToolDecoration
             * @extends ContentTool
             * @private
             */
            {
                /**
                 * Aquest mètode es cridat automàticament al descarregar-se el ContentTool, en aquest cas s'encarrega
                 * de que es faci el tancament adequat.
                 *
                 * @override
                 */
                onUnload: function () {
                    this.closeDocument();
                },

                /**
                 * Realitza les accions de neteja abans de tancar el document i dispara l'esdeveniment de tancament
                 * del document.
                 *
                 * @override
                 */
                closeDocument: function () {
                    var currentTabId = this.dispatcher.getGlobalState().currentTabId;

                    if (currentTabId === this.id) {
                        this.dispatcher.getGlobalState().currentTabId = null;
                    }

                    this.dispatcher.getChangesManager().resetDocumentChangeState(this.id);
                    this.dispatcher.removeDocument(this.id);
                    this.triggerEvent('document_closed', {id: this.id});
                },

                /**
                 * Dispara l'esdeveniment de selecció del document.
                 *
                 * @override
                 */
                onSelect: function () {
                    this.dispatchEvent("document_selected", {id: this.id});
                },

                /**
                 * Dispara l'esdeveniment de des-selecció del document.
                 *
                 * @override
                 */
                onUnselect: function () {
                    this.dispatchEvent("document_unselected", {id: this.id});
                },

                /**
                 * Aquest métode s'encarrega d'establir aquest ContentTool com document actiu
                 */
                setCurrentDocument: function (id) {
                    this.dispatcher.getGlobalState().currentTabId = id;
                    this.dispatcher.getContentCache(id).setMainContentTool(this);
                    this.dispatchEvent("document_selected", {id: id});
                }
            });

    return {
        /** @enum */
        decoration: {
            META:    'meta',
            //RENDER:  'render',
            REQUEST: 'request',
            EDITOR:  'editor'
        },

        /** @enum */
        generation: {
            BASE:     'base',
            DOCUMENT: 'document'
        },

        /**
         * Decora el ContentTool amb el tipus de decoració i valors passats com arguments.
         *
         * Aquest mètode es cridat automàticament pels ContentTools, no cal cridar-lo manualment.
         *
         * @param {string} type - Tipus de decoració
         * @param {ContentTool} contentTool - ContentTool a decorar
         * @param {*} args - Arguments necessaris per configurar la decoració
         * @returns {ContentTool} - ContentTool decorat
         * @protected
         * @see ContentTool.decorate()
         */
        decorate: function (type, contentTool, args) {
            var decoration;

            switch (type) {
                case this.decoration.META:
                    decoration = new MetaContentToolDecoration(args);
                    break;

                case this.decoration.REQUEST:
                    decoration = new RequestContentToolDecoration();
                    break;

                case this.decoration.DOCUMENT:
                    decoration = new DocumentContentToolDecoration(args);
                    break;

                case this.decoration.EDITOR:
                    decoration = new EditorContentToolDecorator(args);
                    break;

                default:
                    console.error('No existeix el tipus de decoració ' + type);
            }

            if (decoration) {
                return declare.safeMixin(contentTool, decoration);
            } else {
                return contentTool;
            }
        },

        /**
         * Genera un ContentTool del tipus especificat amb els arguments passats.
         *
         * @param {string} type - Tipus del ContentTool a generar
         * @param {*} args -
         * @returns {ContentTool} - ContentTool instanciat
         */
        generate: function (type, args) {
            args.decorator = this;

            switch (type) {
                case this.generation.BASE:
                    return new ContentTool(args);

                case this.generation.DOCUMENT:
                    return new DocumentContentTool(args);

                default:
                    console.error('No existeix el tipus de ContentTool ' + type);
            }
        }
    }
});