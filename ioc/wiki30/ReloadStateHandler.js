define([
    "dojo/_base/declare" // declare
], function (declare) {

    var ret = declare(null,
        /**
         * @class ReloadStateHandler
         */
        {
            /**
             * S'sestableix la funció de recarrega. Creat a scriptsRef.tpl. Aquest objecte s'afegeix al Dispatcher i es
             * cridat per ell.
             *
             * @param {function(GlobalState)} reloadHandler funció que serà cridada al recarregar la pàgina.
             * @constructor
             */
            constructor: function (reloadHandler) {


                if (reloadHandler) {
                    this.reload = reloadHandler;
                } else {
                    alert("S'ha intentant establir una funció de reload sense passar la funció");
                }
            },

            /**
             * TODO[Xavi] Comprovar si això es crida enlloc. En qualsevol cas no te cap efecte perque el métode es buit.
             *
             * @param {GlobalState} stateToReload
             */
            reload: function (stateToReload) {
            }
        });
    return ret;
});
