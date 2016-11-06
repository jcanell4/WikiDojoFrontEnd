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
        type: "shortcutstab",

        /**
        * @param {*} value
        * @param {ioc.wiki30.Dispatcher} dispatcher
        * @override
        */
        process: function (result, dispatcher) {
           if (result.type === "add_shortcuts_tab") {
              this._processAddShortcutsTab(result, dispatcher);
           } else if (result.type === "remove_shortcuts_tab") {
              this._processRemoveShortcutsTab(result, dispatcher);
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
        _processAddShortcutsTab: function (result, dispatcher) {

            if (result.content) {


                require([
                    "ioc/gui/ContentTabDokuwikiPage"], function (ContentTabDokuwikiPage) {


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

                        tc.addChild(cp1, 0);
                        tc.selectChild(cp1);
                    }
                });
            } else {
                console.warn("No s'ha trobat el document dreceres per aquest usuari.");
            }
        },

        /**
        * @param {{containerId: string
                    ,tabId: string
                    ,urlBase: string}} result
        * @param {ioc.wiki30.Dispatcher} dispatcher
        * @private
        */
        _processRemoveShortcutsTab: function (result, dispatcher) {
            console.log("ShortcutsTabProcessor#_processRemoveShortcutsTab", result);
            var shortcutsTab = registry.byId(result.containerId + "_tablist_" + result.tabId);
            if (shortcutsTab !== undefined) {
                //  Si existeix la pestanya la eliminem
                var tc = registry.byId(result.containerId);
                var tab = registry.byId(result.tabId);
                console.log("tc:", tc, " tab:", tab);
                tc.removeChild(tab);
                console.log("Eliminat el fill");
                tab.destroy();
                console.log("Destruit");

            }

        }

    });
    return ret;
});
