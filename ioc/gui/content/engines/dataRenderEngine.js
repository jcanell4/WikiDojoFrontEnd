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
            $form = jQuery(data.content).find('form').clone();

        $container.append('<div id="toolbar_' + data.id + '"></div>');
        $form.attr('id', 'form_' + data.id);
        $form.find('textarea').attr('id', 'textarea_'+data.id);
        $container.append($form);

        return $container;
    }
});