define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "dijit/registry"
], function (declare, AbstractResponseProcessor,registry) {
    var ret = declare([AbstractResponseProcessor],
    /**
    * @class AdminTabProcessor
    * @extends AbstractResponseProcessor
    */
    {
        type: "admintab",

        /**
        * @param {*} value
        * @param {ioc.wiki30.Dispatcher} dispatcher
        * @override
        */
        process: function (result, dispatcher) {
           if (result.type === "add_admin_tab") {
              this._processAddAdminTab(result, dispatcher);
           } else if (result.type === "remove_admin_tab") {
              this._processRemoveAdminTab(result, dispatcher);
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
        _processAddAdminTab: function (result, dispatcher) {
            require([
                "ioc/gui/ContentTabDokuwikiPage"], function(ContentTabDokuwikiPage){
                    var admin_tab = registry.byId(result.containerId + "_tablist_" + result.tabId);
                    if (admin_tab !== undefined) {
                        //  Si existeix la pestanya només caldrà substituir el contingut actual pel nou
                        registry.byId(result.tabId).innerHTML = result.content;
                    } else {
                            // Crear una pestanya nova a la zona de navegació si no existeix
                            // fill d'un objecte de tipus ContentTabDokuwikiPage
                            //al qual se li passi la urlBase que hagi arribat amb la resposta
                            //i el contingut html amb la llista de tasques.
                            var cp1 = new ContentTabDokuwikiPage(
                            {
                                id: result.tabId,
                                title: result.title,
                                content: result.content,
                                urlBase: result.urlBase
                            });
                            var tc = registry.byId(result.containerId);
                            tc.addChild(cp1);
                    }
            });
        },

        /**
        * @param {{containerId: string
                    ,tabId: string
                    ,urlBase: string}} result
        * @param {ioc.wiki30.Dispatcher} dispatcher
        * @private
        */
        _processRemoveAdminTab: function (result, dispatcher) {
            var admin_tab = registry.byId(result.containerId + "_tablist_" + result.tabId);
            if (admin_tab !== undefined) {
                //  Si existeix la pestanya la eliminem
                var tc = registry.byId(result.containerId);
                var tab = registry.byId(result.tabId);
                tc.removeChild(tab);
                tab.destroy();
            }
        }

    });
    return ret;
});
