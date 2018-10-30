define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string"
], function (declare, AbstractDojoPlugin, lang, _Plugin, string) {

    var FormatButton = declare(AbstractDojoPlugin, {

        init: function(args) {
            this.inherited(arguments);

            this.htmlTemplate = args.open + "${content}" + args.close;

            this.content = args.sample;
            this.tag = args.tag;

            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon,
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };

            this.addButton(config);
        },

        process: function () {
            // var previousValue = this.editor.getValue();
            var previousValue = this.editor.getValue();

            // this.editor.execCommand('removeformat');
            this.editor.execCommand('formatblock', this.tag);

            // si no hi han canvis es que ja es trobaba aquest block, el reemplaçem pel block generic 'p'. Alerta! amb 'div' com a block generic no funciona, al 3er canvi falla
            if (previousValue === this.editor.getValue()) {
                // this.editor.execCommand('removeformat');
                this.editor.execCommand('formatblock', 'p');
            }

        },


    });


    // Register this plugin.
    _Plugin.registry["insert_format"] = function () {
        return new FormatButton({command: "insert_format"});
    };

    return FormatButton;
});