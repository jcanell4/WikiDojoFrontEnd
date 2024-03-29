define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    'ioc/dokuwiki/editors/Components/DocumentPreviewComponent',
], function (declare, AbstractAcePlugin, DocumentPreviewComponent) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            // console.log("AceDocumentPreview#init", args);
            var config = JSON.parse(JSON.stringify(args));
            if (args.icon.indexOf(".png")===-1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }


            // var config = {
            //     type: args.type,
            //     title: args.title,
            //     icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            // };

            this.documentPreviewComponent = new DocumentPreviewComponent(this.dispatcher);

            this.addButton(config, this.process);
        },

        _processFull:function() {
            this.documentPreviewComponent.send();
        }

    });

});