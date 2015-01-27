define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dijit/registry",            //search widgets by id
    "dojo/dom",
    "dojo/dom-construct",
    "dijit/layout/ContentPane",  //per a la funció newTab
    "ioc/wiki30/DokuwikiContent",
    "dijit/Dialog",
    "dijit/form/Button",
], function (declare, StateUpdaterProcessor, registry, dom, domConstruct,
             ContentPane, DokuwikiContent, Dialog, Button) {

    var ret = declare("ioc.wiki30.processor.ContentProcessor", [StateUpdaterProcessor],
        /**
         * @class ContentProcessor
         * @extends StateUpdaterProcessor
         */
        {
            /**
             * @param {*} value
             * @param {Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {


                var changesManager = dispatcher.getChangesManager(),
                    confirmation = false,
                    id = value.id;


                if (changesManager.isChanged(id)) {

                    //// TODO[Xavi] Afegir la localització
                    //// TODO[Xavi] Reemplaçar amb ConfigDialog quan actualitzem a dojo 1.10
                    //var myDialog = new Dialog({
                    //    title:   "No s'han desat els canvis",
                    //    content: "No s'han desat els canvis al document actual, vols continuar i descartar els canvis?<br>",
                    //    style:   "width: 300px"
                    //});

                    confirmation = this._discardChanges();

                    /*

                     var self = this;
                     var okButton = new Button({label: "Continuar"});
                     var cancelButton = new Button({label: "Cancel·lar"});

                     var args = arguments;

                     okButton.on('click', function (e) {
                     confirmation = true;
                     self._loadTab(value, dispatcher, args);
                     myDialog.destroy();
                     });

                     cancelButton.on('click', function (e) {
                     confirmation = false;
                     myDialog.destroy();
                     });

                     myDialog.addChild(okButton);
                     myDialog.addChild(cancelButton);
                     myDialog.show();
                     */

                } else {
                    confirmation = true;
                }

                if (confirmation) {
                    changesManager.resetDocumentChangeState(id);
                    this._loadTab(value, dispatcher, arguments);
                }

                return confirmation ? 0 : 100;

            },

            _loadTab: function (value, dispatcher, args) {
                this.__newTab(value, dispatcher);
                this.inherited("process", args);
            },

            _discardChanges: function () {
                return confirm("No s'han desat els canvis al document actual, vols descartar els canvis");
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument.
             *
             * @param {Dispatcher} dispatcher
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
             * @returns {number}
             * @private
             */
            __newTab: function (content, dispatcher) {
                var tc = registry.byId(dispatcher.containerNodeId),
                    widget = registry.byId(content.id),
                    self = this,
                    cp;

                /*Construeix una nova pestanya*/
                if (!widget) {
                    cp = new ContentPane({
                        id:       content.id,
                        title:    content.title,
                        content:  content.content,
                        closable: true,

                        onClose: function () {

                            var changesManager = dispatcher.getChangesManager(),
                                confirmation = true;

                            if (changesManager.isChanged(content.id)) {
                                confirmation = self._discardChanges();
                            }

                            if (confirmation) {
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

                                this.unregisterFromEvents();
                                // TODO[Xavi] S'hauria de restaurar la visibilitat dels botons i els panells d'informació

                            }

                            return confirmation;
                        },

                        /** @type {int[]} indentificador propi dels events als que està subscrit */
                        registeredToEvents: [],

                        /**
                         * Es registra al esdeveniment i respón amb la funció passada com argument quan es escoltat.
                         *
                         * Es guarda la referencia obtinguda al registrar-lo per poder desenregistrar-se quan sigui
                         * necessari.
                         *
                         * @param {string} event - nom del esdeveniment
                         * @param {function} callback - funció a executar
                         */
                        registerToEvent: function (event, callback) {
                            this.registeredToEvents.push(dispatcher.registerToEvent(event, callback));
                        },

                        /**
                         * Recorre la lista de esdeveniments al que està subscrit i es desenregistra de tots.
                         */
                        unregisterFromEvents: function () {
                            for (var i = 0, len = this.registeredToEvents.length; i < len; i++) {
                                dispatcher.removeObserver(this.registeredToEvents[i]);
                            }
                        }
                    });

                    // Ens registrem als esdeveniments als que ens interessa observar
                    cp.registerToEvent("document_changed", function (data) {
                        if (data.id == content.id) {
                            cp.controlButton.containerNode.style.color = 'red';
                        }
                    });

                    cp.registerToEvent("document_changes_reset", function (data) {
                        if (data.id == content.id) {
                            cp.controlButton.containerNode.style.color = 'black';
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