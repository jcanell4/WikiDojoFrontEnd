define([
        "dojo/_base/declare",
        "dijit/layout/ContentPane",
        "ioc/gui/renderEngineFactory",
        "ioc/wiki30/Request2",
        "dojo/dom-attr",
        "dojo/_base/event",
        'dojo/query',
        'dojo/dom',
        'dojo/on'

    ], function (declare, ContentPane, renderEngineFactory, Request, att, event, query, dom, on) {
        //return declare([ContentPane, Request], {

        return declare([ContentPane, Request], {
            // New

            //return declare([ContentPane], {
            /** @type mixin - les dades poden estar en qualsevol format */
            data: null,

            /** @type string */
            type: null,

            /** @type function */
            renderEngine: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                //this.urlBase = "lib/plugins/ajaxcommand/ajax.php?call=page";
                this.urlBase = "lib/plugins/ajaxcommand/ajax.php?";

            },

            /**
             *
             * @private
             */
            render: function () {
                this.set('content', this.renderEngine(this.data))
                this.replaceLinksWithRequest();

            },

            replaceLinksWithRequest: function () {

                var q = null;
                var tab = this;


                var node = dom.byId(this.id);


                on(node, "a:click", function (e) {
                    var arr = att.get(this, "href").split("?");
                    if (arr.length > 1) {
                        q = arr[1];
                    }
                    tab.sendRequest(q);
                    event.stop(e); // TODO[Xavi] fer servir e.stopPropagation()?
                });

            },

            startup: function () {
                console.log("STARTING");
                this.inherited(arguments);

                this.renderEngine = renderEngineFactory.getRenderEngine(this.type);

                this.watch("data", function (attr, oldVal, newVal) {
                    this.render();
                });

                if (this.data) {
                    this.render();
                }


                console.log("STARTED");
            }


        });
    }
);

