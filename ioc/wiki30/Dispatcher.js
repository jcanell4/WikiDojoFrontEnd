/**
 * @author Josep Cañellas <jcanell4@ioc.cat>
 */
define([
    "dojo/_base/declare", // declare
    "dijit/registry", //search widgets by id
    "dijit/Dialog",
    "dojo/_base/lang",
    "dojo/_base/array",
    "ioc/wiki30/GlobalState",
    "ioc/wiki30/SectokManager",
    "ioc/wiki30/processor/AlertProcessor",
    "ioc/wiki30/processor/HtmlContentProcessor",
    "ioc/wiki30/processor/MediaProcessor",
    "ioc/wiki30/processor/MetaInfoProcessor",
    "ioc/wiki30/processor/DataContentProcessor",
    "ioc/wiki30/processor/ErrorProcessor",
    "ioc/wiki30/processor/InfoStatusProcessor",
    "ioc/wiki30/processor/LoginProcessor",
    "ioc/wiki30/processor/SectokProcessor",
    "ioc/wiki30/processor/TitleProcessor",
    "ioc/wiki30/processor/RemoveAllContentTabProcessor",
    "ioc/wiki30/processor/RemoveContentTabProcessor",
    "ioc/wiki30/processor/CommandProcessor",
    "ioc/wiki30/processor/AdminTabProcessor",
    "ioc/wiki30/processor/AdminTaskProcessor",
    "ioc/wiki30/processor/JsInfoProcessor",
    "ioc/wiki30/manager/InfoManager",
    "ioc/wiki30/manager/ChangesManager",
    "ioc/wiki30/UpdateViewHandler"
], function (declare, registry, Dialog, lang, array, GlobalState, SectokManager,
                AlertProcessor, HtmlContentProcessor, MediaProcessor, MetaInfoProcessor,
                DataContentProcessor, ErrorProcessor, InfoStatusProcessor,
                LoginProcessor, SectokProcessor, TitleProcessor,
                RemoveAllContentTabProcessor, RemoveContentTabProcessor,
                CommandProcessor, AdminTabProcessor, AdminTaskProcessor, JsInfoProcessor,
                InfoManager, ChangesManager) {
    /**
     * @typedef {object} DijitWidget widget
     * @typedef {object} DijitContainer contenidor
     */

     /** @typedef {{id: string, ns: string, title: string, content: string}} Content */
    var ret = declare(null,
        /**
         * @class Dispatcher
         */
        {
            /** @type {GlobalState} */
            globalState: null,

            /** @type {boolean} */
            unsavedChangesState: false,

            /** @type {Object.<DokuwikiContent>} la  id del hash correspon al id del DokuwikiContent */
            contentCache: {},		//objecte {id_pestanya => metaInformacio[id => {id,title,content}]}

            /**
             * @dict
             * @type {Object.<AbstractResponseProcessor>}
             */
            processors: {},

            /** @type {Array.<UpdateViewHandler>} */
            updateViewHandlers: null,

            /** @type {Array.<ReloadStateHandler>} */
            reloadStateHandlers: null,

            /** @type SectokManager */
            sectokManager: null,

            /** @type {string} S'estableix al scriptsRef pel valor substituit al template */
            containerNodeId: null,

            /** @type {string} S'estableix al scriptsRef pel valor substituit al template */
            navegacioNodeId: null,

            /** @type {string} S'estableix al scriptsRef pel valor substituit al template */
            infoNodeId: null,

            /** @type {string} S'estableix al scriptsRef pel valor substituit al template */
            metaInfoNodeId: null,

            /**
             * TODO[Xavi] Compte, s'afegeix només un element i es fa desde scriptsRef.tpl amb .push();
             * @type {Array.<*>} actualment només s'afegeix 1 element i es tracta d'el corresponent a TAB_INDEX
             */
            toUpdateSectok: null,

            /** @type {Dialog} */
            diag: new Dialog({
                title: "ERROR",
                style: "width: 300px"
            }),

            /** @type {InfoManager} Instancia del gestor de infos associat amb aquest dispatcher */
            infoManager: null,

            /**
             * Afegeix al hash de processadors els processadors, les característiques del objecte passat com argument i
             * inicialitza els arrays per emmagatzemar els handlers.
             *
             * @param pAttributes TODO[Xavi] l'argument es sempre undefined, només es crida desde dispatcherSingleton.js
             * @constructor
             */
            constructor: function (/*Object*/ pAttributes) {
                lang.mixin(this, pAttributes); // TODO[Xavi] comprovar si es més apropiat declare.safeMixin()
                this.processors["alert"] = new AlertProcessor();
                this.processors["html"] = new HtmlContentProcessor();
                this.processors["media"] = new MediaProcessor();
                this.processors["metainfo"] = new MetaInfoProcessor();
                this.processors["data"] = new DataContentProcessor();
                this.processors["error"] = new ErrorProcessor();
                this.processors["info"] = new InfoStatusProcessor();
                this.processors["login"] = new LoginProcessor();
                this.processors["sectok"] = new SectokProcessor();
                this.processors["title"] = new TitleProcessor();
                this.processors["removeall"] = new RemoveAllContentTabProcessor();
                this.processors["remove"] = new RemoveContentTabProcessor();
                this.processors["command"] = new CommandProcessor();
                this.processors["admin_tab"] = new AdminTabProcessor();
                this.processors["admin_task"] = new AdminTaskProcessor();
                this.processors["jsinfo"] = new JsInfoProcessor();
                this.toUpdateSectok = new Array();
                this.sectokManager = new SectokManager();
                this.globalState = GlobalState;
                this.updateViewHandlers = new Array();
                this.reloadStateHandlers = new Array();

                this.infoManager = new InfoManager(this);
                this.changesManager = new ChangesManager(this);

            },

            /**
             * Afegeix el UpdateViewHandler al array que es crida quan s'ha d'actualitzar la vista.
             *
             * @param {UpdateViewHandler} handler handler per afegir
             */
            addUpdateView: function (handler) {
                this.updateViewHandlers.push(handler);
            },

            /**
             * Afegeix el ReloadStatgeHandler al array que es cridar al recarregar.
             *
             * @param {ReloadStateHandler} handler handler per afegir
             */
            addReloadState: function (handler) {
                this.reloadStateHandlers.push(handler);
            },

            /**
             * TODO[Xavi] Buida, no fa res. Es crida enlloc?
             */
            startup: function () {
                /*TO DO. Set the globalState to different components*/
            },

            /**
             * Recorre el array de UpdateViewHandlers i crida al métode update() de cadascun.
             */
            updateFromState: function () {
                if (this.updateViewHandlers) {
                    array.forEach(this.updateViewHandlers, function (handler) {
                        handler.update();
                    });
                }
            },

            /**
             * Recorre el array de ReloadStateHandlers i recarrega el estat passat com argument.
             *
             * Només es crida una vegada al carregar la página.
             *
             * TODO[Xavi] Com que es passa el GlobalState, es necessari que es pasi com argument?
             *
             * @param {GlobalState} stateToLoad
             */
            reloadFromState: function (stateToLoad) {
                if (this.reloadStateHandlers) {
                    array.forEach(this.reloadStateHandlers, function (handler) {
                        handler.reload(stateToLoad);
                    });
                }
            },

            /**
             * TODO[Xavi] mai es passa cap argument, sempre es undefined.
             *
             * @param {string} strUrl ??
             *
             * @returns {string} el security token
             */
            getSectok: function (strUrl) {
                return (this.sectokManager.getSectok(strUrl));
            },

            /**
             * Afegeix el security token al array de security tokens, i l'actualitza a tots els elements al array
             * toUpdateSectok.
             *
             * @param {string|undefined} strUrl TODO[Xavi] el valor es fa servir com a token.
             * @param {?string} sectok TODO[Xavi] sempre es undefined, així que no es fa servir per a res
             */
            putSectok: function (strUrl, sectok) {
                if (!sectok) {
                    sectok = strUrl;
                    strUrl = undefined;
                }
                this.sectokManager.putSectok(strUrl, sectok);
                array.forEach(this.toUpdateSectok, function (responseItem) {
                    responseItem.updateSectok();
                });

            },

            /**
             * TODO[Xavi] Sempre es crida amb el dijit i mai com a string?
             * Només es crida desde el contenidor central a scriptsRef.tpl.
             *
             * @param {DijitContainer|string} pwidget
             */
            removeAllChildrenWidgets: function (pwidget) {
                var children;
                var widget;
                if (lang.isString(pwidget)) {
                    widget = registry.byId(pwidget);
                } else {
                    widget = pwidget;
                }
                if (widget.hasChildren()) {
                    children = widget.getChildren();
                    for(var i=0; i<children.length; i++){
                        if(children[i].unregisterFromEvents){
                            children[i].unregisterFromEvents();
                        }
                    }
                    widget.destroyDescendants(false);
                }
            },

            hideAllChildrenWidgets: function (pwidget) {
                var widget;
                if (lang.isString(pwidget)) {
                    widget = registry.byId(pwidget);
                } else {
                    widget = pwidget;
                }
                if (widget.hasChildren()) {
                    widget.destroyDescendants(false);
                }
            },

            removeWidgetChild: function (command, dispatcher) {
                var parent;
                var child;
                var parentId = command.id;
                var childId = command.childId;
                parent = registry.byId(parentId);
                child = registry.byId(childId);
                if (parent && child) {
                    if(child.unregisterFromEvents){
                        child.unregisterFromEvents();
                    }
                    parent.removeChild(child);
                    child.destroyRecursive(false);
                }
            },

            /**
             * Canvia la propietat del widget amb el id passat com argument, pel valor passat.
             *
             * @param {string} id
             * @param {string} propertyName
             * @param {string|boolean} value
             */
            changeWidgetProperty: function (id, propertyName, value) {
                var widget = registry.byId(id);
                widget.set(propertyName, value);
            },

            /**
             * Retorna el GlobalState emmagatzemat al dispatcher.
             *
             * @returns {?GlobalState} el GlobalState emmagatzemat al dispatcher.
             */
            getGlobalState: function () {
                return this.globalState;
            },


            /**
             * Retorna l'objecte amb el contingut corresponent a la id passat com argument.
             *
             * @param {string} id del contingut.
             * @returns {DokuwikiContent} el contingut corresponent
             */
            getContentCache: function (id) {
                return this.contentCache[id];
            },

            //            /**
            //             * Retorna la informació de la pàgina mostrada a la pestanya actual.
            //             *
            //             * TODO[Xavi] No es crida enlloc?
            //             *
            //             * @returns {{ns: string, node: string, action: string}} pagina de la pestanya actual
            //             */
            //            getCurrentPage: function () {
            //                return this.getGlobalState().pages[this.getGlobalState().currentTabId];
            //            },

            /**
             * Retorna la informació de la pàgina mostrada a la pestanya actual.
             *
             * TODO[Xavi] No es crida enlloc?
             *
             * @returns {{ns: string, node: string, action: string}} pagina de la pestanya actual
             */
            getCurrentContent: function () {
                return this.getGlobalState().getCurrentContent();
            },

            /**
             * Retorna el valor de UnsavedChangeState.
             *
             * @returns {boolean} unsavedChangeState
             */
            getUnsavedChangesState: function () {
                alert("getUnsavedChangesState");
                return this.unsavedChangesState
                    || window.textChanged;
            },

            /**
             * Estableix el valor de UnsavedChangeState.
             *
             * @param {boolean} st
             */
            setUnsavedChangesState:  function (st) {
                alert("SetUnsavedChangesState");
                this.unsavedChangesState = st;
                window.textChanged = st;

            },

            // TODO[Xavi] no es crida enlloc i no fa res, es per esborrar?
            loadDataFromGlobalState: function () {
            },

            /**
             * Processa un error.
             *
             * @param {SyntaxError} error error per processar
             */
            processError: function (error) {
                this._processError(error.response.text);
            },

            /**
             * Processa la resposta passada com argument.
             *
             * TODO[Xavi] no es fa servir la resposta en lloc.
             *
             * @param {Array.<{type: string, value: *}>|{type: string, value: *}} response resposta per processar.
             *
             * @returns {number} sempre es 0
             */
            processResponse: function (response, processors) {
                // TODO[Xavi] canviar req per that per fer més clara la intenció
                var req = this;


                if (Array.isArray(response)) {

                    array.some(response, function (responseItem) {
                        var result = req._processResponse(responseItem, processors);
                        return result != 0; // Surt del bucle quan es true
                    });

                } else {
                    req._processResponse(response, processors);
                }

                this.updateFromState();
                return 0;
                /*
                 // TODO[Xavi] lang.isArray() està deprecated.
                 if (lang.isArray(response)) {
                 array.forEach(response, function (responseItem) {
                 req._processResponse(responseItem, processors);
                 });
                 } else {
                 req._processResponse(response, processors);
                 }
                 this.updateFromState();
                 return 0;
                 */
            },

            /**
             * Comprova si hi ha definit una resposta d'aquest tipus, i si es així la processa passant-li el valor i aquest
             * dispatcher com arguments. En cas contrari mostra una alerta avissant.
             *
             * @param {{type: string, value: *}} response resposta per processar
             *
             * @returns {number} sempre es 0
             * @private
             */
            _processResponse: function (response, processors) {
                var result;

                if (processors && processors[response.type]) {
                    result = processors[response.type].process(response.value, this);
                } else if (this.processors[response.type]) {
                    result = this.processors[response.type].process(response.value, this);
                } else {
                    result = this.processors["alert"].process("Missatge incomprensible", this);
                    /*TO DO: internationalization*/
                }

                return result || 0;
            },

            /**
             * Crida al processor error passant-li el missatge d'error per mostrar.
             *
             * @param {string } errorMessage missatge d'error
             * @private
             */
            _processError: function (errorMessage) {
                if (!errorMessage) errorMessage = "Unknown error";
                this.processors["error"].process({message: errorMessage}, this);
            },

            /**
             * Retorna el gestor d'informacions
             *
             * @returns {InfoManager} Gestor d'informació
             */
            getInfoManager: function () {
                return this.infoManager;
            },

            getChangesManager: function () {
                return this.changesManager;
            },


            events: {}, // string: function[];

            observers: [],

            registerToEvent: function (event, callback) {
                var index,
                    observer;

                if (!Array.isArray(this.events[event])) {
                    this.events[event] = [];
                }

                index = this.events[event].push(callback) -1;
                observer = {event: event, index: index};

                return this.observers.push(observer) - 1;
            },

            /**
             * Despatcha l'esdeveniment amb les dades passades com argument a tots els observadors.
             *
             * @param {string} event - Nom del esdeveniment
             * @param {object} data - Dades que es passaran als observadors
             */
            dispatchEvent: function (event, data) {
                var observers = this.events[event];
                if (observers) {
                    array.forEach(observers, function (callback) {
                        if (callback) {
                            callback(data);
                        }
                    });
                }
            },

            /**
             * Alliberem els objectes però no els esborrem per no alterar la correspondencia dels index de al resta dels
             * subscriptors
             *
             * @param {int} observerId - Identificador del event observat
             */
            removeObserver: function (observerId) {
                var subscriber = this.observers[observerId];

                this.events[subscriber.event][subscriber.index] = null;
                this.observers[observerId] = null;
            }


        });
    return ret;
});
