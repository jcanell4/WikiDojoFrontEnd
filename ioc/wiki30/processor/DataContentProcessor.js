define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/ContentProcessor"
], function (declare, ContentProcessor) {


    var ret = declare("ioc.wiki30.processor.DataContentProcessor", [ContentProcessor],
        /**
         * @class ioc.wiki30.processor.DataContentProcessor
         * @extends {ioc.wiki30.processor.ContentProcessor}
         */
        {

            type: "data",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                this.inherited(arguments);
            },


            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "edit".
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {Object.<{id: string, ns: string}>} value
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().pages[value.id]["action"] = "edit";
            }
        });


    return ret;
});

