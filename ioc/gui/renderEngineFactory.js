/**
 * Aquesta classe es una Factoria de motors de renderització que permet afegir nous tipus i obtenir els motors pels
 * tipus coneguts.
 *
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([], function () {

    var renderEngines = {

            default: function (data) {
                var i = typeof data === 'string' ? data : 'Tipus de dada no reconegut.';
                console.log(i);
                return i;
            }
        },

        _getRenderEngine = function (type) {
            // Comprovem si el tipus existeix
            //      Si existeix el retornem
            //      Si no existeix retornem el generador per defecte, que retorna el contingut tal com s'ha passat

            return renderEngines[type] ? renderEngines[type] : renderEngines['default'];

        },

        _addRenderEngine = function (type, renderEngine) {
            // Afegeix el motor de render a la llista de render engines
            // TODO[Xavi] Que fem si ja existeix?  ACTUALMENT: reemplaça
            renderEngines[type] = renderEngine;
        };


    return {
        // Retornem només els mètodes exposats del closure
        getRenderEngine: _getRenderEngine,
        addRenderEngine: _addRenderEngine
    };
});

