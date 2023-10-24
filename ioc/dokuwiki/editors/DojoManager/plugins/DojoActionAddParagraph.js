define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    // 'ioc/dokuwiki/editors/DojoManager/plugins/DojoWikiBlock',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/_editor/range",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActions',
], function (declare, DojoWikiBlock, lang, _Plugin, string, range, dojoActions) {

    // Aquest plugin es necessari per afegir el parse als elements que heretan directament de dojo (plugins de taula)
    // i no implementan el parse.


    var WikiAddParagraph = declare(DojoWikiBlock, {

        init: function (args) {
            this.inherited(arguments);

            this.prompt = args.prompt;
            this.htmlTemplate = args.htmlTemplate;
            this.data = args.data;
            this.type = args.type;
            this.label = args.label;
            this.placeholder = args.placeholder;

        },

        parse: function () {

            var $nodes = jQuery(this.editor.iframe).contents().find('[data-dw-box]'); // Table

            var context = this;

            $nodes.each(function () {

                var $node = jQuery(this);

                dojoActions.addParagraphAfterAction($node, context.editor);
                dojoActions.addParagraphBeforeAction($node, context.editor);
                dojoActions.setupContainer($node, $node.find('.no-render.action'));
            });

        },


    });


    // Register this plugin.
    _Plugin.registry["add_paragraph"] = function () {
        return new WikiAddParagraph({command: "add_paragraph"});
    };

    return WikiAddParagraph;
});