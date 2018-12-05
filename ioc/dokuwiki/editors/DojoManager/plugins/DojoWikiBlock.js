define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string"
], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, string) {

    var WikiBlockButton = declare(AbstractParseableDojoPlugin, {

        init: function(args) {
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

            // var id = prompt(this.prompt, this.sample);
            //
            // // No cal indicar el secret token, pot ser es per audios privats?
            //
            // // TODO[Xavi] passar la URL des del plugin factory?
            // var url = 'https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/${id}?secret_token=none&color=%230066cc&inverse=false&auto_play=false&show_user=true';
            // url = string.substitute(url, {id: id});

            // TODO:
            //      - Crear un dialog pasant el this.data i el this.prompt.
            //      - el retorn pasar-lo al template.


            var data = this.data;

            var editor = this.editor;
            var template = this.htmlTemplate;


            var dialogManager = this.editor.dispatcher.getDialogManager();


            var context = this;

            var dialog = dialogManager.getDialog('form', this.editor.id, {
                title: this.title,
                message: 'Introdueix les següents dades', // TODO: localitzar
                data:data,
                ok: {
                    text: 'Inserir' // localitzar
                },
                cancel: {
                    text: 'Cancel·lar' // localitzar
                },
                callback: function(newData) {

                    var html = string.substitute(template, newData);
                    var id = jQuery(html).attr('data-ioc-id');

                    editor.execCommand('inserthtml', html);

                    // ALERTA: Per alguna raó el .find() no troba els id normals d'html, per això es fa servir atribut propi
                    var $node = jQuery(editor.iframe).contents().find('[data-ioc-id="' + id +'"]');

                    $node.attr('data-ioc-block', true);

                    context._addHandlers($node);
                }
            });

            dialog.show();
        },

        _addHandlers: function ($node) {

            // Codi de prova, per ara no es gestiona el click
            $node.on('click', function (e) {

                //TODO: generar un nou dialeg (destruir l'anterior si existeix) per fer un update de les dades

                console.log('click',this);
            });
        },

        parse: function () {
            var $nodes = jQuery(this.editor.iframe).contents().find('[data-ioc-block]');
            var context = this;

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });

        },


    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_block"] = function () {
        return new WikiBlockButton({command: "insert_wiki_block"});
    };

    return WikiBlockButton;
});