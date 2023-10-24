define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoMediaFormatFigure',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string"
], function (declare, AbstractParseableDojoPlugin, DojoMediaFormatFigure, lang, _Plugin, string) {

    /*
     Al node generat per aquest plugin trobem dos tipus d'atributs propis:
        * Tipus de bloc, aquests son generics i permet agrupar-los, per exemple les taules normals i de contabilitat son data-ioc-table:
            - data-ioc-table
            - data-ioc-figure
            - data-ioc-etc

        * Tipus de plugin, aquests son individuals per cada configuració del plugin i permeten discriminar entre els elements del mateix tipus per obrir el dialeg corresponent al botó (es generen a partir del títol del botó), per exemple:
             - data-ioc-block-sintaxi-de-taula
             - data-ioc-block-sintaxi-de-quote

     Nota: pel correcte funcionament s'ha de generar un ID únic per cada element, aquest es genera automàticament
     en base al timestamp si no es troba l'atribut id a les dades. En cas contrari no funcionaran correctament les opcions
     d'editar i eliminar.
     */


    var WikiMediaFormatLateral = declare([AbstractParseableDojoPlugin, DojoMediaFormatFigure], {

        init: function (args) {

            this.inherited(arguments);
            // this.button.set('disabled', false);
        },


        _callback: function (data) {
            // console.log("data", data);

            if (!data.image || !data.title) {
                alert("La imatge i el títol son obligatoris");
                return;
            }

            var volatileId = false;

            if (data.id === undefined) {
                data.id = Date.now();
                volatileId = true;
            }

            this.id = data.id;

            data.image = jQuery(data.image).attr('src');

            var html = string.substitute(this.htmlTemplate, data);
            // console.log("Template substituit:", html);

            let $html = this.fixedInsertHtml(html);

            $html.attr('contenteditable', false);
            $html.find('.title').attr('contenteditable', true);

            this._addHandlers($html);


            if (volatileId) {
                data.id = undefined;
            }
        },

        parse: function () {

            // var $nodes = jQuery(this.editor.iframe).contents().find('[data-ioc-block-' + this.normalize(this.title) + ']');
            var $nodes = jQuery(this.editor.iframe).contents().find('[data-dw-lateral="image"]');


            // console.log("Query cercat:", '[data-ioc-block-' + this.normalize(this.title) + ']');
            var context = this;

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });
        },
    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_block"] = function () {
        return new WikiMediaFormatLateral({command: "insert_media_lateral"});
    };

    return WikiMediaFormatLateral;
});