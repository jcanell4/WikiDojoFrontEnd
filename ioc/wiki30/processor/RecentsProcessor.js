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

            type: "recents",
            
            /**
             * @param {*} value
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                this.inherited(arguments);
            },

            createContentTool: function (content, dispatcher) {
                var args = {
                        id:         content.id,
                        title:      content.title,
                        content:    content.content,
                        closable:   true,
                        dispatcher: dispatcher,
                        type: this.type,
                        aRequestFormArgs: content.aRequestFormArgs,
                        requestLinkArgs: content.requestLinkArgs
                    };

                return contentToolFactory.generate(contentToolFactory.generation.RECENTS, args);
//                    .decorate(contentToolFactory.decoration.REQUEST_LINK, argsRequestLink)
////                    .decorate(contentToolFactory.decoration.CONTROL_CHANGES, argsControlsToCheck)
//                    .decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm);
            },
            
            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {{id: string, ns: string, title: string, content: string}} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
//                dispatcher.getGlobalState().pages[value.id]["action"] = "recents";
//                dispatcher.getGlobalState().pages[value.id]["ns"] = value.ns;
                dispatcher.getGlobalState().getContent(value.id)["action"] = "recents";
//                dispatcher.getGlobalState().getContent(value.id)["ns"] = value.ns;
            }

        });
    return ret;
});