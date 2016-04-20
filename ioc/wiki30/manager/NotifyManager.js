define([
    'dojo/_base/declare',
    'ioc/wiki30/Draft',
    'ioc/wiki30/manager/EventObserver',
], function (declare, Draft, EventObserver) {

    var NotifyManagerException = function (message) {
        this.message = message;
        this.name = "NotifyManagerException";
    };

    return declare([EventObserver], {

        _notificationEngine: null,

        constructor: function (args) {
            this.dispatcher = args.dispatcher;
            console.log("Dispatcher: ", this.dispatcher);
        },

        process: function(action, params) {
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
                    this._procesNotifications(params);
                    break;

                case 'close_notifier':
                    console.log(action, params);
                    this._closeNotifier(params);
                    break;

                default:
                    throw new NotifyManagerException("Acció desconeguda: ", action);
            }
        },

        _closeNotifier: function(params) {
            console.log("NotifyManager#_updateNotifier", params);
            if (!this._notificationEngine) {
                throw new NotifyManagerException("S'ha intentat tancar el motor de notificacions però no hi ha cap actiu");
            }

            this._notificationEngine.shutdown();
        },

        _updateNotifier: function(params) {
          console.log("NotifyManager#_updateNotifier", params)
            this._notificationEngine.update(params);
        },

        _initNotifier: function(params) {


            switch (params.type) {
                case 'ajax':
                    this._initAjaxNotifier(params);
                    break;
                case 'websocket':
                    this._initWebsocketNotifier(params);
                    break;
                default:
                    throw new NotifyManagerException("Tipus de motor de notificacions desconegut: ", params.type);
            }
        },

        _initAjaxNotifier: function (params) {
            // Crear un nou ajaxNotificactionEngine TODO: Pensar que ha de ser una interficie

            //TODO[Xavi] Moure a una classe externa!
            this._notificationEngine = {

                // TODO[Xavi] passarà el dispatcher a través del constructor i s'iniciarà el engine
                //constructor: function (args) {
                //    this.dispatcher = args.dispatcher;
                //    this.init(args)
                //},

                init: function(args) {
                    console.log("AjaxEngine#init");

                    this.timer = setInterval(this.refreshNotifications.bind(this), args.timer);
                },

                refreshNotifications: function() {
                    console.log("AjaxEngine#refreshNotifications");
                    // S'ha de fer un pop de les notificacions
                    this.dispatcher.getEventManager().dispatchEvent('notify', {
                        //id: value.id, // ALERTA[Xavi] crec que això, en el cas de les notificacions, no és necessari
                        dataToSend: {
                            do: 'get'
                        }
                    });
                },

                update: function(args) {
                    console.log("AjaxEngine#update");
                    this.shutdown();
                    this.init(args);
                },

                shutdown: function() {
                    console.log("AjaxEngine#shutdown");
                    if (this.timer) {
                        clearInterval(this.timer);
                    }
                }

            },

            this._notificationEngine.dispatcher = this.dispatcher; // ALERTA[Xavi] Això s'afegirà des del constructor
            this._notificationEngine.init(params); // ALERTA[Xavi] Això es cridarà des del constructor


        },

        _initWebsocketNotifier: function (params) {
            throw new NotifyManagerException("Pendent d'implemeentar");
        },

        _procesNotifications: function(notification) {
            console.log("NotifyManager#_processNotifications", notification);
        }
    });
});