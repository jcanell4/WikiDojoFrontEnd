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
                id,
                $candidateHeaders = jQuery($form.closest('div')).prevAll(':header');

            for (var i = 0; i < $candidateHeaders.length; i++) {
                if ($candidateHeaders[i].className.indexOf("sectionedit") > -1) {
                    id = $candidateHeaders[i].id;
                    break;
                }
            }

            $form.find('div.no').append('<input type="hidden" value="' + id + '" name="section_id"/>');
        });

        return $doc;
    }
});