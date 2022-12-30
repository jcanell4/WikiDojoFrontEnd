define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    'ioc/dokuwiki/editors/Components/FireEventComponent'
], function (declare, AbstractAcePlugin, FireEventComponent) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            // console.log("FireEventButtonPlugin#init", args);

            var config = JSON.parse(JSON.stringify(args));
            if (args.icon.indexOf(".png")===-1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }

            this.events = args.event;

            this.fireEventComponent = new FireEventComponent(this.dispatcher);

            this.addButton(config, this.process);
        },

        _processFull: function () {
            this.fireEventComponent.fireFull(this.events['full'])
        },

        _processPartial: function () {
            this.fireEventComponent.firePartial(this.events['partial'])
        }

    });

});