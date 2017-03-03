define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    "ioc/gui/content/ContainerContentTool",
    "dijit/_Container",
    "dijit/_WidgetBase",
    'dijit/_TemplatedMixin',
    "dojo/text!./templates/NotifierContainer.html",
    "ioc/wiki30/dispatcherSingleton",
    "ioc/gui/content/subclasses/RequestSubclass"

], function (declare, EventObserver, ContainerContentTool, _Container, _WidgetBase, _TemplatedMixin, template, getDispatcher) {

    var NotifierContainerException = function (message) {
            this.message = message;
            this.name = "NotifierContainerException";
        },
        dispatcher = getDispatcher();


    return declare("ioc.gui.content.NotifierContainer", [_WidgetBase, _Container, _TemplatedMixin, EventObserver, ContainerContentTool],
        {
            templateString: template,


            constructor: function (args) {
                //console.log("NotifierContainer#constructor: ", args);
                this.notifications = {};
                this.notifyManager = dispatcher.getNotifyManager();


//                this.watch('notificationsCounter', this._updateNotifyButton);
            },


            addChild: function (contentTool) {
                console.log("NotifierContainer#addChild", contentTool);

                if (!this.isNotificationInContainer(contentTool.id)) {
                    throw new NotifierContainerException("No es pot cridar a addChild directament en aquest contenidor. Utilitza addNotification() o removeNotification()");
                }

                this.registerMeToEventFromObservable(contentTool, this.eventName.DESTROY, this._destroyNotification.bind(this));

                this.inherited(arguments);
            },

            addNotification: function (contentTool) {
                //console.log("NotifierContainer#addNotification");

                // Afegir a la llista
                this.notifications[contentTool.id] = contentTool;

                // Afegir el content tool al contenidor
                this.addChild(contentTool);

                // Actualitzem el comptador si no existia o ja estava llegida


                if (!contentTool.read) {
                    this.notifyManager.increaseNotificationCounter();
                }

            },


            removeNotification: function (id) { //ALERTA[Xavi] la crida a aquest mètode destrueix la notificació
                //console.log("NotifierContainer#removeNotification", id, this.notifications);

                if (!this.isNotificationRead(id)) {
                    this.notifyManager.decreaseNotificationCounter();
                }

                this.clearing = true;
                this.notifications[id].removeContentTool();
                this.clearing = false;
            },

            removeAllNotifications: function (resetCounter) {
                this.clearing = true;
                console.log("NotifierContainer#removeAllNotifications", this.notifications);
                for (var notification in this.notifications) {
                    this.notifications[notification].removeContentTool();

                    if (resetCounter) {
                        this.notifyManager.resetNotificationsCounter();
                    }
                }
                this.clearing = false;
            },


            _destroyNotification: function (data) { //ALERTA[Xavi] la crida a aquest mètode només elimina la notificació de la llista
                console.log("NotifierContainer#_destroyNotification", data);
                if (!this.clearing) {
                    this.notifyManager.deleteNotification(data.id);

                }

                delete(this.notifications[data.id]);


            },


            isNotificationInContainer: function (id) {
                //console.log("NotifierContainer#checkNotificationInContainer");
                return !(this.notifications[id] === undefined || this.notifications[id] === null);

            },
            //
            //removeChild: function (contentTool) {
            //    this.inherited(arguments);
            //},

            clearContainer: function () { // Per ser cridat, per exemple, quan es faci logout
                for (var id in this.notifications) {
                    this.notifications[id].removeContentTool();
                }
            },

            markAsRead: function (id) {
                this.notifications[id].markAsRead();
                this.notifyManager.updateNotification(id, {read: true});

            },

            markAsUnread: function (id) {
                this.notifications[id].markAsUnread();
            },

            markAllAsRead: function () {
                for (var id in this.notifications) {
                    this.markAsRead(id);
                }
            },

            isNotificationRead: function (id) {
                //console.log("NotifierContainer#isNotificationReaded", this.notifications[id].isReaded());
                return this.notifications[id].isRead();
            }
        });
});