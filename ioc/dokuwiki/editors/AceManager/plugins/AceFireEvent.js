define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    'ioc/dokuwiki/editors/Components/FireEventComponent'
], function (declare, AbstractAcePlugin, FireEventComponent) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            // console.log("FireEventButtonPlugin#init", args);

            var config = {
                type: args.type,
                title: args.title,
                icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            };

            this.events = args.event;

            this.fireEventComponent = new FireEventComponent(this.editor.dispatcher);

            this.addButton(config, this.process);
        },

        _processFull: function () {
            this.fireEventComponent.fireFull(this.events['full'])
        },

        _processPartial: function () {
            this.fireEventComponent.fireFull(this.events['partial'])
        }

    });

});