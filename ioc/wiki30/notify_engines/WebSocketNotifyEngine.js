define([
    'dojo/_base/declare',
    'ioc/wiki30/notify_engines/AbstractNotifyEngine',
], function (declare, AbstractNotifyEngine) {

    var NotifyEngineException = function (message) {
        this.message = message;
        this.name = "NotifyEngineException";
    };

    var WebSocketController = function (addr, port, protocol) {
        var RECONNECT = 10; // temps en segons per intentar reconnectar

        var host = protocol + '://' + addr + ':' + port;
        var socket;

        var log = function (msg) {
            console.log('LOG: ' + msg);
        };


        var authUser = function (user, token, session, dokuCookie) {
            // var user = $('username').value;
            // var pass = $('password').value;

            var msg = {
                command: 'AUTH',
                user: user,
                token: token,
                session: session,
                doku_cookie: dokuCookie
            };

            try {
                socket.send(JSON.stringify(msg));
                log('Enviat: ' + JSON.stringify(msg));
            } catch (ex) {
                log(ex);
            }
        };

        return {
            init: function (args) {
                console.log("Iniciant connexió");
                var that = this;

                try {
                    socket = new WebSocket(host);
                    log('WebSocket - status ' + socket.readyState);
                    socket.onopen = function (msg) {
                        authUser(args.user, args.token, args.session, args.doku_cookie);

                        log("Welcome - status " + this.readyState);
                    };
                    socket.onmessage = function (msg) {
                        log("Received: " + msg.data);
                    };
                    socket.onclose = function (msg) {
                        log("Disconnected - status " + this.readyState);

                        // Intentem reconnectar
                        if (!that.closed) {
                            window.setTimeout(that.init.bind(that), RECONNECT*1000, args);
                        }

                    };
                }
                catch (ex) {
                    log(ex);
                }
            },


            // TODO[Xavi] Generalitzar el mètode sent perquè el facin servir les diferents funcions, els missatges s'han de generar al notifier (inclos el AUTH)
            send: function (msg) {
                if (!msg) {
                    log("Message can not be empty");
                    return;
                }

                var message = {
                    data: msg,
                    command: 'NOTIFY_TO_FROM',
                    receiverId: $('receiverId').value
                };


                try {
                    socket.send(JSON.stringify(message));
                    log('Sent: ' + message);
                } catch (ex) {
                    log(ex);
                }
            },

            quit: function () {
                if (socket != null) {
                    log("Goodbye!");
                    socket.close();
                    socket = null;
                    this.closed = true;
                }
            },

            echo: function (user) { // ALERTA: Funció per fer proves
                var msg = {
                    command: 'NOTIFY_TO',
                    data: 'Eco eco eco',
                    receiverId: user
                };

                try {
                    socket.send(JSON.stringify(msg));
                    log('Sent: ' + msg);
                } catch (ex) {
                    log(ex);
                }
            },
            reconnect: function (args) {
                this.quit();
                this.init(args);
            },


        }
    }

    return declare([AbstractNotifyEngine], {

        PROTOCOL: 'ws',
        socket: null,

        init: function (args) {
            console.log("WebScoketEngine#init", args);

            // Conectar al servidor
            this.socket = new WebSocketController(args.ip, args.port, this.PROTOCOL);
            // var user = this.dispatcher.getGlobalState().userId;
            //
            // // var token = this.dispatcher.getGlobalState().sectok; // Aquest no es correspon
            // var token = args.token;
            // var session = args.session;
            // var dokuCookie = args.doku_cookie;



            // TODO: canviar el sectok de l'aplicació: En el moment d'iniciar el server durant les proves no existia el sectok i cal crear un

            args.user = this.dispatcher.getGlobalState().userId;

            console.log("Inicialitzant connexió per user: ", args.user);

            this.socket.init(args);

            // TODO: lligar els events onconnect, etc i esperar el retorn d'una resposta amb l'autenticació correcta


            console.log(this.dispatcher.getGlobalState());

            // this.timer = setInterval(this._refreshNotifications.bind(this), args.timer);
        },

        // _refreshNotifications: function () {
        //     //console.log("AjaxEngine#refreshNotifications");
        //     // S'ha de fer un pop de les notificacions
        //     this.dispatcher.getEventManager().fireEvent('notify', {
        //         //id: value.id, // ALERTA[Xavi] crec que això, en el cas de les notificacions, no és necessari
        //         dataToSend: {
        //             do: 'get'
        //         }
        //     });
        // },

        update: function (args) {
            console.log("WebSocketEngine#update", this.socket);

            args.user = this.dispatcher.getGlobalState().userId;
            this.socket.reconnect(args);
            // this.shutdown();
            // this.init(args);
        },

        shutdown: function () {
            console.log("WebSocketEngine#shutdown", this.socket);
            // if (this.timer) {
            //     clearInterval(this.timer);
            // }
            this.socket.quit();
        }
    });

});
