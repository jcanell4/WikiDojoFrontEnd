define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin'
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function () {
            var args = {
                type: "EnableAce",
                title: "Activar/Desactivar ACE",
                icon: "/iocjslib/ioc/gui/img/toggle_on.png"
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
                editor = dispatcher.getContentCache(id).getMainContentTool().getEditor();
            editor.toggleEditor();

        },

        _activatePartial: function () {
            var dispatcher = this.editor.dispatcher;

            var chunk = dispatcher.getGlobalState().getCurrentElementId(),
                id = dispatcher.getGlobalState().getCurrentId();
            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");
            var editor = dispatcher.getContentCache(id).getMainContentTool().getEditor(chunk);

            editor.toggleEditor();

        }

    });

});