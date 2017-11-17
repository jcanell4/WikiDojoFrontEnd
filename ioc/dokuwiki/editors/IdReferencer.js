define([
    'dojo/_base/declare',
], function (declare) {

    return declare(null, {

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

            // console.log("Chunk?", chunk, dispatcher.getGlobalState().getCurrentElementId());

            return chunk;
        },


    });

});