define([
    "dojo/_base/declare",
    "ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin",
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActions',
    'dojo/i18n!ioc/dokuwiki/editors/nls/commands',
], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, string, dojoActions, localization) {

    var uniqueRowSuffix = 0;


    var DojoSwitchEditor = declare(AbstractParseableDojoPlugin, {

        init: function (args) {

            this.inherited(arguments);

            this.heading = args.label;
            this.hasCustomheading = args.hasCustomheading;
            this.quizType = args.quizType;
            this.hasExtraSolutions = args.hasExtraSolutions;
            this.htmlTemplateHeader = args.htmlTemplateHeader;
            this.htmlTemplateRow = args.htmlTemplateRow;
            this.uniqueNamePerRow = args.uniqueNamePerRow;

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

            var selection = this.editor.getSelection();

            var $node = jQuery(selection.nodes[0]);


            if ($node.attr('id') === 'dijitEditorBody') {
                // No hi ha cap node seleccionat, afegim un nou node buit que servirar com a cursor per afegir
                // el quiz al final del document
                var $auxNode = jQuery('<p></p>');
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
            };


            var html = '<div id="${id}" class="ioc-quiz block-enter" contenteditable="false">';

            // Capçalera, ha de contenir un enunciat fixe, un personalitzat o tots dos, no es contempla un exercici
            // sense cap enunciat.
            html += '<div class="editable-text">';

            if (this.heading) {
                args.heading = this.heading;
                html += '<div class="enunciat">${heading}</div>';
            }


            // això només es troba en alguns casos
            if (this.hasCustomheading) {
                html += '<div class="enunciat editable" contenteditable="true">Introdueix l\'enunciat.</div>';
            }

            html += '<div>';


            html += "<table class='opcions' contenteditable='true'>";


            html += this.htmlTemplateHeader;
            // html += this.htmlTemplateRow;


            html += "</table>";


            html += '</div>';

            // Afegim un paràgraf just desprès.
            html += '<p></p>';


            var $newNode = jQuery(string.substitute(html, args));

            // Afegim la columna d'eliminar a la capçalera
            var $header = jQuery($newNode.find('tr').get(0));
            $header.append('<th>Accions</th>');

            $node.after($newNode);


            var $root = jQuery($newNode.get(0));


            if (this.hasExtraSolutions) {
                var $extraSolutions = jQuery(
                    '<div class="extra-solutions editable-text">'
                    + '<label>Introdueix solucions errónies adicionals separades per un salt de línia:</label>'
                    + '<textarea rows="4" class="extra-solutions editable"></textarea>'
                    + '</div>');
                var $data = jQuery('<pre data-ioc-extra-solutions></pre>');

                $extraSolutions.append($data);

                var $textarea = $extraSolutions.find('textarea');

                $textarea.on('change input', function () {
                    $data.text(jQuery(this).val());
                });

                // això no soluciona el problema: si es fa click just al final del texarea es mostra el cursor i permet afegir salts de línia
                // $extraSolutions.on('click', function() {
                //     $textarea.focus();
                //     console.log("Click a extrasolutions");
                // });

                $root.append($extraSolutions);

            }


            this.addActionButtons($root);

            // ALERTA! sempre s'han d'afegir al final perquè al addActionButtons s'elimina tot el contingut de les accions
            var $addRow = jQuery('<button>Afegir fila</button>');

            var $table = $newNode.find('table');


            var context = this;

            $addRow.on('click', function (e) {
                context.addRow($table);
                // var $newRow = jQuery(context.htmlTemplateRow);
                // $table.append($newRow);
            });

            dojoActions.addCustomAction($root, $addRow, 'add-row');

            // Afegim una primera fila buida
            this.addRow($table);

        },

        addRow($table) {
            var $newRow = jQuery(this.htmlTemplateRow);

            // TODO: canviar els noms dels camps si és necessari

            var auxName = $table.attr('id');

            if (this.uniqueNamePerRow) {
                auxName += '_' + uniqueRowSuffix++;
            }

            $newRow.find('[name]').attr('name', auxName);


            var $deleteCol = jQuery('<td contenteditable="false"></td>');
            var $deleteIcon = jQuery('<span class="iocDeleteIcon actionIcon delete" title="' + localization["delete"] + '"></span>');

            $deleteCol.append($deleteIcon);
            $newRow.append($deleteCol);

            $deleteIcon.on('click', function () {
                $newRow.remove();
            });


            // TODO: Afegir la columna amb el botó d'eliminar
            $newRow.find('tr').append($deleteCol);


            $table.append($newRow);
        }


    });


    // Register this plugin.
    _Plugin.registry["switch_editor"] = function () {
        return new DojoSwitchEditor({command: "switch_editor"});
    };

    return DojoSwitchEditor;
});