define([
    "dojo/_base/declare",
    "dijit/_editor/_Plugin",
    "dijit/form/Button",
    "dojo/i18n", // i18n.getLocalization
    "dojo/i18n!ioc/dokuwiki/editors/DojoManager/nls/commands",
], function (declare, _Plugin, Button, i18n) {


    var AbstractDojoPlugin = declare([_Plugin], {

        strings : i18n.getLocalization("ioc.dokuwiki.editors.DojoManager", "commands"),

        iconClassPrefix: 'dijitIocIcon',

        addButton: function(args) {
            this.button = new Button(args);
        }

    });

    // ALERTA: això es imprescindible per tots els plugins, s'han d'autoregistrar
    // Register this plugin.
    // _Plugin.registry["abstract"] = function () {
    //     return new AbstractDojoPlugin({command: "abstract"});
    // };

    return AbstractDojoPlugin;


});

