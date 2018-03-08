define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    'ioc/dokuwiki/editors/Components/FireEventComponent'
], function (declare, AbstractAcePlugin, FireEventComponent) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            console.log("FireDomEventButtonPlugin#init", args);

            var config = {
                type: args.type,
                title: args.title,
                icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            };

            // TODO: Fer servir un component per compartir funcionalitat amb el Dojo
            this.event = args.event;

            this.addButton(config, this.process);
        },


        process: function () {
            // TODO: Fer servir un component per compartir funcionalitat amb el Dojo
            console.log("Disparant event", this.event.type, this.event.data);
            this.editor.emit(this.event.type, this.event.data);
        }


    });

});