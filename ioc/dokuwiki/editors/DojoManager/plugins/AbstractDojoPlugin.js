define([
    "dojo/_base/declare",
    "dijit/_editor/_Plugin",
], function (declare, _Plugin) {


    var AbstractDojoPlugin = declare([_Plugin], {

        needsParse: false,

        iconClassPrefix: 'dijitIocIcon',

        parse: function () {
            throw new Error('Method not implemented')
        }

    });

    // ALERTA: això es imprescindible per tots els plugins, s'han d'autoregistrar
    // Register this plugin.
    // _Plugin.registry["abstract"] = function () {
    //     return new AbstractDojoPlugin({command: "abstract"});
    // };

    return AbstractDojoPlugin;


});

