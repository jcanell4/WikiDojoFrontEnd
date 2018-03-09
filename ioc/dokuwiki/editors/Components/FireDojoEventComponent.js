define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/AbstractIocComponent'
], function (declare, AbstractIocComponent) {


    return declare(AbstractIocComponent, {

        constructor: function (SourceObject) {
            this.SourceObject = SourceObject;
        },

        /**
         * Dispara un event del tipus indicat afegint les dades passades com argument.
         *
         * @param {string} type - tipus d'event, corresponent las que es troben a EventFactory.
         * @param {Object} data - dades que s'afegeixen a l'event
         * @param {string} docId - id del document a partir del qual es dispara l'event
         */
        fire: function(event) {
            this.SourceObject.emit(event.type, event.data)
        },

    });

});