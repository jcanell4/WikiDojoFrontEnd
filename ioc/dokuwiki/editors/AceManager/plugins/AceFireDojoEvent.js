define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    'ioc/dokuwiki/editors/Components/FireDojoEventComponent'
], function (declare, AbstractAcePlugin, FireDojoEventComponent) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            console.log("FireDomEventButtonPlugin#init", args);

            var config = {
                type: args.type,
                title: args.title,
                icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            };

            this.event = args.event;
            this.fireEventComponent = new FireDojoEventComponent(this.editor);

            this.addButton(config, this.process);
        },


        process: function (e) {
            this.fireEventComponent.fire(this.event);
        }


    });

});