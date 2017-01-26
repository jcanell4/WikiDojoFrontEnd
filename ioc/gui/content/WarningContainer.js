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


            constructor: function () {
                //console.log("WarningContainer#constructor: ", args);
                this.notifications = {};
                this.notifyManager = dispatcher.getNotifyManager();

                this.resetCounters();
            },


            addChild: function (contentTool, position) {
                this.inherited(arguments);

                if (!this.notificationsVisible) {
                    this.toggleNotifications();
                }

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
            },

            resetCounters: function() {
                this.counter = {
                    info: 0,
                    success: 0,
                    warning: 0,
                    error: 0
                };

                this.notificationsVisible = false;
            },

            clearCounters: function () {
                this.counterWarning.innerHTML = '0';
                this.counterWarning.setAttribute('style', '');

                this.counterSuccess.innerHTML = '0';
                this.counterSuccess.setAttribute('style', '');

                this.counterError.innerHTML = '0';
                this.counterError.setAttribute('style', '');

                this.counterInfo.innerHTML = '0';
                this.counterInfo.setAttribute('style', '');
            },

            reset: function() {
                this.removeAllNotifications();
                this.resetCounters();
                this.clearCounters();
            }
        });
});