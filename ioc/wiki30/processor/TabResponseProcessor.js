define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dijit/registry"
], function (declare, StateUpdaterProcessor, registry) {

    var TabResponseProcessorException = function (message) {
        this.message = message;
        this.name = "TabResponseProcessorException";
    };

    return declare([StateUpdaterProcessor],
        /**
         * @class TabProcessor
         * @extends AbstractResponseProcessor
         * @author Xavier Garcia <xaviergaro.dev@gmail.com>
         */
        {
            type: "tabmanager",

            /**
             * @param {*} response
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @override
             */
            process: function (response, dispatcher) {

                switch (response.type) {
                    case 'add_tab':
                        this._processAddTab(response, dispatcher);
                        break;

                    case 'remove_tab':
                        this._processRemoveTab(response);
                        break;

                    default:
                        throw new TabResponseProcessorException("Tipus d'acció sobre les pestanyes no reconeguda: " + response.type);
                }
                this.inherited(arguments);
            },
            updateState: function(dispatcher, response){
                switch (response.type) {
                    case 'add_tab':
                        dispatcher.getGlobalState().addExtraTab(response.contentParams.id)
                        break;

                    case 'remove_tab':
                        dispatcher.getGlobalState().removeExtraTab(response.tabId);
                        break;
                }
            },

            /**
             * @param {{containerId: string
                        contentParams:{
                            tabId: string,
                            title: string,
                            content: string,
                            ...},
                        position: string
                        selected: boolean}} response
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @private
             */
            _processAddTab: function (response, dispatcher) {
                if (response.contentParams) {
                    var oldTab = registry.byId(/*this._generateTabId(response.containerId, */response.contentParams.id)/*)*/;

                    if (oldTab) {
                        this._updateTab(oldTab, response);
                    } else {
                        this._generateTab(response, dispatcher);
                    }

                } else {
                    console.warn("La pestanya amb identificador " + response.contentParams.id + " no s'ha afegit atès que no te contingut");
                }

            },

            _updateTab: function (oldTab, response) {

                // oldTab.setData(newContent); // TODO[Xavi]Substituir per aquest quan les pestenyes s'actualitzin a ContentTools
                if(oldTab.setData){
                    oldTab.setData(response.contentParams);
                }else{
                    oldTab.set('content', response.contentParams.content);
                }

            },

            _generateTabId: function (containerId, tabId) {
                return containerId + "_" + tabId;
            },

            _generateTab: function (response, dispatcher) {
                var containerClass = "ioc/gui/ContentTabDokuwikiPage";
                var tab = null/*,
                    tabId = this._generateTabId(response.containerId, response.contentParams.id)*/; // Afegit el id del contenidor per evitar posibles conflictes futurs

                if(response.containerClass){
                    containerClass = response.containerClass;
                }
                require([containerClass], function (ContentTab) {
                    tab = new ContentTab(response.contentParams);
                    var tabContainer = this._getTabContainer(response.containerId);

                    this._addTabToContainer(tab, tabContainer, response.position);

                    if (response.selected) {
                        tabContainer.selectChild(tab);
                    }else{
                        var nId = dispatcher.getGlobalState().getCurrentNavigationId();
                        if(nId == tab.id){
                            tabContainer.selectChild(tab);
                        }
                    }
                }.bind(this));
            },

            _getTabContainer: function (containerId) {
                var tabContainer = registry.byId(containerId);

                if (!tabContainer) {
                    throw new TabResponseProcessorException("No existeix cap contenidor de pestanyes amb id: " + containerId);
                }

                return tabContainer;
            },

            _addTabToContainer: function (tab, tabContainer, position) {

                switch (position) {
                    case 'first':
                        tabContainer.addChild(tab, 0);
                        break;

                    default:
                        tabContainer.addChild(tab);
                }

            },


            /**
             * @param {{containerId: string
                    ,tabId: string
                    ,urlBase: string}} response
             * @private
             */
            _processRemoveTab: function (response) {

                var tabId = /*this._generateTabId(response.containerId, */response.tabId/*)*/,
                    tab = registry.byId(tabId);

                if (tab) {
                    var tabContainer = registry.byId(response.containerId);
                    tabContainer.removeChild(tab);
                    tab.destroy();
                }

            }
        });

});
