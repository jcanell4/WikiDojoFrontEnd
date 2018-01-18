define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dijit/form/ToggleButton",
    "dojo/string"
], function (declare, AbstractDojoPlugin, lang, _Plugin, ToggleButton) {

    var FormatButton = declare(AbstractDojoPlugin, {


        init: function(args) {
            this.inherited(arguments);

            this.command = args.command;

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

            this.editor.on('changeCursor', this._updateToggle.bind(this));

            this.addButton(config);
        },

        _updateToggle: function() {
            if (!this.editor.document) {
                // console.log("Encara no està llest el document");
                return;
            }
            this.button.set('checked', this.editor.document.queryCommandState(this.command));
        },

        process: function () {
            this.editor.execCommand(this.command);
        },


        addButton: function(config) {
            this.button = new ToggleButton(config);
        },


    });


    // Register this plugin.
    _Plugin.registry["insert_format_block"] = function () {
        return new FormatButton({command: "insert_format_block"});
    };

    return FormatButton;
});