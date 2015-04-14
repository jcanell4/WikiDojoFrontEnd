define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ioc/gui/renderEngineFactory",
    "dojo/_base/event",
    "dojo/dom-attr",
    'dojo/dom',
    'dojo/on',
    'dojo/ready'

], function (declare, lang, renderEngineFactory, event, att, dom, on, ready) {

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
                console.log("constructor");

                require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                    ready(lang.hitch(this, function () {
                        this.requester = new Request();
                    }));
                }));
            },

            /**
             *
             * @protected
             */
            render: function () {
                this.set('content', this.renderEngine(this.data))
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

        });


    return {


        /** @enum */
        types: {
            META:    'meta',
            RENDER:  'render',
            REQUEST: 'request',
            EDITOR:  'editor'
        },

        decorate: function (type, contentTool) {
            var decoration;

            console.log(contentTool.type);


            switch (type) {
                case this.types.META:
                    decoration = new MetaContentTool();
                    console.log("nou metacontenttool");
                    break;

                case this.types.RENDER:
                    decoration = new RenderContentTool();
                    console.log("nou rendercontenttool");

                    break;

                case this.types.REQUEST:
                    // TODO comprovar si contentTool es instance of RenderContentTool i si no ho es fer primer el mixin amb el RenderContentTool


                    if (!contentTool.render) {
                        console.log("no hi ha render");
                        contentTool.decorate('render');

                    } else {
                        console.log("hi ha render");
                    }

                    decoration = new RequestContentTool();
                    console.log("nou requestrcontenttool");
                    break;


                // TODO per implementar
                //case this.types.EDITOR:
                //
                //    decoration = new EditorContentTool();
                //    break;


                default:
                    console.error('No existeix el tipus de ContentTool ' + type);

            }

            console.log(contentTool);


            if (decoration) {
                return declare.safeMixin(contentTool, decoration);
            } else {
                return contentTool;
            }

        }
    }


});