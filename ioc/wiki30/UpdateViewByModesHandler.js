define([
    "dojo/_base/declare" // declare
    , "ioc/wiki30/dispatcherSingleton"
], function (declare, getDispatcher) {
    var dispatcher = getDispatcher();
    var ret = declare(null,
        /**
         * @class UpdateViewByModesHandler
         */
        {
            functions:   {},
            /**
             * Aquest objecta proporciona el métode UpdateViewHandler al dispatcher. Es cridat desde scriptsRef.tpl.
             * El métode update permet mostrar o ocultar els botons de la part dreta de la pantalla, segons el GlobalState
             * i la acció a realitzar a la pàgina sel·leccionada.
             *
             * @param {function} updateFunctionHashMap - hashMap de funcions
             * associades a modes
             * @constructor
             */
            constructor: function (updateFunctionHashMap) {
                this.functions = {};

                if (updateFunctionHashMap) {
                    for (var key in updateFunctionHashMap) {
                        this.functions[key] = updateFunctionHashMap[key];
                    }
                }
            },

            /**
             * Associa una funció a un mode determinat.
             *
             * @param {string} mode
             * @param {function} updateFunction
             */
            addUpdateFunction: function (mode, updateFunction) {
                this.functions[mode] = updateFunction;
            },

            /**
             * TODO[Xavi] Té cap efecte? es sobrescrit al scriptsRef.
             * Posa tots els botons ocults, i segons el GlobalState i la acció mostra unos botons o altres.
             *
             * @type {function()}
             */
            update: function () {
                var currentId = dispatcher.getGlobalState().getCurrentId();
                var f = this.functions[dispatcher.getGlobalState().getContentMode(currentId)];
                if (f) {
                    f();
                }
            }
        });
    return ret;
});
