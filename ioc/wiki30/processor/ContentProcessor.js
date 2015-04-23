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

                var tc = registry.byId(dispatcher.containerNodeId),
                    widget = registry.byId(content.id),
                    cp;


                if (!widget) {
                    cp = this.createContentTool(content, dispatcher);


                    tc.addChild(cp);

                    tc.selectChild(cp);


                } else {
                    tc.selectChild(widget);
                    var node = dom.byId(content.id);
                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                    domConstruct.place(content.content, node);
                    cp = dispatcher.getContentCache(content.id).getMainContentTool();
                }

                dispatcher.addDocument(content);
                cp.setCurrentDocument(content.id);

                return 0;
            },

            /**
             * @protected
             * @abstract
             */
            createContentTool: function (content, dispatcher) {
                console.error("Error. Aquest mètode ha de ser implementat per les subclasses del ContentProcessor");
                //var args = {
                //    id:         content.id,
                //    title:      content.title,
                //    content:    content.content,
                //    closable:   true,
                //    dispatcher: dispatcher
                //};
                //
                //return contentToolFactory.generate(contentToolFactory.generation.EDITOR, args);

            }
        });
    return ret;
});