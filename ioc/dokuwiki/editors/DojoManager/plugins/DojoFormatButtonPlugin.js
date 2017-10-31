define([
    "dojo/_base/declare", // declare
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    // "dojo/i18n", // i18n.getLocalization
    "dojo/_base/lang", // lang.hitch
    "dojo/sniff", // has("chrome") has("opera")
    "dijit/focus", // focus.focus()
    "dijit/_editor/_Plugin",
    "dijit/form/Button",
    "dojo/string", // string.substitute
    // "dojo/i18n!ioc/dokuwiki/editors/DojoManager/nls/commands"
], function (declare, AbstractDojoPlugin, /*i18n, */lang, has, focus, _Plugin, Button, string) {



    var IocSoundFormatButton = declare("ioc.dokuwiki.editors.DojoManager.plugins.testplugin", AbstractDojoPlugin, {

        htmlTemplate: "{{soundcloud>${content}}}",

        content: "identificador del so:clau",

        // strings : i18n.getLocalization("ioc.dokuwiki.editors.DojoManager", "commands"),

        init: function(args) {
            console.log("DojoFormatButtonPlugin", args);

            this.htmlTemplate = args.open + "${content}" + args.close;

            this.content = args.sample;

            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "IocSound", // TODO[Xavi] el prefix ha de canviar per correspondre amb una classe CSS que mostri la icona
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };

            this.addButton(config);
        },


        process: function () {
            var args = {content: this._getSelectionText() || this.content};
            this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));
        },

        // ALERTA[Xavi] S'ha de fer a través de la propietat window de l'editor perqué aquest es troba en un iframe
        _getSelectionText: function () {
            var text = this.editor.window.getSelection().toString();
            return text;
        }

    });


    // Register this plugin.
    _Plugin.registry["sound_format"] = function () {
        return new IocSoundFormatButton({command: "sound_format"});
    };

    return IocSoundFormatButton;
});