define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dojo/dom"
], function (declare, StateUpdaterProcessor, dom) {
    var ret = declare([StateUpdaterProcessor],

        /**
         * @class LoginProcessor
         * @extends StateUpdaterProcessor
         */
        {
            type: "login",

            /**
             * @param {*} value
             * @param {Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {

                this._processLogin(value, dispatcher);

                this.inherited(arguments);
                this._updateGUI(dispatcher, value);
            },

            /**
             * Processar la connexió i desconnexió dels usuaris, mostrant un error si el nom d'usuari o contrasenya son
             * incorrectes.
             *
             * @param {{loginRequest: string, loginResult: string}} result
             * @param {Dispatcher} dispatcher
             *
             * @private
             */
            _processLogin: function (result, dispatcher) {

                if (result.loginRequest && !result.loginResult) {
                    // TODO[Xavi] el missatge d'error es mostra cridant a un mètode privat.
                    dispatcher._processError("Usuari o contrasenya incorrectes");

                }

            },

            /**
             * Actualitza els valors de login del GlobalState.
             *
             * @param {Dispatcher} dispatcher
             * @param {{loginResult: string, userId: string}} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                dispatcher.getGlobalState().login = value.loginResult;
                dispatcher.getGlobalState().userId = value.userId;
            },

            /**
             * Recupera el contingut de 'localStorage.UserConfig' que conté els valors personalitzats
             * del tamany dels ContentPane
             */
            _updateGUI: function (dispatcher, value) {
                if (value.userId) {
                    dispatcher.almacenLocal.loadUserConfig(dispatcher, value.userId);
                }else {
                    dispatcher.almacenLocal.setUserDefaultPanelsSize(dispatcher);
                }
            }
        });
    return ret;
});

