define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWikiBlock',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActions',
], function (declare, DojoWikiBlock, lang, _Plugin, string, dojoActions) {

    var WikiBlockButton = declare(DojoWikiBlock, {

        init: function (args) {

            this.inherited(arguments);

            // Actualitzem el valor del data (que es fa servir per generar el dialog amb la llista de mides
            this.sizes = JSINFO.shared_constants.ONLINE_VIDEO_CONFIG['sizes'];
            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i].name === 'size') {
                    this.data[i].options = [];

                    for (var size in this.sizes) {
                        this.data[i].options.push(size);
                    }

                    break;
                }
            }

            this.origins = JSINFO.shared_constants.ONLINE_VIDEO_CONFIG['origins'];

            // Actualitzem el valor del data (que es fa servir per generar el dialog amb la llista d'origens
            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i].name === 'origin') {
                    this.data[i].options = [];

                    for (var origin in this.origins) {
                        this.data[i].options.push(origin);
                    }

                    break;
                }
            }

        },

        _substitute: function (template, data) {
            data.url = string.substitute(this.origins[data.origin].url_template, data);

            var size = this.sizes[data.size].split('x');
            data.width = size[0];
            data.height = size[1];

            data.unique = Date.now();

            return string.substitute(template, data);
        },


        parse: function () {

            var $nodes = jQuery(this.editor.iframe).contents().find('[data-dw-block="video"]');
            var context = this;

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });
        },


        _addHandlers: function ($node) {
            this.inherited(arguments);

            dojoActions.addEditAction($node, this);
        },

        getEditData: function ($node) {
            // TODO: obtener del node!

            for (var key in this.data) {

                var item = this.data[key];

                switch (item.name) {
                    case 'title':
                        item.value = $node.attr('data-video-title');
                        break;

                    case 'id':

                        var $id = $node.attr('data-video-id');
                        $id = $id.split('|')[0];
                        item.value = $id.split('?')[0];
                        break;

                    case 'origin':
                        item.value = $node.attr('data-video-type');
                        break;

                    case 'size':
                        item.value = $node.attr('data-video-size');
                        break;
                }
            }

            return this.data;
        },

        _showDialog: function (data, previousId) {
            var dialog = this.inherited(arguments);

            var context = this;
            var $dialog = jQuery(dialog.domNode);

            // ALERTA: Codi duplicat al AceVidePlugin

            // ALERTA! En aquest punt sembla que encara no s'han creat els camps i no son accessibles, afegim el listener
            // al dialeg


            $dialog.on('paste', function (e) {
                var clipboardData, pastedData;
                var $origin = $dialog.find('[name="origin"]');
                var $id = $dialog.find('[name="id"]');

                clipboardData = e.originalEvent.clipboardData || e.clipboardData || window.clipboardData;
                pastedData = clipboardData.getData('Text');

                for (var origin in context.origins) {

                    var $matches = pastedData.match(new RegExp(context.origins[origin].pattern));

                    if ($matches && $matches.length > 1) {

                        $origin.val(origin);
                        $id.val($matches[1]);

                        // Només s'interrompt l'event si s'ha trobat un id vàlid
                        e.stopPropagation();
                        e.preventDefault();
                        break;
                    }
                }

            });
        }

    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_video"] = function () {
        return new WikiBlockButton({command: "insert_wiki_video"});
    };

    return WikiBlockButton;
});