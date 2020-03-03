 define([
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/DojoManager/plugins/DojoFormatBlock",
    //"ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin",
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
     "dijit/form/ToggleButton"
], function (declare, AbstractDojoPlugin, lang, _Plugin, string, ToggleButton) {

    var FormatButton = declare(AbstractDojoPlugin, {

        // init: function(args) {
        //     this.inherited(arguments);
        //
        //     this.htmlTemplate = args.open + "${content}" + args.close;
        //
        //     this.content = args.sample;
        //     this.tag = args.tag;
        //
        //     var config = {
        //         label: args.title,
        //         ownerDocument: this.editor.ownerDocument,
        //         dir: this.editor.dir,
        //         lang: this.editor.lang,
        //         showLabel: false,
        //         iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon,
        //         tabIndex: "-1",
        //         onClick: lang.hitch(this, "process")
        //     };
        //
        //
        //
        //     this.addButton(config);
        //
        //     if (this.tag) {
        //         this.editor.on('changeCursor', this.updateCursorState.bind(this));
        //     }
        // },

        process: function () {

            if (this.button.get('checked')) {

                var args = {content: this._getSelectionText() || this.content};
                this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));


            } else {
                this.inherited(arguments)

            }

        },

        addButton: function (config) {
            if (this.tag) {
                this.button = new ToggleButton(config);
            } else {
                this.inherited(arguments);
            }
        },

        updateCursorState: function (e) {

            if (e.state.indexOf(this.tag) > -1) {
                this.button.set('checked', true);
            } else {
                this.button.set('checked', false);
            }
        },

    });


    // Register this plugin.
    _Plugin.registry["insert_format"] = function () {
        return new FormatButton({command: "insert_format"});
    };

    return FormatButton;
});