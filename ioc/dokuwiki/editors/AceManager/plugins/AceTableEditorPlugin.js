define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin'
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            // ALERTA[Xavi] En aquest cas no cal afegir cap botó, però es podria afegir un botó per inserir un bloc, obrir un dialeg, etc.

            console.log("AceTableEditorPlugin#init", args);

            // var config = {
            //     type: 'format',
            //     title: args.title,
            //     icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            //     open: args.open,
            //     sample: args.sample,
            //     close: args.close
            // };
            //
            // this.addButton(config);

            this.previousMarker = null;
            this.editor.addReadonlyBlock('edittable', this.readonlyCallback.bind(this));
            //this.editor.addReadonlyBlock('readonly');


            var config = {
                type: args.type,
                title: args.title,
                icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png'
            };

            this.addButton(config, this.process);

            this.enabled = true;
            this.editor.readOnlyBlocksManager.enabled = this.enabled; // TODO: Afegir una propietat independent per les taules?

        },

        process: function () {
            this.enabled = !this.enabled;
            this.editor.readOnlyBlocksManager.enabled = this.enabled; // TODO: Afegir una propietat independent per les taules?
        },


        readonlyCallback: function (range, blockContent) {
            console.log(range);
            this.editor.session.removeMarker(this.previousMarker);
            this.previousMarker = this.editor.session.addMarker(range, 'edittable-highlight');
            //editor.selection.setRange(range);
            alert("Click a secció table-editor, contingut:\n\n" + blockContent);
        }

    });

});