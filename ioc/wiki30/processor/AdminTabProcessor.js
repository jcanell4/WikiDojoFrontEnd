define([
    "dojo/_base/declare", 
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "dojo/dom",
    "ioc/gui/ContentTabDokuwikiPage" 
], function (declare, AbstractResponseProcessor,dom,ContentTabDokuwikiPage) {
    var ret = declare("ioc.wiki30.processor.AdminTabProcessor", [AbstractResponseProcessor],
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
            process: function (value, dispatcher) {
                this._processAdminTab(value, dispatcher);
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
            _processAdminTab: function (result, dispatcher) {
              var admin_tab = dom.byId(result.containerId + "_tablist_" + result.tabId);
              if (admin_tab !== null) {  
                  //  Si existeix la pestanya només caldrà substituir el contingut actual pel nou
                  dom.byId(result.tabId).innerHTML = result.content;  
              } else {
                 // Crear una pestanya nova a la zona de navegació si no existeix 
                 //fill d'un objecte de tipus ContentTabDokuwikiPage 
                 //al qual se li passi la urlBase que hagi arribat amb la resposta 
                 //i el contingut html amb la llista de tasques.
                 var cp1 = new ContentTabDokuwikiPage({
                        id: result.containerId + "_tablist_" + result.tabId,
                        title: result.title,
                        content: result.content,
                        urlBase: result.urlBase
                });
                var tc = dom.byId(result.containerId);
                tc.addChild(cp1);
              }
            }
        });
    return ret;
});


