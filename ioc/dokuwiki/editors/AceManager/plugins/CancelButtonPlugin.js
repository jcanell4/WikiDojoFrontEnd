define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin'
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function () {
            var args = {
                type: 'BackButton',
                title: 'Tornar',
                icon: '/iocjslib/ioc/gui/img/back.png'
            };

            this.addButton(args, this.activate);
        },


        activate: function () {
            switch (this.editor.TOOLBAR_ID) {
                case 'full-editor':
                    this._activateFull();
                    break;

                case 'partial_edit':
                    this._activatePartial();
                    break;

                default:
                    throw new Error("Tipus d'editor no reconegut: " + this.editor.TOOLBAR_ID);
            }
        },


        _activateFull: function () {
            var dispatcher = this.editor.dispatcher;

            var id = dispatcher.getGlobalState().getCurrentId(),
                eventManager = dispatcher.getEventManager();

            eventManager.fireEvent(eventManager.eventName.CANCEL, {id: id}, id);
        },

        _activatePartial: function () {
            var dispatcher = this.editor.dispatcher;

            var chunk = dispatcher.getGlobalState().getCurrentElementId(),
                id = dispatcher.getGlobalState().getCurrentId(),
                eventManager = dispatcher.getEventManager();

            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");

            eventManager.fireEvent(eventManager.eventName.CANCEL_PARTIAL, {
                id: id,
                chunk: chunk
            }, id);
        }

    });

});