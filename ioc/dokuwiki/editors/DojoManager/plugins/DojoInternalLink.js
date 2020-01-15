define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
], function (declare, AbstractDojoPlugin, lang, _Plugin) {

    var TIMER_INTERVAL = 0.1;
    var timer = null;


    var InternalLinkButton = declare(AbstractDojoPlugin, {

        init: function (args) {
            this.inherited(arguments);

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

            this.open = args.open;
            this.close = args.close;
            this.linkClass = args.class;

            this.addButton(config);
        },

        _processFull: function () {

            //

            var formId = 'form_' + this.editor.id + '_internal_link';
            var textareaId = 'textarea_' + this.editor.id + '_internal_link';

            jQuery('form#' + formId).remove();
            clearInterval(timer);

            // Afegim un de nou
            var $form = jQuery('<form>')
                .attr('id', formId);
            var $input = jQuery('<input>')
                .attr('name', 'id')
                .attr('value', this.editor.id);
            var $textarea = jQuery('<textarea>')
                .attr('id', textareaId);

            $form.css('display', 'none');

            $form.append($textarea);
            $form.append($input);

            jQuery('body').append($form);

            // ALERTA[Xavi] El canvia al textarea es fa mitjançant expresions regulars directament
            // sobre el text, no es dispara cap event

            var context = this;

            timer = setInterval(function () {
                var value = $textarea.val();

                if (value.length > 0) {
                    clearInterval(timer);
                    context.insertHtml(value);
                    timer = null;
                }

            }, TIMER_INTERVAL);

            dw_linkwiz.val = {
                open: this.open,
                close: this.close
            };

            dw_linkwiz.toggle($textarea);

        },

        insertHtml: function (value) {
            var html = this.wikiInternalLinkToHTML(value);
            this.editor.execCommand('inserthtml', html);
        },

        wikiInternalLinkToHTML: function (value) {

            var extractedValue = value.substring(this.open.length, value.length - this.close.length);

            var tokens = extractedValue.split('|');

            return '<a href="/dokuwiki_30/doku.php?id=' + tokens[0] + '" title="' + tokens[0] + '" class='+this.linkClass+'>' + (tokens[1] ? tokens[1] : tokens[0]) + '</a>'; // TODO: pasar la URL base desde servidor, com? el JSINFO?
        }

    });


    // Register this plugin.
    _Plugin.registry["internal_link"] = function () {
        return new InternalLinkButton({command: "internal_link"});
    };

    return InternalLinkButton;
});