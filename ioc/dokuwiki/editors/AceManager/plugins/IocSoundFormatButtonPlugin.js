define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function () {
            var args = {
                type: 'format',
                title: 'Sintaxis de so',
                icon: '/iocjslib/ioc/gui/img/sound.png',
                open: "{{soundcloud>",
                sample: "identificador del so:clau",
                close: "}}"
            };

            this.addButton(args);
        }

    });

});