define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor"
], function (declare, ContentProcessor) {

    var ret = declare("ioc.wiki30.processor.MediaDetailsProcessor", [ContentProcessor],
        /**
         * @class MediaDetailsProcessor
         * @extends ContentProcessor
         */
        {

            type: "mediadetails",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                //dispatcher.getGlobalState().pages[value.id]["action"] = "media";
                this.inherited(arguments);

            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "mediadetails".
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {{id: string, ns: string, title: string, content: string}} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().pages[value.id]["action"] = "mediadetails";
            }
        });
    return ret;
});

