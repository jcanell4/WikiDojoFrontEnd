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
            //console.log("AjaxEngine#init");
            this.timer = setInterval(this._refreshNotifications.bind(this), args.timer);
            this.lastNewNotification = 0;
        },

        _refreshNotifications: function () {
            //console.log("AjaxEngine#refreshNotifications");
            // S'ha de fer un pop de les notificacions

            this.dispatcher.getEventManager().fireEvent('notify', {
                //id: value.id, // ALERTA[Xavi] crec que això, en el cas de les notificacions, no és necessari
                dataToSend: {
                    do: 'get',
                    since: this.lastNewNotification
                }
            });
        },

        setLastNewNotification: function (timestamp) {
            this.lastNewNotification = timestamp;
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
        },

        updateNotification: function(notificationId, changes) {
            this.dispatcher.getEventManager().fireEvent('notify', {
                dataToSend: {
                    do: 'update',
                    notificationId: notificationId,
                    changes: JSON.stringify(changes)
                }
            });
        },

        deleteNotification:function(notificationId) {

            this.dispatcher.getEventManager().fireEvent('notify', {
                dataToSend: {
                    do: 'delete',
                    notificationId: notificationId
                }
            });
        }
    });

});
