define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, ContentProcessor, contentToolFactory) {

    var ret = declare([ContentProcessor],
        /**
         * @class HtmlContentProcessor
         * @extends ContentProcessor
         */
        {

            type: "html",

            /**
             * @param {Content} value
             * @param {Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                return this.inherited(arguments);
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {Dispatcher} dispatcher
             * @param {Content} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().pages[value.id]["action"] = "view";
            },

            createContentTool: function (content, dispatcher) {
                var args = {
                        id:         content.id,
                        title:      content.title,
                        content:    content.content,
                        closable:   true,
                        dispatcher: dispatcher
                    },
                    //contentTool = contentToolFactory.generate(contentToolFactory.generation.EDITOR, args);
                    //contentTool = contentToolFactory.generate(contentToolFactory.generation.DOCUMENT, args);
                    contentTool = contentToolFactory.generate(contentToolFactory.generation.BASE, args);

                contentTool.decorate(contentToolFactory.decoration.DOCUMENT, args);


                return contentTool;
            }
        });
    return ret;
});

