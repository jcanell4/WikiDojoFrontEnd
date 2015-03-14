define([
        "dojo/_base/declare",
        "ioc/gui/ContentTool",
        "ioc/gui/renderEngineFactory",
    ], function (declare, ContentTool, renderEngineFactory) {
        //return declare([ContentPane, Request], {

        return declare([ContentTool], {
            /** @type mixin - les dades poden estar en qualsevol format */
            data: null,

            /** @type string */
            type: null,

            /** @type function */
            renderEngine: null,

            constructor: function (args) {

            },

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

            }
        });
    }
);

