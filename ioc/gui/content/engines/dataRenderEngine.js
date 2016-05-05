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

    return function (data) {


        var $container = jQuery('<div id="container_' + data.id + '"></div>'),
            $form = jQuery(data.content).find('form').clone(), //canviar
            $textarea = $form.find('textarea');

        $container.append('<div id="toolbar_' + data.id + '"></div>');
        $form.attr('id', 'form_' + data.id);

        $textarea.attr('id', 'textarea_' + data.id);
        $textarea.val(jQuery.trim($textarea.val()));

        // TODO afegir el beforeContent
        $container.append($form);
        // TODO afegir el afterContent


        return $container;
    }
});