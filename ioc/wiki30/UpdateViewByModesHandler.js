define([
    "dojo/_base/declare" // declare
   ,"ioc/wiki30/dispatcherSingleton"
], function (declare, dispatcher) {
    var ret = declare("ioc.wiki30.UpdateViewByModesHandler", [],
        /**
         * @class UpdateViewHandler
         */
        {
            functions:null,
            /**
             * Aquest objecta proporciona el métode UpdateViewHandler al dispatcher. Es cridat desde scriptsRef.tpl.
             * El métode update permet mostrar o ocultar els botons de la part dreta de la pantalla, segons el GlobalState
             * i la acció a realitzar a la pàgina sel·leccionada.
             *
             * @param {function()} updateFunction hashMap de funcions 
             * associades a modes
             * @constructor
             */
            constructor: function (updateFunctionHashMap) {
                this.functions = {};
                if (updateFunctionHashMap) {
                    for(var key in updateFunctionHashMap){
                        this.functions[key] = updateFunctionHashMap[key];
                    }
                }
            },
             
            /**
             * Associa una funció a un mode determinat
             *
             * @type {function()}
             */
            addUpdateFunction: function(mode, updateFunction){
                this.functions[mode]= updateFunction;
            },

            /**
             * TODO[Xavi] Té cap efecte? es sobrescrit al scriptsRef.
             * Posa tots els botons ocults, i segons el GlobalState i la acció mostra unos botons o altres.
             *
             * @type {function()}
             */
            update: function () {
                var currentId = dispatcher.getGlobalState().getCurrentId();
                var f = this.functions[dispatcher.getGlobalState()
                                                .getContentMode(currentId)];
                if(f){
                    f();
                }
            }
        });
    return ret;
});