define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dijit/registry",            //search widgets by id
    "dojo/dom",
    "dojo/dom-construct",
    "dijit/layout/ContentPane",  //per a la funció newTab
    "ioc/wiki30/DokuwikiContent"
], function (declare, StateUpdaterProcessor, registry, dom, domConstruct, 
                    ContentPane, DokuwikiContent) {

    var ret = declare("ioc.wiki30.processor.ContentProcessor", [StateUpdaterProcessor],
        /**
         * @class ContentProcessor
         * @extends StateUpdaterProcessor
         */
        {
            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                this.__newTab(value, dispatcher);
                this.inherited(arguments);
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument.
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {{id: string, ns: string, title: string, content: string}} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                if (!dispatcher.contentCache[value.id]) {
                    dispatcher.contentCache[value.id] = new DokuwikiContent({
                        "id": value.id /*
                         ,"title": value.title */
                    });
                }
                //         dispatcher.contentCache[value.id].setDocumentHTML(value);
                if (!dispatcher.getGlobalState().pages[value.id]) {
                    dispatcher.getGlobalState().pages[value.id] = {};
                }
                dispatcher.getGlobalState().pages[value.id]["ns"] = value.ns;
                dispatcher.getGlobalState().currentTabId = value.id;
            },

            /**
             * Si existeix una pestanya amb aquesta id carrega el contingut a aquesta pestanya, si no construeix una de nova.
             *
             * @param {{id: string, ns: string, title: string, content: string}} content
             * @param {Dispatcher} dispatcher
             * @returns {number} TODO[Xavi] Sempre retorna 0, es fa servir per alguna cosa?
             * @private
             */
            __newTab: function (content, dispatcher) {
                var tc = registry.byId(dispatcher.containerNodeId);
                var widget = registry.byId(content.id);

                /*Construeix una nova pestanya*/
                if (!widget) {
                    var cp = new ContentPane({
                        id:       content.id,
                        title:    content.title,
                        content:  content.content,
                        closable: true,
                        onClose:  function () {
                            var currentTabId = dispatcher.getGlobalState().currentTabId;
                            //actualitzar globalState
                            delete dispatcher.getGlobalState().pages[content.id];
                            //actualitzar contentCache
                            delete dispatcher.contentCache[content.id];
                            //elimina els widgets corresponents a les metaInfo de la pestanya
                            if (currentTabId === content.id) {
                                var nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId);
                                dispatcher.removeAllChildrenWidgets(nodeMetaInfo);
                                dispatcher.getGlobalState().currentTabId = null;
                            }

                            dispatcher.getChangesManager().resetDocumentChangeState(content.id);


                            // TODO[Xavi] S'hauria de restaurar la visibilitat dels botons i els panells d'informació

                            return true;
                        }
                    });

                    tc.addChild(cp);
                    tc.selectChild(cp);

                } else {
                    tc.selectChild(widget);
                    var node = dom.byId(content.id);
                    while (node.firstChild) {
                       node.removeChild(node.firstChild);
                    }
                    domConstruct.place(content.content, node);
                }
                return 0;
            }
        });
    return ret;
});