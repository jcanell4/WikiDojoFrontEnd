/**
 * Aquest render mostra les dades d'un formulari en un format estàtic (readonly)
 * @module viewFormRenderEngine
 * @culpable Rafael
 */
define([], function () {

    // Si obj1.priority es major, es colocarà abans
    var comparePriority = function (obj1, obj2) {
            if (!obj1) {
                return obj2.priority || 0;
            }else if (!obj2) {
                return obj1.priority;
            }else {
                return obj2.priority - obj1.priority;
            }
        },

        renderGroup = function (group, fvalues) {
            var fields,
                $group = '',
                $header,
                cols = group.columns || 12;

            if (group.elements) {
                $group = jQuery('<div>');
                fields = group.elements.sort(comparePriority);
                
                // renderitzar el marc i titol
                if (group.title) {
                    $header = jQuery('<p>')
                        .addClass('h2')
                        .html(group.title);

                    $group.append($header);
                }
                
                if (group.frame) {
                    $group.addClass('form-frame');
                } else {
                    $group.addClass('form-without-frame');
                }

                for (var i = 0; i < fields.length; i++) {
                    switch (group.elements[i].formType) {
                        case 'row':   $group.append(renderRow(fields[i], fvalues)); break;
                        case 'group': $group.append(renderGroup(fields[i], fvalues)); break;
                        case 'field': $group.append(renderField(fields[i], fvalues)); break;
                    }
                }

                if (group.id) {
                    $group.attr('id', group.id);
                }
                $group.addClass('form-group col-xs-' + cols); // input-group o form-group?
            }

            return $group;

        },

        renderField = function (field, fvalues) {
            var $field,
                cols = field.columns || 12;

            switch (field.type) {
                case 'hidden':
                    return;
                    
                case 'textarea':
                    $field = renderFieldTextarea(field, fvalues);
                    break;

                case 'select':
                    $field = renderFieldSelect(field, fvalues);
                    break;
                    
                case 'checkbox':
                case 'radio':
                    $field = renderFieldCheckbox(field, fvalues);
                    break;

                default:
                    $field = renderFieldDefault(field, fvalues);
            }

            $field.addClass('col-xs-' + cols);

            return $field;
        },

        renderFieldDefault = function (field, fvalues) {
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

        renderFieldSelect = function (field, fvalues) {
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

        renderFieldTextarea = function (field, fvalues) {
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

        renderFieldCheckbox = function (field, fvalues) {
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

        renderRow = function (row, fvalues) {
            var $row = jQuery('<div>'),
                $header, $title;

            $row.addClass('row');

            if (row.title) {
                $header = jQuery('<div>')
                    .addClass('col-xs-12');

                $title = jQuery('<p>')
                    .addClass('h1')
                    .html(row.title);

                $row.append($header.append($title));
            }

            row.elements.sort(comparePriority);

            if (row.id) {
                $row.attr('id', row.id);
            }

            for (var i = 0; i < row.elements.length; i++) {
                switch (row.elements[i].formType) {
                    case 'row':   $row.append(renderRow(row.elements[i], fvalues)); break;
                    case 'group': $row.append(renderGroup(row.elements[i], fvalues)); break;
                    case 'field': $row.append(renderField(row.elements[i], fvalues)); break;
                }
            }

            return $row;
        };


    return function (data) {
        var $doc = jQuery('<div>'),
            $form = jQuery('<div>');

        $form.attr('id', 'project_view_' + data.id);
        // Si fem servir 'container' la amplada màxima es ~1200px
        $doc.addClass('container-fluid ioc-bootstrap').append($form);
        data.elements.sort(comparePriority);

        for (var i = 0; i < data.elements.length; i++) {
            switch (data.elements[i].formType) {
                case 'row':   $form.append(renderRow(data.elements[i], data.formValues)); break;
                case 'group': $form.append(renderGroup(data.elements[i], data.formValues)); break;
                case 'field': $form.append(renderField(data.elements[i], data.formValues)); break;
            }
        }
        return $doc;
    };
});
