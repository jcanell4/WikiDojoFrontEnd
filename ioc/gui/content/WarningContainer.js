define([
    'dojo/_base/declare',
    'ioc/gui/content/NotifierContainer',
    "dojo/text!./templates/WarningContainer.html",
    "ioc/wiki30/dispatcherSingleton",
    "dojo/dom-class"

], function (declare, NotifierContainer, template, getDispatcher, domClass) {

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

                this.notificationsVisible = false;

//                this.watch('notificationsCounter', this._updateNotifyButton);
            },


            addChild: function (contentTool, position) {
                this.inherited(arguments);

                if (!this.notificationsVisible) {
                    this.toggleNotifications();
                }

                // this.set(this.counter[contentTool.data.type], this.counter[contentTool.data.type]+1);
                // this.set(this.counter.warning, 66);
                // Alerta[Xavi] No es poden utilitzar variables (valors que canvian) en el template perqué peta en actualitzar-los.

                switch (contentTool.data.type) {
                    case 'warning':
                        this.counterWarning.innerHTML = ++this.counter.warning;
                        this.counterWarning.setAttribute('style', "display: inline-block");
                        break;

                    case 'success':
                        this.counterSuccess.innerHTML = ++this.counter.success;
                        this.counterSuccess.setAttribute('style', "display: inline-block");
                        break;

                    case 'error':
                        this.counterError.innerHTML = ++this.counter.error;
                        this.counterError.setAttribute('style', "display: inline-block");
                        break;

                    default: // 'info' i qualsevol altre tipus desconegut
                        this.counterInfo.innerHTML = ++this.counter.info;
                        this.counterInfo.setAttribute('style', "display: inline-block");
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

            startup: function() {
                this.inherited(arguments);
                var that = this;

                this.domNode.addEventListener('click', function() {
                    that.toggleNotifications();
                })
            },

            toggleNotifications: function() {
                this.notificationsVisible = !this.notificationsVisible;
                console.log("Toggle:", this.notificationsVisible);

                // TODO[Xavi] Afegir o eliminar la classe ''toggle'' dels botons de warning


                if (this.notificationsVisible) {
                    domClass.add(this.domNode, "toggle");
                    this.showAllNotifications();
                } else {
                    domClass.remove(this.domNode, "toggle");
                    this.hideAllNotifications();
                }
            },

            hideAllNotifications:function() {
                for (var notificationId in this.notifications) {
                    this.hideNotification(notificationId);
                }
            },

            showAllNotifications:function() {
                for (var notificationId in this.notifications) {
                    this.showNotification(notificationId);
                }
            },

            hideNotification: function(id) {
              this.notifications[id].hide();
            },

            showNotification: function(id) {
                this.notifications[id].show();
            }

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