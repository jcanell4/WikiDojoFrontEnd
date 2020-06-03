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

            // TODO: habilitar el sistema per selecció múltiple

            // ALERTA: En aquest punt el botó encara no ha canviat d'estat en ser premut
            // console.log("Estat del botó:", this.button.get('checked'));

            // if (this.empty) {
            //
            //     this.editor.execCommand('inserthtml', '<' + this.tag + '/>');
            //
            // } else {
            //
            //
            if (this.button.get('checked')) {
                this.addBlock();
            } else {
                this.removeBlock();
            }
            // }
        },

        addBlock: function () {
            var selection = this.editor.getSelection();
            console.log("Selection nodes?", selection.nodes);

            for (var i = 0; i < selection.nodes.length; i++) {
                console.log("i:", i);
                var $node = jQuery(selection.nodes[i]);
                $node.wrap("<newcontent></newcontent>")
                console.log("Node wrapped:", $node);
            }


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



        },


        // addBlock: function () {
        //
        //     var selection = this.editor.getSelection();
        //
        //     for (var i = 0; i < selection.nodes.length; i++) {
        //         // var $node = jQuery(selection.nodes[i]);
        //         var $node = this.searchRootNode(selection.nodes[i]);
        //         var $newNode = jQuery('<' + this.tag + '>');
        //
        //         if (this.clearFormat) {
        //             $newNode.html($node.text());
        //         } else {
        //             $newNode.html($node.html());
        //         }
        //
        //         $node.empty();
        //
        //         //$node.append($newNode);
        //         $node.replaceWith($newNode);
        //
        //         this.editor.setCursorToNodePosition($newNode.get(0));
        //
        //     }
        // },
        //
        // removeBlock: function () {
        //     var selection = this.editor.getSelection();
        //
        //     for (var i = 0; i < selection.nodes.length; i++) {
        //         var $node = this.searchRootNode(selection.nodes[i]);
        //
        //
        //         if ($node.prop('tagName').toLowerCase() === this.tag.toLowerCase()
        //             // console.log("UNWRAP pel tag");
        //             // $node.contents().unwrap();
        //             || (this.groupPattern && this.groupPattern.test($node.prop('tagName').toLowerCase()))) {
        //             // console.log("UNWRAP pel pattern");
        //             //$node.contents().wrap('p'), $node.contents().unwrap();
        //             var $newNode = jQuery('<p>');
        //
        //             // console.log("Node:", $node);
        //
        //             $newNode.append($node.html());
        //
        //             // console.log("Newnode:", $newNode);
        //
        //             $node.replaceWith($newNode);
        //
        //             this.editor.setCursorToNodePosition($newNode.get(0));
        //
        //         }
        //
        //     }
        //
        // },

        // searchRootNode: function (node) {
        //     var $node = jQuery(node);
        //
        //     if ($node.attr('id') === 'dijitEditorBody') {
        //         var $placeholderNode =jQuery('<p>');
        //         $placeholderNode.text(this.sample);
        //         $node.prepend($placeholderNode);
        //         return $placeholderNode;
        //     }
        //
        //     while ($node.parent().attr('id') !== 'dijitEditorBody') {
        //         $node = $node.parent();
        //     }
        //
        //     return $node;
        //
        // }
    });


    // Register this plugin.
    _Plugin.registry["insert_format"] = function () {
        return new FormatButton({command: "insert_format"});
    };

    return FormatButton;
});