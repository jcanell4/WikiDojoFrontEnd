define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/_plugins/AbstractIocPlugin',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
], function (declare, AbstractIocPlugin, toolbarManager) {

    return declare([AbstractIocPlugin], {

        /**
         * Permet afegir botons propis de la dokuwiki i botons personalitzats.
         *
         * @param args
         * @param callback
         */
        addButton: function (args, callback) {

            toolbarManager.setDispatcher(this.dispatcher);

            switch (args.type) {
                case 'format':

                    toolbarManager.addFormatButton(args, this.setupEditor.TOOLBAR_ID);
                    break;

                default: // Això correspón a tots els botons personalitzats
                    toolbarManager.addButton(args, callback.bind(this), this.setupEditor.TOOLBAR_ID);
            }
        },

        process:function() {
            this.inherited(arguments);
            jQuery('.picker').addClass('a11y');
        },

        // ALERTA! aquesta crida no funcionarà durant la inicialització del content tool
        getEditor: function () {
            let id = this.dispatcher.getGlobalState().getCurrentId();
            let contentTool = this.dispatcher.getContentCache(id).getMainContentTool();
            return contentTool.getCurrentEditor();
        },

        // Retorna l'editor intern, s'espera que sigui una instància de IocAceEditor
        getInnerEditor() {
            return this.getEditor().editor;
        },

    });

});