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
        //console.log("Render partial:", data);
        //data = JSON.parse(JSON.stringify(data));
        var $doc, $forms;

        $doc = jQuery(data.html);

        $doc.find('form');
        $forms = $doc.find('form');

        $forms.each(function () {
            jQuery(this).remove();

        });

        return $doc;
    }
});