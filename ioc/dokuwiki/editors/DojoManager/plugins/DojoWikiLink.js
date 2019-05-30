define([
    "dojo/_base/declare",
    // 'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWikiBlock',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string"
], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, string) {

    var WikiBlockButton = declare(AbstractParseableDojoPlugin, {

        init: function (args) {
            this.inherited(arguments);

            this.prompt = args.prompt;
            this.htmlTemplate = args.htmlTemplate;
            this.data = args.data;
            this.title = args.title;
            this.target = args.target;


            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon,
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };

            this.addButton(config);
        },


        _showDialog: function (data, previousId) {



            var dialogManager = this.editor.dispatcher.getDialogManager();

            this.previousId = previousId;

            data[0].options = this._getLinkIds(this.target);;


            var dialog = dialogManager.getDialog('form', this.editor.id, {
                title: this.title,
                message: this.prompt, // TODO: localitzar
                data: data,
                ok: {
                    text: 'Inserir' // localitzar
                },
                cancel: {
                    text: 'Cancel·lar' // localitzar
                },
                callback: this._callback.bind(this)
            });

            dialog.show();
        },

        _getLinkIds: function(target) {
            var $contents = jQuery(this.editor.iframe).contents();
            var $targets = $contents.find('[' + target + '] .iocinfo a');

            var linkIds = [];
                $targets.each(function() {

                    // Si no s'ha especificat un ID ho ignorem
                    if (this.id.length>0) {
                        linkIds.push(this.id);
                    }

                });


            return linkIds;

        },

        _addHandlers: function ($node) {

            // Eliminem tots els elements 'no-render' ja que aquests són elements que s'afegeixen dinàmicament.
            // En el cas dels enllaços no es troba dins, si no a continuació
            $node.siblings('.no-render').remove();

            this.inherited(arguments);

        },

    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_link"] = function () {
        return new WikiBlockButton({command: "insert_wiki_link"});
    };

    return WikiBlockButton;
});