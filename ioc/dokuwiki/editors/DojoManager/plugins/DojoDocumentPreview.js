define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    'ioc/dokuwiki/editors/Components/DocumentPreviewComponent',
], function (declare, AbstractDojoPlugin, lang, _Plugin, DocumentPreviewComponent) {

    var DocumentPreviewButton = declare(AbstractDojoPlugin, {

        init: function(args) {
            this.inherited(arguments);

            this.documentPreviewComponent= new DocumentPreviewComponent(this.editor.dispatcher);

            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon, // TODO[Xavi] el prefix ha de canviar per correspondre amb una classe CSS que mostri la icona
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };

            this.events = args.event;

            this.addButton(config);
        },

        _processFull:function() {
            this.documentPreviewComponent.send(
                {contentFormat: 'DOJO'}
            );
        }


    });


    // Register this plugin.
    _Plugin.registry["document_preview"] = function () {
        return new DocumentPreviewButton({command: "document_preview"});
    };

    return DocumentPreviewButton;
});