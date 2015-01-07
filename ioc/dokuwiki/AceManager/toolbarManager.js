/**
 * Mòdul per afegir i eliminar botons de la barra d'eines de la dokuwiki dinàmicaments.
 *
 * @author Xavier García<xaviergaro.dev@gmail.com>
 */
define([], function () {

    return {
        /**
         * Afegeix un botó a la barra de eines amb la configuració passada com argument i que executará la funció
         * al fer click sobre ell.
         *
         * @param {object} conf - Objecte amb la configuració del botó, corresponent al format de la dokuwiki com es
         * pot veure a : https://www.dokuwiki.org/devel:toolbar
         * @param {function} func - Funció a executar quan es clica el botó.
         */
        addButton: function (conf, func) {
            var funcType = 'addBtnAction' + conf.type;

            window[funcType] = function ($btn, props, edid) {
                $btn.click(func);

            };

            if (typeof window.toolbar !== 'undefined') {
                window.toolbar[window.toolbar.length] = conf
            } else {
                alert("No existeix la barra d'eines"); // TODO[Xavi] per determinar com tractar aquest error, no ha de passar mai
            }
        },

        /**
         * Elimina de la barra d'eines el botó especificat.
         *
         * @param {string|int} title - Pot ser el títol del botó o el ordre en que es troba començant des de 0 per la
         * esquerra.
         */
        removeButton: function (title) {
            var button;

            if (typeof window.toolbar === 'undefined') {
                return;
            }

            if (typeof title === 'number' && window.toolbar.length >= title) {
                window.toolbar.splice(title, 1);

            } else {
                for (var i = 0, len = window.toolbar.length; i < len; i++) {
                    button = window.toolbar[i];
                    if (button.title == title) {
                        window.toolbar.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
});