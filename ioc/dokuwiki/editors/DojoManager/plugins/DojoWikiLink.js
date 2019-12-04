define([
    "dojo/_base/declare",
    // 'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWikiBlock',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/_editor/range"
], function (declare, DojoWikiBlock, lang, _Plugin, string, range) {

    var WikiBlockButton = declare(DojoWikiBlock, {

        init: function (args) {
            this.inherited(arguments);

            this.prompt = args.prompt;
            this.htmlTemplate = args.htmlTemplate;
            this.data = args.data;
            this.title = args.title;
            this.target = args.target;
            this.type = args.type;


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

            var $contents = jQuery(this.editor.iframe).contents();

            if (previousId) {
                // ALERTA! aquesta funció la sobreescriu el patcher globalment però el plugin Range necesita la original (que es troba també a document)
                var backup = window.getSelection;
                window.getSelection = document.getSelection;

                var sel = dijit.range.getSelection(this.editor.internalDocument);
                this.editor.focus();
                var el = $contents.find('[data-ioc-id="' + previousId + '"]').get(0); // aquesta es la part que s'eliminarà

                var range = document.createRange();
                range.setStart(el, 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);

                // Restaurem la funció
                window.getSelection = backup;

            }

            var dialogManager = this.editor.dispatcher.getDialogManager();

            this.previousId = previousId;

            data[0].options = this._getLinkIds(this.target);

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
                    if (this.name) {
                        linkIds.push(this.name);
                    }

                });

            return linkIds;

        },

        parse: function () {

            // No modifiquem el pare perque no tinc clar a quines classes afecta

            var $nodes = jQuery(this.editor.iframe).contents().find('[data-ioc-link="' + this.type +'"]');
            var context = this;


            var counter = 0;

            $nodes.each(function () {
                // Afegim els ids
                var nodeId = 'link_' + context.type + '_' + counter++;

                jQuery(this).attr('data-ioc-id', nodeId);
                context._addHandlers(jQuery(this)/*, context*/);
            });
        },

        _addHandlers: function ($node) {

            // Eliminem tots els elements 'no-render' ja que aquests són elements que s'afegeixen dinàmicament.
            // En el cas dels enllaços no es troba dins, si no a continuació
            $node.siblings('.no-render').remove();

            $node.on('click', function (e) {
               // Desactivem el click al node
               e.preventDefault();
            });

            $node.css('cursor', 'default');

            this.inherited(arguments);

        },

        _callback: function (data) {
            this.inherited(arguments);

            // El link afegit s'ha de deshabilitar
            // var $contents = jQuery(this.editor.iframe).contents();

            // var $node = $contents.find('[data-ioc-id="' + this.lastId + '"]');

            // $node .on('click', function(e) {
            //     // Desactivat
            //     e.preventDefault();
            // });

        }

    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_link"] = function () {
        return new WikiBlockButton({command: "insert_wiki_link"});
    };

    return WikiBlockButton;
});