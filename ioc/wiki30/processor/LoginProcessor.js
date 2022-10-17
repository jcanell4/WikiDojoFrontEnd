define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dojo/dom"
], function (declare, StateUpdaterProcessor, dom) {
    /**
     * @class LoginProcessor
     * @extends StateUpdaterProcessor
     */
    var ret = declare([StateUpdaterProcessor], {

        type: "login",

        /**
         * @override
         * @param {*} value
         * @param {Dispatcher} dispatcher
         */
        process: function (value, dispatcher) {
            this._processLogin(value, dispatcher);
            this.inherited(arguments);
            this._updateGUI(dispatcher, value);
        },

        /**
         * @private
         * Processar la connexió i desconnexió dels usuaris, mostrant un error si el nom d'usuari o contrasenya son
         * incorrectes.
         *
         * @param {{loginRequest: string, loginResult: string}} result
         * @param {Dispatcher} dispatcher
         */
        _processLogin: function (result, dispatcher) {
            if (result.loginRequest && !result.loginResult) {
                // TODO[Xavi] el missatge d'error es mostra cridant a un mètode privat.
                dispatcher._processError(LANG.template['ioc-template'].login_error);
            } else if (!result.loginRequest && !result.loginResult) {
                var notifyManager = dispatcher.getNotifyManager();
                notifyManager.clearAll();
                dispatcher.getGlobalState().freeAllPages(true);
            }
        },

        /**
         * @override
         * Actualitza els valors de login del GlobalState.
         *
         * @param {Dispatcher} dispatcher
         * @param {{loginResult: string, userId: string}} value
         */
        updateState: function (dispatcher, value) {
            var moodleToken = value.moodleToken;
            if (value.loginResult && localStorage.login) {
                var login = JSON.parse(localStorage.login);
                if (login && login.moodleToken)
                    moodleToken = login.moodleToken;
            }
            dispatcher.getGlobalState().updateLoginState(value.userId, value.loginResult, moodleToken);
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

