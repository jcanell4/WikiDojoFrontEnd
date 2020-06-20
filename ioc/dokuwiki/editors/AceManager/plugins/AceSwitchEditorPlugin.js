define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    'ioc/dokuwiki/editors/Components/SwitchEditorComponent',
], function (declare, AbstractAcePlugin, SwitchEditorComponent) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            if (!this.editor.ALLOW_SWITCH_EDITOR) {
                return;
            }

            this.switchEditorComponent= new SwitchEditorComponent(this.editor.dispatcher);

            var config = JSON.parse(JSON.stringify(args));

            if (args.icon.indexOf(".png")===-1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }

            this.addButton(config, this.process);
        },

        process:function() {

            this.switchEditorComponent.send(
                {editorType: 'DOJO'}
            );
        }

    });

});