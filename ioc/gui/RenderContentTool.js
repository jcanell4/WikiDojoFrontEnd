define([
        "dojo/_base/declare",
        "ioc/gui/ContentTool",
        "ioc/gui/renderEngineFactory",
    ], function (declare, ContentTool, renderEngineFactory) {

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
            }
        });
    }
);

