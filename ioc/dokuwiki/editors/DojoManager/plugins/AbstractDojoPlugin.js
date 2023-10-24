define([
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/_plugins/AbstractIocPlugin",
    "dijit/_editor/_Plugin",
    "dijit/form/Button",
    "dojo/i18n", // i18n.getLocalization
    "dojo/i18n!ioc/dokuwiki/editors/nls/commands",
], function (declare, AbstractIocPlugin, _Plugin, Button, i18n) {


    var AbstractDojoPlugin = declare([_Plugin, AbstractIocPlugin], {

        test : "AbstractDojoPlugin",

        strings : i18n.getLocalization("ioc.dokuwiki.editors", "commands"),

        iconClassPrefix: 'dijitIocIcon',

        init: function(args) {
            this.category = args.category;
        },

        addButton: function(config) {
            this.button = new Button(config);
        },

        // ALERTA[Xavi] S'ha de fer a través de la propietat window de l'editor perqué aquest es troba en un iframe
        _getSelectionText: function () {
            var text = this.editor.window.getSelection().toString();
            return text;
        },


        destroy: function(){
            this.inherited(arguments);

            //TODO: Remember to destroy the toolbar you created.
        },

        setEditor: function (editor) {
            this.editor = editor;
            // this.dispatcher = editor.dispatcher;
        },

        getEditor: function () {
            return this.editor;
        },

        // El execCommand normal no funciona a chrome en alguns casos, el codi html es malconfigura
        // un exemple: https://stackoverflow.com/questions/66272074/weird-behaviour-with-document-execcommandinserthtml
        fixedInsertHtml: function(html) {
            var $html = jQuery(html);

            $html.attr('data-ioc-id', this.normalize($html.attr('data-ioc-id')));
            var id = $html.attr('data-ioc-id');
            //var id = jQuery(html).attr('data-ioc-id');

            // ALERTA[Xavi] utilitzar el execCommand no sempre funciona a Chrome, normalment es trenca
            // la estructura inserida. Per solventar-lo afegim amb execcommand un àncora amb un id
            // que capturem amb jQuery un cop inserida i la reemplaçem amb el node de jQuery generat
            // correctament.

            // fem servir div perquè les figures sempre són blocs
            let anchor = '<em id="anchor_' + id + '">@</em>';
            // ALERTA
            this.editor.execCommand('inserthtml', anchor);
            // this.editor.execCommand('inserthtml', html);

            let $anchor = jQuery(this.editor.iframe).contents().find('#anchor_' + id);

            $anchor.after($html);
            $anchor.remove();

            return $html;
        }

    });

    // ALERTA: això es imprescindible per tots els plugins, s'han d'autoregistrar
    // Register this plugin.
    // _Plugin.registry["abstract"] = function () {
    //     return new AbstractDojoPlugin({command: "abstract"});
    // };


    return AbstractDojoPlugin;


});

