define([
    "dojo/_base/declare" // declare
], function (declare) {
    var ret = declare("ioc.wiki30.UpdateViewHandler", [], {
        /**
         * Aquest objecta proporciona el métode UpdateViewHandler al dispatcher. Es cridat desde scriptsRef.tpl.
         * El métode update permet mostrar o ocultar els botons de la part dreta de la pantalla, segons el GlobalState
         * i la acció a realitzar a la pàgina sel·leccionada.
         *
         * @param {?function()} updateFunction funció per substituir a update
         */
        constructor: function (updateFunction) {
            if (updateFunction) {
                this.update = updateFunction;
            }
        },

        /**
         * TODO[Xavi] Té cap efecte? es sobrescrit al scriptsRef.
         * Posa tots els botons ocults, i segons el GlobalState i la acció mostra unos botons o altres.
         */
        update: function () {
        }
    });
    return ret;
});
