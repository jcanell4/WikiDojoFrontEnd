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
                    if (e.state.indexOf('th') > -1) {
                        this.button.set('checked', true);

                    } else {
                        this.button.set('checked', false);
                    }
                } else {
                    this.button.set('disabled', true);

                }

            }

        },

        process: function () {
            var selected = this.editor.getSelection();
            var $oldNode = selected.$node;
            var $content = $oldNode.html();
            var $newNode;

            if ($oldNode.is('td')) {
                $newNode = jQuery('<th>');
                this.button.set('checked', true);
            } else {
                $newNode = jQuery('<td>');
                this.button.set('checked', false);
            }

            $newNode.attr('id', $oldNode.attr('id'));
            $newNode.attr('class', $oldNode[0].className);
            $newNode.html($content);

            $oldNode.replaceWith($newNode[0]);

            this.editor.setCursorToNodePosition($newNode.get(0));

            // INICI: CODI ESPECIAL PER CANVIAR LA SELECCIÓ (duplicat a DojoWikiLink)
                // var $contents = jQuery(this.editor.iframe).contents();
                // var backup = window.getSelection;
                // window.getSelection = document.getSelection;
                //
                // var sel = dijit.range.getSelection(this.editor.internalDocument);
                // this.editor.focus();
                // var el = $newNode.get(0);
                //
                //
                //
                // var range = document.createRange();
                // range.setStart(el, 0);
                // range.collapse(true);
                // sel.removeAllRanges();
                // sel.addRange(range);
                //
                // // Restaurem la funció
                // window.getSelection = backup;

            // FI: CODI ESPECIAL PER CANVIAR LA SELECCIÓ


            this.editor.forceUpdateCursor();
            this.editor.forceChange();
        },

    });


    // Register this plugin.
    _Plugin.registry["insert_format"] = function () {
        return new FormatButton({command: "insert_format"});
    };

    return FormatButton;
});