define([
    "dojo/_base/declare",
    "ioc/gui/content/engines/_abstractFormRenderEngine",
], function (declare, AbstractFormRenderEngine) {

    return declare([AbstractFormRenderEngine],
        {

            renderFieldDefault: function (field, fvalues) {
                var $field = jQuery('<div>'),
                    $label = jQuery('<label>'),
                    $data = jQuery('<span>');
                if (field.type !== 'hidden') {
                    $label.html(field.label);
                    $field.append($label)
                        .append($data);

                    $data.attr('name', field.name)
                        .html(fvalues[field.name])
                        .addClass('view-field')
                        .attr('title', field.label);
                }
                return $field;
            },

            renderFieldSelect: function (field, fvalues) {
                var $field = jQuery('<div>'),
                    $label = jQuery('<label>'),
                    $data = jQuery('<span>'),
                    exit = false,
                    value;
                if (field.type !== 'hidden') {
                    $label.html(field.label);
                    $field.append($label)
                        .append($data);

                    value = fvalues[field.name];
                    for(var i=0; !exit && i<field.config.options.length; i++){
                        exit = field.config.options[i].value===value;
                        if(exit){
                            value = field.config.options[i].description;
                        }
                    }
                    $data.attr('name', field.name)
                        .html(value)
                        .addClass('view-field')
                        .attr('title', field.label);
                }
                return $field;
            },

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

                if (field.rows) {
                    var padding = 6;
                    var border = 1;
                    var lineheight = 20;
                    var height = (padding+border)*2 + lineheight * field.rows;

                    $textarea.css('height', height);
                }



                return $field;
            },

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
            
            render: function (data, context, $content) {

                // console.log(data, context, $content);

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
