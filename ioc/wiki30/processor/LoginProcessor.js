define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dojo/dom"
], function (declare, StateUpdaterProcessor, dom) {
    var ret = declare("ioc.wiki30.processor.LoginProcessor", [StateUpdaterProcessor],

        /**
         * @class LoginProcessor
         * @extends StateUpdaterProcessor
         */
        {
            type: "login",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                this._processLogin(value, dispatcher);
                this.inherited(arguments);
            },

            /**
             * Processar la connexió i desconnexió dels usuaris, mostrant un error si el nom d'usuari o contrasenya son
             * incorrectes.
             *
             * TODO[Xavi] el missatge d'error es mostra cridant a un mètode privat.
             *
             * @param {{loginRequest: string, loginResult: string}} result
             * @param {ioc.wiki30.Dispatcher} dispatcher
             *
             * @private
             */
            _processLogin: function (result, dispatcher) {
                if (result.loginRequest && !result.loginResult) {
                    dispatcher._processError("Usuari o contrasenya incorrectes");

                } else if (!result.loginRequest && !result.loginResult) {
                    dom.byId(dispatcher.infoNodeId).innerHTML = "usuari desconnectat";

                } else {
                    dom.byId(dispatcher.infoNodeId).innerHTML = "usuari connectat";
                }
            },

            /**
             * Actualitza els valors de login del GlobalState.
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {{loginResult: string}} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                dispatcher.getGlobalState().login = value.loginResult;
                dispatcher.getGlobalState().userId = value.userId;
            }

        });
    return ret;
});

