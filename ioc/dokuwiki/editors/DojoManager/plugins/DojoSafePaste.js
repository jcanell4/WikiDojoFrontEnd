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

                if (pastedDataHtml.trim().startsWith('<meta charset=') || (pastedDataHtml.trim().startsWith('<html'))) {
                    // Es tracta de contingut html enganxat des de una altra aplicació
                    context.process(context.sanitize(pastedDataTxt));
                } else {
                    // S'enganxa codi del propi editor, no cal sanejar
                    context.process(pastedDataHtml);
                }


            });


        },

        process: function (html) {
            this.editor.execCommand('inserthtml', html);
            this.editor.reparse();
        },

        // fa el canvi de les entitats html pels valors correspondents i converteix cada línia en un paràgraf
        sanitize: function (rawText) {
            var html = '';

            var encodedStr = rawText.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#'+i.charCodeAt(0)+';';
            });

            var lines = encodedStr.split("\n");

            for (var i = 0; i < lines.length; i++) {
                html += "<p>" + lines[i].trim() + "</p>\n";
            }

            return html;
        }

    });


    // Register this plugin.
    _Plugin.registry["clear_format"] = function () {
        return new ClearFormatButton({command: "clear_format"});
    };

    return ClearFormatButton;
});