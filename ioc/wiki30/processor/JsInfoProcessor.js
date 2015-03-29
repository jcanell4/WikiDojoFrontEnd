define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor"
], function (declare, StateUpdaterProcessor) {
    var ret = declare("ioc.wiki30.processor.JsInfoProcessor", [StateUpdaterProcessor],

        /**
         * @class JsInfoProcessor
         * @extends StateUpdaterProcessor
         */
        {

            type: "jsinfo",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                //NO FUNCIONA -> this.inherited(arguments);
                this._processJsInfo(value, dispatcher);
                
            },

            /**
             * Afegeix les dades del JsInfo al Dispatcher
             * @param {string}result
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @private
             */
            _processJsInfo: function (result, dispatcher) {
                var permission = dispatcher.getGlobalState().permissions;
                permission.isadmin = result.value.permission['isadmin'];
                permission.ismanager = result.value.permission['ismanager'];
             }
        });
    return ret;
});
