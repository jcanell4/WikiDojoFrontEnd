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

            blackList: ['html_partial', 'project_diff', 'project_view'],
            type: null,

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
                    clearDraft = false,
                    id = value.id;

                if (! this._getLoginState()) {
                    confirmation = false;
                }else if (value.discard_changes) {
                    confirmation = true;
                } else if (changesManager.isChanged(id)) {
                    confirmation = dispatcher.discardChanges();
                    clearDraft = true;
                } else {
                    confirmation = true;
                }

                if (confirmation) {
                    if (clearDraft){
                        dispatcher.getDraftManager().clearDraft(value.id, value.ns);

                        if (value.hasDraft){
                            //console.log("Eliminat esborrany");
                            dispatcher.getEventManager().fireEvent(
                                dispatcher.getEventManager().eventName.REMOVE_DRAFT, {
                                    id: value.id,
                                    dataToSend: {
                                        id: value.ns,
                                        type:'full'
                                    },
                                    standbyId: dispatcher.containerNodeId
                               }
                           );
                        }
                    }
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
                // console.log("ContentProcessor#_loadTab", content)
                var container = registry.byId(dispatcher.containerNodeId);
                this.addContent(content, dispatcher, container);

                this.inherited("process", args);
            },

            _getLoginState: function() {
                return JSON.parse(localStorage.login).login;
            },

            /**
             * TODO[Xavi] Actualment no fa res. Anotarla com a abstract?
             *
             * @param {Dispatcher} dispatcher
             * @param {Content} value
             * @override
             */
            updateState: function (dispatcher, value) {},

            /**
             * Aquest mètode ha de ser implementat obligatoriament per les subclasses per generar el tipus de
             * ContentTool i decorar-lo com sigui necessari.
             *
             * @param {*} content - Contingut a partir del que es generarà el ContentTool
             * @param {Dispatcher} dispatcher - Dispatcher al que quedarà lligat el ContentTool
             * @returns {ContentTool} - ContentTool generat i decorat.
             * @abstract
             * @protected
             */
            createContentTool: function (content, dispatcher) {
                console.error("Error. Aquest mètode ha de ser implementat per les subclasses del ContentProcessor");
            },

            /**
             * Creat un ContentTool del tipus apropiat per aquest processador i l'afegeix al contenidor passat com
             * argument.
             *
             * @param {Content} content - Contingut a partir del qual es generarà el ContentTool
             * @param {Dispatcher} dispatcher - Dispatcher lligat tant al ContentTool com al ContainerContentTool
             * @param {ContainerContentTool} container - Contenidor al que s'afegirà el ContentTool
             * @protected
             */
            addContent: function (content, dispatcher, container) {
                var oldContentTool = registry.byId(content.id),
                    contentTool,
                    position = 0,
                    refreshContent;

                let sameFormat = false;

                if (oldContentTool && content.editorType) {
                    sameFormat = oldContentTool.editorType.toLowerCase() === content.editorType.toLowerCase();
                } else if (oldContentTool && oldContentTool.type) {
                    sameFormat =  oldContentTool.type === this.type;
                }

                if (sameFormat) {
                    refreshContent = this.isRefreshableContent(oldContentTool.type);
                } else {
                    refreshContent = false;
                }

                if (refreshContent) {
                    this._updateContentTool(oldContentTool, content);
                } else {
                    if (oldContentTool) {
                        position = container.getChildIndex(oldContentTool.id);
                        oldContentTool.removeContentTool();
                    }
                    contentTool = this.createContentTool(content, dispatcher);
                    container.addChild(contentTool, position);
                }
            },

            /** @protected */
            _updateContentTool: function(contentTool, content) {
                contentTool.updateDocument(content);
            },

            isRefreshableContent: function (oldType, newType) {
                if ((oldType === this.type && this.blackList.indexOf(this.type) === -1) ||
                    (newType && newType === oldType)) {
                    return true;
                }
                return false;
            },

            /**
             * Retorna cert o fals si el tipus del oldContentTool es troba a la llista de allowedTypes.
             *
             * @param {ContentTool} oldContentTool - Contenidor antic a comprovar
             * @param {string|string[]} allowedTypes - Tipus permesos
             * @returns {boolean} - true si es un tipus permes o false en cas contrari
             * @deprecated
             * @protected
             */
            isOldContentAllowed: function (oldContentTool, allowedTypes) {
                var oldContentToolType;

                if (!oldContentTool || !allowedTypes) {
                    return false;
                }

                oldContentToolType = oldContentTool.getType();


                if (typeof allowedTypes === 'string' && oldContentTool.getType() == allowedTypes) {
                    return true;

                } else {
                    for (var type in allowedTypes) {
                        if (oldContentToolType === allowedTypes[type]) {
                            return true;
                        }
                    }
                }

                return false;
            },

            /**
             * Retorna la llista de tipus permesos. Aquest mètode s'ha de sobrescriure amb la lògica necessaria pels
             * diferents processors.
             *
             * @params {*} content - objecte d'on es poden extreure les dades necessaries per generar la llista de tipus
             * permesos
             * @returns {string|string[]}
             * @protected
             * @deprecated
             */
            getAllowedTypes: function (content) {
                return null;
            }
        });
});
