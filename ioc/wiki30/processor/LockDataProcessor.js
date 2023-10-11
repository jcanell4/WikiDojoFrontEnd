define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/wiki30/processor/AbstractResponseProcessor"
], function (declare, registry, AbstractResponseProcessor) {
    var ret = declare([AbstractResponseProcessor],
        /**
         * @class LockDataProcessor
         * @extends AbstractResponseProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "lock_data",

            /**
             * Processa un missatge de tipus lock_data que actualitza el bloqueig corresponent
             *
             * @param {string} value - Missatge que es mostrarà
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                this._process(value, dispatcher);
            },

            /**
             * Configura el dialge amb el text passat com argument i el mostra.
             *
             * @param data
             * @param {Dispatcher} dispatcher
             * @private
             */
            _process: function (data, dispatcher) {
                //console.log("LockDataProcessor#_process", data);
                //[JOSEP]: AIXÒ ja no serveix per res! dispatcher.getLockManager().update(data); //arriba en segons
                //[JOSEP]: Ara es treballa amb TimedDocumentSubclass
                var cTool = registry.byId(data.id);
                if(cTool && cTool.refreshTimer){
                    cTool.refreshTimer(data.timeout);
                }else{
                    //console.log("Error no esxisteix el contentTool o no és TimedDocumentSubclass");
                }
                
            }
        });
    return ret;
});


