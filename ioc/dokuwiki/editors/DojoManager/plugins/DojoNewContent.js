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
            // this.tag = args.tag;
            this.tag = 'newcontent';
            this.clearFormat = args.clearFormat;
            this.sample = args.sample;

            this.groupPattern = args.groupPattern ? new RegExp(args.groupPattern) : false;

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
            console.log("state?", e.state);

            if (e.state.indexOf(this.tag) > -1) {
                console.log(this.tag, true);
                this.button.set('checked', true);
            } else {
                console.log(this.tag, false);
                this.button.set('checked', false);
            }
        },

        process: function () {

            if (this.button.get('checked')) {
                this.addBlock();
            } else {
                this.removeBlock();
            }
        },

        addBlock: function () {
            var selection = this.editor.getSelection();
            console.log("Selection nodes?", selection.nodes);

            for (var i = 0; i < selection.nodes.length; i++) {

                var $node = jQuery(selection.nodes[i]);

                if ($node.attr('id') === 'dijitEditorBody') {
                    continue;
                }

                // TODO: Cal cercar el node arrel

                while ($node.parent().attr('id')!== 'dijitEditorBody') {
                    $node = $node.parent();
                }

                // Aquest cas es dona quan hi ha una selecció múltiple d'elements que comparteixen arrél,
                // com per exemple els elements d'una llista
                if ($node.prop("tagName").toLowerCase() === "newcontent") {
                    return;
                }

                // Quan es perd el focus del document la selecció retorna el node del document, en aquest cas
                // s'ha d'ignorar



                $node.wrap("<newcontent></newcontent>")
                console.log("Node wrapped:", $node);
            }

            this.editor.forceChange();

        },

        removeBlock: function () {
            var selection = this.editor.getSelection();
            console.log("Selection nodes?", selection.nodes);

            for (var i = 0; i < selection.nodes.length; i++) {
                console.log("i:", i);
                var $node = jQuery(selection.nodes[i]).closest(this.tag).children();
                $node.unwrap();
                console.log("Node unwrapped:", $node);
            }

            this.editor.forceChange();


        }
    });


    // Register this plugin.
    _Plugin.registry["insert_format"] = function () {
        return new FormatButton({command: "insert_format"});
    };

    return FormatButton;
});