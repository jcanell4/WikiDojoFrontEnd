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

                // console.log("TXT:", pastedDataTxt);
                // console.log("HTML:", pastedDataHtml);

                // ALERTA! Això no funciona i provoca diversos errors com per exemple:
                //      afegeix paràgrafs dintre d'una cel·la en copiar i enganxar cel·les
                //      enganxa el contingut fora dels blocks de text

                // if (pastedDataHtml.trim().startsWith('<') && (pastedDataHtml.trim().endsWith('>'))) {
                //     // Això no funciona correctament a chrome i no funciona en absolut amb safari
                // // if (pastedDataHtml.trim().startsWith('<meta charset=') || (pastedDataHtml.trim().startsWith('<html'))) {
                //     // Es tracta de contingut html enganxat des de una altra aplicació
                //     context.process(context.sanitize(pastedDataTxt));
                // } else {
                //     // S'enganxa codi del propi editor, no cal sanejar
                //     context.process(pastedDataHtml);
                // }

                // això només processa text pla però funciona en tots els casos
                context.process(pastedDataTxt);


            });


        },

        process: function (text) {
            console.log("Que s'envia per enganxar?", text);

            // separem cada línia en un paràgraf
            let regex = new RegExp('^.*$', 'gm');
            let paragraphs = text.match(regex);
            let html = "<p>";
            html += paragraphs.join("</p><p>");
            html += "</p>";


            console.log("Salts reemplaçats?", html);

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