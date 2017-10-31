define([
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin",
], function (declare, AbstractDojoPlugin) {


    var AbstractParseableDojoPlugin = declare([AbstractDojoPlugin], {

        needsParse: true,

        parse: function () {
            throw new Error('Method not implemented')
        }

    });

    return AbstractParseableDojoPlugin;


});

