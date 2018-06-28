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

            toolbarManager.setDispatcher(this.editor.dispatcher);

            switch (args.type) {
                case 'format':

                    toolbarManager.addFormatButton(args, this.editor.TOOLBAR_ID);
                    break;

                default: // Això correspón a tots els botons personalitzats
                    toolbarManager.addButton(args, callback.bind(this), this.editor.TOOLBAR_ID);
            }
        }

    });

});