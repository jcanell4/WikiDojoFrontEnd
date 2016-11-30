define([
    'dojo/_base/declare',
    'ioc/gui/content/NotifierContainer',
    "dojo/text!./templates/WarningContainer.html",
    "ioc/wiki30/dispatcherSingleton",

], function (declare, NotifierContainer, template, getDispatcher) {

    var WarningContainerException = function (message) {
            this.message = message;
            this.name = "WarningContainerException";
        },
        dispatcher = getDispatcher();

    return declare("ioc.gui.content.WarningContainer", [NotifierContainer],
        {
            templateString: template,


            constructor: function (args) {
                //console.log("NotifierContainer#constructor: ", args);
                this.notifications = {};
                this.notifyManager = dispatcher.getNotifyManager();

                this.counter = {
                    info: 0,
                    success: 0,
                    warning: 0,
                    error: 0,
                };

//                this.watch('notificationsCounter', this._updateNotifyButton);
            },


            addChild: function (contentTool, position) {
                this.inherited(arguments);

                console.log("Contenttool, es veu el tipus?", contentTool.data.type);
                console.log("Counter: ", this.counter[contentTool.data.type]);
                // this.set(this.counter[contentTool.data.type], this.counter[contentTool.data.type]+1);
                // this.set(this.counter.warning, 66);
                // Alerta[Xavi] No es poden utilitzar variables (valors que canvian) en el template perqué peta en actualitzar-los.

                switch (contentTool.data.type) {
                    case 'warning':
                        this.counterWarning.innerHTML = ++this.counter.warning;
                        break;

                    case 'sucess':
                        this.counterSuccess.innerHTML = ++this.counter.success;
                        break;

                    case 'error':
                        this.errorWarning.innerHTML = ++this.counter.error;
                        break;

                    default: // 'info' i qualsevol altre tipus desconegut
                        this.counterInfo.innerHTML = ++this.counter.info;
                }

            },

            addNotification: function (contentTool) {
                //console.log("NotifierContainer#addNotification");

                // Afegir a la llista
                this.notifications[contentTool.id] = contentTool;

                // Afegir el content tool al contenidor
                this.addChild(contentTool);

                // Actualitzem el comptador si no existia o ja estava llegida

            },


            // removeNotification: function (id) { //ALERTA[Xavi] la crida a aquest mètode destrueix la notificació
            //     //console.log("NotifierContainer#removeNotification", id, this.notifications);
            //
            //     if (!this.isNotificationReaded(id)) {
            //         this.notifyManager.decreaseNotificationCounter();
            //     }
            //
            //     this.notifications[id].removeContentTool();
            // },
            //
            // removeAllNotifications: function (resetCounter) {
            //     console.log("NotifierContainer#removeAllNotifications", this.notifications);
            //     for (var notification in this.notifications) {
            //         this.notifications[notification].removeContentTool();
            //
            //         if (resetCounter) {
            //             this.notifyManager.resetNotificationsCounter();
            //         }
            //     }
            // },
            //
            //
            // _destroyNotification: function (data) { //ALERTA[Xavi] la crida a aquest mètode només elimina la notificació de la llista
            //     //console.log("NotifierContainer#_destroyNotification", data);
            //     delete(this.notifications[data.id]);
            // },
            //
            //
            // isNotificationInContainer: function (id) {
            //     //console.log("NotifierContainer#checkNotificationInContainer");
            //     return !(this.notifications[id] === undefined || this.notifications[id] === null);
            //
            // },
            //
            //removeChild: function (contentTool) {
            //    this.inherited(arguments);
            //},

            // clearContainer: function () { // Per ser cridat, per exemple, quan es faci logout
            //     for (var id in this.notifications) {
            //         this.notifications[id].removeContentTool();
            //     }
            // },
            //
            // markAsRead: function (id) {
            //     this.notifications[id].markAsRead();
            // },
            //
            // markAsUnread: function (id) {
            //     this.notifications[id].markAsUnread();
            // },
            //
            // markAllAsRead: function () {
            //     for (var id in this.notifications) {
            //         this.markAsRead(id);
            //     }
            // },
            //
            // isNotificationReaded: function (id) {
            //     //console.log("NotifierContainer#isNotificationReaded", this.notifications[id].isReaded());
            //     return this.notifications[id].isReaded();
            // }
        });
});