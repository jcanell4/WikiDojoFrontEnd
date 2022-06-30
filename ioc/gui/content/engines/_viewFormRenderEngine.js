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
                        .addClass('view-field')
                        .attr('title', field.label);
                    
                    if (field.type === "date") {
                        $data.html(this.convertToDateDMY(fvalues[field.name]));
                    }else {
                        $data.html(fvalues[field.name]);
                    }
                }
                
                if (field.props) {
                    this.addPropsToInput(field.props, $data);
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
                            value = field.config.options[i].description?field.config.options[i].description:field.config.options[i].value;
                        }
                    }
                    $data.attr('name', field.name)
                        .html(value)
                        .addClass('view-field')
                        .attr('title', field.label);
                }
                if (field.props) {
                    this.addPropsToInput(field.props, $data);
                }                
                return $field;
            },

            renderFieldDataList: function (field, fvalues) {
                return this.renderFieldSelect(field, fvalues);
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
                if (field.props) {
                    this.addPropsToInput(field.props, $textarea);
                }
                return $field;
            },

            renderFieldCheckbox: function (field, fvalues) {
                var $field = jQuery('<div>'),
                    $group = jQuery('<div>'),
                    $span = jQuery('<span>'),
                    $data = jQuery('<span>'),
                    $label = jQuery('<input>'),
                    $nolabel = jQuery('<label>');
        
                $nolabel.html(" ");
                $field.append($nolabel).append($group);

                $label.attr('readonly', true)
                    .addClass('form-control')
                    .addClass('check-label')
                    .val(field.label)
                    .attr('type', 'text')
                    .attr('title', field.label);

                $span.addClass('input-group-addon')
                    .append($data);

                $group.addClass('input-group')
                    .append($span)
                    .append($label);

                $data.addClass('view-check');
                if(fvalues[field.name]==="true" || fvalues[field.name]==="on" || fvalues[field.name]===true){
                    $data.addClass('view-checked');
                }
                if (field.props) {
                    this.addPropsToInput(field.props, $data);
                }
                
                return $field;
            },

            // @overwrite
            renderButton: function (field, fvalues) {
                var $field = jQuery('<div>');
                return $field;
            },
            
            render: function (data, context, $content) {
                // console.log("render original:", data, context, $content);

                var $doc = jQuery('<div>'),
                    $form = jQuery('<div>');
                var $collapse = jQuery('<span>'),
                    $expand = jQuery('<span>');


                $form.attr('id', 'project_view_' + data.id);
                $doc.addClass('container-fluid ioc-bootstrap');
                this._setCollapseAllAndExpandAllButtons($doc, $collapse, $expand);
                $doc.append($form);
                data.elements.sort(this.comparePriority);

                for (var i = 0; i < data.elements.length; i++) {
                    switch (data.elements[i].formType) {
                        case 'row':   $form.append(this.renderRow(data.elements[i], data.formValues)); break;
                        case 'group': $form.append(this.renderGroup(data.elements[i], data.formValues)); break;
                        case 'field': $form.append(this.renderField(data.elements[i], data.formValues)); break;
                    }
                }
                if(this.nCollapsableGruops==0){
                    $collapse.hide();
                    $expand.hide();
                }
                return $doc;
            },
            addPropsToInput: function (props, $tag) {
                for (var prop in props) {
                    switch (prop){
                        case "accesskey":
                        case "contenteditable":
                        case "dir":
                        case "draggable":
                        case "dropzone":
                        case "hidden":
                        case "id":
                        case "lang":
                        case "spellcheck":
                        case "style":
                        case "tabindex":
                        case "title":
                        case "translate":
                            $tag.attr(prop, props[prop]);
                            break;                            
                        default :
                            if(prop.indexOf("data-")>-1){
                                $tag.attr(prop, props[prop]);
                            }
                    }
                }
            },

            renderWidget: function (field, fvalues) {

                if ((field.config.readonly === true || this._options.type === "view") && field.config.class.view) {
                    // Es readonly i hi ha un widget diferent per la vista
                    field.config.class = field.config.class.view;
                } else {
                    // No es readonly o es readonly però ho gestiona el mateix widget.
                    field.config.class = field.config.class.edit;
                }

                return this.inherited(arguments);
            },
        });
});
