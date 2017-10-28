/**
 * Mòdul per gestionar la creació i inicialització de ToolBars, i l'adició de botons a aquestes.
 *
 * Una barra d'eines consta només d'un array amb la configuració dels seus botons, que criden a funcions globals
 * definides al espai window del navegador (funcionament de la barra d'eines de DokuWiki).
 *
 * @author Xavier García<xaviergaro.dev@gmail.com>
 */
define([], function () {


    var ToolbarManagerException = function (message) {
        this.message = message;
        this.name = "ToolbarManagerException";
        console.error(message);
    };

    // ALERTA[Xavi] Substituim la funció global corresponent al picker

    window['addBtnActionPicker'] = function ($btn, props, edid) {
        var pickerid = 'picker' + (pickercounter++);
        createPicker(pickerid, props, edid);

        $btn.click(
            function () {
                var $container = $btn.closest('[data-editor-container]'),
                    idContainer = $container.attr('id');

                _dispatcher.getGlobalState().setCurrentElement(idContainer, true);
                jQuery('#' + idContainer).find('textarea').focus();

                pickerToggle(pickerid, $btn);
                return false;
            }
        );

        return true;
    };


    var buttons = {},
        baseToolbar = window['toolbar'], // Com a font fem servir sempre la barra d'eines exportada per la wiki
        toolbars = {},
        _dispatcher = null,
        patchedButtons = {},

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
            //console.log('toolbarManager#_createButtonInToolbar', type);
            if (!_dispatcher) {
                throw new ToolbarManagerException("No s'ha establert el dispatcher. Crida a toolbarManager.setDispatcher(dispatcher) abans.");
            }

            var funcType = 'addBtnAction' + (config.type = config.type.charAt(0).toUpperCase()+config.type.substring(1) + '_' + type);

            window[funcType] = function ($btn) {

                $btn.click(function (event) {
                    var idContainer = jQuery(event.currentTarget).closest('[data-editor-container]').attr('id');

                    _dispatcher.getGlobalState().setCurrentElement(idContainer, true);
                    jQuery('#' + idContainer).find('textarea').focus();
                    func(arguments);
                });
            };

            _checkAsPatched(config.type);

            _getToolbar(type)[toolbars[type].length] = config;

            if (!buttons[type]) {
                buttons[type] = {};
            }

            buttons[type][config.title] = {conf: config, func: func};
        },

        _createFormatButtonInToolbar = function (config, type) {

            _getToolbar(type)[toolbars[type].length] = config;

            if (!buttons[type]) {
                buttons[type] = {};
            }

            buttons[type][config.title] = {conf: config};
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
        },

        _patchButton = function (button) {
            // console.log("Aplicant patch a ", button);
            // El nom de la funció definit a la wiki(toolbar.js) està format per 'tb_' + button.type
            var funcType = 'tb_' + button.type;

            if (!_dispatcher) {
                throw new ToolbarManagerException("No s'ha establert el dispatcher. Crida a toolbarManager.setDispatcher(dispatcher) abans.");
            }

            var originalFunction = window[funcType];

            if (originalFunction) {

                window[funcType] = function ($btn, props, edid) {
                    // console.log("Click a un botó PARXEJAT", button.type, arguments);


                    if (!$btn.parent().hasClass('picker')) {
                        var $container = $btn.closest('[data-editor-container]');

                        if ($container) {

                            var idContainer = $container.attr('id');
//                            console.log("id del contenidor obtingut:", $btn, $btn.closest('[data-editor-container]'), idContainer);

                            _dispatcher.getGlobalState().setCurrentElement(idContainer, true);
                            jQuery('#' + idContainer).find('textarea').focus();

                        } else {

                            throw new ToolbarManagerException("No s'ha trobat el contenidor");
                        }
                    }

                    originalFunction($btn, props, edid);

                };

                _checkAsPatched(button.type);
            }

        },


        _checkAsPatched = function (type) {
            patchedButtons[type] = true;
        };

    return {

        /**
         * Retorna un array amb els botons que formen la barra d'eines amb el nom especificat.
         *
         * @param {string} type tipus de la barra d'eines
         * @returns {object[]} array amb els botons que formen la barra d'eines
         */
        getToolbar: function (type) {
            //console.log('toolbarManager#getToolbar', type);
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
            //console.log('toolbarManager#initToolbar', type);
            initToolbar(toolbarId, wikiTextId, this.getToolbar(type));

            var $toolbar = jQuery('#' + toolbarId);
            $toolbar.attr('role', 'toolbar');

//            console.log("S'ha trobat la toolbar?", toolbarId, $toolbar)

            // Recorrem tots els botons
            var _buttons = this.getToolbar(type);

            for (var i = 0; i < _buttons.length; i++) {
                var key = _buttons[i].type;

                if (!patchedButtons[key]) {
                    // Encara no s'ha parxejat el botó, cerquem la funció

                    _patchButton(_buttons[i])
                }
            }


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
            config.type += '_' + type;
            //console.log(toolbarManager#addButton);
            if (_existsButtonInToolbar(config.title, type)) {
                return false;
            } else {
                _createButtonInToolbar(config, func, type);
                return true;
            }
        },

        /**
         *
         * @param type
         */
        addFormatButton: function (config, type) {
            // var args = {
            //     type : 'format',
            //     open: config.open,
            //     sample: config.sample || '',
            //     close: config.close,
            // };


            config.type = 'format';

            console.log("toolbarManager#addFormatButton", config);


            if (_existsButtonInToolbar(config.title, type)) {
                return false;
            } else {
                _createFormatButtonInToolbar(config, type);
                return true;
            }
        },


        /**
         * Estableix el dispatcher que serà utilitzat per establir la secció al fer un click sobre un botó
         *
         * @param dispatcher
         */
        setDispatcher: function (dispatcher) {
            _dispatcher = dispatcher;
        }
    }
});