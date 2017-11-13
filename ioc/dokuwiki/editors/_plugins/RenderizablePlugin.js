define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/_plugins/AbstractIocPlugin'
], function (declare, AbsractIocPlugin) {


    return declare(AbsractIocPlugin, {

        render: function () {
            throw new Error('Method not implemented');
        },

    });

});