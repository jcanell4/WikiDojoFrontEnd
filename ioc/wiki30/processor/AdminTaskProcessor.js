
define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, ContentProcessor, contentToolFactory) {
    var ret = declare([ContentProcessor],
        /**
         * @class AdminTaskProcessor
         * @extends AbstractResponseProcessor
         */
        {

            type: "admin",
            
            /**
             * @param {*} value
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                this.inherited(arguments);
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {Dispatcher} dispatcher
             * @param {{id: string, ns: string, title: string, content: string}} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().getContent(value.id)["action"] = "admin";
            },

            createContentTool: function (content, dispatcher) {
                var args = {
                        id:         content.id,
                        title:      content.title,
                        content:    content.content,
                        closable:   true,
                        dispatcher: dispatcher,
                        type: this.type
                    };

                return contentToolFactory.generate(contentToolFactory.generation.DOCUMENT, args);
            }
        });
    return ret;
});