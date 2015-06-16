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
    "ioc/gui/content/ContentTool",
    "ioc/gui/content/DocumentContentTool",
    "ioc/gui/content/MetaInfoContentTool",
    "ioc/gui/content/EditorContentToolDecoration",
    "ioc/gui/content/requestReplacerFactory",
    "ioc/gui/content/MediaDetailsContentToolDecoration",
    "ioc/gui/content/MetaMediaDetailsCTDecoration"
], function (declare, lang, ContentTool, DocumentContentTool, MetaInfoContentTool, EditorContentToolDecoration, requestReplacerFactory,MediaDetailsContentToolDecoration,MetaMediaDetailsCTDecoration) {

//    var MetaContentToolDecoration = declare(null,
//            /**
//             * Aquesta classe es una decoració i requereix que es faci un mixin amb un ContentTool per poder funcionar.
//             *
//             * Afegeix els métodes per observar a un altre document el que permet que reaccioni als seus esdeveniments
//             * de la següent manera:
//             *      - Si el document es seleccionat es fa visible
//             *      - Si el document es des-seleccionat s'amaga
//             *      - Si el document es tanca es destrueix
//             *
//             * Requereix una propietat docId quan es fa el mixin per determinar a quin document ha de observar.
//             *
//             * @class MetaContentToolDecoration
//             * @extends ContentTool
//             * @private
//             */
//            {
//                /**
//                 * Accions a realitza desprès de carregar.
//                 *
//                 * S'enregistra al document a observar.
//                 * @override
//                 * @protected
//                 */
//                postLoad: function () {
//                    var observed = this.dispatcher.getContentCache(this.docId).getMainContentTool();
//
//                    this.registerToEvent(observed, "document_closed", lang.hitch(this, this._onDocumentClosed));
//                    this.registerToEvent(observed, "document_selected", lang.hitch(this, this._onDocumentSelected));
//                    this.registerToEvent(observed, "document_unselected", lang.hitch(this, this._onDocumentUnselected));
//
//                    this.watch("selected", function (name, oldValue, newValue) {
//                        var contentCache = this.dispatcher.getContentCache(this.docId);
//                        if (contentCache) {
//                            contentCache.setCurrentId("metadataPane", this.id)
//                        }
//                    });
//
//                    this.inherited(arguments);
//                },
//
//                /**
//                 * Aquest ContentTool s'elimina
//                 *
//                 * @private
//                 */
//                _onDocumentClosed: function (data) {
//                    if (data.id == this.docId) {
//                        this.removeContentTool();
//                    }
//                },
//
//                /**
//                 * Aquest ContentTool es fa visible.
//                 *
//                 * @private
//                 */
//                _onDocumentSelected: function (data) {
//                    var selectedPane,
//                        parent;
//
//                    if (data.id == this.docId && this.domNode) {
//
//                        this.showContent();
//                        selectedPane = this.dispatcher.getContentCache(this.docId).getCurrentId('metadataPane');
//
//                        if (selectedPane == this.id) {
//                            parent = this.getContainer();
//                            parent.selectChild(this);
//                        }
//                    }
//                },
//
//                /**
//                 * Aquest ContentTool s'amaga.
//                 *
//                 * @private
//                 */
//                _onDocumentUnselected: function (data) {
//                    if (data.id == this.docId && this.domNode) {
//                        this.hideContent();
//                    }
//                }
//            }),


       var RequestContentToolDecoration = declare(null,
            /**
             * Aquesta classe es una decoració i requereix que es faci un mixin amb un ContentTool per poder funcionar.
             *
             * Aquesta decoració reemplaça els continguts que enllacin a altres direccións per crides ajax que
             * respondran a diferents esdevenimets.
             *
             * @class RequestContentToolDecoration
             * @extends ContentTool
             * @private
             */
            {
                /** @type Request @protecte*/
                requester: null,

                /** @private */
                replacers: {},

                /** @private */
                replacersParams: {},

                constructor: function (args) {
                    if (args.requester) {
                        this.requester = args.requester;
                    } else {
                        this._createRequest();
                    }
                },

                /**
                 * Carrega i genera un nou objecte Request. Aquest objecte no inclou urlBase, aquesta s'ha de passar
                 * via el reemplaçador.
                 *
                 * @private
                 */
                _createRequest: function () {

                    require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                        this.requester = new Request();

                        this.requester.updateSectok = function (sectok) {
                            this.sectok = sectok;
                        };

                        this.requester.sectok = this.requester.dispatcher.getSectok();
                        this.requester.dispatcher.toUpdateSectok.push(this.requester);
                    }));
                },

                /**
                 * Aquest métode realitza la renderització de els dades i la substitució dels enllaços per crides AJAX.
                 * @protected
                 */
                render: function () {
                    this.set('content', this.renderEngine(this.data));
                    this._replaceContent();
                },

                /**
                 * Itera sobre tots els reemplaçadors afegits i realitza la substitució cridant a la funció de reemplaç
                 * @private
                 */
                _replaceContent: function () {
                    for (var replacer in this.replacers) {
                        lang.hitch(this, this.replacers[replacer])(this.replacersParams[replacer]);
                    }

                    this.inherited(arguments);
                },

                /**
                 * Afegeix un reemplaçador de continguts específic.
                 * TODO[Xavi] Cal que sigui un Hash o pot ser un array?
                 *
                 * @param {string} type - tipus per identificar aquest reemplaçador
                 * @param {function} replacer - funció que es cridarà quan calgui fer el reemplaç
                 * @param {*} params - arguments necessaris per efectuar el reemplaç
                 */
                addReplacer: function (type, replacer, params) {
                    if (!this.replacers) {
                        this.replacers = {};
                        this.replacersParams = {};
                    }

                    params.request = this.requester;
                    this.replacersParams[type] = params;
                    this.replacers[type] = replacer;
                },

                /**
                 * Afegeix un hash de reemplaçadors.
                 *
                 * @param {{string:{type: string, replacer:function, params:{query: string, nodeId:string, trigger:string}}}} replacers
                 */
                addReplacers: function (replacers) {
                    for (var replacer in replacers) {
                        this.addReplacer(
                            replacers[replacer]['type'],
                            replacers[replacer]['replacer'],
                            replacers[replacer]['params']);
                    }
                }
            });

    return {
        /** @enum */
        decoration: {
//          META:               'meta',
            EDITOR:             'editor',
            REQUEST:            'request',
            REQUEST_LINK:       'request_link',
            REQUEST_FORM:       'request_form',
            MEDIADETAILS:       'mediadetails',
            METAMEDIADETAILS:   'metamediadetails'
        },

        /** @enum */
        generation: {
            BASE:     'base',
            META:     'meta',
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
            args = args ? args : {};
            args.requester = contentTool.requester;

            //console.log("Hi ha arguments al decorador?", args);

            switch (type) {
//                case this.decoration.META:
//                    decoration = new MetaContentToolDecoration(args);
//                    break;

                case this.decoration.EDITOR:
                    decoration = new EditorContentToolDecoration(args)
                    //console.log("Decoration:", decoration);
                    //console.log("Decoration args:", args);
                    //alert("stop");
                    break;

                case this.decoration.REQUEST:
                    //Aquest request no afegeix res, els replaces han d'anar ja afegits als arguments dins del
                    //args.replacers.
                    //
                    //Aquest es un exemple de com s'afegiría el tipus link manualment:

                    //args.replacers = {
                    //    'link': {
                    //        type: 'link',
                    //        replacer: requestReplacerFactory.getRequestReplacer('link'),
                    //        params: {
                    //            trigger: "click",
                    //            urlBase: args.urlBase
                    //
                    //        }
                    //    }
                    //};
                    decoration = new RequestContentToolDecoration(args);

                    if (args.replacers) {
                        decoration.addReplacers(args.replacers);
                    }

                    break;

                case this.decoration.REQUEST_LINK:
                    decoration = new RequestContentToolDecoration(args);
                    decoration.addReplacer('link', requestReplacerFactory.getRequestReplacer('link'), {
                        trigger: "click",
                        urlBase: args.urlBase,
                        standbyTarget: args.standbyTarget
                    });
                    break;

                case this.decoration.REQUEST_FORM:
                    decoration = new RequestContentToolDecoration(args);
                    decoration.addReplacer('form', requestReplacerFactory.getRequestReplacer('form'), {
                        trigger: "click",
                        urlBase: args.urlBase,
                        form:    args.form,
                        standbyTarget: args.standbyTarget
                    });
                    break;
                case this.decoration.MEDIADETAILS:

                    decoration = new MediaDetailsContentToolDecoration(args);

                    break;
                case this.decoration.METAMEDIADETAILS:

                    decoration = new MetaMediaDetailsCTDecoration(args);

                    break;

                default:
                    console.error('No existeix el tipus de decoració ' + type);
            }

            if (decoration) {
                return declare.safeMixin(contentTool, decoration);
            }
            else {
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

                case this.generation.META:
                     return new MetaInfoContentTool(args);

                case this.generation.DOCUMENT:
                    return new DocumentContentTool(args);

                default:
                    console.error('No existeix el tipus de ContentTool ' + type);
            }
        }
    }
})
;