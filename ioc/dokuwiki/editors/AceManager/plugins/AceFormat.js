define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin'
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function (args) {
            // console.log("AceFormatButtonPlugin#init", args);
            var config = args;
            config.type = 'format';
            config.icon = '/iocjslib/ioc/gui/img/' + args.icon + '.png';


            // var config = {
            //     type: 'format',
            //     title: args.title,
            //     icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            //     open: args.open,
            //     sample: args.sample,
            //     close: args.close
            // };

            this.addButton(config);
        }

    });

});