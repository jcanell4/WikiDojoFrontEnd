define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/AbstractResponseProcessor"
], function (declare, AbstractResponseProcessor) {
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
                console.log("LockDataProcessor#_process", data);

                dispatcher.getLockManager().update(data.id, 15 * 1000); //arriba en segons TEST en lloc de fer servir el timer posem 15s
                //dispatcher.getLockManager().refresh(data.id, data.timeout * 1000); //arriba en segons

                //var contentTool = dispatcher.getContentCache(data.id).getMainContentTool();

                // 1. obtenir el content tool corresponent a data.id del dispatcher

                // 3. Si el timeout es >0 refrescar el lock amb aquesta quanitat de segons

                //if (data.timeout < 0) {
                //    console.log("No s'ha pogut bloquejar el document.")
                //    // 2. Si el timeout es -1 cridar a unlock, el document no ha pogut ser bloquejat
                //    contentTool.unlock(); // TODO[Xavi] afegir el mètode al contentool per gestionar la cancelació.
                //} else {
                //    contentTool.refreshLock(data.timeout);
                //}

            }
        });
    return ret;
});


