define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin'
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function () {
            var args = {
                type: 'EnableWrapper', // we havea new type that links to the function
                title: 'Activar/Desactivar embolcall',
                icon: '/iocjslib/ioc/gui/img/wrap.png'
            };

            this.addButton(args, this.process);
        },

        // ALERTA[Xavi] Això és un però com que la acció la realitza una funció global de la wiki no controlem l'estat activat|desactivat, així que no fem servir el Toggle AbstractIocPlugin per implementar-lo
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
                editor = dispatcher.getContentCache(id).getMainContentTool().getEditor();

            editor.toggleWrap();
        },

        _processPartial: function () {
            var dispatcher = this.editor.dispatcher;

            var chunk = dispatcher.getGlobalState().getCurrentElementId(),
                id = dispatcher.getGlobalState().getCurrentId(),
                editor;
            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");

            editor = dispatcher.getContentCache(id).getMainContentTool().getEditor(chunk);
            editor.toggleWrap();
        }

    });

});