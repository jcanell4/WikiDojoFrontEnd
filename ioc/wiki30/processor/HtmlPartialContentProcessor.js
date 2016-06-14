define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",
    "dijit/registry"
], function (declare, ContentProcessor, contentToolFactory, registry) {

    return declare([ContentProcessor],
        /**
         * Aquesta classe s'encarrega de processar els continguts per documents de tipus Html, generar els ContentTool
         * apropiat i afegir-lo al contenidor adequat.
         *
         * @class HtmlContentProcessor
         * @extends ContentProcessor
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "html_partial",

            /**
             * Processa el valor rebut com argument com a un document estructurat. Si el doucument ja existeix refresca
             * la informació.
             *
             * @param {*} value - Valor per processar
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest document.
             * @override
             */
            process: function (value, dispatcher) {
                //console.log("HtmlPartialContentProcessor#process", value);

                //
                ////ALERTA[Xavi] Codi de prova pels notifiers -> INIT
                //dispatcher.getEventManager().dispatchEvent('notify', {
                //    id: value.id,
                //    dataToSend: {
                //        do: 'init'
                //    }
                //});


                //ALERTA[Xavi] Codi de prova pels notifiers -> ADD
                //dispatcher.getEventManager().dispatchEvent('notify', {
                //    id: value.id,
                //    dataToSend: {
                //        do: 'add',
                //        message: 'hello world',
                //        to: 'Admin', // ens l'enviem a nosaltres mateixos
                //        'params': JSON.stringify({
                //            paramA:'aaa',
                //            paramB:'bbb'}
                //        )}
                //});
                //
                ////ALERTA[Xavi] Codi de prova pels notifiers -> GET
                //dispatcher.getEventManager().dispatchEvent('notify', {
                //    id: value.id,
                //    dataToSend: {
                //        do: 'get'
                //    }
                //});

                ////ALERTA[Xavi] Codi de prova pels notifiers -> CLOSE
                //dispatcher.getEventManager().dispatchEvent('notify', {
                //    id: value.id,
                //    dataToSend: {
                //        do: 'close'
                //    }
                //});



                var changesManager = dispatcher.getChangesManager(),
                    cache = dispatcher.getContentCache(value.id), // TODO[Xavi] de vegades torna null?
                    confirmation = false,
                    contentTool;

                if (cache) {
                    contentTool = cache.getMainContentTool();
                }

                // TODO[Xavi] Refactoritzar, massa condicionals
                if (contentTool && contentTool.type === this.type && !value.discard_changes) { // Alerta [Xavi] afegit nou per forçar els discards

                    // Es una actualització
                    contentTool.getContainer().selectChild(contentTool);

                    // Es una nova edició?

                    // TODO[Xavi] Quan s'ha guardat el isChanged retorna false, s'ha de forçar una comprovació de canvis, però aquest mètode hauria de ser privat
                    contentTool._checkChanges();
                    //console.log("is changed?", changesManager.isChanged(value.id) );


                    //console.log("Ja hi ha un contenttol del mateix tipus");

                    if (changesManager.isChanged(value.id) && value.cancel) {
                        if (contentTool.isAnyChunkChanged(value.cancel)) {
                            confirmation = dispatcher.discardChanges();
                        } else {
                            confirmation = true;
                        }

                        if (confirmation) {
                            dispatcher.getDraftManager().clearDraftChunks(value.id, value.cancel);
                            //console.log("Eliminats chunks dels esborranys locals:", value.cancel);
                            // TODO[Xavi] S'hauria d'afegir un command per eliminar també els esborranys remots
                            //dispatcher.getEventManager().dispatchEvent(
                            //    dispatcher.getEventManager().eventName.REMOVE_DRAFT, {
                            //        id: value.id,
                            //        dataToSend: {
                            //            id: value.ns,
                            //            type:'structured'
                            //        },
                            //        standbyId: dispatcher.containerNodeId
                            //    }
                            //);
                            dispatcher.getEventManager().fireEvent(
                                dispatcher.getEventManager().eventName.REMOVE_DRAFT, {
                                    id: value.id,
                                    dataToSend: {
                                        id: value.ns,
                                        type:'structured'
                                    },
                                    standbyId: dispatcher.containerNodeId
                                },
                                value.id
                            );

                        }

                    } else if (changesManager.isChanged(value.id) && !value.selected && !value.cancel) {
                        confirmation = dispatcher.discardChanges();

                    } else {
                        confirmation = true;
                    }

                    contentTool.rev = value.rev;

                    if (confirmation) {


                        if (value.cancel) {
                            contentTool.resetChangesForChunks(value.cancel);
                        } else if (!value.selected) {
                            contentTool.resetAllChangesForChunks();
                        }

                        contentTool.updateDocument(value);

                        dispatcher.getGlobalState().getContent(value.id).rev = contentTool.rev; // ALERTA[Xavi] posava content.rev, això no pot ser, es referia contentTool.rev (que a la seva vegada es el mateix que value.rev)?
                    }
                } else {
                    // No hi ha tipus previ de contenttool, o el tipus del contenttol era diferent

                    return this.inherited(arguments);
                }

                var contentCache = dispatcher.getGlobalState().getContent(value.id);

                if (contentCache && contentCache.rev != value.rev) {
                    dispatcher.getGlobalState().getContent(value.id).rev = value.rev;
                }


                if (value.timer) {
                    this._initTimer(value, dispatcher);
                }

                return confirmation ? 0 : 100;
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "view".
             *
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest process
             * @param {Content} value - Valor per processar
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().getContent(value.id).action = "view"; // ALERTA[xavi] això quan es fa servir?
                dispatcher.getGlobalState().getContent(value.id).rev = value.rev;
            },

            /**
             * Genera un ContentTool decorat adecuadament per funcionar com document de només lectura.
             *
             * @param {Content} content - Contingut a partir del qual es generarà el ContentTool
             * @param {Dispatcher} dispatcher - Dispatcher al que estarà lligat el ContentTool
             * @returns {ContentTool} ContentTool decorat com a tipus document.
             * @protected
             * @override
             */
            createContentTool: function (content, dispatcher) {
//                console.log("Content:", content);
                var args = {
                    ns: content.ns,
                    id: content.id,
                    title: content.title,
                    content: content,
                    closable: true,
                    dispatcher: dispatcher,
                    rev: content.rev || '',
                    type: this.type,
                    readonly: content.readonly? content.readonly : false
                };

                return contentToolFactory.generate(contentToolFactory.generation.STRUCTURED_DOCUMENT, args);
            },

            ///**
            // * Crea el llistat pel control de canvis per chunks.
            // * @param chunks
            // * @returns {{}}
            // * @private
            // */
            //_generateEmptyChangedChunks: function (chunks) {
            //    var chunk,
            //        changedChunks = {};
            //
            //    for (var i = 0; i < chunks.length; i++) {
            //        chunk = chunks[i];
            //        changedChunks[chunk.header_id] = {};
            //        changedChunks[chunk.header_id].changed = false;
            //        changedChunks[chunk.header_id].content = chunk.editing;
            //
            //    }
            //
            //    return changedChunks;
            //}

            // ALERTA[Xavi] Adaptat del DataContentProcessor
            _initTimer: function(params, dispatcher){
                var contentTool = registry.byId(params.id);
                var paramsOnExpire = params.timer.dialogOnExpire;
                paramsOnExpire.contentTool = contentTool;
                paramsOnExpire.closable = false;
                paramsOnExpire.timeout = params.timer.timeout;
                contentTool.initTimer({
                    onExpire: function(ptimer){

                        // ALERTA[Xavi] Si no existeix el ptimer retornem sense fer res, sembla que no es cancel·la el timer si es torna manualment
                        if (!ptimer) {
                            return;
                        }

                        // a) Si hi ha canvis:
                        if(ptimer.contentTool.isContentChanged()){
                            //          1) enviar demanda de bloqueig
                            ptimer.contentTool.fireEvent(ptimer.contentTool.eventName.REFRESH_EDITION);
                            //          2) Mostrar diàleg no closable informant
                            //                  que s'ha sobrepassat el temps de bloqueig
                            //                  sense cap activitat i per tant es demana
                            //                  si es guarden els canvis o bé es cancel·la
                            //                  l'edició.
                            //                  També s'avisa que si no es contesta el diàleg
                            //                  en X temps, es passarà a calcel·lar els canvis.
                            //                  La cancel·lació s'envia forçant la cancel·lació
                            //                  dels canvis + un alerta informant del fet
                            var dialog = dispatcher.getDialogManager().getDialog('lock_expiring'
                                , "lockExpiring_"+ptimer.contentTool.id
                                , ptimer);
                            ptimer.contentTool.getContainer().selectChild(ptimer.contentTool);
                            dialog.show();
                            // b) Si no hi ha canvis, es cancel·la sense avís previ, però a mé
                            //                  de l'html s'envia també una alerta informant del fet
                        }else{
                            ptimer.contentTool.fireEvent(
                                ptimer.cancelContentEvent,
                                ptimer.cancelEventParams);
                        }
                    },
                    paramsOnExpire: paramsOnExpire
                });
                contentTool.startTimer(params.timer.timeout);
            }

        })


});
