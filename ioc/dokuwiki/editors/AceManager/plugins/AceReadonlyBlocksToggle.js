define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin'
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            // ALERTA[Xavi] En aquest cas no cal afegir cap botó, però es podria afegir un botó per inserir un bloc, obrir un dialeg, etc.

            // console.log("AceFormatButtonPlugin#init", args);

            // TODO: Convertir en toggle per resaltar si està activat o nos
            var config = args;
            if (args.icon.indexOf(".png")===-1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }
            config.class ='toggled';


            // var config = {
            //     type: args.type,
            //     title: args.title,
            //     icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            //     class: 'toggled',
            // };

            this.addButton(config, this.process);

        },



        _processFull: function () {
            var dispatcher = this.editor.dispatcher;

            var id = dispatcher.getGlobalState().getCurrentId(),
                editor = dispatcher.getContentCache(id).getMainContentTool().getEditor();

            this._toggleReadOnlyBlocksManager(editor);

        },

        _processPartial: function () {
            var dispatcher = this.editor.dispatcher;

            var chunk = dispatcher.getGlobalState().getCurrentElementId(),
                id = dispatcher.getGlobalState().getCurrentId();
            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");
            var editor = dispatcher.getContentCache(id).getMainContentTool().getEditor(chunk);

            this._toggleReadOnlyBlocksManager(editor);


        },

        _toggleReadOnlyBlocksManager: function (editor) {

            editor.editor.readOnlyBlocksManager.toggle();
        },

        process: function(args, btn) {
            jQuery(btn).toggleClass('toggled');

            this.inherited(arguments);
        }

    });

});