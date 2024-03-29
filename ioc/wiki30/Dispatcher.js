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
    "ioc/wiki30/processor/MediaProcessor",
    "ioc/wiki30/processor/MetaInfoProcessor",
    "ioc/wiki30/processor/MetaMediaInfoProcessor",
    "ioc/wiki30/processor/MediaDetailsProcessor",
    "ioc/wiki30/processor/MetaMediaDetailsInfoProcessor",
    "ioc/wiki30/processor/DataContentProcessor",
    "ioc/wiki30/processor/ErrorProcessor",
    "ioc/wiki30/processor/InfoStatusProcessor",
    "ioc/wiki30/processor/LoginProcessor",
    "ioc/wiki30/processor/SectokProcessor",
    "ioc/wiki30/processor/TitleProcessor",
    "ioc/wiki30/processor/RemoveAllContentTabProcessor",
    "ioc/wiki30/processor/RemoveContentTabProcessor",
    "ioc/wiki30/processor/CommandProcessor",
    "ioc/wiki30/processor/AdminTaskProcessor",
    "ioc/wiki30/processor/JsInfoProcessor",
    "ioc/wiki30/manager/InfoManager",
    "ioc/wiki30/manager/ChangesManager",
    "ioc/wiki30/processor/RevisionsProcessor",
    "ioc/wiki30/processor/ExtraContentStateProcessor",
    "ioc/wiki30/processor/ExtraMetaInfoProcessor",
    "ioc/wiki30/DokuwikiContent",
    "ioc/wiki30/processor/DiffContentProcessor",
    "ioc/wiki30/processor/MetaDiffProcessor",
    "ioc/wiki30/processor/DraftProcessor",
    "ioc/wiki30/processor/HtmlPartialContentProcessor",
    "ioc/wiki30/processor/LockDataProcessor",
    "ioc/wiki30/processor/TreeProcessor",
    "ioc/wiki30/processor/NotificationProcessor",
    "ioc/wiki30/manager/EventManager",
    "ioc/wiki30/manager/LockManager",
    "ioc/wiki30/manager/DraftManager",
    "ioc/wiki30/manager/NotifyManager",
    "ioc/wiki30/manager/DialogManager",
    "ioc/wiki30/processor/RequiringContentProcessor",
    "ioc/wiki30/processor/CodeResponseProcessor",
    "ioc/wiki30/processor/ControlManagerProcessor",
    "ioc/wiki30/processor/FormContentProcessor",
    "ioc/wiki30/processor/TabResponseProcessor",
    "ioc/wiki30/processor/RecentsProcessor",
    "ioc/wiki30/processor/MetaFormProcessor",
    "ioc/wiki30/processor/PrintProcessor",
    "ioc/wiki30/processor/ContentToolTimerProcessor",
    "ioc/wiki30/processor/UserStateProcessor",
    "ioc/wiki30/processor/UpdateLocalDraftsProcessor",
    "ioc/wiki30/processor/UserProfileProcessor",
    "ioc/wiki30/processor/ProjectEditContentProcessor",
    "ioc/wiki30/processor/ProjectViewContentProcessor",
    "ioc/wiki30/processor/ProjectDiffContentProcessor",
    "ioc/wiki30/processor/ProjectRequireContentProcessor",
    "ioc/wiki30/processor/ProjectPartialContentProcessor",
    "ioc/wiki30/processor/MetaErrorProcessor",
    "ioc/wiki30/processor/HtmlSuppliesFormProcessor",
    "ioc/wiki30/processor/HtmlResponseFormProcessor",
    "ioc/wiki30/processor/HtmlNewUserTeachersFormProcessor"
], function (declare, registry, Dialog, lang, array, GlobalState, SectokManager,
             AlertProcessor, MediaProcessor, MetaInfoProcessor, MetaMediaInfoProcessor,
             MediaDetailsProcessor, MetaMediaDetailsInfoProcessor, DataContentProcessor,
             ErrorProcessor, InfoStatusProcessor, LoginProcessor, SectokProcessor,
             TitleProcessor, RemoveAllContentTabProcessor, RemoveContentTabProcessor,
             CommandProcessor, AdminTaskProcessor, JsInfoProcessor, InfoManager, ChangesManager,
             RevisionsProcessor, ExtraContentStateProcessor, ExtraMetaInfoProcessor,
             DokuwikiContent, DiffContentProcessor, MetaDiffProcessor, DraftProcessor,
             HtmlPartialContentProcessor, LockDataProcessor, TreeProcessor, NotificationProcessor,
             EventManager, LockManager, DraftManager, NotifyManager, DialogManager,
             RequiringContentProcessor, CodeResponseProcessor, ControlManagerProcessor,
             FormContentProcessor, TabResponseProcessor, RecentsProcessor, MetaFormProcessor,
             PrintProcessor, ContentToolTimerProcessor, UserStateProcessor,
             UpdateLocalDraftsProcessor, UserProfileProcessor, ProjectEditContentProcessor,
             ProjectViewContentProcessor, ProjectDiffContentProcessor, ProjectRequireContentProcessor,
             ProjectPartialContentProcessor, MetaErrorProcessor, HtmlSuppliesFormProcessor,
             HtmlResponseFormProcessor, HtmlNewUserTeachersFormProcessor) {

    /** @typedef {object} DijitWidget widget */
    /** @typedef {object} DijitContainer contenidor */
    /** @typedef {{id: string, ns: string, title: string, content: string}} Content */
    /** @typedef {{id: string, ns: string, title: string, content: string, editor: {Editor}, editing: *}} EditorContent */

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
            
            requestedState:null,
            
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
                //this.processors["html"] = new HtmlContentProcessor();
                this.processors["media"] = new MediaProcessor();
                this.processors["metainfo"] = new MetaInfoProcessor();
                this.processors["metaMedia"] = new MetaMediaInfoProcessor();
                this.processors["mediadetails"] = new MediaDetailsProcessor();
                this.processors["metamediadetails"] = new MetaMediaDetailsInfoProcessor();
                this.processors["data"] = new DataContentProcessor();
                this.processors["error"] = new ErrorProcessor();
                this.processors["info"] = new InfoStatusProcessor();
                this.processors["login"] = new LoginProcessor();
                this.processors["sectok"] = new SectokProcessor();
                this.processors["title"] = new TitleProcessor();
                this.processors["removeall"] = new RemoveAllContentTabProcessor();
                this.processors["remove"] = new RemoveContentTabProcessor();
                this.processors["command"] = new CommandProcessor();
                // this.processors["admin_tab"] = new AdminTabProcessor();
                this.processors["admin_task"] = new AdminTaskProcessor();
                this.processors["jsinfo"] = new JsInfoProcessor();
                this.processors["user_state"] = new UserStateProcessor();
                this.processors["update_local_drafts"] = new UpdateLocalDraftsProcessor();

                this.toUpdateSectok = new Array();
                this.sectokManager = new SectokManager();
                this.globalState = GlobalState;
                this.updateViewHandlers = new Array();
                this.reloadStateHandlers = new Array();
                this._updatePropertyControl = new Array();

                this.infoManager = new InfoManager(this);
                this.changesManager = new ChangesManager(this);

                this.processors["revisions"] = new RevisionsProcessor();
                this.processors["extraContentState"] = new ExtraContentStateProcessor();
                this.processors["extra_metainfo"] = new ExtraMetaInfoProcessor();
                this.processors["diff"] = new DiffContentProcessor();
                this.processors["diff_metainfo"] = new MetaDiffProcessor();
                this.processors["draft_dialog"] = new DraftProcessor();
                this.processors["html_partial"] = new HtmlPartialContentProcessor();
                this.processors["lock_data"] = new LockDataProcessor();
                this.processors["tree"] = new TreeProcessor();
                this.processors["notification"] = new NotificationProcessor();
                this.processors["requiring"] = new RequiringContentProcessor();
                this.processors["form"] = new FormContentProcessor();

                this.eventManager = new EventManager({dispatcher:this});
                this.lockManager = new LockManager({dispatcher:this});
                //ALERTA [JOSEP] TODO: Aquí cal configurar els temps dels drafts.
                this.draftManager = new DraftManager({dispatcher:this});
                this.notifyManager= new NotifyManager({dispatcher:this});
                this.dialogManager= new DialogManager({dispatcher:this});

                this.processors["code"] = new CodeResponseProcessor();
                this.processors["controlManager"] = new ControlManagerProcessor();

                // this.processors["shortcuts_tab"] = new ShortcutsTabProcessor();
                this.processors["tab"] = new TabResponseProcessor();
                this.processors["recents"] = new RecentsProcessor();
                this.processors["html_supplies_form"] = new HtmlSuppliesFormProcessor();
                this.processors["html_response_form"] = new HtmlResponseFormProcessor();
                this.processors["html_new_user_teachers_form"] = new HtmlNewUserTeachersFormProcessor();
                this.processors["meta_form"] = new MetaFormProcessor();
                this.processors["print"] = new PrintProcessor();
                this.processors["contentTool_timer"] = new ContentToolTimerProcessor();
                this.processors["user_profile"] = new UserProfileProcessor();
                this.processors["project_edit"] = new ProjectEditContentProcessor();
                this.processors["project_view"] = new ProjectViewContentProcessor();
                this.processors["project_partial"] = new ProjectPartialContentProcessor();
                this.processors["project_diff"] = new ProjectDiffContentProcessor();
                this.processors["project_require"] = new ProjectRequireContentProcessor();

                this.processors["meta_error_type"] = new MetaErrorProcessor();
                this.originalButtonAttributes = {};
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
            },
            
            initUpdateWidgetProperty: function(widget, property, value){
                if(!this._updatePropertyControl[widget+"_"+property]){
                    this.changeWidgetProperty(widget, property, value);
                    this._updatePropertyControl[widget+"_"+property]=true;
                }
            },

            /**
             * Recorre el array de UpdateViewHandlers i crida al métode update() de cadascun.
             */
            updateFromState: function () {
                this._updatePropertyControl = new Array();
                if (this.updateViewHandlers) {
                    this.__resetButtons();
                    for(var i=this.updateViewHandlers.length-1; i>=0; i--){
                        this.updateViewHandlers[i].update();
                    }
                }
            },
            
            __resetButtons: function(){
                for (const [buttonId, actions] of Object.entries(this.originalButtonAttributes)) {
//                     for (const [buttonId, actions] of Object.entries(oldValues['%_projectType_%%_workflowState_%'])) {
                    var button = registry.byId(buttonId);
                    if(actions["toDelete"]){
                        actions["toDelete"].forEach(function(element){
                            delete button[element];
                        });      
                    }
                    if(actions["toSet"]){
                        for (const [key, value] of Object.entries(actions['toSet'])) {
                            button.set(key, value);
                        }
                    }
//                    }
                }
                this.originalButtonAttributes = {};
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
             * @param {ContainerContentTool|string} pwidget
             */
            removeAllChildrenWidgets: function (pwidget) {
                var container;

                if (typeof pwidget === "string") {
                    container = registry.byId(pwidget);
                } else {
                    container = pwidget;
                }

                if (container.clearContainer) {
                    container.clearContainer();
                } else {
                    container.destroyDescendants(false);
                }
            },

            removeWidgetChild: function (command) {
                var parent;
                var child;
                var parentId = command.id;
                var childId = command.childId;
                parent = registry.byId(parentId);
                child = registry.byId(childId);
                if (parent && child) {
                    if (child.unregisterFromEvents) {
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
                if (widget === undefined) 
                    alert("ERROR:\nDispatcher#changeWidgetProperty()\nid = "+id);
                else
                    widget.set(propertyName, value);
            },

            /**
             * Retorna el valor d'una propietat
             * @returns property
             */
            getWidgetProperty: function(id, property) {
                var widget = registry.byId(id);
                return widget.get(property);
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
                // console.log("Dispatcher#getContentCache", id, this.contentCache);
                return this.contentCache[id];
            },


            /**
             * Retorna la informació de la pàgina mostrada a la pestanya actual.
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
            setUnsavedChangesState: function (st) {
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
                this._processError(error.response.text, error.response.status);
            },

            /**
             * Processa les respostes passades com argument.
             *
             * @param {Array.<{type: string, value: *}>|{type: string, value: *}} response resposta per processar.
             * @returns {number} TODO[Xavi] no es fa servir la resposta en lloc.
             */
            processResponse: function (response, processors) {
                var req = this;

                if (Array.isArray(response)) {
                    array.some(response, function (responseItem) {
                        var result = req._processResponse(responseItem, processors);
                        return result !== 0; // Surt del bucle quan es true
                    });

                } else {
                    req._processResponse(response, processors);
                }

                this.updateFromState();
                return 0;
            },

            /**
             * Comprova si hi ha definit una resposta d'aquest tipus, i si es així la processa passant-li el valor i aquest
             * dispatcher com arguments. En cas contrari mostra una alerta avisant.
             *
             * @param {{type: string, value: *}} response resposta per processar
             *
             * @returns {number} sempre es 0
             * @private
             */
            _processResponse: function (response, processors) {
                //console.log("Dispatcher#_processResponse", response);
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
            _processError: function (errorMessage, status) {
                let mes = (errorMessage)?errorMessage.trim():"Unknown error";
                if(!isNaN(status) && status >= 400 && mes.charAt(0)=="[" && mes.charAt(mes.length-1)=="]"){
                    this.processResponse(JSON.parse(mes));
                }else{
                    this.processors["error"].process({message: mes}, this);
                }
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


            getEventManager: function () {
                return this.eventManager;
            },


            /**
             * Mostra un quadre de dialeg demanant confirmació i retorna true o false segons si s'ha de continuar o no.
             * Aquest missatge només es mostrarà en alguns navegadors (això depen dels navegadors i no de nosaltres).
             *
             * @returns {bool}
             */
            discardChanges: function () {
                //console.error("Dispatcher#discardChanges");
                return confirm("No s'han desat els canvis al document actual, vols descartar els canvis?");
            },


            /**
             * Afegeix un document.
             *
             * TODO[Xavi] Aixó es mourà al onAttach() del documentContentTool()
             *
             * @deprecated
             *
             * @param content
             */
            addDocument: function (content) {
//                console.log("Dispatcher#addDocument", content.id);

                if (!this.contentCache[content.id]) {

                    this.contentCache[content.id] = new DokuwikiContent({
                        "id": content.id
                    })
                }

                this.getGlobalState().getContent(content.id).ns = content.ns;
            },

            /**
             * Elimina el document amb la id passada com argument.
             *
             * @param {string} id
             */
            removeDocumentState: function (id) {
                // console.log("Dispatcher#removeDocumentState", id);
                this.getGlobalState().deleteContent(id);

                if (this.contentCache[id]) {
                    delete this.contentCache[id];
                }
            },

            getLockManager: function() {
                return this.lockManager;
            },

            getDraftManager: function() {
                return this.draftManager;
            },

            getNotifyManager: function() {
                return this.notifyManager;
            },

            getDialogManager: function() {

                return this.dialogManager;
            },

            getWidget: function(id){
                return registry.byId(id);
            },
            
                    
            getRequestedState: function(){
                return this.requestedState;
            },

            setRequestedState: function(value){
                this.requestedState= value;
            }

        });
        
    return ret;
});
