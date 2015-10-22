/**
 * @module htmlEngineFactory
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
        var $doc, $forms;

        $doc = jQuery(data);

        $forms = $doc.find('form');

        $forms.each(function () {
            var $form = jQuery(this).parent(),
                id = jQuery(this).parent().prev().prev().attr('id');
            $form.find('div.no').append('<input type="hidden" value="' + id + '" name="section_id"></input>');
        });

        return $doc;
    }
});