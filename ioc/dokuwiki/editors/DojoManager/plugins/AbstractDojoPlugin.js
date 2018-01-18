define([
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/_plugins/AbstractIocPlugin",
    "dijit/_editor/_Plugin",
    "dijit/form/Button",
    "dojo/i18n", // i18n.getLocalization
    "dojo/i18n!ioc/dokuwiki/editors/nls/commands",
], function (declare, AbstractIocPlugin, _Plugin, Button, i18n) {


    var AbstractDojoPlugin = declare([_Plugin, AbstractIocPlugin], {

        strings: i18n.getLocalization("ioc.dokuwiki.editors", "commands"),

        iconClassPrefix: 'dijitIocIcon',

        init: function (args) {
            this.category = args.category;
        },

        addButton: function (config) {
            this.button = new Button(config);
        },

        _getSelectionText: function () {
            var range;
            var text = '';

            var selection = this.editor.window.getSelection();
            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
                var clonedSelection = range.cloneContents();
                var div = document.createElement('div');
                div.appendChild(clonedSelection);
                text = div.innerHTML;
            }
            return text;

        }
    });

    // ALERTA: això es imprescindible per tots els plugins, s'han d'autoregistrar
    // Register this plugin.
    // _Plugin.registry["abstract"] = function () {
    //     return new AbstractDojoPlugin({command: "abstract"});
    // };

    return AbstractDojoPlugin;


});

