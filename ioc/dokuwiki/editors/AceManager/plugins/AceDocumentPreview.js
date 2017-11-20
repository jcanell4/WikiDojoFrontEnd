define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    'ioc/dokuwiki/editors/Components/DocumentPreviewComponent',
], function (declare, AbstractAcePlugin, DocumentPreviewComponent) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            // console.log("AceDocumentPreview#init", args);

            var config = {
                type: args.type,
                title: args.title,
                icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            };

            this.documentPreviewComponent = new DocumentPreviewComponent(this.editor.dispatcher);

            this.addButton(config, this.process);
        },

        _processFull:function() {
            this.documentPreviewComponent.send();
        }

    });

});