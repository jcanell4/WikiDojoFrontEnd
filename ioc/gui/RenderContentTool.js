define([
        "dojo/_base/declare",
        "ioc/gui/ContentTool",
        "ioc/gui/renderEngineFactory",
    ], function (declare, ContentTool, renderEngineFactory) {
        //return declare([ContentPane, Request], {

        return declare([ContentTool], {

            /** @type string */
            type: null,

            /** @type function */
            renderEngine: null,

            /**
             *
             * @private
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
            },

            onLoad: function() {
                //console.log("load RenderContentTool");
            },

            postLoad: function() {
                //console.log("només ha de sortir aquest postload pel rendercontenttool");
            }
        });
    }
);

