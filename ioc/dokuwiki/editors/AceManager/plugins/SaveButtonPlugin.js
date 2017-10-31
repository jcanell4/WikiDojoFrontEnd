define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin'
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function () {
            var args = {
                type: 'SaveButton',
                title: 'Desar',
                icon: '/iocjslib/ioc/gui/img/save.png'
            };

            this.addButton(args, this.process);
        },


        process: function () {
            switch (this.editor.TOOLBAR_ID) {
                case 'full-editor':
                    this._processFull();
                    break;

                case 'partial_edit':
                    this._processPartial();
                    break;

                default:
                    throw new Error("Tipus d'editor no reconegut: " + this.editor.TOOLBAR_ID);
            }
        },


        _processFull: function () {
            var dispatcher = this.editor.dispatcher;

            var id = dispatcher.getGlobalState().getCurrentId(),
                eventManager = dispatcher.getEventManager();

            eventManager.fireEvent(eventManager.eventName.SAVE, {id: id}, id);
        },

        _processPartial: function () {
            var dispatcher = this.editor.dispatcher;

            var chunk = dispatcher.getGlobalState().getCurrentElementId(),
                id = dispatcher.getGlobalState().getCurrentId(),
                eventManager = dispatcher.getEventManager();

            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");

            eventManager.fireEvent(eventManager.eventName.SAVE_PARTIAL, {
                id: id,
                chunk: chunk
            }, id);
        }

    });

});