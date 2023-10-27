define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin'
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            var config = JSON.parse(JSON.stringify(args));
            if (args.icon.indexOf(".png")===-1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }

            // var config = {
            //     type: args.type,
            //     title: args.title,
            //     icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png'
            // };

            this.addButton(config, this.process);
        },

        _processFull: function () {

            var id = this.dispatcher.getGlobalState().getCurrentId(),
                editor = this.dispatcher.getContentCache(id).getMainContentTool().getEditor();

            editor.toggleWrap();
        },

        _processPartial: function () {

            var chunk = this.dispatcher.getGlobalState().getCurrentElementId(),
                id = this.dispatcher.getGlobalState().getCurrentId(),
                editor;
            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");

            editor = dispatcher.getContentCache(id).getMainContentTool().getEditor(chunk);
            editor.toggleWrap();
        }

    });

});