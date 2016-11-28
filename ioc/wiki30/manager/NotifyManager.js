define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/notify_engines/AjaxNotifyEngine',
    'ioc/gui/content/contentToolFactory'
], function (declare, EventObserver, AjaxNotifyEngine, contentToolFactory) {

    var NotifyManagerException = function (message) {
        this.message = message;
        this.name = "NotifyManagerException";
    };

    return declare([EventObserver], {

        _notificationEngine: null,

        _receivedWarningIds: null,

        constructor: function (args) {
            this.dispatcher = args.dispatcher;
            this.unreadCounter = 0;
            this._receivedWarningIds = [];
        },

        process: function (action, params) {
            switch (action) {
                case 'init_notifier':
                    //console.log(action, params);

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
                    //console.log(action, params);
                    break;

                case 'notification_received':
                    //console.log(action, params);
                    this._processNotifications(params.notifications);
                    break;

                case 'close_notifier':
                    //console.log(action, params);
                    this._closeNotifier(params);
                    break;

                default:
                    console.log("action no trobada:",action);
                    throw new NotifyManagerException("Acció desconeguda: ", action);
            }
        },

        _closeNotifier: function (params) {
            //console.log("NotifyManager#_updateNotifier", params);
            if (!this._notificationEngine) {
                throw new NotifyManagerException("S'ha intentat tancar el motor de notificacions però no hi ha cap actiu");
            }

            this._notificationEngine.shutdown();
        },

        _updateNotifier: function (params) {
            //console.log("NotifyManager#_updateNotifier", params);
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
                    //console.log("notification.type: " + notification.type);
                    break;
                case 'message':
                    //afegir/sobrescriure per ID, al notificador (GUI)
                    this._processMessage(notification); // ALERTA[Xavi] Substituit per fer proves pel processWarning
                    break;


                case 'alert':
                    this._processAlert(notification);
                    break;

                case 'warning':
                    this._processWarning(notification);
                    break;

                case 'dialog':
                default:
                    console.warn("Notificació de tipus "+notification.type+" rebuda:", notification);
            }
        },

        _processAlert: function (notification) {
            this._processMessage(notification)
        },

        _processMessage: function (notification) {
            //console.log("NotifyManager#_processMessage", notification);
//            notification.notification_id = notification.notification_id.replace(/:/g, '_');


            if (this.notifierContainer.isNotificationInContainer(notification.notification_id)) {
                this.notifierContainer.removeNotification(notification.notification_id);
            }

            var contentTool = this._createNotificationContentTool(notification);

            this.addNotificationContentTool(contentTool);
        },

        _createNotificationContentTool: function (notification) {
            var args = {
                    id: notification.notification_id,
                    data: {
                        type: notification.data.type || notification.type || "info",
                        id: notification.notification_id,
                        title: notification.data.title || notification.sender_id,
                        text: notification.data.text,
                    },
                    dispatcher: this.dispatcher,
                    type: 'notification',
                    readed: notification.readed
                },

                contentTool = contentToolFactory.generate(contentToolFactory.generation.NOTIFICATION, args);

            return contentTool;

        },

        _processWarning: function (notification) {
            // TODO: Mostrar l'alerta
            console.log("NotifyManager#_processWarning", notification);

            if (!this._receivedWarningIds[notification.data.id]) {
                // alert(notification.data.text);
                notification.readed = true;
                // this._processMessage(notification);



                if (this.warningContainer.isNotificationInContainer(notification.notification_id)) {
                    this.warningContainer.removeNotification(notification.notification_id);
                }

                var contentTool = this._createNotificationContentTool(notification);

                this.addWarningContentTool(contentTool);

                this._receivedWarningIds[notification.data.id] = true;
            }

        },


        setNotifierContainer: function (notifierContainer) {
            this.notifierContainer = notifierContainer;
            notifierContainer.set('title',  'Notificacions');
        },

        setWarningContainer: function(warningContainer) {
            this.warningContainer = warningContainer;
        },

        addNotificationContentTool: function (contentTool) {
            if (this.notifierContainer) {
                this.notifierContainer.addNotification(contentTool);
            } else {
                throw new NotifyManagerException("No s'ha establert el contenidor de notificacions");
            }
        },

        addWarningContentTool: function (contentTool) {
            if (this.warningContainer) {
                this.warningContainer.addNotification(contentTool);
            } else {
                throw new NotifyManagerException("No s'ha establert el contenidor d'avisos");
            }
        },

        removeAllWarnings: function() {
            this._receivedWarningIds = [];
            this.warningContainer.removeAllNotifications();
        },

        removeAllNotifications: function() {
            this.notifierContainer.removeAllNotifications(true);
        },

        removeWarning: function (id) {
            this.warningContainer.removeNotification(id);
        },

        removeNotification: function (id) {
            this.notifierContainer.removeNotification(id);
             this.set('notificationsCounter', this.get('notificationsCounter') - 1);
        },

        markAsRead: function (id) {
            this.notifierContainer.markAsRead(id);
        },

        markAllAsRead: function () {
            this.notifierContainer.markAllAsRead();
        },

        resetUnreadCounter: function () {
            this.set('unreadCounter', 0);
        },

        increaseNotificationCounter: function () {
            //console.log("NotifyManager#increaseNotificationCounter");
            this.set('unreadCounter', this.get('unreadCounter') + 1);
            this.set('notificationsCounter', this.get('notificationsCounter') + 1);
        },

        decreaseNotificationCounter: function () {
            //console.log("NotifyManager#decreaseNotificationCounter");
            this.set('unreadCounter', this.get('unreadCounter') - 1);
        },

        resetNotificationsCounter: function() {
            this.set('unreadcounter', 0);
        },
        
        hasNotifications: function(){
            return Object.keys(this.notifierContainer.notifications).length > 0;
        },

        clearAll: function() {
            this.removeAllWarnings();
            this.removeAllNotifications();
            this.resetUnreadCounter();
        }

    });
});