define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin'
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            // ALERTA[Xavi] En aquest cas no cal afegir cap botó, però es podria afegir un botó per inserir un bloc, obrir un dialeg, etc.

            // console.log("AceFormatButtonPlugin#init", args);

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

            this.setupEditor.addReadonlyBlock('readonly', this.editTableCallback.bind(this));
            this.setupEditor.addReadonlyBlock('protectedcontent');
        },

        editTableCallback: function(range, blockContent) {
            //console.log(range);
            let editor = this.getInnerEditor();
            editor.session.removeMarker(this.previousMarker);
            this.previousMarker = editor.session.addMarker(range, 'readonly-highlight');
            //editor.selection.setRange(range);
            alert("Click a secció readonly, contingut:\n\n" + blockContent);
        }

    });

});