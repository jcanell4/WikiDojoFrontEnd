define([
    "dojo/_base/declare",
    "ioc/gui/content/engines/_abstractFormRenderEngine",
], function (declare, AbstractFormRenderEngine) {

    return declare([AbstractFormRenderEngine],
        {

            //
            // /**
            //  * Si obj1.priority es major, es colocarà abans
            //  * @param obj1
            //  * @param obj2
            //  * @returns {*}
            //  */
            // comparePriority: function (obj1, obj2) {
            //     //console.log('formRenderEngine#comparePriority', obj1.priority, obj2.priority);
            //     if (!obj1) {
            //         return obj2.priority || 0;
            //     } else if (!obj2) {
            //         return obj1.priority;
            //     } else {
            //         return obj2.priority - obj1.priority;
            //     }
            // },
            //
            // renderGroup: function (group, fvalues) {
            //     var fields,
            //         $group = '',
            //         $header,
            //         cols = group.columns || 12;
            //
            //     if (group.elements) {
            //         $group = jQuery('<div>');
            //         fields = group.elements.sort(this.comparePriority);
            //
            //         // renderitzar el marc i titol
            //         if (group.title) {
            //             $header = jQuery('<p>')
            //                 .addClass('h2')
            //                 .html(group.title);
            //
            //             $group.append($header);
            //         }
            //
            //         if (group.frame) {
            //             $group.addClass('form-frame');
            //         } else {
            //             $group.addClass('form-without-frame');
            //         }
            //
            //         for (var i = 0; i < fields.length; i++) {
            //             switch (group.elements[i].formType) {
            //                 case 'row':
            //                     $group.append(this.renderRow(fields[i], fvalues));
            //                     break;
            //                 case 'group':
            //                     $group.append(this.renderGroup(fields[i], fvalues));
            //                     break;
            //                 case 'field':
            //                     $group.append(this.renderField(fields[i], fvalues));
            //                     break;
            //             }
            //         }
            //
            //         if (group.id) {
            //             $group.attr('id', group.id);
            //         }
            //         $group.addClass('form-group col-xs-' + cols); // input-group o form-group?
            //     }
            //
            //     return $group;
            //
            // },

            // renderField: function (field, fvalues) {
            //     var $field,
            //         cols = field.columns || 12;
            //
            //     switch (field.type) {
            //         case 'editableObject':
            //             $field = this.renderFieldEditableObject(field, fvalues);
            //             break;
            //
            //         case 'hidden':
            //             return;
            //
            //         case 'textarea':
            //             $field = this.renderFieldTextarea(field, fvalues);
            //             break;
            //
            //         case 'select':
            //             $field = this.renderFieldSelect(field, fvalues);
            //             break;
            //
            //         case 'checkbox':
            //         case 'radio':
            //             $field = this.renderFieldCheckbox(field, fvalues);
            //             break;
            //
            //         default:
            //             $field = this.renderFieldDefault(field, fvalues);
            //     }
            //
            //     $field.addClass('col-xs-' + cols);
            //
            //     return $field;
            // },

            renderFieldDefault: function (field, fvalues) {
                var $field = jQuery('<div>'),
                    $label = jQuery('<label>'),
                    $data = jQuery('<span>');

                $label.html(field.label);
                $field.append($label)
                    .append($data);

                $data.attr('name', field.name)
                    .html(fvalues[field.name])
                    .addClass('view-field')
                    .attr('title', field.label);

                return $field;
            },


            //
            // renderField: function (field, fvalues) {
            //     console.log("RenderField:", field, fvalues);
            //     var $field,
            //         cols = field.columns || 12;
            //
            //     switch (field.type) {
            //         case 'editableObject':
            //             $field = this.renderFieldEditableObject(field, fvalues);
            //             break;
            //         //break;
            //
            //         case 'textarea':
            //             $field = this.renderFieldTextarea(field, fvalues);
            //             break;
            //
            //         case 'select':
            //             $field = this.renderFieldSelect(field, fvalues);
            //             break;
            //
            //
            //         case 'checkbox': // TODO[Xavi] No s'ajusta correctament l'amplada
            //         case 'radio':
            //             $field = this.renderFieldCheckbox(field, fvalues);
            //             break;
            //
            //         default:
            //             $field = this.renderFieldDefault(field, fvalues);
            //     }
            //
            //     $field.addClass('col-xs-' + cols);
            //
            //     return $field;
            // },
            //
            // renderFieldDefault: function (field, fvalues) {
            //     var $field = jQuery('<div>'),
            //         $label = jQuery('<label>'),
            //         $input = jQuery('<input>');
            //
            //     if (field.type !== 'hidden') {
            //         $label.html(field.label);
            //         $field.append($label);
            //
            //         // TODO[Xavi] Afegir un parámetre a field que retornará del servidor i indicarà si s'ha de mostrar el botó de l'editor
            //         if (true) {
            //             $input.attr('data-form-editor-button', field.id)
            //         }
            //     }
            //
            //
            //     $field.append($input);
            //
            //     $input.attr('type', field.type)
            //         .attr('name', field.name)
            //         //.val(field.value)
            //         .val(fvalues[field.name])
            //         .addClass('form-control')
            //         .attr('title', field.label);
            //
            //     if (field.id) {
            //         $input.attr('id', field.id);
            //     }
            //
            //     if (field.props) {
            //         this.addPropsToInput(field.props, $input);
            //     }
            //
            //     return $field;
            // },
            //

            renderFieldSelect: function (field, fvalues) {
                var $field = jQuery('<div>'),
                    $label = jQuery('<label>'),
                    $select = jQuery('<select>');

                $label.html(field.label);

                $field.append($label)
                    .append($select);

                $select.attr('name', field.name)
                    .html(fvalues[field.name])
                    .addClass('view-field');

                return $field;
            },

            // renderFieldSelect: function (field, fvalues) {
            //     var $field = jQuery('<div>'),
            //         $label = jQuery('<label>'),
            //         $select = jQuery('<select>');
            //
            //     $label.html(field.label);
            //
            //     $field.append($label)
            //         .append($select);
            //
            //     $select.attr('type', field.type)
            //         .attr('name', field.name)
            //         //.val(field.value)
            //         .val(fvalues[field.name])
            //         .addClass('form-control');
            //
            //     if (field.id) {
            //         $select.attr('id', field.id);
            //     }
            //
            //     this.addOptionsToSelect(field.options, $select);
            //
            //     if (field.props) {
            //         this.addPropsToInput(field.props, $select);
            //     }
            //
            //     return $field;
            // },
            //
            // addOptionsToSelect: function (options, $select) {
            //     var $option;
            //
            //     for (var i = 0; i < options.length; i++) {
            //         $option = jQuery('<option>')
            //             .val(options[i].value)
            //             .html(options[i].description);
            //
            //         if (options[i].selected) {
            //             $option.attr('selected', true);
            //         }
            //
            //         $select.append($option);
            //     }
            // },
            //

            renderFieldTextarea: function (field, fvalues) {
                var $field = jQuery('<div>'),
                    $label = jQuery('<label>'),
                    $textarea = jQuery('<div>');

                $label.html(field.label);

                $field.append($label)
                    .append($textarea);

                $textarea.attr('name', field.name)
                    .html(fvalues[field.name])
                    .addClass('view-textarea')
                    .attr('title', field.label);

                return $field;
            },

            // renderFieldTextarea: function (field, fvalues) {
            //     var $field = jQuery('<div>'),
            //         $label = jQuery('<label>'),
            //         $textarea = jQuery('<textarea>');
            //
            //     $label.html(field.label);
            //
            //     $field.append($label)
            //         .append($textarea);
            //
            //     $textarea.attr('name', field.name)
            //     //.val(field.value)
            //         .val(fvalues[field.name])
            //         .addClass('form-control')
            //         .attr('title', field.label);
            //
            //     if (field.id) {
            //         $textarea.attr('id', field.id);
            //     }
            //
            //     if (field.props) {
            //         this.addPropsToInput(field.props, $textarea);
            //     }
            //
            //     return $field;
            // },
            //
            //

            renderFieldCheckbox: function (field, fvalues) {
                var $field = jQuery('<div>'),
                    $group = jQuery('<div>'),
                    $span = jQuery('<span>'),
                    $data = jQuery('<span>'),
                    $label = jQuery('<label>');

                $field.append($group);

                $label.attr('readonly', true)
                    .addClass('form-control')
                    .val(field.label)
                    .attr('type', 'text')
                    .attr('title', field.label);

                $span.addClass('input-group-addon')
                    .append($data);

                $group.addClass('input-group')
                    .append($span)
                    .append($label);

                $data.attr('name', field.name)
                    .html(fvalues[field.name]);

                return $field;
            },

            // renderFieldCheckbox: function (field, fvalues) {
            //     var $field = jQuery('<div>'),
            //         $group = jQuery('<div>'),
            //         $span = jQuery('<span>'),
            //         $input = jQuery('<input>'),
            //         $label = jQuery('<input>');
            //
            //     $field.append($group);
            //
            //     $label.attr('readonly', true)
            //         .addClass('form-control')
            //         .val(field.label)
            //         .attr('type', 'text')
            //         .attr('title', field.label);
            //
            //     $span.addClass('input-group-addon')
            //         .append($input);
            //
            //     $group.addClass('input-group')
            //         .append($span)
            //         .append($label);
            //
            //     $input.attr('type', field.type)
            //         .attr('name', field.name)
            //         //.val(field.value);
            //         .val(fvalues[field.name]);
            //
            //     if (field.id) {
            //         $input.attr('id', field.id);
            //     }
            //
            //     if (field.props) {
            //         this.addPropsToInput(field.props, $input);
            //     }
            //
            //     return $field;
            // },
            //
            //
            // renderFieldEditableObject: function (field, fvalues) {
            //     console.log("renderEditableElement:", field, field.props.editableClass);
            //     var $field;
            //
            //     switch (field.props['data-editable-element']) {
            //         case 'table':
            //             $field = this.renderFieldTable(field, fvalues);
            //             // alert("Table!");
            //             break;
            //
            //         default:
            //             alert("error, editable-element no identificat:" + field.props['data-editable-element']);
            //         // $field = renderFieldDefault(field, fvalues);
            //     }
            //
            //
            //     if (field.id) {
            //         $field.attr('id', field.id);
            //     }
            //
            //
            //     return $field;
            // },
            //
            // renderFieldTable: function (field, fvalues) {
            //     var data = JSON.parse(field.value);
            //
            //
            //     var $table = jQuery('<table></table>');
            //     var $header = jQuery('<thead></thead>');
            //     var $body = jQuery('<tbody></tbody>');
            //
            //     // Agafem les claus de la primera fila per afegir la capñalera
            //     var $row = jQuery('<tr></tr>');
            //     var first = true;
            //
            //     for (var key in data[0]) {
            //         var $col = jQuery('<th>' + key + '</th>');
            //
            //         // ALERTA[Xavi]! Posem la primera fila com a readonly manualment.
            //         if (first) {
            //             first = false;
            //             $row.attr('readonly', true);
            //         }
            //         $row.append($col);
            //     }
            //
            //     $header.append($row);
            //     $table.append($header);
            //
            //
            //     // Afegim les files
            //     for (var i = 0; i < data.length; i++) {
            //         $row = jQuery('<tr></tr>');
            //
            //         for (key in data[i]) {
            //             $col = jQuery('<td>' + data[i][key] + '</td>');
            //             $row.append($col);
            //         }
            //
            //         $body.append($row);
            //
            //     }
            //
            //
            //     $table.append($body);
            //
            //
            //     if (field.props) {
            //         this.addPropsToInput(field.props, $table);
            //     }
            //
            //     return $table;
            // },
            //
            // addPropsToInput: function (props, $input) {
            //     for (var prop in props) {
            //         $input.attr(prop, props[prop]);
            //     }
            // },
            //
            // renderRow: function (row, fvalues) {
            //     var $row = jQuery('<div>'),
            //         $header,
            //         $title;
            //
            //     $row.addClass('row');
            //
            //     if (row.title) {
            //         $header = jQuery('<div>')
            //             .addClass('col-xs-12');
            //
            //         $title = jQuery('<p>')
            //             .addClass('h1')
            //             .html(row.title);
            //
            //         $row.append($header.append($title));
            //     }
            //
            //     row.elements.sort(this.comparePriority);
            //
            //     if (row.id) {
            //         $row.attr('id', row.id);
            //     }
            //
            //     for (var i = 0; i < row.elements.length; i++) {
            //         switch (row.elements[i].formType) {
            //             case 'row':
            //                 $row.append(this.renderRow(row.elements[i], fvalues));
            //                 break;
            //             case 'group':
            //                 $row.append(this.renderGroup(row.elements[i], fvalues));
            //                 break;
            //             case 'field':
            //                 $row.append(this.renderField(row.elements[i], fvalues));
            //                 break;
            //         }
            //     }
            //
            //     return $row;
            // },
            //
            // renderSubmitButton: function () {
            //     var $button = jQuery('<div>'),
            //         $submit = jQuery('<input>');
            //
            //     $button.addClass('col-sm-offset-5 col-xs-2') // Offset 5 i amplada del botó del botó 2
            //         .append($submit);
            //
            //     // Alerta[Xavi] Eliminem el botó d'enviar, s'ha d'enviar via el botó de guardar
            //     //$submit.attr('type', 'submit')
            //     //    .val('Enviar')
            //     //    .attr('name', 'submit')
            //     //    .addClass('form-control btn btn-default');
            //     return $button;
            // }

            render: function (data, context, $content) {

                console.log(data, context, $content);

                var $doc = jQuery('<div>'),
                    $form = jQuery('<div>');

                $form.attr('id', 'project_view_' + data.id);
                $doc.addClass('container-fluid ioc-bootstrap').append($form);
                data.elements.sort(this.comparePriority);

                for (var i = 0; i < data.elements.length; i++) {
                    switch (data.elements[i].formType) {
                        case 'row':   $form.append(this.renderRow(data.elements[i], data.formValues)); break;
                        case 'group': $form.append(this.renderGroup(data.elements[i], data.formValues)); break;
                        case 'field': $form.append(this.renderField(data.elements[i], data.formValues)); break;
                    }
                }
                return $doc;
            }
        });
});