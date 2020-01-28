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
            this.tags = args.tags;

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

            if (e.state.indexOf('-') > -1 && e.state.indexOf(this.tags[0]) === -1) {
                // hi ha més d'un estat i no es tracta d'aquest.
                // ALERTA! Només comprovem un tag, si hi ha més tipus de bloc s'ha d'ampliar
                this.button.set('disabled', true);
            } else {
                this.button.set('disabled', false);
            }

            // console.log("State:", e.state);

            if (e.state.indexOf(this.tags[0]) > -1) {
                this.button.set('checked', true);
            } else {
                this.button.set('checked', false);
            }
        },

        process: function () {

            // ALERTA: En aquest punt el botó encara no ha canviat d'estat en ser premut
            // console.log("Estat del botó:", this.button.get('checked'));

            if (this.empty) {

                var html = this.sample;
                for (var i = this.tags.length - 1; i >= 0; i--) {
                    html = '<' + this.tags[i] + '>' + html + '</' + this.tags[i] + '>';
                }

                this.editor.execCommand('inserthtml', html);

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
            // console.log("Selection", selection);

            for (var i = 0; i < selection.nodes.length; i++) {
                var $node = jQuery(selection.nodes[i]);
                var $newNode = jQuery('<' + this.tags[0] + '>');
                var $child = $newNode;

                for (i = 1; i < this.tags.length; i++) {
                    var $previous = $child;
                    $child = jQuery('<' + this.tags[i] + '>');
                    $previous.append($child);
                    // console.log("Afegit child", $child);
                }

                $child.html($node.text());
                $node.empty();

                if ($node.attr('id') === 'dijitEditorBody') {
                    $node.append($newNode);
                } else {
                    $node.replaceWith($newNode);
                }

            }
        },

        removeBlock: function () {
            var selection = this.editor.getSelection();
            for (var i = 0; i < selection.nodes.length; i++) {

                var $node = jQuery(selection.nodes[i]);
                var $root = $node.parent(this.tags[0]);

                var content = $node.text();
                var $container = jQuery('<p></p>');
                $container.html(content);

                console.log("root", $root);

                $root.replaceWith($container);
            }
        }
    });


    // Register this plugin.
    _Plugin.registry["insert_code"] = function () {
        return new FormatButton({command: "insert_code"});
    };

    return FormatButton;
});