define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
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
            this.sample = args.sample;
            this.title = args.title;


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

        process: function () {

            if (this.data.length > 0) {
                this._showDialog(this.data);
            } else {
                this.data.json = "[]";
                this._callback(this.data);
            }
        },

        _showDialog: function (data, previousId) {


            var dialogManager = this.editor.dispatcher.getDialogManager();

            this.previousId = previousId;

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

        _callback: function (data) {
            var volatileId = false;

            if (data.id === undefined) {
                data.id = Date.now();
                volatileId = true;
            }

            var html = string.substitute(this.htmlTemplate, data);

            var $html = jQuery(html);
            $html.attr('data-ioc-id', this.normalize($html.attr('data-ioc-id')));
            var id = jQuery(html).attr('data-ioc-id');

            if (this.previousId) {
                jQuery(this.editor.iframe).contents().find('[data-ioc-id="' + this.previousId + '"]').remove();
            }

            // Si un node opcional es buit l'eliminem
            $html.find('[data-ioc-optional]').each(function () {
                    var $this = jQuery(this);

                    if ($this.text().length === 0) {
                        console.log("eliminant node opcional");
                        $this.remove();
                    }
                }
            );


            this.editor.execCommand('inserthtml', html);

            var $node = jQuery(this.editor.iframe).contents().find('[data-ioc-id="' + id + '"]');
            $node.attr('data-ioc-block-' + this.normalize(this.title), true);


            this._addHandlers($node);

            // Com que el valor de data.id pot venir de this.data si s'asigna un cop es queda fixat per a tots els nous elements generats
            if (volatileId) {
                data.id = undefined;
            }
        },

        _addHandlers: function ($node) {

            // Eliminem tots els elements 'no-render' ja que aquests són elements que s'afegeixen dinàmicament.
            $node.find('.no-render').remove();

            var context = this;

            var $actions = jQuery('<div class="no-render action" >');

            var $edit = jQuery('<a contenteditable="false" style="float:right;">editar</a>');
            var $delete = jQuery('<a contenteditable="false" style="float:right;">eliminar</a>');

            if (this.data.length > 0) {
                $actions.append($edit);
            }

            $actions.append($delete);

            $node.append($actions);

            $edit.on('click', function (e) {
                e.preventDefault();
                // $node.trigger('click');

                var json = $node.attr('data-ioc-block-json');

                json = json.split('&quot').join('"');

                var data = JSON.parse(json);

                context._showDialog(data, $node.attr('data-ioc-id'));
            });

            $delete.on('click', function (e) {
                e.preventDefault();
                $node.remove();
            });


        },

        parse: function () {

            var $nodes = jQuery(this.editor.iframe).contents().find('[data-ioc-block-' + this.normalize(this.title) + ']');
            var context = this;

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });
        },

        // Canviem els espais per guions i eliminem la resta de caràcters conflictius habituals
        normalize: function (string) {
            var normalized = string.split(' ').join('-');

            normalized = normalized.toLowerCase().replace(/[ñçàèòáéíóúüï'·]+/g, '');

            return normalized;
        }


    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_block"] = function () {
        return new WikiBlockButton({command: "insert_wiki_block"});
    };

    return WikiBlockButton;
});