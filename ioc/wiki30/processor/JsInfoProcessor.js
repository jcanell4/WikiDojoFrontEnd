define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor"
], function (declare, StateUpdaterProcessor) {
    /**
     * @class JsInfoProcessor
     * @extends StateUpdaterProcessor
     */
    var ret = declare([StateUpdaterProcessor],{
        type: "jsinfo",

        /**
         * @param {*} value
         * @param {ioc.wiki30.Dispatcher} dispatcher
         * @override
         */
        process: function (value, dispatcher) {
            this._processJsInfo(value, dispatcher);
            this.inherited(arguments);
        },

        /**
         * Estableix el token de seguretat al GlobalState
         *
         * @param {ioc.wiki30.Dispatcher} dispatcher
         * @param {string} value
         */
        updateState: function (dispatcher, value) {
            var permission = dispatcher.getGlobalState().permissions;
            if (Object.keys(value).length>0) {
               permission.isadmin = value['isadmin'];
               permission.ismanager = value['ismanager'];
               if (value['permission']){
                   Object.keys(value['permission']).forEach(function(key){
                       permission[key] = value['permission'][key];
                   });
               }
            }
        },

        /**
         * Afegeix les dades del JsInfo al Dispatcher
         * @param {string}result
         * @private
         */
        _processJsInfo: function (result) {
            window.JSINFO = result;
         }
    });

    return ret;
    
});
