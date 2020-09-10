define([
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin",
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActions',
], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, string, dojoActions) {

    var DojoSwitchEditor = declare(AbstractParseableDojoPlugin, {

        init: function (args) {

            this.inherited(arguments);

            this.heading = args.label;
            this.hasCustomheading = args.hasCustomheading;
            this.quizType = args.quizType;
            this.hasExtraSolutions = args.hasExtraSolutions;
            this.htmlTemplateHeader = args.htmlTemplateHeader;
            this.htmlTemplateRow = args.htmlTemplateRow;

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

        _processFull: function () {

            this.addBlock();
        },

        addActionButtons: function ($node) {


            var $aux = dojoActions.getActionContainer($node);

            $aux.empty();


            dojoActions.addParagraphAfterAction($node, this.editor);
            dojoActions.addParagraphBeforeAction($node, this.editor);
            dojoActions.deleteAction($node, this.editor, 'exercici');
            dojoActions.setupContainer($node, $node.find('.no-render.action'));


            // Eliminem el listener per editar els enllaços del info (que no han de tractar-se com enllaços)
            // $node.find('[data-dw-link]').on('dblclick', function (e) {
            //     e.preventDefault();
            //     return false;
            // })

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
            // this.addActionButtons($node.closest('pre'));
            //
            // var context = this;


            // this.editor.on('tabPress', function(e) {
            //
            //     if (context.editor.getCurrentNodeState().indexOf('pre') > -1 && context.editor.getCurrentNodeState().indexOf('code') > -1) {
            //         context.editor.execCommand('insertText', TAB_STRING);
            //     }
            //
            // });

        },

        addBlock: function () {
            console.log("que es this?", this);

            var selection = this.editor.getSelection();
            console.log("Selection", selection);


            let $node = jQuery(selection.nodes[0]);


            if ($node.attr('id') === 'dijitEditorBody') {
                // No hi ha cap node seleccionat, afegim un nou node buit que servirar com a cursor per afegir
                // el quiz al final del document
                let $auxNode = jQuery('<p></p>');
                $node.append($auxNode);
                $node = $auxNode;

            } else {
                // cerquem el node arrel, el node que tè com a pare #dijitEditorBody;

                while ($node.parent().attr('id') !== 'dijitEditorBody') {
                    $node = $node.parent();
                }
            }




            var args = {
                id: "ioc-quiz-" + Date.now(),

                // resolveBtnTitle: localization['ioc-comment-resolve-title'],
                // resolveBtn: localization['ioc-comment-resolve-button'],
                // textareaPlaceholder: localization['ioc-comment-textarea-placeholder'],
                // replyBtnTitle: localization['ioc-comment-reply-title'],
                // replyBtn: localization['ioc-comment-reply-button']
                // signature: SIG, // ALERTA[Xavi] aquesta és una variable global definida per DokuWiki
            };


            // var htmlCode = string.substitute(this.htmlTemplate, args);

            var html = '<div id="${id}" class="ioc-quiz">';

            if (this.heading) {
                args.heading = this.heading;
                html += '<p contenteditable="false" class="enunciat">${heading}</p>';
            }


            // això només es troba en alguns casos
            if (this.hasCustomheading) {
                html += '<p class="enunciat">Introdueix l\'enunciat.</p>';
            }

            html += "<table class='opcions'>";



            html += this.htmlTemplateHeader;
            html += this.htmlTemplateRow;




            // switch (this.quizType) {
            //
            //     case 'vf':
            //         html += "<tr contenteditable=\"false\">";
            //         html += "<th>Pregunta</th>";
            //         html += "<th>V</th>";
            //         html += "<th>F</th>";
            //         html += "</tr>";
            //
            //         html += "<tr>";
            //         html += "<td>pregunta</td>";
            //         html += '<td class="center" contenteditable="false"><input type="radio" name="sol_1"></td>';
            //         html += '<td class="center" contenteditable="false"><input type="radio" name="sol_1"></td>';
            //         html += "</tr>";
            //         break;
            //
            //     case 'choice':
            //         html += "<tr contenteditable=\"false\">";
            //         html += "<th>Pregunta</th>";
            //         html += "<th>Resposta</th>";
            //         html += "</tr>";
            //
            //         html += "<tr>";
            //         html += "<td>opcio</td>";
            //         html += '<td class="center" contenteditable="false"><input type="radio" name="sol_1"></td>';
            //         html += "</tr>";
            //         break;
            //
            //     case 'relations':
            //         html += "<tr contenteditable=\"false\">";
            //         html += "<th>Pregunta</th>";
            //         html += "<th>Resposta</th>";
            //         html += "</tr>";
            //
            //         html += "<tr>";
            //         html += "<td>opcio</td>";
            //         html += '<td class="center" contenteditable="false"><input type="checkbox"></td>';
            //         html += "</tr>";
            //         break;
            //
            //     case 'complete':
            //         html += "<tr contenteditable=\"false\">";
            //         html += "<th>Text previ</th>";
            //         html += "<th>Solució</th>";
            //         html += "<th>Text posterior</th>";
            //         html += "</tr>";
            //
            //         html += "<tr>";
            //         html += "<td>Text previ</td>";
            //         html += "<td>solució</td>";
            //         html += "<td>text posterior</td>";
            //         html += "</tr>";
            //         break;
            //
            //     default:
            //         alert("Tipus de quiz desconegut: " + args.quizType);
            // }


            html += "</table>";

            if (this.hasExtraSolutions) {
                html += '<div class="extra-solutions">';
                html += '<label>Introdueix solucions errónies adicionals separades per un salt de línia:</label>'
                html += '<textarea rows="4" class="extra-solutions"></textarea>';
                html += '</div>';
            }


            html += '</div>';

            // Afegim un paràgraf just desprès. TODO: afegir accions per afegir els paràgrafs anterior, posterior i eliminar
            html += '<p></p>';


            var $newNode = jQuery(string.substitute(html, args));
            $node.after($newNode);

            // TODO: Afegir els handlers!


            console.log("node:", $node);
            console.log("new node:", $newNode.html());

            // for (var i = 0; i < selection.nodes.length; i++) {
            //     var $node = jQuery(selection.nodes[i]);
            //     var $newNode = jQuery('<' + this.tags[0] + '>');
            //     var $child = $newNode;
            //
            //     for (i = 1; i < this.tags.length; i++) {
            //         var $previous = $child;
            //         $child = jQuery('<' + this.tags[i] + '>');
            //         $previous.append($child);
            //         // console.log("Afegit child", $child);
            //     }
            //
            //     if ($node.text().length === 0) {
            //         $node.text("&nbsp;");
            //     }
            //
            //     $child.html($node.text());
            //
            //
            //     $node.empty();
            //
            //     if ($node.attr('id') === 'dijitEditorBody') {
            //         $node.append($newNode);
            //     } else {
            //         $node.replaceWith($newNode);
            //     }
            //
            // }

            this.addActionButtons(jQuery($newNode.get(0)));

        },


    });


    // Register this plugin.
    _Plugin.registry["switch_editor"] = function () {
        return new DojoSwitchEditor({command: "switch_editor"});
    };

    return DojoSwitchEditor;
});