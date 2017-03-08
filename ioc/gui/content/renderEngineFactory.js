/**
 * Aquesta mòdul es una Factoria de motors de renderització que permet afegir nous tipus i obtenir els motors pels
 * tipus coneguts.
 *
 * @module renderEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([
    "ioc/gui/content/engines/standardRenderEngine",
    "ioc/gui/content/engines/revisionRenderEngine",
    "ioc/gui/content/engines/html_partialRenderEngine",
    "ioc/gui/content/engines/dataRenderEngine",
    "ioc/gui/content/engines/requiringRenderEngine",
    "ioc/gui/content/engines/requiring_partialRenderEngine",
    "ioc/gui/content/engines/notificationRenderEngine",
    "ioc/gui/content/engines/formRenderEngine",
    "ioc/gui/content/engines/htmlRenderEngine",
    "ioc/gui/content/engines/request_formRenderEngine",
], function (standardRenderEngine, revisionRenderEngine, html_partialRenderEngine, 
                dataRenderEngine, requiringRenderEngine, requiring_partialRenderEngine, 
                notificationRenderEngine, formRenderEngine, htmlRenderEngine,
                request_formRenderEngine) {

    var /** @type function */
        defaultRenderEngine = null,

        /**
         * Array amb tots els motors de render disponibles per defecte
         *
         * @type {{string: function}}
         */
        renderEngines = {},

        /**
         * Retorna el motor de render pel tipus especificat o un generic si no existeix.
         *
         * @param {string} type - Tipus de motor de render
         * @returns {function} - Motor del tipus especificat o un generic si no s'ha trobat
         * @private
         */
        _getRenderEngine = function (type) {
            // TODO[Xavi] afegir el canvi a les funcions:
            // after.content;
            // before.content;


            return renderEngines[type] ? renderEngines[type] : defaultRenderEngine;
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
        },

        _init = function () {
            _addRenderEngine('notification', notificationRenderEngine);
            _addRenderEngine('revisions', revisionRenderEngine);
            _addRenderEngine('standard', standardRenderEngine);
            _addRenderEngine('html_partial', html_partialRenderEngine);
            _addRenderEngine('data', dataRenderEngine);
            _addRenderEngine('requiring', requiringRenderEngine);
            _addRenderEngine('requiring_partial', requiring_partialRenderEngine);
            _addRenderEngine('form', formRenderEngine);
            _addRenderEngine('metainfo', htmlRenderEngine);
            _addRenderEngine('request_form', request_formRenderEngine);
            defaultRenderEngine = _getRenderEngine('standard');
        };

    _init();

    return {
        // Retornem només els mètodes exposats del closure
        getRenderEngine: _getRenderEngine,
        addRenderEngine: _addRenderEngine
    };
});

