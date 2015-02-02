define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor"
], function (declare, ContentProcessor) {

    var ret = declare("ioc.wiki30.processor.HtmlContentProcessor", [ContentProcessor],
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
            }
        });
    return ret;
});

