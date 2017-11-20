define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/AbstractIocComponent'
], function (declare, AbstractIocComponent) {


    return declare(AbstractIocComponent, {

        constructor: function (dispatcher) {
            this.dispatcher = dispatcher;
        },

        /**
         * Dispara un event del tipus indicat afegint les dades passades com argument.
         *
         * @param {string} type - tipus d'event, corresponent las que es troben a EventFactory.
         * @param {Object} data - dades que s'afegeixen a l'event
         * @param {string} docId - id del document a partir del qual es dispara l'event
         */
        fire: function(type, data, docId) {
            // console.log("FireEventComponent#fire", type);
            var eventManager = this.dispatcher.getEventManager();
            eventManager.fireEvent(type, data, docId);
        },

        fireFull: function(type, data) {
            var docId = this._getDocumentId();

            if (!data) {
                data = {};
            }

            data.id = docId;

            this.fire(type, data, docId);
        },

        firePartial: function(type, data) {
            var docId = this._getDocumentId();

            if (!data) {
                data = {};
            }

            data.id = docId;
            data.chunk = this._getChunkId();

            this.fire(type, data, docId);
        }

    });

});