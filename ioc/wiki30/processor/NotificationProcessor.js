define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/AbstractResponseProcessor"
], function (declare, AbstractResponseProcessor) {
    var ret = declare([AbstractResponseProcessor],
        /**
         * @class NotificationProcessor
         * @extends AbstractResponseProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "notification",

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
             * Configura el dialeg amb el text passat com argument i el mostra.
             *
             * @param data
             * @param {Dispatcher} dispatcher
             * @private
             */
            _process: function (data, dispatcher) {
                //console.log("NotificationProcessor#_process", data);
                // var notifyManager = dispatcher.getNotifyManager();
                // for (var i=0; i<data.notifications.length; i++) {
                //     notifyManager.process(data.notifications[i].action, data.notifications[i].params)
                // }

                dispatcher.getNotifyManager().process(data.action, data.params);
            }
        });
    return ret;
});


