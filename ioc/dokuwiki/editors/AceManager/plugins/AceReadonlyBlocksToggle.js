define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin'
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            // ALERTA[Xavi] En aquest cas no cal afegir cap botó, però es podria afegir un botó per inserir un bloc, obrir un dialeg, etc.

            // console.log("AceFormatButtonPlugin#init", args);

            // TODO: Convertir en toggle per resaltar si està activat o nos
            var config = args;
            if (args.icon.indexOf(".png")===-1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }
            config.class ='toggled';


            // var config = {
            //     type: args.type,
            //     title: args.title,
            //     icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            //     class: 'toggled',
            // };

            this.addButton(config, this.process);

            this.enabled = true;
            this.editor.readOnlyBlocksManager.enabled = this.enabled;

        },

        process: function(args, btn) {

            jQuery(btn).toggleClass('toggled');

            this.enabled = !this.enabled;
            this.editor.readOnlyBlocksManager.enabled = this.enabled;
        }


    });

});