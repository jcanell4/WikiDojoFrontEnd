define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    'ioc/dokuwiki/editors/Components/FireDojoEventComponent'
], function (declare, AbstractAcePlugin, FireDojoEventComponent) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            // console.log("FireDomEventButtonPlugin#init", args);

            var config = JSON.parse(JSON.stringify(args));
            if (args.icon.indexOf(".png")===-1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }


            // var config = {
            //     type: args.type,
            //     title: args.title,
            //     icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            // };

            this.event = args.customEvent;
            this.fireEventComponent = new FireDojoEventComponent(this.setupEditor);

            this.addButton(config, this.process);
        },


        process: function (e) {
            this.fireEventComponent.fire(this.event);
        }


    });

});