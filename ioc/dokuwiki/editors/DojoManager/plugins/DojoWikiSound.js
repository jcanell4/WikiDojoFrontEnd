define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWikiBlock',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActions',
], function (declare, DojoWikiBlock, lang, _Plugin, string, dojoActions) {

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


    var WikiBlockButton = declare(DojoWikiBlock, {


        parse: function () {

            var $nodes = jQuery(this.editor.iframe).contents().find('[data-dw-block="sound"]');
            var context = this;

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });
        },

        _addHandlers: function ($node) {

            this.inherited(arguments);

            // PROBLEMA: no es captura el doble click dins del frame, hem d'afegir una icona
            // TODO: Convertir això en un dojoAction?

            dojoActions.addEditAction($node, this);
        }

    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_sound"] = function () {
        return new WikiBlockButton({command: "insert_wiki_sound"});
    };

    return WikiBlockButton;
});