define([
    'dojo/_base/declare',
    'ioc/wiki30/notify_engines/AbstractNotifyEngine',
], function (declare, AbstractNotifyEngine) {

    var NotifyEngineException = function (message) {
        this.message = message;
        this.name = "NotifyEngineException";
    };

    return declare([AbstractNotifyEngine], {

        init: function (args) {
            console.log("WebScoketEngine#init");
            this.timer = setInterval(this._refreshNotifications.bind(this), args.timer);
        },

        _refreshNotifications: function () {
            //console.log("AjaxEngine#refreshNotifications");
            // S'ha de fer un pop de les notificacions
            this.dispatcher.getEventManager().fireEvent('notify', {
                //id: value.id, // ALERTA[Xavi] crec que això, en el cas de les notificacions, no és necessari
                dataToSend: {
                    do: 'get'
                }
            });
        },

        update: function (args) {
            //console.log("AjaxEngine#update");
            this.shutdown();
            this.init(args);
        },

        shutdown: function () {
            //console.log("AjaxEngine#shutdown");
            if (this.timer) {
                clearInterval(this.timer);
            }
        }
    });

});
