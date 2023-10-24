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

            this.heading = args.heading;
            this.hasCustomheading = args.hasCustomheading;
            this.quizType = args.quizType;
            this.hasExtraSolutions = args.hasExtraSolutions;
            this.htmlTemplateHeader = args.htmlTemplateHeader;
            this.htmlTemplateRow = args.htmlTemplateRow;
            this.uniqueNamePerRow = args.uniqueNamePerRow;
            this.rowCount = 0;

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

        },


        parse: function () {
            var $nodes = jQuery(this.editor.iframe).contents().find('.ioc-quiz[data-quiz-type="' + this.quizType +'"]');
            var context = this;

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });

        },

        _addHandlers: function ($node) {

            this.addActionButtons($node);

            var $data = $node.find('pre[data-ioc-extra-solutions]');
            var $textarea = $node.find('textarea');

            $textarea.on('change input', function () {
                $data.text(jQuery(this).val());
            });

            var $addRow = $node.find('button');


            var context = this;

            $addRow.on('click', function (e) {
                context.addRow(jQuery.find('table'));
            });

            dojoActions.addCustomAction($node, $addRow, 'add-row');


            // TODO: falta el listener per eliminar files

            var $rows = $node.find('tr');


            var $deleteIcon = $rows.find('.delete');

            $deleteIcon.on('click', function () {
                jQuery(this).closest('tr').remove();
            });

            for (var i = 1; i < $rows.length; i++) {
                let $row = jQuery($rows[i]);
                // console.log(i, $row);


                var $type = $node.closest('[data-quiz-type]').attr('data-quiz-type');

                // TODO: falten els listeners pels botons vf/choice
                switch ($type) {
                    case 'vf':

                        $row.find('[type="radio"]').on('change input', function () {
                            jQuery(this).closest('tr').find('td.hidden-field').text(jQuery(this).val());
                        });

                        break;

                    case 'choice':

                        $row.attr('data-row-id', this.rowCount++);

                        $row.find('[type="radio"]').on('change input', function () {
                            $node.find('.hidden-field').text(jQuery(this).closest('tr').attr('data-row-id'));
                        });

                        var $checked = $row.find(':checked');
                        $node.find('.hidden-field').text($checked.closest('tr').attr('data-row-id'));

                        break;
                }
            }

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
                quizType: this.quizType
            };


            var html = '<div id="${id}" class="ioc-quiz" contenteditable="false" data-quiz-type="${quizType}">';

            // Capçalera, ha de contenir un enunciat fixe, un personalitzat o tots dos, no es contempla un exercici
            // sense cap enunciat.
            html += '<div class="editable-text">';

            if (this.heading) {
                args.heading = this.heading;
                html += '<div class="enunciat"><div>${heading}</div></div>';
            }


            // això només es troba en alguns casos
            if (this.hasCustomheading) {
                html += '<div class="enunciat editable" contenteditable="true"><div>Introdueix l\'enunciat.</div></div>';
            }

            html += '<div>';


            html += "<table id='table_" + args.id + "' class='opcions' contenteditable='true'>";


            html += this.htmlTemplateHeader;
            // html += this.htmlTemplateRow;


            html += "</table>";
            html += '</div>';
            html += '</div>';


            var $newNode = jQuery(string.substitute(html, args));

            // Afegim la columna d'eliminar a la capçalera
            var $header = jQuery($newNode.find('tr').get(0));
            $header.append('<th>Accions</th>');

            $node.after($newNode);

            // // Afegim un paràgraf just desprès.
            // $newNode.after(jQuery('<p></p>'));

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

            var $visibleField = $newRow.find('[name]');
            $visibleField.attr('name', auxName);


            switch (this.quizType) {
                case 'vf':
                    var $hiddenField = $newRow.find('td.hidden-field');

                    $newRow.find('[type="radio"]').on('change input', function () {
                        $hiddenField.text(jQuery(this).val());
                    });

                    break;

                case 'choice':
                    $newRow.attr('data-row-id', this.rowCount++);

                    $hiddenField = $table.find('.hidden-field');

                    if ($hiddenField.length === 0) {
                        $table.append('<div class="hidden-field"></div>');
                        $hiddenField = $table.find('.hidden-field');
                    }

                    $newRow.find('[type="radio"]').on('change input', function () {
                        $hiddenField.text($newRow.attr('data-row-id'));
                    });


                    break;
            }


            var $deleteCol = jQuery('<td contenteditable="false"></td>');
            var $deleteIcon = jQuery('<span class="iocDeleteIcon actionIcon delete" title="' + localization["delete"] + '"></span>');

            $deleteCol.append($deleteIcon);
            $newRow.append($deleteCol);

            $deleteIcon.on('click', function () {
                $newRow.remove();
            });

            $newRow.find('tr').append($deleteCol);

            $table.append($newRow);
        }

    });


    // Register this plugin.
    _Plugin.registry["ioc_quiz"] = function () {
        return new DojoSwitchEditor({command: "ioc_quiz"});
    };

    return DojoSwitchEditor;
});