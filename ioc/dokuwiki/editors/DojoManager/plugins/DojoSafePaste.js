define([
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin",
    "dojo/_base/lang", // lang.hitch
    // "dojo/_base/on",
    "dijit/_editor/_Plugin"
], function (declare, AbstractDojoPlugin, lang, /*on,*/ _Plugin) {

    var ClearFormatButton = declare(AbstractDojoPlugin, {


        init: function (args) {
            this.inherited(arguments);

            var context = this;

            this.editor.on('safePaste', function (e) {

                var pastedDataTxt = e.originalEvent.clipboardData.getData('text');
                var pastedDataHtml = e.originalEvent.clipboardData.getData('text/html');

                console.log("TXT:", pastedDataTxt);
                console.log("HTML:", pastedDataHtml);

                // TODO: habilitar el sanejament
                context.process(pastedDataTxt);
                //this.process(this.sanitize(pastedDataHtml));

            });


        },

        process: function (html) {
            this.editor.execCommand('inserthtml', html);
        },

        sanitize: function (rawHtml) {
            // TODO parsejar el contingut html
            // descargar el head
            // descartar les classes css
            // descartar etiquetes (sense eliminar el contingut):
            //      span
            // processat especial:
            //      taules


            return rawHtml;
        }

    });


    // Register this plugin.
    _Plugin.registry["clear_format"] = function () {
        return new ClearFormatButton({command: "clear_format"});
    };

    return ClearFormatButton;
});