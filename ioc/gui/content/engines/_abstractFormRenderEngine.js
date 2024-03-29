define([
    "dojo/_base/declare",
    'ioc/widgets/WidgetFactory',
], function (declare, widgetFactory) {

    var createAMDWidget = function (data, nodeId) {
        widgetFactory.addWidgetToNode(data, nodeId)
    };

    return declare(null, {

        nCollapsableGruops: 0,
        /**
         * Si obj1.priority es major, es colocarà abans
         * @param obj1
         * @param obj2
         * @returns {*}
         */
        comparePriority: function (obj1, obj2) {
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
            // console.log("_abstractFormRenderEngine#RenderGroup:", group);
            var fields,
                $group = '',
                $header,
                cols = group.columns || 12,
                collapsable = false,
                collapsed = false;

            if(!group.elements || group.elements.length==0){
                return;
            }


            if (group.config) {
                collapsable = group.config.collapsable ? true : false;
                collapsed = group.config.collapsed ? true : false;
            }


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

                    $group.addClass('collapsable-frame');
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

        // Aquesta funció gestiona la tecla enter per solucionar el bug que fa
        // que es canvii el focus a un editor ACE i s'activi el primer botó de la toolbar
        manageEnter: function(e) {
            if(e.which === 13) {
                e.preventDefault();
                jQuery(this).blur()
            }
        },

        renderField: function (field, fvalues) {
            // console.log("_abstractFormRenderEngine#RenderField:", field.type, fvalues);

            var $field,
                cols = field.columns || 12;

            switch (field.type) {
                case 'array':
                case 'table':
                case 'objectArray':
                    if(!field.props){
                        field.props = {"data-editable-element":"table"};
                    }
                    if(!field.props["data-editable-element"]){
                        field.props["data-editable-element"]="table";
                    }
                case 'editableArray':
                case 'editableTable':
                case 'editableObject':
                    $field = this.renderFieldEditableObject(field, fvalues);
                    break;

                case 'textarea':
                    $field = this.renderFieldTextarea(field, fvalues);
                    $field.find('textarea').keypress(this.manageEnter)
                    break;

                case 'select':
                    $field = this.renderFieldSelect(field, fvalues);
                    break;

                case 'datalist':
                    $field = this.renderFieldDataList(field, fvalues);
                    break;

                case 'checkbox': // TODO[Xavi] No s'ajusta correctament l'amplada
                case 'radio':
                    $field = this.renderFieldCheckbox(field, fvalues);
                    break;

                case 'image':
                    $field = this.renderImage(field, fvalues);
                    break;

                case 'amd':
                    $field = this.renderWidget(field, fvalues);
                    break;

                default:
                    $field = this.renderFieldDefault(field, fvalues);
                    $field.find('input').keypress(this.manageEnter)
            }

            if (field.type !== 'hidden') {
                $field.addClass('col-xs-' + cols);
                $field.addClass('pair-label-field');
                if (field.config && field.config.columns_offset){
                    $field.addClass('col-xs-offset-' + field.config.columns_offset); 
                }
            }

            // Padding 6px, border 1px, line height 20px

            $field.find('label').attr('data-error-id', field.id);

            return $field;
        },

        renderWidget: function (field, fvalues) {

            if (!field.config.class || typeof field.config.class !== 'string') {
                return this.renderFieldDefault(field, fvalues);
            }

            // ALERTA[Xavi] Aquesta no és la id del component, si no la id del lloc on s'afegirà
            var token = field.name + (Date.now() + Math.ceil(Math.random() * 16));
            // var token = Date.now() + Math.ceil(Math.random() * 16);

            var $input = jQuery('<div>');
            $input.attr('id', token);

            field.config.data.value = fvalues[field.name];

            createAMDWidget(field.config, token);

            var $field = jQuery('<div>');
            var $label = jQuery('<label>');

            $label.html(field.label);

            $field.append($label)
                .append($input);

            return $field;
        },

        renderFieldDefault: function (field, fvalues) {
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $input = jQuery('<input>'),
                value = fvalues[field.name];

            if (Array.isArray(value)) {
                value = JSON.stringify(value);
            }

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
                    $input.val(value);
                }else {
                    $input.val(this.convertToDateDMY(value));
                }
            }else {
                $input.val(value);
            }

            if (field.id) {
                $input.attr('id', field.id);
            }

            if (field.props) {
                this.addPropsToInput(field.props, $input);
            }

            return $field;
        },

        renderFieldDataList: function (field, fvalues) {
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $input = jQuery('<input>'),
                $select = jQuery('<datalist>');

            $label.html(field.label);

            $field.append($label)
                .append($input)
                .append($select);
            
            $input.attr('type', 'text')
                .attr('list', 'dl_'+field.name)
                .attr('name', field.name)
                .val(fvalues[field.name])
                .addClass('form-control');
                        
            $select.attr('id', 'dl_'+field.name);

            if (field.id) {
                $input.attr('id', field.id);
            }

            this.addOptionsToSelect(field.config.options, $select, fvalues[field.name]);

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

                if (field.props.readonly) {
                    $select.prop("disabled",true);
                }
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
            
                if(typeof valueSelected == "string"){
                    switch(typeof options[i].value){
                        case "boolean":
                            valueSelected = valueSelected.toLowerCase()=="true"
                                            || valueSelected.toLowerCase()=="yes"
                                            || valueSelected.toLowerCase()=="si"
                                            || valueSelected.toLowerCase()=="on";
                            break;
                        case "Number":
                            valueSelected = Number(valueSelected);
                            break;
                    }
                }
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
                $title = jQuery('<input>'),
                $label = jQuery('<label>');
        
            $label.html(field.label);
            $field.append($label).append($group);

            $title.attr('readonly', true)
                .addClass('form-control')
                .addClass('check-label')
                .val(field.props.title)
                .attr('type', 'text')
                .attr('title', field.props.title);

            $span.addClass('input-group-addon')
                .append($input);

            $group.addClass('input-group')
                .append($span)
                .append($title);

            $input.attr('type', field.type)
                .attr('name', field.name)
                .val("true")
                .prop("checked", fvalues[field.name]==="true" || fvalues[field.name]==="on" || fvalues[field.name]===true);

            if (field.id) {
                $input.attr('id', field.id);
            }

            if (field.props) {
                this.addPropsToInput(field.props, $input);

                if (field.props.readonly) {
                    $input.prop("disabled",true);
                }
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
            }else if(field.label!==""){
                $field.append($label);
                $label.html(field.name);
                $field.attr("title", field.name);
            }
            $field.append($editableObject);
            
            if (field.props.readonly) {
                let $hidden =  jQuery('<input type="hidden" name="' + field.name + '" id="' + field.name + '"/>');
                if (Array.isArray(fvalues[field.name])) {
                    $hidden.val(JSON.stringify(fvalues[field.name]));
                }else{
                    $hidden.val(fvalues[field.name]);
                }
                $field.append($hidden);
            }
            return $field;
        },

        renderFieldTable: function (field, fvalues) {
            var ret;
            if(field.type == "array" || field.type=="editableArray"){
                ret = this._renderFieldTableArray(field, fvalues);
            }else if(field.type == "table" || field.type=="editableTable"){
                ret = this._renderFieldTableTable(field, fvalues);
            }else{
                ret = this._renderFieldTableObject(field, fvalues);
            }
            return ret;
        },
        
        _renderFieldTableArray: function (field, fvalues) {
            var data;
            var value = fvalues[field.name] || field.value;

            if(typeof value ==="string"){
                data = JSON.parse(value);
            }else{
                data = value;
            }

            var $table = jQuery('<table></table>');
            $table.attr('id', field.id);

            var $body = jQuery('<tbody></tbody>');
            var dato;
            
            // Afegim les files
            for (var i = 0; i < data.length; i++) {
                var $row = jQuery('<tr></tr>');
                var $col = jQuery('<td></td>');
                
                if(field.config.typeDef==="date"){
                    dato = this.convertToDateDMY(data[i]);
                }else{
                    dato =  data[i];
                }
                
                $col.attr('data-field', "col0");
                $col.attr('data-originalValue', data[i]);
                $col.html(dato);
                $row.append($col);
                $body.append($row);
            }

            $table.append($body);

            if (field.props) {
                this.addPropsToInput(field.props, $table);
            }
            return $table;
        },
        
        _renderFieldTableTable: function (field, fvalues) {
            var data;
            var value = fvalues[field.name] || field.value;

            if(typeof value ==="string"){
                data = JSON.parse(value);
            }else{
                data = value;
            }

            var $table = jQuery('<table></table>');
            $table.attr('id', field.id);

            var $body = jQuery('<tbody></tbody>');
            var dato;
            
            // Afegim les files
            for (var i = 0; i < data.length; i++) {
                var $row = jQuery('<tr></tr>');
                
                var $cols = [];
                // Creem una cel·la buida per cada columna
                for (var j =0; j<field.config.array_columns; j++) {
                    var $col = jQuery('<td></td>');
                    $cols.push($col);
                }

                for (var key=0; key<data[i].length; key++) {
                    var colNumber = key;

                    if(field.config.typeDef==="date"){
                        dato = this.convertToDateDMY(data[i][key]);
                    }else {
                        dato = data[i][key];
                    }
                    //tratamiento especial para los campos de fecha de las tablas
                    $cols[colNumber].attr('data-field', "col"+key);
                    $cols[colNumber].attr('data-originalValue', data[i][key]);
                    $cols[colNumber].html(dato);
                    //$col = jQuery('<td data-field="'+key+'" data-originalvalue="' + data[i][key] + '">' + dato + '</td>');
                }

                for (var j=0; j<field.config.array_columns; j++) {
                    $row.append($cols[j]);
                }
                
                $body.append($row);
            }

            $table.append($body);

            if (field.props) {
                this.addPropsToInput(field.props, $table);
            }
            return $table;            
        },
        
        _renderFieldTableObject: function (field, fvalues) {
            // console.log("render table:", field, fvalues);
            var data;
            var value = fvalues[field.name] || field.value;

            if(typeof value ==="string"){
                data = JSON.parse(value);
            }else{
                data = value;
            }

            var $table = jQuery('<table></table>');
            $table.attr('id', field.id);

            var $header = jQuery('<thead></thead>');
            var $body = jQuery('<tbody></tbody>');

            // Agafem les claus de la primera fila per afegir la capñalera
            // ALERTA[Xavi] La capçalera està formada pels continguts de field.config.display_fields si eisteix i
            // en aquest ordre. Només es mostren les columnes indicades.
            var $row = jQuery('<tr></tr>');
            var first = true;

            var headerRow = field.config.display_fields ||
                field.config.defaultRow;

            var fieldToCol = {};
            var colCounter=0;

            // for (var key in data[0]) {
            for (var key in headerRow) {

                if (field.config.display_fields) {
                    // en aquest cas key és l'index, hem de fer la conversió
                    key = headerRow[key];
                }

                var fieldName = this.getDataFieldNameIfExists(headerRow, key, field.config.layout) || key;
                fieldToCol[key] = colCounter++;
                var extra = '';

                if (fieldName) {
                    //console.log("Trobat extra:", key, defaultRow[key].name);
                    extra += 'data-field="' + key + '"';
                }

                var $col = jQuery('<th '+extra+'>' + fieldName  + '</th>');

                var witdth = this.getLayoudDataIfExists(key, field.config.layout, "width");
                if(witdth){
                    $col.css("width", witdth);
                }
                //var $col = jQuery('<th >' + key + '</th>');

                // ALERTA[Xavi]! Posem la primera fila com a readonly manualment.
                if (first) {
                    first = false;
                    $row.attr('readonly', true);
                }
                $row.append($col);
            }

            $header.append($row);
            $table.append($header);

            var dato;
            // Afegim les files
            for (var i = 0; data && i < data.length; i++) {
                $row = jQuery('<tr></tr>');
                var $cols = [];

                // Creem una cel·la buida per cada columna
                for (var j =0; j<colCounter; j++) {
                    $col = jQuery('<td></td>');
                    $cols.push($col);
                }

                for (key in data[i]) {
                    var colNumber = fieldToCol[key];
                    if (colNumber === undefined) {
                        // Si no s'ha afegit la columna s'ignora la dada
                        continue;
                    }

                    if (!field.config.fields[key]) {
                        console.error("Key " + key + " not found.", field.config.fields);
                        continue;
                    }

                    let fieldType = field.config.fields[key].type;
                    if (fieldType === "date") {
                        dato = this.convertToDateDMY(data[i][key]);
                    } else if (fieldType === "tree") {
                        dato = JSON.stringify(data[i][key]);
                    }else {
                        dato = data[i][key];
                    }

                    //tratamiento especial para los campos de fecha de las tablas
                    $cols[colNumber].attr('data-field', key);

                    let originalValue = typeof data[i][key] === "object" ? JSON.stringify(data[i][key]) : data[i][key];
                    $cols[colNumber].attr('data-originalValue', originalValue);
                    // $cols[colNumber].attr('data-originalValue', data[i][key]);
                    $cols[colNumber].html(dato);
                    //$col = jQuery('<td data-field="'+key+'" data-originalvalue="' + data[i][key] + '">' + dato + '</td>');
                }

                for (var j=0; j<colCounter; j++) {
                    $row.append($cols[j]);
                }

                $body.append($row);
            }

            $table.append($body);

            if (field.props) {
                this.addPropsToInput(field.props, $table);
            }

            return $table;
        },

        renderButton: function (field, fvalues) {
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $data = jQuery('<button>');

            if (field.type !== 'hidden') {
                $label.html(field.label);
                $field.append($label)
                    .append($data);

                $data.attr('name', field.name)
                    .addClass('form-control')
                    .attr('title', field.label);

                $data.html(fvalues[field.name]);
            }
            if (field.props) {
                this.addPropsToInput(field.props, $data);
            }
            return $field;
        },

        renderSubmitButton: function () {
            var $button = jQuery('<div>'),
                $submit = jQuery('<input>');

            $button.addClass('col-sm-offset-5 col-xs-2') // Offset 5 i amplada del botó del botó 2
                .append($submit);

            return $button;
        },

        getLayoudDataIfExists: function(fieldKey, layout, layoutKey) {
            // Si no existeix el layout el cerca al config
            if (!layout) {
                return false;
            }

            for (var i=0;i<layout.length;i++) {

                for (var j=0; j<layout[i].cells.length; j++) {
                    if (layout[i].cells[j].field === fieldKey) {
                        var ret = false;
                        if(layout[i].cells[j][layoutKey] !== undefined){
                            ret = layout[i].cells[j][layoutKey];
                        }else if(layout[i].defaultCell[layoutKey]){
                            ret = layout[i].defaultCell[layoutKey];
                        }
                        return ret;
                    }
                }
            }

            return false;
        },

        getDataFieldNameIfExists: function(row, fieldKey, layout) {

            // Si no existeix el layout el cerca al config
            if (!layout) {

                return row[fieldKey] && row[fieldKey].name ? row[fieldKey].name : null;
            }

            for (var i=0;i<layout.length;i++) {

                for (var j=0; j<layout[i].cells.length; j++) {
                    if (layout[i].cells[j].field === fieldKey && layout[i].cells[j].name !== undefined) {
                        return layout[i].cells[j].name;
                    }
                }
            }

            return false;
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

        render: function (data, context, $content) {
            throw new Error("El mètode render ha de ser implementat per les subclasses");
        },

        _setCollapseAllAndExpandAllButtons: function($doc, $collapse, $expand){            
            $collapse.addClass("collapseAll-icon");
            $collapse.attr('title', "compacta tots els grups de dades originalment compactats");
            $collapse.click(function(event){
                $collapse.parent().parent().find(".collapse-icon span[data-collapsed=true]").not(".collapsed").trigger("click");
            });
            $doc.append($collapse);
            $expand.addClass("expandAll-icon");
            $expand.attr('title', "expandeix tots els grups de dades");
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

        //Convierte una fecha a formato "dd-mm-yyyy". El formato esperado es ISO "yyyy-mm-dd"
        convertToDateDMY: function(data) {
            let sdata;

            function pad(s) {
                return (s.length < 2 || s.toString().length < 2) ? '0' + s : s; }
            if (data === "" || data === null || data === undefined) {
                return "dd-mm-aaaa";
            }else if (isNaN(data.substring(0,4))) {
                sdata = data.split(/\/|-/);

                // aquest cas es dona quan el format és incorrecte
                if (sdata.length<3) {
                    sdata = ["00", "00", "0000"];
                }

                return [pad(sdata[0]), pad(sdata[1]), sdata[2]].join('/');
            }else {
                var d = new Date(data);
                return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
            }
        }

    });
    
});
