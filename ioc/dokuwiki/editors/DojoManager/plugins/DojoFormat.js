 define([
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin",
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string"
], function (declare, AbstractDojoPlugin, lang, _Plugin, string) {

    var FormatButton = declare(AbstractDojoPlugin, {

        init: function(args) {
            this.inherited(arguments);

            this.htmlTemplate = args.open + "${content}" + args.close;

            this.content = args.sample;

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
            var args = {content: this._getSelectionText() || this.content};
            this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));
        },


    });


    // Register this plugin.
    _Plugin.registry["insert_format"] = function () {
        return new FormatButton({command: "insert_format"});
    };

    return FormatButton;
});