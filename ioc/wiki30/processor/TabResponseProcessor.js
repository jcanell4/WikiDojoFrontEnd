define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "dijit/registry"
], function (declare, AbstractResponseProcessor, registry) {

    var TabResponseProcessorException = function (message) {
        this.message = message;
        this.name = "TabResponseProcessorException";
    };

    return declare([AbstractResponseProcessor],
        /**
         * @class TabProcessor
         * @extends AbstractResponseProcessor
         * @author Xavier Garcia <xaviergaro.dev@gmail.com>
         */
        {
            type: "tabmanager",

            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {

                switch (value.type) {
                    case 'add_tab':
                        this._processAddTab(value, dispatcher);
                        break;

                    case 'remove_tab':
                        this._processRemoveTab(value, dispatcher);
                        break;

                    default:
                        throw new TabResponseProcessorException("Tipus d'acció sobre les pestanyes no reconeguda: " + value.type);
                }

            },

            /**
             * @param {{containerId: string
                    ,tabId: string
                    ,title: string
                    ,content: string
                    ,urlBase: string}} result
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @private
             */
            _processAddTab: function (result) {
                if (result.content) {
                    var oldTab = registry.byId(this._generateTabId(result.containerId, result.tabId));

                    if (oldTab) {
                        this._updateTab(oldTab, result.content);
                    } else {
                        this._generateTab(result);
                    }

                } else {
                    console.warn("La pestanya amb identificador " + result.tabId + " no s'ha afegit atès que no te contingut");
                }

            },

            _updateTab: function (oldTab, content) {

                console.log("Existeix la pestanya");

                if (oldTab.setData) { // TODO[Xavi] Si es troba definida es tracta d'un ContentTool, ALERTA[Xavi]però actualment no ho son!
                    console.log("ContentTool detectat");
                    oldTab.setData(content);
                } else {
                    oldTab.set('content', content);
                }

            },

            _generateTabId: function (containerId, tabId) {
                return containerId + "_" + tabId;
            },

            _generateTab: function (data) {
                var tab = null,
                    tabId = this._generateTabId(data.containerId, data.tabId); // Afegit el id del contenidor per evitar posibles conflictes futurs

                // ALERTA[Xavi] No es pot carregar a la capçalera perquè es crea una referència circular entre el Request i el Dispatcher
                require(["ioc/gui/ContentTabDokuwikiPage"], function (ContentTabDokuwikiPage) {
                    tab = new ContentTabDokuwikiPage(
                        {
                            id: tabId,
                            title: data.title,
                            content: data.content,
                            urlBase: data.urlBase,
                            standbyId: data.containerNodeId
                        });
                });

                this._addTabToContainer(tab, data.containerId, data.position);

            },

            _addTabToContainer: function (tab, containerId, position) {
                var tabContainer = registry.byId(containerId);

                if (!tabContainer) {
                    throw new TabResponseProcessorException("No existeix cap contenidor de pestanyes amb id: " + containerId);
                }

                switch (position) {
                    case 'first':
                        tabContainer.addChild(tab, 0);
                        break;

                    case 'last': // fallthrough intencionat
                    default:
                        tabContainer.addChild(tab);
                }

                tabContainer.selectChild(tab);
            },


            /**
             * @param {{containerId: string
                    ,tabId: string
                    ,urlBase: string}} result
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @private
             */
            _processRemoveTab: function (result, dispatcher) {
                console.log("TabResponseProcessor#_processRemoveTab", result);

                var tabId = this._generateTabId(result.containerId, result.tabId),
                    tab = registry.byId(tabId);

                if (tab) {
                    var tabContainer = registry.byId(result.containerId);
                    tabContainer.removeChild(tab);
                    tab.destroy();
                }

            }

        });

});
