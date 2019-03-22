define([
    "dojo/_base/declare",
    "ioc/gui/content/engines/_abstractFormRenderEngine",
    'ioc/widgets/WidgetFactory',
    "ioc/gui/content/engines/_viewFormRenderEngine",
], function (declare, AbstractFormRenderEngine, widgetFactory, ViewFormRenderEngine) {

    var createAMDWidget = function (data, nodeId) {
        widgetFactory.addWidgetToNode(data, nodeId)
    };

    return declare([AbstractFormRenderEngine],
        {
            viewRenderer: null,

            render: function (data, context, $content) {
                console.log("_partialEditFormRenderEngine#render", data);

                this.viewRenderer = new ViewFormRenderEngine();


                var $doc = jQuery('<div>'),
                    $form = jQuery('<form>');
                var $collapse = jQuery('<span>'),
                    $expand = jQuery('<span>');

                $form.attr('id', 'form_' + data.id);

                $doc.addClass('container-fluid ioc-bootstrap'); // Si fem servir 'container' la amplada màxima es ~1200px
                this._setCollapseAllAndExpandAllButtons($doc, $collapse, $expand);
                $doc.append($form);
                data.elements.sort(this.comparePriority);

                for (var i = 0; i < data.elements.length; i++) {
                    console.log("Formtype?", data.elements[i].formType);

                    switch (data.elements[i].formType) {
                        case 'row':
                            var $row = this.renderRow(data.elements[i], data.formValues);
                            $form.append($row);
                            break;

                        case 'group':
                            var $group = this.renderGroup(data.elements[i], data.formValues)
                            $form.append($group);

                            break;

                        case 'field':
                            var $fieldEdit = this.renderField(data.elements[i], data.formValues);
                            $form.append($fieldEdit);
                            this.convertToPartialField($fieldEdit, $form, data.elements[i], data.formValues);

                            break;


                        case 'amd':
                            // En au
                            // ALERTA[Xavi] Aquesta no és la id del component, si no la id del lloc on s'afegirà
                            var token = Date.now() + Math.ceil(Math.random() * 16);
                            var $input = jQuery('<div>');
                            $input.attr('id', token);
                            createAMDWidget(data, token);
                            break;
                    }
                }
                if (this.nCollapsableGruops == 0) {
                    $collapse.hide();
                    $expand.hide();
                }

                return $doc;
            },

            convertToPartialField($fieldEdit, $container, element, values) {

                // Amagar la cel·la edició i afegir-la.
                $fieldEdit.css('display', 'none');

                console.log("Afegint fieldEdit", $fieldEdit);
                $container.append($fieldEdit);

                // Generar la cel·la de vista i afegir-la
                var $fieldView = this.viewRenderer.renderField(element, values);
                $container.append($fieldView);

                $fieldView.on('dblclick', function() {
                    console.log("Doble click a ", jQuery(this));
                });

                console.log("Afegint fieldView", $fieldView);



                // TODO
                // Afegir un listener pel doble click a $rowView que amagui el edit i mostri el edit
                // Afegir un listener a edició que actualitzi el view i s'amagui i mostri la vista en finalitzar la edició


                // var $fieldEdit = this.renderField(data.elements[i], data.formValues);
                // $form.append($fieldEdit));

                // ALERTA[Xavi] Compte amb el canvi de contexte als listeners, pot ser es millor afegir una unique id
                // per lligar els camps. Per utilitzar directament els objectes s'hauria de cridar a una nova funció
                // per crear un closure únic per cada parell de nodes.

                // CAnviar el icon al passa sobre el $fieldView (css)

                // Habilitar el botó de desar.

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
                            var $fieldEdit = this.renderField(data.elements[i], data.formValues);
                            this.convertToPartialField($fieldEdit, $form, data.elements[i], data.formValues);
                            $row.append(this.renderField(row.elements[i], fvalues));
                            break;
                    }
                }

                return $row;
            },

            renderGroup: function (group, fvalues) {
                // console.log("_abstractFormRenderEngine#RenderGroup:", group, fvalues);
                var fields,
                    $group = '',
                    $header,
                    cols = group.columns || 12,
                    collapsable = false,
                    collapsed = false;

                if (!group.elements || group.elements.length == 0) {
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
                        var $collapseIcon = jQuery('<span class="collapse-icon"><span class="' + (collapsed ? 'collapsed" data-collapsed=true' : '"') + '></span></span>');

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

                    console.log("_partialFormRenderEngine#render formType", group.elements[i].formType);
                    switch (group.elements[i].formType) {
                        case 'row':
                            $element = this.renderRow(fields[i], fvalues);
                            $group.append($element);
                            break;

                        case 'group':
                            $element = this.renderGroup(fields[i], fvalues);
                            group.append($element)
                            break;

                        case 'field':
                            $element = this.renderField(fields[i], fvalues);
                            $group.append($element);
                            this.convertToPartialField($element, $group, fields[i], fvalues);


                            break;

                        default:
                            console.log("Element no reconegut. No s'ha rendertizat", fields[i], fvalues);
                    }

                    if ($element) {
                        // $group.append($element);

                        if (collapsable && collapsed) {
                            $element.css('display', 'none');
                        }
                    }

                }

                if (group.id) {
                    $group.attr('id', group.id);
                }
                $group.addClass('form-group col-xs-' + cols); // input-group o form-group?
                if (group.config && group.config.columns_offset) {
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
                    var height = (padding + border) * 2 + lineheight * group.rows;

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

                    case 'amd':
                        $field = this.renderWidget(field, fvalues);
                        break;

                    default:
                        $field = this.renderFieldDefault(field, fvalues);
                }

                if (field.type !== 'hidden') {
                    $field.addClass('col-xs-' + cols);
                    $field.addClass('pair-label-field');
                    if (field.config && field.config.columns_offset) {
                        $field.addClass('col-xs-offset-' + field.config.columns_offset);
                    }
                }

                // Padding 6px, border 1px, line height 20px

                return $field;
            },

        });
});