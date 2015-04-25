/**
 * Aquesta classe es una Factoria de motors de renderització que permet afegir nous tipus i obtenir els motors pels
 * tipus coneguts.
 *
 * @moudle renderEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([], function () {

    /**
     * Array amb tots els motors de render disponibles per defecte
     *
     * @type {{string: function}}
     */
    var renderEngines = {

            /**
             * Aquest motor de render espera que el format de les dades sigui string i retorna el mateix contingut
             * o un missatge d'error.
             *
             * @param {string} data
             * @returns {string}
             */
            standard: function (data) {
                return typeof data === 'string' ? data : 'Tipus de dada no reconegut.';
            }
        },

        /**
         * Retorna el motor de render pel tipus especificat o un generic si no existeix.
         *
         * @param {string} type - Tipus de motor de render
         * @returns {function} - Motor del tipus especificat o un generic si no s'ha trobat
         * @private
         */
        _getRenderEngine = function (type) {
            return renderEngines[type] ? renderEngines[type] : renderEngines['standard'];
        },

        /**
         * Afegeix el motor de render amb el tipus especificat.
         *
         * @param {string} type - Nom del tipus de motor de render
         * @param {function} renderEngine - Funció que actuará com a motor de render
         * @private
         */
        _addRenderEngine = function (type, renderEngine) {
            renderEngines[type] = renderEngine;
        };

    return {
        // Retornem només els mètodes exposats del closure
        getRenderEngine: _getRenderEngine,
        addRenderEngine: _addRenderEngine
    };
});

