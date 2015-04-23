define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ioc/gui/content/renderEngineFactory",
    "dojo/_base/event",
    "dojo/dom-attr",
    "dojo/dom",
    "dojo/on",
    "ioc/gui/content/ContentTool",
    "ioc/gui/content/EditorContentTool",
    //"ioc/gui/content/DocumentContentTool",

], function (declare, lang, renderEngineFactory, event, att, dom, on, ContentTool, EditorContentTool) {

    /**
     * Aquesta classe requereix que es faci un mixin amb un ContentTool per poder funcionar.
     *
     * @class MetaContentTool
     * @extends EventObserver
     */
    var MetaContentTool = declare(null, {
            /**
             * @override
             * @protected
             */
            postLoad: function () {
                //console.log("Postload");
                var observed = this.dispatcher.getContentCache(this.docId).getMainContentTool();
                //console.log("docid: ", this.docId);
                //console.log("observer: ", observed);


                this.registerToEvent(observed, "document_closed", lang.hitch(this, this._onDocumentClosed));
                this.registerToEvent(observed, "document_selected", lang.hitch(this, this._onDocumentSelected));
                this.registerToEvent(observed, "document_unselected", lang.hitch(this, this._onDocumentUnselected));
                //console.log("observer despres de registrar: ", observed);

                this.watch("selected", function (name, oldValue, newValue) {
                    var contentCache = this.dispatcher.getContentCache(this.docId);
                    if (contentCache) {
                        contentCache.setCurrentId("metadataPane", this.id)
                    }
                })
            },

            /** @private */
            _onDocumentClosed: function (data) {
                if (data.id == this.docId) {
                    this.removeContentTool();
                }
            },

            /** @private */
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

            /** @private */
            _onDocumentUnselected: function (data) {
                //console.log("Rebut unselected");
                if (data.id == this.docId && this.domNode) {
                    this.hideContent();
                }
            }
        }),


        /**
         * Aquesta classe requereix que es faci un mixin amb un ContentTool per poder funcionar.
         *
         * @class MetaContentTool
         * @extends EventObserver
         */
        RenderContentTool = declare(null, {
            /** @type string */
            //type: null,

            /** @type function */
            //renderEngine: null,


            /**
             *
             * @protected
             */
            render: function () {
                this.set('content', this.renderEngine(this.data));
            },


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


        RequestContentTool = declare(null, {

            /** @type Request */
            requester: null,

            constructor: function () {


                require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                    this.requester = new Request();
                }));
            },

            /**
             *
             * @protected
             */
            render: function () {
                this.set('content', this.renderEngine(this.data));
                this.replaceLinksWithRequest();
            },

            /** @private */
            replaceLinksWithRequest: function () {
                var q = null;
                //var tab = this.requester;


                var self = this;

                var node = dom.byId(this.id);

                on(node, "a:click", function (e) {

                    var arr = att.get(this, "href").split("?");


                    if (arr.length > 1) {
                        q = arr[1];
                    }

                    self.requester.sendRequest(q);

                    event.stop(e); // TODO[Xavi] fer servir e.stopPropagation()?
                });

            }

        }),

        DocumentContentTool = declare(null, {

            onClose: function () {
                this.closeDocument();
                return true;
            },

            onUnload: function () {
                //this.inherited(arguments);
                this.closeDocument();
            },

            closeDocument: function () {
                var currentTabId = this.dispatcher.getGlobalState().currentTabId;

                if (currentTabId === this.id) {
                    this.dispatcher.getGlobalState().currentTabId = null;
                }

                this.dispatcher.getChangesManager().resetDocumentChangeState(this.id);
                this.dispatcher.removeDocument(this.id);
                this.triggerEvent('document_closed', {id: this.id});
            },


            onSelect: function () { // onShow()
                this.dispatchEvent("document_selected", {id: this.id});

            },

            onUnselect: function () { // onHide()
                this.dispatchEvent("document_unselected", {id: this.id});
            },

            setCurrentDocument: function (id) {
                this.dispatcher.getGlobalState().currentTabId = id;
                this.dispatcher.getContentCache(id).setMainContentTool(this);
                this.dispatchEvent("document_selected", {id: id});
            }

        });

    ;


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
            EDITOR:   'editor',
            BASE:     'base',
            DOCUMENT: 'document'
        },


        decorate: function (type, contentTool, args) {
            var decoration;


            switch (type) {
                case this.decoration.META:
                    decoration = new MetaContentTool(args);
                    //console.log("nou metacontenttool");
                    break;

                case this.decoration.RENDER:
                    decoration = new RenderContentTool(args);
                    //console.log("nou rendercontenttool");

                    break;

                case this.decoration.REQUEST:
                    // TODO comprovar si contentTool es instance of RenderContentTool i si no ho es fer primer el mixin amb el RenderContentTool


                    if (!contentTool.render) {
                        //console.log("no hi ha render");
                        contentTool.decorate(this.decoration.RENDER, args);

                    } else {
                        //console.log("hi ha render");
                    }

                    decoration = new RequestContentTool();
                    //console.log("nou requestrcontenttool");
                    break;

                case this.decoration.DOCUMENT:
                {

                    decoration = new DocumentContentTool(args);
                    break;
                }

                // TODO per implementar
                //case this.types.EDITOR:
                //
                //    decoration = new EditorContentTool();
                //    break;


                default:
                    console.error('No existeix el tipus de decoració ' + type);

            }

            //console.log(contentTool);


            if (decoration) {
                return declare.safeMixin(contentTool, decoration);
            } else {
                return contentTool;
            }

        },

        generate: function (type, args) {

            args.decorator = this;

            switch (type) {

                case this.generation.BASE:
                    return new ContentTool(args);

                case this.generation.EDITOR:
                    return new EditorContentTool(args);

                //case this.generation.DOCUMENT:
                //    console.log("Args: ", args);
                //    return new DocumentContentTool(args);


                default:
                    console.error('No existeix el tipus de ContentTool ' + type);
            }

        }

    }


});