/**
 * @module DataEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define(function () {

    /**
     * Afegeix el id de la secció al formulari per enviarlo al servidor com a camp ocult.
     *
     * @param {string} data - codi html al que hem d'afegir un nou camp ocult per passar la id del document al formulari.
     * @returns {string} - document amb el camp section_id afegit
     */

    return function (data, context) {

        // TODO afegir el beforeContent

        var idContainer = 'container_' + data.id,
            $container = jQuery('<div id="container_' + data.id + '" data-editor-container></div>'),
            $form = jQuery(data.htmlForm).find('form').clone(),
            $textarea = $form.find('textarea');

        $container.append('<div id="toolbar_' + data.id + '"></div>');
        $form.attr('id', 'form_' + data.id);

        $textarea.attr('id', 'textarea_' + data.id);
        $textarea.attr('data-doc-id', data.id);
        $textarea.val(data.content);
        $container.append($form);


        $container.on('click', function() {
            context.dispatcher.getGlobalState().setCurrentElement(idContainer, true);
            $textarea.focus();
        });

        // TODO afegir el afterContent


        return $container;
    }
});
