define([
    "dojo/_base/declare" // declare
], function (declare) {

    var ret = declare("ioc.wiki30.ReloadStateHandler", [],
        /**
         * @class ioc.wiki30.ReloadStateHandler
         */
        {
            /**
             * S'sestableix la funció de recarrega. Creat a scriptsRef.tpl. Aquest objecte s'afegeix al Dispatcher i es
             * cridat per ell.
             *
             * @param {function(GlobalState)} realodFunction funció que serà cridada quan ??
             * @constructor
             */
            constructor: function (realodFunction) {
                // TODO[Xavi] S'ha de poder instanciar sense l'argument?
                if (realodFunction) {
                    this.reload = realodFunction;
                } else {
                    alert("S'ha intentant establir una funció de reload nla");
                }
            },

            /**
             * TODO[Xavi] Comprovar si això es crida enlloc. En qualsevol cas no te cap efecte perque el métode es buit.
             *
             * @param {ioc.wiki30.GlobalState} stateToReload
             */
            reload: function (stateToReload) {
            }
        });
    return ret;
});
