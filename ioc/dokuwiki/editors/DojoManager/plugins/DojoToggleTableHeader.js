define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/form/ToggleButton"
], function (declare, AbstractDojoPlugin, lang, _Plugin, string, Button) {

    var FormatButton = declare(AbstractDojoPlugin, {

        init: function(args) {
            this.inherited(arguments);

            this.htmlTemplate = args.open + "${content}" + args.close;

            this.content = args.sample;

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

            this.button.set('disabled', true);

            this.editor.on('changeCursor', this.updateCursorState.bind(this));


        },

        addButton: function (config) {
            this.button = new Button(config);
        },

        updateCursorState: function (e) {

            // console.log(e);

            if (e.$node) {
                if (e.$node.is('td, th')) {
                    this.button.set('disabled', false);
                } else {
                    this.button.set('disabled', true);

                    if (e.state.indexOf('th') > -1) {
                        this.button.set('checked', true);

                    } else {
                        this.button.set('checked', false);
                    }
                }

            }

        },

        process: function () {
            var selected = this.editor.getSelection();

            console.log("que hi ha seleccionat:", selected);

            var $oldNode = selected.$node;
            var $newNode;

            if ($oldNode.is('td')) {
                $newNode = jQuery('<th>');
                this.button.set('checked', true);
            } else {
                $newNode = jQuery('<td>');
                this.button.set('checked', false);
            }

            $newNode.attr('id', $oldNode.attr('id'));
            $oldNode.replaceWith($newNode);
            console.log("Canviat oldNode per:", $newNode);


            // TODO: Canviar la icona si es TD o TH, (toggle)

            // var args = {content: this._getSelectionText() || this.content};
            //this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));
        },


    });


    // Register this plugin.
    _Plugin.registry["insert_format"] = function () {
        return new FormatButton({command: "insert_format"});
    };

    return FormatButton;
});