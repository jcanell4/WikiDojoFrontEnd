define([
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin",
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/form/ToggleButton",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActions',
], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, string, Button, dojoActions) {

    var TAB_STRING = '  ';

    var FormatButton = declare(AbstractParseableDojoPlugin, {

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

                var html = this.sample + "\n";
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

                if ($node.text().length === 0) {
                    $node.text("&nbsp;");
                }

                $child.html($node.text());


                $node.empty();

                if ($node.attr('id') === 'dijitEditorBody') {
                    $node.append($newNode);
                } else {
                    $node.replaceWith($newNode);
                }

            }

            this.addActionButtons($newNode);

        },

        removeBlock: function () {
            var selection = this.editor.getSelection();
            for (var i = 0; i < selection.nodes.length; i++) {

                var $node = jQuery(selection.nodes[i]);
                var $root = $node.parent(this.tags[0]);

                var content = $node.text();

                var lines = content.split("\n");

                var $container = jQuery('<p></p>');
                $container.html(lines[0]);
                $root.replaceWith($container);

                var $prev = $container;

                for (var i = 1; i < lines.length; i++) {
                    var $row = jQuery('<p></p>');
                    $row.html(lines[i]);
                    $row.insertAfter($prev);
                    $prev = $row;
                }
            }
        },

        addActionButtons: function ($node) {


            var $code = $node.find('code');

            if ($code.length < 0) {
                $code.append(jQuery('<br />'));
            }

            var $container = $node.find('.no-render.action');

            if ($container.length !== 0) {
                // Ja s'han afegit, no cal fer res <-- ho eliminem per si s'ha enganxat i no conté els handlers
                $container.remove();
            }

            $container = jQuery('<div class="no-render action" contenteditable="false"></div>');
            $code.prepend($container);


            var $labelLang = jQuery('<label>Llenguatge:</label>');
            var $input = jQuery('<input type="text" />');

            $labelLang.append($input);

            $input.on('input change', function (e) {
                $code.attr('data-dw-lang', jQuery(this).val());
            });

            var $select = jQuery('<select></select>');
            var $option1 = jQuery('<option value="code">Codi</option>');
            var $option2 = jQuery('<option value="file">Fitxer</option>');

            var $labelType = jQuery('<label>Tipus:</label>');
            $labelType.append($select);

            $select.append($option1);
            $select.append($option2);

            $container.append($labelLang);
            $container.append($labelType);

            $select.on('input change', function (e) {
                var $this = jQuery(this);

                if ($this.val() === 'file') {
                    $code.removeAttr('data-dw-lang');
                    $input.prop('disabled', true);
                    $code.attr('data-dw-file', true);

                } else {
                    $code.attr('data-dw-lang', $input.val());
                    $input.prop('disabled', false);
                    $code.removeAttr('data-dw-file');
                }


            });

            // Inicialitzem els valors amb els continguts anteriors
            $input.val($code.attr('data-dw-lang'));
            $select.val($code.attr('data-dw-file') ? 'file' : 'code');
            $select.trigger('change');


            dojoActions.addParagraphAfterAction($node, this.editor);
            dojoActions.addParagraphBeforeAction($node, this.editor);
            dojoActions.deleteAction($node, this.editor, "bloc de codi"); // TODO: Localitzar
            dojoActions.setupContainer($node, $container);



        },


        parse: function () {
            var $nodes = jQuery(this.editor.iframe).contents().find('pre code');
            var context = this;

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });

        },

        _addHandlers: function ($node) {

            // console.log("Afegint botons", $node);
            this.addActionButtons($node.closest('pre'));

            var context = this;


            this.editor.on('tabPress', function(e) {

                if (context.editor.getCurrentNodeState().indexOf('pre') > -1 && context.editor.getCurrentNodeState().indexOf('code') > -1) {
                    context.editor.execCommand('insertText', TAB_STRING);
                }

            });

        }
    });


    // Register this plugin.
    _Plugin.registry["insert_code"] = function () {
        return new FormatButton({command: "insert_code"});
    };

    return FormatButton;
});