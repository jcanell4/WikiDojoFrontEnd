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
            // this.title = args.title;
            // this.target = args.target;
            this.type = args.type;
            this.label = args.label;
            this.placeholder = args.placeholder;


            // No s'afegeix botó
            // var config = {
            //     label: args.title,
            //     ownerDocument: this.editor.ownerDocument,
            //     dir: this.editor.dir,
            //     lang: this.editor.lang,
            //     showLabel: false,
            //     iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon,
            //     tabIndex: "-1",
            //     onClick: lang.hitch(this, "process")
            // };
            //
            // this.addButton(config);
        },


        parse: function () {

            var $nodes = jQuery(this.editor.iframe).contents().find('[data-dw-box]'); // Table

            var context = this;

            $nodes.each(function () {
                var $node = jQuery(this);

                // Ens asegurem de no duplicar el handler
                if ($node.find('.action').length > 0) {
                    return true;
                }

                var $aux = jQuery('<div class="no-render action"><span>' + context.label + '</span></div>');

                context._addHandlers($aux);


                $node.append($aux);

            });

        },

        _addHandlers: function ($node) {

            // Ens asegurem de no duplicar el handler

            var context = this;

            $node.on('click', function (e) {
                e.preventDefault();

                $node.after(jQuery('<p>' + context.placeholder + '</p>'));
                context.editor.forceChange();
            });
        },


    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_link"] = function () {
        return new WikiBlockButton({command: "insert_wiki_link"});
    };

    return WikiBlockButton;
});