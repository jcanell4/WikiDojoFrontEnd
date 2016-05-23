define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/notify_engines/AjaxNotifyEngine',
], function (declare, EventObserver, AjaxNotifyEngine) {

    var NotifyManagerException = function (message) {
        this.message = message;
        this.name = "NotifyManagerException";
    };

    return declare([EventObserver], {

        _notificationEngine: null,

        constructor: function (args) {
            this.dispatcher = args.dispatcher;
        },

        process: function (action, params) {
            switch (action) {
                case 'init_notifier':
                    console.log(action, params);

                    // 1. Comprovar si ja hi ha un notificador iniciat
                    if (this._notificationEngine) {
                        // TODO[Xavi]: Si existeix s'ha de tancar? comprovem el tipus i si es el mateix refresquem el init? (timer per exemple, o informació del servidor)
                        console.warn("Ja existeix un client de notificiacions actiu, s'ha de refrescar la configuració");
                        this._updateNotifier(params);
                    } else {
                        this._initNotifier(params);
                    }
                    break;

                case 'notification_send':
                    // TODO[Xavi] això només ens indica que hem enviat una notificació
                    console.log(action, params);
                    break;

                case 'notification_received':
                    console.log(action, params);
                    this._processNotifications(params.notifications);
                    break;

                case 'close_notifier':
                    console.log(action, params);
                    this._closeNotifier(params);
                    break;

                default:
                    throw new NotifyManagerException("Acció desconeguda: ", action);
            }
        },

        _closeNotifier: function (params) {
            console.log("NotifyManager#_updateNotifier", params);
            if (!this._notificationEngine) {
                throw new NotifyManagerException("S'ha intentat tancar el motor de notificacions però no hi ha cap actiu");
            }

            this._notificationEngine.shutdown();
        },

        _updateNotifier: function (params) {
            console.log("NotifyManager#_updateNotifier", params)
            this._notificationEngine.update(params);
        },

        _initNotifier: function (params) {

            params.dispatcher = this.dispatcher;

            switch (params.type) {

                case 'ajax':
                    this._notificationEngine = new AjaxNotifyEngine(params);
                    break;

                case 'websocket':
                default:
                    throw new NotifyManagerException("Tipus de motor no implementat: ", params.type);
            }

            this._notificationEngine.init(params);
        },

        _processNotifications: function (notifications) {
            //console.log("NotifyManager#_processNotifications", notifications);
            for (var i=0; i<notifications.length; i++) {
                this._processNotification(notifications[i]);
            }
        },

        _processNotification: function(notification) {
            //console.log("NotifyManager#_processNotification:", notification);
            switch (notification.type) {
                case 'cancel_notification':
                case 'lock_expiring':
                    console.log("notification.type: " + notification.type);
                    break;
                case 'message':
                    //afegir/sobrescriure per ID, al notificador (GUI)
                case 'alert':
                    this._processAlert(notification);
                    break;
                case 'dialog':
                default:
                    console.warn("Notificació de tipus "+notification.type+" rebuda:", notification);
            }
        },

        // TODO[Xavi] Copiat del AlertProcessor, substituir pel gestor de dialegs quan estigui implementat
        _processAlert: function (notification) {
            //console.log("NotifyManager#_processAlert", notification);
            this.dispatcher.diag.set("title", "ALERTA: " + notification.sender_id);
            this.dispatcher.diag.set("content", notification.data.text);
            this.dispatcher.diag.show();
        }

    });
});