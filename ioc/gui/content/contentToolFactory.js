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
    "ioc/gui/content/renderEngineFactory",
    "dojo/_base/event",
    "dojo/dom-attr",
    "dojo/dom",
    "dojo/on",
    "ioc/gui/content/ContentTool",
    "ioc/gui/content/EditorContentTool"
], function (declare, lang, renderEngineFactory, event, att, dom, on, ContentTool, EditorContentTool) {

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

        RenderContentToolDecoration = declare(null,
            /**
             * Aquesta classe es una decoració i requereix que es faci un mixin amb un ContentTool per poder funcionar.
             *
             * Aquesta decoració afegeix un motor de render al ContentTool el que li permet mostrar la informació
             * de manera diferent segons el tipus de render especificat.
             *
             * Requereix una propietat type quan es fa el mixin per determinar a quin tipus de motor de render s'ha
             * de fer servir per interpretar les dades.
             *
             * @class RenderContentToolDecoration
             * @extends ContentTool
             * @private
             */
            {
                /**
                 * Processa les dades a través del motor de render i les afegeix al contingut amb el format obtingut.
                 *
                 * @protected
                 */
                render: function () {
                    this.set('content', this.renderEngine(this.data));
                },

                /**
                 * Afegeix un observador per renderitzar les dades quan aquestes canviin
                 *
                 * @override
                 */
                startup: function () {
                    this.renderEngine = renderEngineFactory.getRenderEngine(this.type);

                    this.watch("data", function () {
                        this.render();
                    });

                    if (this.data) {
                        this.render();
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
            META:     'meta',
            RENDER:   'render',
            REQUEST:  'request',
            DOCUMENT: 'document'
        },

        /** @enum */
        generation: {
            EDITOR: 'editor',
            BASE:   'base'
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

                case this.decoration.RENDER:
                    decoration = new RenderContentToolDecoration(args);
                    break;

                case this.decoration.REQUEST:
                    if (!contentTool.render) {
                        contentTool.decorate(this.decoration.RENDER, args);
                    }

                    decoration = new RequestContentToolDecoration();
                    break;

                case this.decoration.DOCUMENT:
                    decoration = new DocumentContentToolDecoration(args);
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

                case this.generation.EDITOR:
                    return new EditorContentTool(args);

                default:
                    console.error('No existeix el tipus de ContentTool ' + type);
            }
        }
    }
});