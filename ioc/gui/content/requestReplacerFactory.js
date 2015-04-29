/**
 * Aquesta mòdul es una Factoria de motors reemplaçadors de renderització que permet afegir nous tipus i obtenir els motors pels
 * tipus coneguts.
 *
 * @module requestReplacerFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([
    "ioc/gui/content/replacers/linkRequestReplacer",
    "ioc/gui/content/replacers/formRequestReplacer"

], function (linkRequestReplacer, formRequestReplacer) {


    var /** @type function */
        defaultRequestReplacer = null,

        /**
         * Array amb tots els motors de render disponibles per defecte
         *
         * @type {{string: function}}
         */
        requestReplacers = {},

        /**
         * Retorna el motor de render pel tipus especificat o un generic si no existeix.
         *
         * @param {string} type - Tipus de motor de render
         * @returns {function} - Motor del tipus especificat o un generic si no s'ha trobat
         * @private
         */
        _getRequestReplacer = function (type) {
            return requestReplacers[type] ? requestReplacers[type] : defaultRequestReplacer;
        },

        /**
         * Afegeix el motor de render amb el tipus especificat.
         *
         * @param {string} type - Nom del tipus de motor de render
         * @param {function} requestReplacer - Funció que actuará com a reemplaçadora
         * @private
         */
        _addRequestReplacer = function (type, requestReplacer) {
            requestReplacers[type] = requestReplacer;
        },

        _init = function () {
            _addRequestReplacer('link', linkRequestReplacer);
            _addRequestReplacer('form', formRequestReplacer);
            defaultRequestReplacer = _getRequestReplacer('link');
        };

    _init();

    return {
        // Retornem només els mètodes exposats del closure
        getRequestReplacer: _getRequestReplacer,
        addRequestReplacer: _addRequestReplacer
    };

});



