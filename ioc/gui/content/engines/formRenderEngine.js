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
            var fields = group.fields.sort(comparePriority),
                $group = jQuery('<div>'),
                $header,
                cols = group.columns || 12;

            // renderitzar el marc i titol
            if (group.title) {
                $header = jQuery('<p>')
                    .addClass('h2')
                    .html(group.title);

                $group.append($header);
            }

            if (group.hasFrame) {
                $group.addClass('form-frame');
            } else {
                $group.addClass('form-without-frame');
            }

            for (var i = 0; i < fields.length; i++) {
                $group.append(renderField(fields[i]));
            }

            $group.addClass('form-group col-xs-' + cols); // input-group o form-group?

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


            $label.html(field.label);

            $field.append($label)
                .append($input);

            $input.attr('type', field.type)
                .attr('name', field.name)
                .val(field.value)
                .addClass('form-control');

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
                .addClass('form-control');


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
                .val(field.type)
                .attr('type', 'text');

            $span.addClass('input-group-addon')
                .append($input);

            $group.addClass('input-group')
                .append($span)
                .append($label);

            $input.attr('type', field.type)
                .attr('name', field.name)
                .val(field.value);

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

            row.groups.sort(comparePriority);


            for (var i = 0; i < row.groups.length; i++) {
                $row.append(renderGroup(row.groups[i]));
            }

            return $row;
        },

        renderSubmitButton = function () {
            var $button = jQuery('<div>'),
                $submit = jQuery('<input>');

            $button.addClass('col-sm-offset-5 col-xs-2') // Offset 5 i amplada del botó del botó 2
                .append($submit);

            $submit.attr('type', 'submit')
                .val('Enviar')
                .attr('name', 'submit')
                .addClass('form-control btn btn-default');

            return $button;
        };


    return function (data) {
        //console.log("FormRenderEngine", data);

        var $doc = jQuery('<div>'),
            $form = jQuery('<form>');

        $form.attr('id', data.id);

        $doc.addClass('container-fluid ioc-bootstrap') // Si fem servir 'container' la amplada màxima es ~1200px
            .append($form);

        data.rows.sort(comparePriority);

        for (var i = 0; i < data.rows.length; i++) {
            $form.append(renderRow(data.rows[i]));
        }

        $form.append(renderSubmitButton());

        return $doc;
    }
});

