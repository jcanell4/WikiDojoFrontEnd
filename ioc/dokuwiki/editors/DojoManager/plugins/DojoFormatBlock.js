define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/form/ToggleButton"
], function (declare, AbstractDojoPlugin, lang, _Plugin, string, Button) {

    var FormatButton = declare(AbstractDojoPlugin, {

        init: function (args) {
            this.inherited(arguments);

            this.htmlTemplate = args.open + "${content}" + args.close;

            this.content = args.sample;
            this.tag = args.tag;
            this.clearFormat = args.clearFormat;
            this.sample = args.sample;

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

            this.empty = args.empty !== undefined ? args.empty : false;


            this.editor.on('changeCursor', this.updateCursorState.bind(this));
        },

        addButton: function (config) {
            this.button = new Button(config);
        },

        updateCursorState: function (e) {

            if (e.state.indexOf(this.tag) > -1) {
                this.button.set('checked', true);
            } else {
                this.button.set('checked', false);
            }
        },

        process: function () {


            // TODO: habilitar el sistema per selecció múltiple

            // ALERTA: En aquest punt el botó encara no ha canviat d'estat en ser premut
            // console.log("Estat del botó:", this.button.get('checked'));

            if (this.empty) {

                this.editor.execCommand('inserthtml', '<' +this.tag+'/>');

            } else if (!this.button.get('checked')) {
                // console.log("Removing block");
                this.removeBlock()
            } else {
                // console.log("Adding block");
                this.addBlock();
            }

        },

        addBlock: function () {
            var selection = this.editor.getSelection();

            for (var i = 0; i < selection.nodes.length; i++) {
                var $node = jQuery(selection.nodes[i]);
                var $newNode = jQuery('<' + this.tag + '>');

                if (this.clearFormat) {
                    $newNode.html($node.text());
                } else {
                    $newNode.html($node.html());
                }

                $node.empty();

                $node.append($newNode);

            }
        },

        removeBlock: function () {
            var selection = this.editor.getSelection();

            for (var i = 0; i < selection.nodes.length; i++) {
                var $node = jQuery(selection.nodes[i]);
                // console.log("Unwrapping node:", $node, $node.html());

                if ($node.prop('tagName').toLowerCase() === this.tag.toLowerCase()) {
                    // Cas 1: l'element seleccionat es el que té la etiqueta
                    $node.contents().unwrap();

                } else {
                    // Cas 2: Múltiples nodes poden contenir la etiqueta
                    $node.find(this.tag).each(function () {
                        jQuery(this).contents().unwrap();
                    });

                    // Cas 3: Un node superior conté la etiqueta
                    $node.closest(this.tag).each(function() {
                        jQuery(this).contents().unwrap();
                    });
                }
            }
        }
    });


    // Register this plugin.
    _Plugin.registry["insert_format"] = function () {
        return new FormatButton({command: "insert_format"});
    };

    return FormatButton;
});