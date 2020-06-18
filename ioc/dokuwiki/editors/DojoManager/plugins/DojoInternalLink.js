define([
    "dojo/_base/declare",
    // 'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
], function (declare, AbstractParseableDojoPlugin, lang, _Plugin) {

    var TIMER_INTERVAL = 0.1;
    var timer = null;
    var idCounter = 0;


    var InternalLinkButton = declare(AbstractParseableDojoPlugin, {

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
            this._openEditor();
        },

        _openEditor: function () {

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
            console.log(this.editor.getCurrentNodeState());
            var html = this.wikiInternalLinkToHTML(value);

            if (this.editor.getCurrentNodeState().length === 0) {
                html = '<p>' + html + '</p>';
            }

            this.editor.execCommand('inserthtml', html);

            // El id es necessari només quan s'afegeix el handler, per poder cercar-lo un cop afegit.
            var id = jQuery(html).attr('data-ioc-id');
            var $node = jQuery(this.editor.iframe).contents().find('[data-ioc-id="' + id +'"]');

            this._addHandlers($node);

        },

        wikiInternalLinkToHTML: function (value) {

            var extractedValue = value.substring(this.open.length, value.length - this.close.length);

            var tokens = extractedValue.split('|');

            var id = 'InternalLink_' + idCounter;
            ++idCounter;

            var title = (tokens[1] ? tokens[1] : tokens[0]);

            return '<a '
                + 'data-ioc-id="' + id + '" '
                + 'data-dw-type="internal_link" '
                + 'data-dw-ns="' + tokens[0] + '" '
                + 'data-dw-title="' + title + '" '
                +'href="/dokuwiki_30/doku.php?id=' + tokens[0] + '" title="' + tokens[0] + '" '
                + 'class="'+this.linkClass+'">' + title

                + '</a>&nbsp;'; // TODO: pasar la URL base desde servidor, com? el JSINFO?
        },

        _addHandlers: function($node) {

            var context = this;

            $node.on('dblclick', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var $this = jQuery(this);

                if (!dw_linkwiz.$entry) {
                    dw_linkwiz.$entry =jQuery('<input>');
                }

                // Només s'afegeix el valor si es troba dins d'un espai de noms
                var value = $this.attr('data-dw-ns');
                dw_linkwiz.$entry.val(value.indexOf(':') === -1 ? '' : value);

                context._openEditor();
            })
        },

        parse: function () {
            var $nodes = jQuery(this.editor.iframe).contents().find('[data-dw-type="internal_link"]');
            var context = this;

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });

        },

    });


    // Register this plugin.
    _Plugin.registry["internal_link"] = function () {
        return new InternalLinkButton({command: "internal_link"});
    };

    return InternalLinkButton;
});