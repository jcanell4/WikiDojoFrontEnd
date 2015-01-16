/**
 * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier Garcia
 */
define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dojo/dom",
    "ioc/dokuwiki/guiSharedFunctions",

], function (declare, StateUpdaterProcessor, dom, guiSharedFunctions) {
    var ret = declare("ioc.wiki30.processor.InfoStatusProcessor", [StateUpdaterProcessor],
        /**
         * @class InfoStatusProcessor
         * @extends StateUpdaterProcessor
         */
        {
            type: "info",

            process: function (value, dispatcher) {
                this._processInfo(value, dispatcher);
                this.inherited(arguments);
            },

            /**
             * Estableix la info al node d'informació del dispatcher.
             *
             * @param {string|{documentId:string, info:string[], global:bool}} info
             * @param {Dispatcher} dispatcher
             *
             * @private
             */
            _processInfo: function (info, dispatcher) {

                var arrayInfo = [];

                // Mostrem la informació a la GUI segons les propietats trobades a info
                if (info.global) {
                    dom.byId(dispatcher.infoNodeId).innerHTML = guiSharedFunctions.formatInfoToHTML(dispatcher.getGlobalState().info);


                } else if (info.info) {
                    arrayInfo = Array.isArray(info.info) ? info.info : [info.info];

                    if (info.documentId) {
                        var contentCache = dispatcher.getContentCache(info.documentId);
                        if (contentCache) {
                            //arrayInfo = contentCache.getInfo().concat(arrayInfo);
                            contentCache.putInfo(arrayInfo);
                        }
                    }

                    dom.byId(dispatcher.infoNodeId).innerHTML = guiSharedFunctions.formatInfoToHTML(arrayInfo);

                } else if (Array.isArray(info)) {
                    // TODO[Xavi] Quan es recarrega la pàgina es passa el valor de info directament desde el emmagatzemat al GlobalState
                    dom.byId(dispatcher.infoNodeId).innerHTML = guiSharedFunctions.formatInfoToHTML(info);

                } else {
                    console.log(info);
                    alert("Error detectat!: [" + info +"]");
                }
            },

            /**
             * Estableix el valor de la info GloblaState al del valor passat com argument.
             *
             * @param {Dispatcher} dispatcher
             * @param {Object.<{id: string, ns: string}>} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                if (value.global) {
                    // No es guarda cap valor
                } else if (value.documentId) {
                    //dispatcher.getContentCache(value.documentId).addInfo(value.info);
                    dispatcher.getContentCache(value.documentId).putInfo(value.info);

                } else if (value.info){
                    dispatcher.getGlobalState().info = value.info;

                }
            }

        });
    return ret;
});

