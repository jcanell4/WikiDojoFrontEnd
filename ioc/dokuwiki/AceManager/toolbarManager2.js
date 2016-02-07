/**
 * Mòdul per afegir i eliminar botons de la barra d'eines de la dokuwiki dinàmicaments.
 *
 * @author Xavier García<xaviergaro.dev@gmail.com>
 */
define([], function () {

    var buttons = {};

    return {

        setToolbar: function (toolbarName, toolbarId, wikiTextId) {
            console.log("toolbarManager#setToolbar");
            _toolbar = window[toolbarName];
            _toolbarId = toolbarId;
            _wikiTextId = wikiTextId;
        },

        // TODO[Xavi] com que ara hi han múltiples toolbars, s'han de passar el pàrametres
        initToolbar: function (_toolbarId, _wikiTextId, _toolbar) {
            console.log("toolbarManager#initToolbar");
            //
            //if (_toolbar && _toolbarId && _wikiTextId) {
                initToolbar(_toolbarId, _wikiTextId, _toolbar);
                jQuery('#' + _toolbarId).attr('role', 'toolbar');
            //} else {
            //    alert("error al inicialitzar la barra d'eines");
            //}

        },

        /**
         * Afegeix un botó a la barra de eines amb la configuració passada com argument i que executará la funció
         * al fer click sobre ell.
         *
         * @param {object} conf - Objecte amb la configuració del botó, corresponent al format de la dokuwiki com es
         * pot veure a : https://www.dokuwiki.org/devel:toolbar
         * @param {function} func - Funció a executar quan es clica el botó.
         */
        addButton: function (conf, func, toolbar) {
            var funcType = 'addBtnAction' + conf.type;

            console.log("funcType:", conf);

            if (buttons[conf.title]) {
                console.log("El botó ja s'ha afegit, retornem");
                return false;
            }

            window[funcType] = function ($btn, props, edid) {
                $btn.click(func);

            };


            if (typeof toolbar !== 'undefined') {
                toolbar[toolbar.length] = conf;
                buttons[conf.title] = {conf: conf, func: func};
                console.log("Afegit botó: ", buttons);
                return true;
            } else {
                console.error("No existeix la barra d'eines");
                return false;
            }

        },

        /**
         * Elimina de la barra d'eines el botó especificat.
         *
         * @param {string} title - El títol del botó a esborrar
         */
        removeButton: function (title) {
            var button;

            if (typeof _toolbar === 'undefined') {
                return;
            }

            //if (typeof title === 'number' && _toolbar.length >= title) {
            //    _toolbar.splice(title, 1);
            //
            //} else {
                for (var i = 0, len = _toolbar.length; i < len; i++) {
                    button = _toolbar[i];
                    if (button.title == title) {
                        _toolbar.splice(i, 1);
                        delete button[title];
                        break;
                    }
                }
            //}

        }
    }
});