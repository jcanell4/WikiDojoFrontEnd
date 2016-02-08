/**
 * Mòdul per gestionar la creació i inicialització de ToolBars, i l'adició de botons a aquestes.
 *
 * Una barra d'eines consta només d'un array amb la configuració dels seus botons, que criden a funcions globals
 * definides al espai window del navegador (funcionament de la barra d'eines de DokuWiki).
 *
 * @author Xavier García<xaviergaro.dev@gmail.com>
 */
define([], function () {

    var buttons = {},
        baseToolbar = window['toolbar'], // Com a font fem servir sempre la barra d'eines exportada per la wiki
        toolbars = {},

        /**
         * Crea una nova toolbar afegint els botons basics de la wiki.
         *
         * @param {string} type - tipus de la barra d'eines
         * @private
         */
        _createToolbar = function (type) {
            toolbars[type] = baseToolbar.slice(); // Clonem la font
        },

        /**
         * Retorna cert o fals segons si ja existeix o no un botó amb aquest title a la barra d'eines especificada.
         *
         * @param title - títol únic que identifica al botó dins de la barra d'eines
         * @param type - tipus de la barra d'eines
         * @returns boolean - cert si ja existeix un botó amb el mateix title per aquest tipus de barra d'eines o fals
         * en cas contrari
         * @private
         */
        _existsButtonInToolbar = function (title, type) {
            return buttons[type] && buttons[type][title] ? true : false;
        },


        /**
         * Crea un botó amb la configuració passada com argument a la barra d'eines especificada que executará la
         * funció indicada al ser clicat.
         *
         * @param {object} config - Objecte amb la configuració del botó, corresponent al format de la dokuwiki com es
         * pot veure a : https://www.dokuwiki.org/devel:toolbar
         * @param {function} func - funció a executar
         * @param {string} type - tipus de la barra d'eines
         * @private
         */
        _createButtonInToolbar = function (config, func, type) {
            console.log('toolbarManager#_createButtonInToolbar', type);
            var funcType = 'addBtnAction' + config.type;

            window[funcType] = function ($btn) {
                $btn.click(func);
            };

            console.log("barra creada? ", _getToolbar(type));
            console.log("toolbars:", toolbars);

            toolbars[type][toolbars[type].length] = config;

            if (!buttons[type]) {
                buttons[type] = {};
            }

            buttons[type][config.title] = {conf: config, func: func};
        },

        /**
         * Retorna un array amb els botons que formen la barra d'eines amb el nom especificat. Si no existeix ja una
         * toolbar amb aquest nom es crea.
         *
         * @param {string} type - tipus de la barra d'eines
         * @returns {object[]} array amb els botons que formen la barra d'eines
         * @private
         */
        _getToolbar = function (type) {
            if (!_existsToolbar(type)) {
                _createToolbar(type);
            }

            return toolbars[type];
        },

        /**
         * Retorna cert si existeix la barra d'eines del tipus passat com argument.
         *
         * @param {string} type - tipus de la barra d'eines
         * @returns {boolean} - Cert si existeix o fals en cas contrari
         * @private
         */
        _existsToolbar = function (type) {
            return toolbars[type] ? true : false;
        };

    return {

        /**
         * Retorna un array amb els botons que formen la barra d'eines amb el nom especificat.
         *
         * @param {string} type tipus de la barra d'eines
         * @returns {object[]} array amb els botons que formen la barra d'eines
         */
        getToolbar: function (type) {
            //console.log(toolbarManager#getToolbar);
            return _getToolbar(type);
        },

        /**
         * Genera una nova barra d'eines amb el identificador passat com argument lligada al textarea i tipus indicat.
         *
         * @param {string} toolbarId - identificador que rebra la barra d'eines
         * @param {string} wikiTextId - identificador del textarea al que es lligarà
         * @param {string} type - tipus de barra d'eines
         */
        initToolbar: function (toolbarId, wikiTextId, type) {
            //console.log('toolbarManager#initToolbar');
            initToolbar(toolbarId, wikiTextId, this.getToolbar(type));
            jQuery('#' + toolbarId).attr('role', 'toolbar');
        },

        /**
         * Afegeix un botó amb la configuració passada com argument que cridarà a la funció per la barra d'eines
         * especificada.
         *
         * No es poden sobrescriure botons, si ja existeix algún botó amb el mateix title indicat al paràmetre conf
         * aquesta funció no farà res.
         *
         * Compte! Quan s'afegeix un botó per un tipus de barra d'eines aquest botó es mostrarà en totes les barres
         * que es generi per aquest tipus.
         *
         * @param {object} config - Objecte amb la configuració del botó, corresponent al format de la dokuwiki com es
         * pot veure a : https://www.dokuwiki.org/devel:toolbar
         * @param {function} func funció a executar quan es clica el botó
         * @param {string} type
         * @returns {boolean} Cert si s'ha afegit en botó o fals en cas contrari
         */
        addButton: function (config, func, type) {
            //console.log(toolbarManager#addButton);
            if (_existsButtonInToolbar(config.title, type)) {
                return false;
            } else {
                _createButtonInToolbar(config, func, type);
                return true;
            }
        }
    }
});