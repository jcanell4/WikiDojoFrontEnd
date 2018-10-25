define([
    "dojo/_base/declare",
], function (declare) {

    return declare(null, {

        nCollapsableGruops: 0,
        /**
         * Si obj1.priority es major, es colocarà abans
         * @param obj1
         * @param obj2
         * @returns {*}
         */
        comparePriority: function (obj1, obj2) {
//            console.log('formRenderEngine#comparePriority', obj1.priority, obj2.priority);
            if (!obj1 && !obj2) {
                return 0;
            }else if (!obj1) {
                return obj2.priority || 0;
            } else if (!obj2) {
                return obj1.priority;
            } else {
                return obj2.priority - obj1.priority;
            }
        },

        renderGroup: function (group, fvalues) {
            // console.log("_abstractFormRenderEngine#RenderGroup:", group, fvalues);
            var fields,
                $group = '',
                $header,
                cols = group.columns || 12,
                collapsable = false,
                collapsed = false;



            if (group.config) {
                collapsable = group.config.collapsable ? true : false;
                collapsed = group.config.collapsed ? true : false;
            }


            if (group.elements) {
                $group = jQuery('<div>');
//                fields = group.elements.sort(this.comparePriority);
                fields = group.elements;

                // renderitzar el marc i titol
                if (group.title) {
                    $header = jQuery('<p>')
                        .addClass('h2')
                        .html(group.title);

                    $group.append($header);

                    if (collapsable) {
                        this.nCollapsableGruops++;
                        // Afegim la icona de desplegable
                        var $collapseIcon = jQuery('<span class="collapse-icon"><span class="' + (collapsed? 'collapsed" data-collapsed=true' : '"') +'></span></span>');

                        $header.append($collapseIcon);

                        $collapseIcon.on('click', this._collapseToggle);
                    }

                }

                if (group.frame) {
                    $group.addClass('form-frame');
                } else {
                    $group.addClass('form-without-frame');
                }

                for (var i = 0; i < fields.length; i++) {
                    var $element;

                    switch (group.elements[i].formType) {
                        case 'row':
                            $element = this.renderRow(fields[i], fvalues);
                            break;

                        case 'group':
                            $element = this.renderGroup(fields[i], fvalues);
                            break;

                        case 'field':
                            $element = this.renderField(fields[i], fvalues);
                            break;

                        default:
                            console.log("Element no reconegut. No s'ha rendertizat", fields[i], fvalues);
                    }

                    if ($element) {
                        $group.append($element);

                        if (collapsable && collapsed) {
                            $element.css('display', 'none');
                        }
                    }

                }

                if (group.id) {
                    $group.attr('id', group.id);
                }
                $group.addClass('form-group col-xs-' + cols); // input-group o form-group?
                if(group.config && group.config.columns_offset){
                    $group.addClass('col-xs-offset-' + group.config.columns_offset); 
                }
            }

            //[JOSEP]: Canviar el paràmetres fixats en el codi pels valors reals
            /*var fs = $group.css("font-size");
             *var lh = $group.css("line-height");
             *var lineheight = jQuery("<div>").css("font-size", fs).css("line-height", lh).text("x").height()
             */
            if (group.rows) {
                var padding = 6;
                var border = 1;
                var lineheight = 20;
                var height = (padding+border)*2 + lineheight * group.rows;

                $group.css('min-height', height);
            }

            return $group;

        },

        renderField: function (field, fvalues) {
            // console.log("_abstractFormRenderEngine#RenderField:", field, fvalues);
            var $field,
                cols = field.columns || 12;

            switch (field.type) {
                case 'editableObject':
                    $field = this.renderFieldEditableObject(field, fvalues);
                    break;

                case 'textarea':
                    $field = this.renderFieldTextarea(field, fvalues);
                    break;

                case 'select':
                    $field = this.renderFieldSelect(field, fvalues);
                    break;

                case 'checkbox': // TODO[Xavi] No s'ajusta correctament l'amplada
                case 'radio':
                    $field = this.renderFieldCheckbox(field, fvalues);
                    break;

                case 'image':
                    $field = this.renderImage(field, fvalues);
                    break;

                default:
                    $field = this.renderFieldDefault(field, fvalues);
            }

            $field.addClass('col-xs-' + cols);
            if (field.config && field.config.columns_offset){
                $field.addClass('col-xs-offset-' + field.config.columns_offset); 
            }

            // Padding 6px, border 1px, line height 20px

            return $field;
        },

        renderFieldDefault: function (field, fvalues) {
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $input = jQuery('<input>');

            if (field.type !== 'hidden') {
                $label.html(field.label);
                $field.append($label);

                // TODO[Xavi] Afegir un parámetre a field que retornará del servidor i indicarà si s'ha de mostrar el botó de l'editor
                if (field.config && field.config.formEditorButton) {
                    $input.attr('data-form-editor-button', field.id);
                }
            }

            $field.append($input);

            $input.attr('type', field.type)
                .attr('name', field.name)
                .addClass('form-control')
                .attr('title', field.label);

            if (field.type === "date") {
                if (this.checkDateInput()) {
                    $input.val(fvalues[field.name]);
                }else {
                    $input.val(this.convertToDateDMY(fvalues[field.name]));
                }
            }else {
                $input.val(fvalues[field.name]);
            }

            if (field.id) {
                $input.attr('id', field.id);
            }

            if (field.props) {
                this.addPropsToInput(field.props, $input);
            }

            return $field;
        },

        renderFieldSelect: function (field, fvalues) {
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $select = jQuery('<select>');

            $label.html(field.label);

            $field.append($label)
                .append($select);

            $select.attr('type', field.type)
                .attr('name', field.name)
                //.val(field.value)
                .val(fvalues[field.name])
                .addClass('form-control');

            if (field.id) {
                $select.attr('id', field.id);
            }

            this.addOptionsToSelect(field.config.options, $select, fvalues[field.name]);

            if (field.props) {
                this.addPropsToInput(field.props, $select);
            }

            return $field;
        },

        addOptionsToSelect: function (options, $select, valueSelected) {
            var $option;

            for (var i = 0; i < options.length; i++) {
                var value = options[i].value;
                var description = options[i].description?options[i].description:options[i].value;
                $option = jQuery('<option>')
                    .val(value)
                    .html(description);

                if (options[i].selected || options[i].value==valueSelected) {
                    $option.attr('selected', true);
                }

                $select.append($option);
            }
        },

        renderFieldTextarea: function (field, fvalues) {
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $textarea = jQuery('<textarea>');

            $label.html(field.label);

            $field.append($label)
                .append($textarea);

            $textarea.attr('name', field.name)
            //.val(field.value)
                .val(fvalues[field.name])
                .addClass('form-control')
                .attr('title', field.label);

            if (field.id) {
                $textarea.attr('id', field.id);
            }

            if (field.rows) {
                $textarea.attr('rows', field.rows);
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
                //.val(field.value);
                .val(fvalues[field.name])
                .prop("checked", fvalues[field.value]);

            if (field.id) {
                $input.attr('id', field.id);
            }

            if (field.props) {
                this.addPropsToInput(field.props, $input);
            }

            return $field;
        },


        renderFieldEditableObject: function (field, fvalues) {
            // console.log("_abstractFormRenderEngine#renderFieldEditableObject:", field, field.props.editableClass);
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $editableObject;

            switch (field.props['data-editable-element']) {
                case 'table':
                    $editableObject = this.renderFieldTable(field, fvalues);
                    break;

                default:
                    alert("error, editable-element no identificat:" + field.props['data-editable-element']);
                    // $field = renderFieldDefault(field, fvalues);
            }

            if (field.id) {
                $editableObject.attr('id', field.id);
            }

            if(field.label && field.name !== field.label){
                $field.append($label);
                $label.html(field.label);
                $field.attr("title", field.label);
            }
            $field.append($editableObject);

            return $field;
        },

        renderFieldTable: function (field, fvalues) {
            var data;
            var value = fvalues[field.name] || field.value;

            if(typeof value ==="string"){
                data = JSON.parse(value);
            }else{
                data = value;
            }

            // if(typeof field.value ==="string"){
            //     data = JSON.parse(field.value);
            // }else{
            //     data = field.value;
            // }

            var $table = jQuery('<table></table>');
            $table.attr('id', field.id);

            var $header = jQuery('<thead></thead>');
            var $body = jQuery('<tbody></tbody>');

            // Agafem les claus de la primera fila per afegir la capñalera
            var $row = jQuery('<tr></tr>');
            var first = true;


            var defaultRow = field.config.defaultRow;

            // for (var key in data[0]) {
            for (var key in defaultRow) {
                var $col = jQuery('<th>' + key + '</th>');

                // ALERTA[Xavi]! Posem la primera fila com a readonly manualment.
                if (first) {
                    first = false;
                    $row.attr('readonly', true);
                }
                $row.append($col);
            }

            $header.append($row);
            $table.append($header);


            // Afegim les files
            for (var i = 0; i < data.length; i++) {
                $row = jQuery('<tr></tr>');

                for (key in data[i]) {
                    $col = jQuery('<td>' + data[i][key] + '</td>');
                    $row.append($col);
                }

                $body.append($row);

            }


            $table.append($body);


            if (field.props) {
                this.addPropsToInput(field.props, $table);
            }

            return $table;
        },

        renderImage: function (field, fvalues) {
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $image = jQuery('<img>');

            $label.html(field.label);

            $field.append($label)
                .append($image);

            $image.attr('title', fvalues[field.label]);    
            if (field.props) {
                $image.attr('src', field.props.src);    
                this.addPropsToInput(field.props, $image);
            }

            if (field.rows) {
                var padding = 6;
                var border = 1;
                var lineheight = 20;
                var height = (padding+border)*2 + lineheight * field.rows;

                $image.css('height', height);
            }



            return $field;                
        },

        addPropsToInput: function (props, $input) {
            for (var prop in props) {
                if (typeof props[prop] === 'object') {
                    $input.attr(prop, JSON.stringify(props[prop]));
                } else {
                    $input.attr(prop, props[prop]);
                }
            }
        },

        renderRow: function (row, fvalues) {
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

            row.elements.sort(this.comparePriority);

            if (row.id) {
                $row.attr('id', row.id);
            }

            for (var i = 0; i < row.elements.length; i++) {
                switch (row.elements[i].formType) {
                    case 'row':
                        $row.append(this.renderRow(row.elements[i], fvalues));
                        break;
                    case 'group':
                        $row.append(this.renderGroup(row.elements[i], fvalues));
                        break;
                    case 'field':
                        $row.append(this.renderField(row.elements[i], fvalues));
                        break;
                }
            }

            return $row;
        },

        // ALERTA[Xavi] Això sembla que no es fa servir en lloc, eliminar?
        renderSubmitButton: function () {
            var $button = jQuery('<div>'),
                $submit = jQuery('<input>');

            $button.addClass('col-sm-offset-5 col-xs-2') // Offset 5 i amplada del botó del botó 2
                .append($submit);

            return $button;
        },

        render: function (data, context, $content) {

            throw new Error("El mètode render ha de ser implementat per les subclasses");
        },

        _setCollapseAllAndExpandAllButtons: function($doc, $collapse, $expand){            
            $collapse.addClass("collapseAll-icon");
            $collapse.attr('title', "compacta tots els grups de dades originalment compactats")
            $collapse.click(function(event){
                $collapse.parent().parent().find(".collapse-icon span[data-collapsed=true]").not(".collapsed").trigger("click");
            });
            $doc.append($collapse);
            $expand.addClass("expandAll-icon");
            $expand.attr('title', "expandeix tots els grups de dades")
            $expand.click(function(event){
                $expand.parent().parent().find(".collapse-icon span.collapsed").trigger("click");
            });
            $doc.append($expand);
        },

        _collapseToggle: function() {
            var $icon = jQuery(this);
            //getting the next element
            var $content = $icon.parent().siblings();
            $icon.parent().parent().css('min-height', 0); // Si fem servir el collapse deshabilitiem la alçada mínima per aquest grup

            //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
            $content.slideToggle(500, function () {
                //execute this after slideToggle is done
                //change text of header based on visibility of content div
                // $icon.text(function () {
                //     //change text based on condition
                //     // TODO: Canviar la icona per altra més adient
                //
                //     if ()
                //
                //     return $content.is(":visible") ? "^" : "v";
                // });

                if ($content.is(":visible")) {
                    $icon.find('span').removeClass('collapsed');
                } else {
                    $icon.find('span').addClass('collapsed');
                }
            });
        },

        //Verifica la existencia del tipo "input type='date'" en el navegador actual
        checkDateInput: function() {
            var input = document.createElement('input');
            input.setAttribute('type', "date");
            return input.type === "date";
        },

        //Convierte una fecha a formato "dd/mm/yyyy". El formato esperado es ISO "yyyy-mm-dd"
        convertToDateDMY: function(data) {
            function pad(s) { return (s.length < 2 || s.toString().length < 2) ? '0' + s : s; }
            if (isNaN(data.substring(0,4))) {
                sdata = data.split(/\/|-/);
                return [pad(sdata[0]), pad(sdata[1]), sdata[2]].join('/');
            }else {
                var d = new Date(data);
                return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
            }
        }

    });
    
});
