define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFormat',
    "dijit/_editor/_Plugin",
    "dojo/string",
], function (declare, AbstractDojoPlugin, _Plugin, string) {

    var ReplaceFormatButton = declare(AbstractDojoPlugin, {


        process: function () {
            var args = {content: this._getSelectionText() || this.content};
            this.editor.execCommand('removeFormat');
            this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));
        },


    });


    // Register this plugin.
    _Plugin.registry["replace_format"] = function () {
        return new ReplaceFormatButton({command: "replace_format"});
    };

    return ReplaceFormatButton;
});