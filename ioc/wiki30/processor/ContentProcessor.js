define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dijit/registry",            //search widgets by id
    "dojo/dom",
    "dojo/dom-construct",
    "ioc/gui/content/contentToolFactory",

], function (declare, StateUpdaterProcessor, registry, dom, domConstruct, contentToolFactory) {

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
                    confirmation = dispatcher.discardChanges();

                } else {
                    confirmation = true;
                }


                if (confirmation) {
                    changesManager.resetDocumentChangeState(id);

                    this._loadTab(value, dispatcher, arguments);
                }

                return confirmation ? 0 : 100;

            },

            /** @private */
            _loadTab: function (value, dispatcher, args) {

                this.__newTab(value, dispatcher);

                this.inherited("process", args);
            },


            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument.
             *
             * @param {Dispatcher} dispatcher
             * @param {Content} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                //dispatcher.addDocument(value);

            },

            /**
             * Si existeix una pestanya amb aquesta id carrega el contingut a aquesta pestanya, si no construeix una de nova.
             *
             * @param {Content} content
             * @param {Dispatcher} dispatcher
             * @returns {number}
             * @private
             */
            __newTab: function (content, dispatcher) {
                var container = registry.byId(dispatcher.containerNodeId);
                this.addContent(content, dispatcher, container);

                return 0;
            },


            /**
             *
             * @param content
             * @param dispatcher
             *
             * @abstract
             * @protected
             */
            createContentTool: function (content, dispatcher) {
                console.error("Error. Aquest mètode ha de ser implementat per les subclasses del ContentProcessor");
            },

            /**
             * Aquesta es la implementació per defecte que pot ser sobrescrita per les subclasses.
             *
             * Aquesta implementació afegeix un ContentTool si no hi ha un amb el mateix id o el reemplaça si es així.
             *
             * @protected
             *
             */
            addContent: function (content, dispatcher, container) {
                var oldContentTool = registry.byId(content.id),
                    cp,
                    position = 0;

                if (oldContentTool) {
                    position = container.getChildIndex(oldContentTool.id);
                    oldContentTool.removeContentTool();
                }

                cp = this.createContentTool(content, dispatcher);
                container.addChild(cp, position);
                container.selectChild(cp);

                dispatcher.addDocument(content);
                cp.setCurrentDocument(content.id);
            }
        });
    return ret;
})
;