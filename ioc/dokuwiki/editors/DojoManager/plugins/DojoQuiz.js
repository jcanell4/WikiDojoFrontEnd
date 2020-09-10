define([
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin",
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    // "ioc/dokuwiki/editors/Components/SwitchEditorComponent",
], function (declare, AbstractParseableDojoPlugin, lang, _Plugin/*, SwitchEditorComponent*/) {

    var DojoSwitchEditor = declare(AbstractParseableDojoPlugin, {

        init: function(args) {

            this.inherited(arguments);

            // this.switchEditorComponent= new SwitchEditorComponent(this.editor.dispatcher);

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

            this.events = args.event;

            this.addButton(config);
        },

        _processFull:function() {
            

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


            // dojoActions.addParagraphAfterAction($node, this.editor);
            // dojoActions.addParagraphBeforeAction($node, this.editor);
            // dojoActions.deleteAction($node, this.editor, "bloc de codi"); // TODO: Localitzar
            // dojoActions.setupContainer($node, $container);



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
    _Plugin.registry["switch_editor"] = function () {
        return new DojoSwitchEditor({command: "switch_editor"});
    };

    return DojoSwitchEditor;
});