define([
    "dojo/_base/declare",
    "ioc/gui/content/engines/_abstractFormRenderEngine",
    'ioc/widgets/WidgetFactory',
], function (declare, AbstractFormRenderEngine, widgetFactory) {

    var createAMDWidget = function (data, nodeId) {
        widgetFactory.addWidgetToNode(data, nodeId)
    };

    return declare([AbstractFormRenderEngine],
        {

            render: function (data, context, $content) {

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
                    switch (data.elements[i].formType) {
                        case 'row':
                            $form.append(this.renderRow(data.elements[i], data.formValues));
                            break;
                        case 'group':
                            $form.append(this.renderGroup(data.elements[i], data.formValues));
                            break;
                        case 'field':
                            $form.append(this.renderField(data.elements[i], data.formValues));
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
                if(this.nCollapsableGruops==0){
                    $collapse.hide();
                    $expand.hide();
                }

                return $doc;
            },

            renderWidget: function (field, fvalues) {

                // Si es un string no cal fer res, no hi ha alternativa de representació. En aquest cas el widget ha de
                // gestionar internament la vista i el readonly.

                if (typeof field.config.class === 'string') {
                    return this.inherited(arguments);
                }

                if (field.config.readonly === true && field.config.class.view) {
                    // Es readonly i hi ha un widget diferent per la vista
                    field.config.class = field.config.class.view;
                } else {

                    // No es readonly o es readonly però ho gestiona el mateix widget.
                    field.config.class = field.config.class.edit;

                }

                return this.inherited(arguments);
            },

            // renderRow: function() {
            //     return this.inherited(arguments);
            // },
            //
            // renderGroup: function() {
            //     return this.inherited(arguments);
            // }
        });
});