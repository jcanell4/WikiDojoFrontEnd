define([
    "dojo/_base/declare",
    "ioc/gui/content/engines/_abstractFormRenderEngine",
], function (declare, AbstractFormRenderEngine) {

    return declare([AbstractFormRenderEngine],
        {

            render: function (data, context, $content) {

                var $doc = jQuery('<div>'),
                    $form = jQuery('<form>');

                $form.attr('id', 'form_' + data.id);

                $doc.addClass('container-fluid ioc-bootstrap') // Si fem servir 'container' la amplada màxima es ~1200px
                    .append($form);

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
                    }
                }

                return $doc;
            }
        });
});