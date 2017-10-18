define([
    "dojo/_base/declare", // declare
    "dojo/i18n", // i18n.getLocalization
    "dojo/_base/lang", // lang.hitch
    "dojo/sniff", // has("chrome") has("opera")
    "dijit/focus", // focus.focus()
    "dijit/_editor/_Plugin",
    "dijit/form/Button",
    "dojo/string", // string.substitute
    "dojo/i18n!ioc/dokuwiki/AceManager/nls/commands"
], function (declare, i18n, lang, has, focus, _Plugin, Button, string) {

    var TestPlugin = declare("ioc.dokuwiki.AceManager.plugins.testplugin", _Plugin, {
        // summary:
        //		This plugin provides Print capability to the editor.  When
        //		clicked, the document in the editor frame will be printed.

        // htmlTemplate: [protected] String
        //		String used for templating the HTML to insert at the desired point.
        htmlTemplate: "<br>::note:<br>${content}</br>:::<br>",

        content: "text de prova",


        _initButton: function () {
            // summary:
            //		Over-ride for creation of the Print button.
            var strings = i18n.getLocalization("ioc.dokuwiki.AceManager", "commands"),
                editor = this.editor;
            this.button = new Button({
                label: strings["testplugin"],
                ownerDocument: editor.ownerDocument,
                dir: editor.dir,
                lang: editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "Print", // TODO[Xavi] el prefix ha de canviar per correspondre amb una classe CSS que mostri la icona
                tabIndex: "-1",
                onClick: lang.hitch(this, "_addNote")
            });

            console.log("** Inicialitzat TestPlugin");
        },

        setEditor: function (/*dijit/Editor*/ editor) {
            // summary:
            //		Tell the plugin which Editor it is associated with.
            // editor: Object
            //		The editor object to attach the print capability to.
            this.editor = editor;
            this._initButton();
        },

        // updateState: function(){
        //     // summary:
        //     //		Over-ride for button state control for disabled to work.
        //     var disabled = this.get("disabled");
        //     if(!this.editor.iframe.contentWindow["print"]){
        //         disabled = true;
        //     }
        //     this.button.set("disabled", disabled);
        // },

        _addNote: function () {
            args = {content: this._getSelectionText() || this.content};
            this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));

            console.log("Funciona!");
        },

        // ALERTA[Xavi] S'ha de fer a través de la propietat window de l'editor perqué aquest es troba en un iframe
        _getSelectionText: function () {
            var text = this.editor.window.getSelection().toString();
            console.log("Text:", text);
            return text;
        }


    });


    // Register this plugin.
    _Plugin.registry["testplugin"] = function () {
        return new TestPlugin({command: "print"});
    };

    console.log("Plugins:", _Plugin.registry);

    return TestPlugin;
});