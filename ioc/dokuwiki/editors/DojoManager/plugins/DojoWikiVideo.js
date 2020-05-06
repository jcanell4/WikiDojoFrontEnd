define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWikiBlock',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActions',
], function (declare, DojoWikiBlock, lang, _Plugin, string, dojoActions) {


    // var urls = {
    //     'vimeo' : 'https://player.vimeo.com/video/{$id}',
    //     'youtube' : 'https://www.youtube.com/embed/{$id}?controls=1',
    //     'dailymotion' : 'https://www.dailymotion.com/embed/video/{$id}'
    // };


    var WikiBlockButton = declare(DojoWikiBlock, {

        init: function (args) {
            this.inherited(arguments);

            this.urls = args.urls;
            this.sizes = args.sizes;
        },

        _substitute: function (template, data) {
            // 1 - obtenir la URL
            // 2 - substituir el ID a la URL
            // 3 - Afegir la URL al data

            var url = string.substitute(this.urls[data.origin], data);
            data.url = url;

            var size = this.sizes[data.size].split('x');
            data.width = size[0];
            data.height = size[1];

            data.unique = Date.now();

            console.log("data", data);


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

        getEditData:function($node) {
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

            console.log("Data actualizat:", this.data);

            return this.data;
        }

    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_video"] = function () {
        return new WikiBlockButton({command: "insert_wiki_video"});
    };

    return WikiBlockButton;
});