define([
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/DojoManager/plugins/DojoFormat",
    "dojo/_base/lang", // lang.hitch
    "dijit/_editor/_Plugin"
], function (declare, DojoFormat, lang, _Plugin) {

    var ClearFormatButton = declare(DojoFormat, {


        init: function(args) {
            this.inherited(arguments);

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
            this.editor.execCommand('removeFormat');
        }


    });


    // Register this plugin.
    _Plugin.registry["clear_format"] = function () {
        return new ClearFormatButton({command: "clear_format"});
    };

    return ClearFormatButton;
});