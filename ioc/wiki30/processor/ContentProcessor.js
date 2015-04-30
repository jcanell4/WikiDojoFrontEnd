define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/StateUpdaterProcessor",
    "dijit/registry"
], function (declare, StateUpdaterProcessor, registry) {

    return declare([StateUpdaterProcessor],
        /**
         * Aquesta es la superclasse a partir de la qual heretan altres processadors de contingut. Aquests continguts
         * seràn processats, es generarà un ContentTool apropiat pel tipus de contingut i s'afegiran al contenidor
         * principal.
         *
         * @class ContentProcessor
         * @extends StateUpdaterProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            /**
             * Comprova si ja existeix un document amb la mateixa id carregat, si es així comprova si s'han produit
             * canvis, i en cas afirmatiu mostra un missatge demanant si es volen descartar els canvis.
             *
             * En cas de que no hi hagi cap document amb aquesta id, o que no hi hagin canvis, o que es descartin els
             * canvis es processarà el contingut, es generarà un nou ContentTool del tipus apropiat i s'afegira
             * al ContainerContentTool principal.
             *
             * @param {*} value - Valor per processar
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat el processador
             * @returns {int} - 0 en cas de que s'hagi generat el contingut o 100 en cas contrari
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
                    changesManager.removeContentTool(id);
                    changesManager.resetContentChangeState(id);
                    this._loadTab(value, dispatcher, arguments);
                }

                return confirmation ? 0 : 100;
            },

            /**
             * Localitza el ContainerContentTool i li afegeix el contingut passat com argument
             *
             * @private
             */
            _loadTab: function (content, dispatcher, args) {
                var container = registry.byId(dispatcher.containerNodeId);
                this.addContent(content, dispatcher, container);
                this.inherited("process", args);
            },

            /**
             * TODO[Xavi] Actualment no fa res. Anotarla com a abstract?
             *
             * @param {Dispatcher} dispatcher
             * @param {Content} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
            },

            /**
             * Aquest mètode ha de ser implementat obligatoriament per les subclasses per generar el tipus de
             * ContentTool i decorar-lo com sigui necessari.
             *
             * @param {*} content - Contingut a partir del que es generarà el ContentTool
             * @param {Dispatcher} dispatcher - Dispatcher al que quedarà lligat el ContentTool
             * @abstract
             * @protected
             */
            createContentTool: function (content, dispatcher) {
                console.error("Error. Aquest mètode ha de ser implementat per les subclasses del ContentProcessor");
            },

            /**
             * Crea un ContentTool apropiat pel tipus de processador i l'afegeix al contenidor passat com argument.
             *
             * Aquesta es una implementació per defecte que pot ser sobrescrita per les subclasses.
             *
             * Aquesta implementació afegeix un ContentTool si no hi ha un amb el mateix id o el reemplaça si es així.
             *
             * @param {*} content - Contingut a partir del cual es generarà el ContentTool apropiat
             * @param {Dispatcher} dispatcher - Dispatcher al que estaran lligats tant el ContainerContentTool com
             * el ContentTool creat.
             * @param {ContainerContentTool} container - Contenidor al que s'afegira el ContentTool creat
             * @protected
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
});