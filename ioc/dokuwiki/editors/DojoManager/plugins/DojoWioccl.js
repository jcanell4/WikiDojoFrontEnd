define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/form/ToggleButton"
], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, string, Button) {

    var FormatButton = declare(AbstractParseableDojoPlugin, {

        init: function (args) {
            this.inherited(arguments);

            // this.htmlTemplate = args.open + "${content}" + args.close;

            // this.content = args.sample;
            this.tag = 'wioccl';
            // this.clearFormat = args.clearFormat;
            // this.sample = args.sample;

            // this.groupPattern = args.groupPattern ? new RegExp(args.groupPattern) : false;

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

            // this.empty = args.empty !== undefined ? args.empty : false;


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

            alert("TODO");

        },

        _addHandlers: function ($node, context) {

            $node.on('mouseover', function (e){
                let id = $node.attr('data-wioccl-ref');
                let ids = [];

                if (id.indexOf(',')!== -1){
                    ids = id.split(',');

                } else {
                    ids.push(id);
                }

                for (let i=0; i<ids.length; i++) {
                    console.log("mouseover: Element a la estructura:", ids[i], context.editor.extra.wioccl_structure.structure[ids[i]]);
                }


                // TODO: Determinar que fer en aquest cas, si no s'atura l'event es dispara per tots els nodes encapsulats
                // però potser és això el que ens interessa, ja que en alguns casos pot ser que sigui la única manera
                // de veure els nodes pare
                e.preventDefault();
                e.stopPropagation();

            });

            // Cerca de parelles

            let refId = $node.attr('data-wioccl-ref');

            if ($node.attr('data-wioccl-state') === 'open') {
                // cerquem el de tancament dintre del mateix pare


                // el node de tancament contindrà 'data-wioccl-state' === 'close' i 'data-wioccl-ref' == al refId
                let now = Date.now();
                let $closingNode = $node.parent().find('[data-wioccl-state="close"][data-wioccl-ref="'+ refId+ '"]');

                console.log("***Inici cerca node close")
                if ($closingNode.length > 0) {
                    console.log("Closing node trobat al mateix parent:", $closingNode);

                    // TODO: moure tots els
                } else {
                    // No es troba al parent
                }
                console.log("***Fi cerca node close", Date.now()-now);






            } else if ($node.attr('data-wioccl-state') === 'close') {
                // no fem res
            } else {
                // TODO: per determinar, es tracta d'una fila, ja que aquestes no indique l'state
            }






            //
            //
            // // console.log("Adding handlers", $node);
            //
            // // Si el node no te ID s'ha de genera una Id i una referència
            // if (!$node.attr('id')) {
            //     // console.log("No s'ha trobat id");
            //
            //     var time = Date.now();
            //     $node.attr('id', 'ioc-comment-' + time);
            //
            //     var ref = this._referenceFromDate(time);
            //     var reference = "*";
            //     reference += " (" + ref + ")";
            //
            //     var $reference = $node.find('[data-reference]');
            //     $reference.html(reference);
            //
            //     // var counter = $node.attr('data-note-counter');
            //
            //     // var $body = jQuery(this.editor.iframe).contents().find('div[data-note-counter="' + counter + '"]');
            //
            //     // Ens asegurem que es troba dins del note, com que 'ioc-note' és un element propi quan es troba dins d'un element de block (com <p> per exemple) es separen els elements incorrectament
            //     // $node.append($body);
            //
            //     $node.find('.ioc-comment-main b').html('Ref. ' + ref);
            // }
            //
            // var $replyNode = $node.find('textarea.reply');
            // var $buttons = $node.find('button[data-action]');
            // // var $removeButtons = $node.find('[data-button="remove"]');
            // // var $editButtons = $node.find('[data-button="edit"]');
            // var context = this;
            //
            // // Mostrem els botons ocultats pel mode readonly
            // $replyNode.css('display', 'inherit');
            //
            // $node.find('button[data-action="reply"]').css('display', 'inherit');
            //
            // $node.find('button[data-action="resolve"]').css('display', 'inherit');
            //
            // $buttons.on('click', function (e) {
            //     var $button = jQuery(this);
            //     var func = $button.attr('data-action');
            //     context[func].bind(context);
            //     context[func]($node);
            //     e.preventDefault();
            // });
            //
            // $replyNode.on('keypress keydown keyup', function (e) {
            //     $replyNode.focus();
            //
            //     if (e.keyCode === 13 || e.charCode === 13) {
            //         e.stopPropagation();
            //     }
            //
            // });
            //
            // // TODO: només s'ha d'afegir les toolbars de l'últim element
            //
            //
            // var $toolbars = $node.find('.ioc-comment-toolbar');
            // $toolbars.css('display', 'none');
            //
            // var $lastToolbar = $node.find('.ioc-comment-toolbar').last();
            //
            //
            // if ($lastToolbar.length > 0) {
            //     $lastToolbar.css('display', 'inherit');
            //
            //     var $removeButton = $lastToolbar.find('[data-button="remove"]');
            //     var $editButton = $lastToolbar.find('[data-button="edit"]');
            //
            //     var $commentNode = $removeButton.closest('.ioc-comment-reply');
            //
            //     $removeButton.on('click', context.addRemoveCommentHandler($commentNode).bind(context));
            //     $editButton.on('click', context.addEditCommentHandler($commentNode).bind(context));
            //
            // }
            //
            // var $commentBody = $node.find('.ioc-comment-body');
            //
            //
            // $commentBody.on('click', function (e) {
            //
            //     if (!jQuery(e.srcElement).attr(data-button)) {
            //         $node.find('textarea.reply').focus();
            //     }
            //
            //     e.preventDefault();
            // });
            //
            // // ALERTA! això ERA necessari per reenganxar el contingut del paràgraf quan hi ha una nota enmig
            // // var auxNode = $node.parent().get(0).nextSibling;
            //
            // // console.log("Quin és el node següent?", auxNode);
            // // console.log("Quin és el contingut del node següent?", auxNode.textContent);
            //
            // // if (auxNode && auxNode.nodeType === 3 /*&& auxNode.textContent.trim() !== ''*/) {
            // //     // console.log("Contingut detectat, corregim el text");
            // //     $node.after(auxNode);
            // // } else {
            // //     // console.log("No s'ha trobat node següent, afegim un espai");
            // //     $node.after("&nbsp;");
            // // }
            //
            // // var $commentBody = $node.find('ioc-coment-body');
            //
            // var $actions = jQuery('<span class="no-render action" contenteditable="false">');
            //
            // $commentBody.append($actions);
            //
            // dojoActions.addParagraphAfterAction($actions, this.editor);
            // dojoActions.addParagraphBeforeAction($actions, this.editor);
            // dojoActions.setupContainer($node, $actions);

        },

        parse: function () {

            var $nodes = jQuery(this.editor.iframe).contents().find('[data-wioccl-ref]');
            var context = this;

            $nodes.each(function () {
                let $node = jQuery(this);
                let id = $node.attr('data-wioccl-ref');
                console.log("context?", context.editor.extra);
                console.log("Detectat element a la estructura:", id, context.editor.extra.wioccl_structure.structure[id]);

                context._addHandlers($node, context);
            });

        },
    });


    // Register this plugin.
    _Plugin.registry["insert_wioccl"] = function () {
        return new FormatButton({command: "insert_wioccl"});
    };

    return FormatButton;
});