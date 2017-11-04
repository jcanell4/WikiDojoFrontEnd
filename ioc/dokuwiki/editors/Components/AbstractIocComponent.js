define([
    'dojo/_base/declare',
    'dojo/Evented'
], function (declare, Evented) {

    return declare(Evented, {

        _getDocumentId: function () {
            var dispatcher = this.dispatcher,
                id = dispatcher.getGlobalState().getCurrentId();

            return id;
        },

        _getChunkId: function () {
            var dispatcher = this.dispatcher,
                id = dispatcher.getGlobalState().getCurrentId(),
                chunk = dispatcher.getGlobalState().getCurrentElementId();

            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");

            return chunk;
        }


    });

});