/**
 * Mòdul per afegir i eliminar botons de la barra d'eines de la dokuwiki dinàmicaments.
 *
 * @author Xavier García<xaviergaro.dev@gmail.com>
 */
define([], function () {

    var buttons = {},
        sourceToolbar = window['toolbar'], // Com a font fem servir sempre la barra d'eines exportada per la wiki
        toolbars = {},

        _createToolbar = function (name) {
            toolbars[name] = sourceToolbar.slice(); // Clonem la font
        };


    return {

        getToolbar: function (name) {
            if (!toolbars[name]) {
                _createToolbar(name);
            }

            return toolbars[name];
        },


        // TODO[Xavi] com que ara hi han múltiples toolbars, s'han de passar el pàrametres
        initToolbar: function (_toolbarId, _wikiTextId, toolbarId) {
            console.log("toolbarManager#initToolbar");
            var _toolbar = this.getToolbar(toolbarId);

            initToolbar(_toolbarId, _wikiTextId, _toolbar);
            jQuery('#' + _toolbarId).attr('role', 'toolbar');
        },

        /**
         * Afegeix un botó a la barra de eines amb la configuració passada com argument i que executará la funció
         * al fer click sobre ell.
         *
         * @param {object} conf - Objecte amb la configuració del botó, corresponent al format de la dokuwiki com es
         * pot veure a : https://www.dokuwiki.org/devel:toolbar
         * @param {function} func - Funció a executar quan es clica el botó.
         */
        addButton: function (conf, func, toolbarId) {
            var funcType = 'addBtnAction' + conf.type,
                toolbar = this.getToolbar(toolbarId);

            console.log("funcType:", conf);

            if (buttons[toolbarId] && buttons[toolbarId][conf.title]) {
                console.log("El botó ja s'ha afegit anteriorment, retornem");
                return false;
            }

            window[funcType] = function ($btn, props, edid) {
                $btn.click(func);
            };

            console.log("toolbar a la que afegim:", toolbars[toolbarId]);
            console.log("lengt?:", toolbars[toolbarId].length);

            toolbars[toolbarId][toolbars[toolbarId].length] = conf;

            if (!buttons[toolbarId]) {
                buttons[toolbarId] = {};
            }
            buttons[toolbarId][conf.title] = {conf: conf, func: func};
            console.log("Afegit botó: ", buttons);
            return true;

        }

    }
});