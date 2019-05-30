define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoFormat',
    "dijit/_editor/_Plugin"
], function (declare, DojoFormat, _Plugin) {

    var ClearFormatButton = declare(DojoFormat, {


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