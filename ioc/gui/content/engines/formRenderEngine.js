/**
 * Aquest motor de render espera que el format de les dades sigui string i retorna el mateix contingut
 * o un missatge d'error si no era un string.
 *
 * @module standardEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([], function () {

    /**
     * Si obj1.priority es major, es colocarà abans
     * @param obj1
     * @param obj2
     * @returns {*}
     */
    var comparePriority = function (obj1, obj2) {
            //console.log('formRenderEngine#comparePriority', obj1.priority, obj2.priority);
            if (!obj1) {
                return obj2.priority || 0;
            } else if (!obj2) {
                return obj1.priority;
            } else {
                return obj2.priority - obj1.priority;
            }
        },

        renderGroup = function (group) {
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
                        case 'row':   $group.append(renderRow(fields[i])); break;
                        case 'group': $group.append(renderGroup(fields[i])); break;
                        case 'field': $group.append(renderField(fields[i])); break;
                    }
                }

                if (group.id) {
                    $group.attr('id', group.id);
                }

                $group.addClass('form-group col-xs-' + cols); // input-group o form-group?
            }

            return $group;

        },

        renderField = function (field) {
            var $field,
                cols = field.columns || 12;

            switch (field.type) {
                case 'textarea':
                    $field = renderFieldTextarea(field);
                    break;

                case 'select':
                    $field = renderFieldSelect(field);
                    break;
                    
                case 'checkbox': // TODO[Xavi] No s'ajusta correctament l'amplada
                case 'radio':
                    $field = renderFieldCheckbox(field);
                    break;

                default:
                    $field = renderFieldDefault(field);
            }

            $field.addClass('col-xs-' + cols);

            return $field;
        },


        renderFieldDefault = function (field) {
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $input = jQuery('<input>');

            if (field.type !== 'hidden') {
                $label.html(field.label);
                $field.append($label)
            }


            if (true) { // TODO[Xavi] Afegir un parámetre a field que retornará del servidor i indiacarà si s'ha de mostrar el botó de l'editor

                var $row = jQuery('<div>');
                $row.append($input);

                var $editorButton = jQuery('<button class="btn btn-primary">Editor</button>');
                $editorButton.attr('data-form-editor-button', field.id); // id del camp que al que enllaça l'editor

                $row.append($editorButton);
                $field.append($row);


            } else {
                $field.append($input);
            }





            $input.attr('type', field.type)
                .attr('name', field.name)
                .val(field.value)
                .addClass('form-control')
                .attr('title', field.label);

            if (field.id) {
                $input.attr('id', field.id);
            }

            if (field.props) {
                addPropsToInput(field.props, $input);
            }

            return $field;
        },

        renderFieldSelect = function (field) {
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $select = jQuery('<select>');

            $label.html(field.label);

            $field.append($label)
                .append($select);

            $select.attr('type', field.type)
                .attr('name', field.name)
                .val(field.value)
                .addClass('form-control');

            if (field.id) {
                $select.attr('id', field.id);
            }

            addOptionsToSelect(field.options, $select);

            if (field.props) {
                addPropsToInput(field.props, $select);
            }

            return $field;
        },

        addOptionsToSelect = function (options, $select) {
            var $option;

            for (var i = 0; i < options.length; i++) {
                $option = jQuery('<option>')
                    .val(options[i].value)
                    .html(options[i].description);

                if (options[i].selected) {
                    $option.attr('selected', true);
                }

                $select.append($option);
            }
        },

        renderFieldTextarea = function (field) {
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $textarea = jQuery('<textarea>');

            $label.html(field.label);

            $field.append($label)
                .append($textarea);

            $textarea.attr('name', field.name)
                .val(field.value)
                .addClass('form-control')
                .attr('title', field.label);

            if (field.id) {
                $textarea.attr('id', field.id);
            }

            if (field.props) {
                addPropsToInput(field.props, $textarea);
            }

            return $field;
        },


        renderFieldCheckbox = function (field) {
            var $field = jQuery('<div>'),
                $group = jQuery('<div>'),
                $span = jQuery('<span>'),
                $input = jQuery('<input>'),
                $label = jQuery('<input>');

            $field.append($group);

            $label.attr('readonly', true)
                .addClass('form-control')
                .val(field.label)
                .attr('type', 'text')
                .attr('title', field.label);

            $span.addClass('input-group-addon')
                .append($input);

            $group.addClass('input-group')
                .append($span)
                .append($label);

            $input.attr('type', field.type)
                .attr('name', field.name)
                .val(field.value);

            if (field.id) {
                $input.attr('id', field.id);
            }

            if (field.props) {
                addPropsToInput(field.props, $input);
            }

            return $field;
        },


        addPropsToInput = function (props, $input) {
            for (var prop in props) {
                $input.attr(prop, props[prop]);
            }
        },

        renderRow = function (row) {
            var $row = jQuery('<div>'),
                $header,
                $title;

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
                    case 'row':   $row.append(renderRow(row.elements[i])); break;
                    case 'group': $row.append(renderGroup(row.elements[i])); break;
                    case 'field': $row.append(renderField(row.elements[i])); break;
                }
            }

            return $row;
        },

        renderSubmitButton = function () {
            var $button = jQuery('<div>'),
                $submit = jQuery('<input>');

            $button.addClass('col-sm-offset-5 col-xs-2') // Offset 5 i amplada del botó del botó 2
                .append($submit);

            // Alerta[Xavi] Eliminem el botó d'enviar, s'ha d'enviar via el botó de guardar
            //$submit.attr('type', 'submit')
            //    .val('Enviar')
            //    .attr('name', 'submit')
            //    .addClass('form-control btn btn-default');

            return $button;
        };


    return function (data) {
        var $doc = jQuery('<div>'),
            $form = jQuery('<form>');

        $form.attr('id', 'form_' + data.id);

        $doc.addClass('container-fluid ioc-bootstrap') // Si fem servir 'container' la amplada màxima es ~1200px
            .append($form);

        data.elements.sort(comparePriority);

        for (var i = 0; i < data.elements.length; i++) {
            switch (data.elements[i].formType) {
                case 'row':   $form.append(renderRow(data.elements[i])); break;
                case 'group': $form.append(renderGroup(data.elements[i])); break;
                case 'field': $form.append(renderField(data.elements[i])); break;
            }
        }

        //$form.append(renderSubmitButton());

        return $doc;
    };
});

