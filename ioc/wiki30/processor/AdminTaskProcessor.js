define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor"
], function (declare, ContentProcessor) {
    var ret = declare("ioc.wiki30.processor.AdminTaskProcessor", [ContentProcessor],
    /**
    * @class AdminTabProcessor
    * @extends AbstractResponseProcessor
    */
    {
       type: "admin",

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
         * el valor de la acció a "view".
         *
         * @param {ioc.wiki30.Dispatcher} dispatcher
         * @param {{id: string, ns: string, title: string, content: string}} value
         *
         * @override
         */
        updateState: function (dispatcher, value) {
            this.inherited(arguments);
            dispatcher.getGlobalState().pages[value.id]["action"] = "admin";
        }
    });
    return ret;
});
