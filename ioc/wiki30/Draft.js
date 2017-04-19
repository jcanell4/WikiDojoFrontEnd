define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObservable',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/Timer'
], function (declare, EventObservable, EventObserver, Timer) {

    var DraftException = function (message) {
        this.message = message;
        this.name = "DraftException";
    };

    return declare([EventObservable, EventObserver], {

        AUTOSAVE_LOCAL: 5 * 1000, // Temps en ms mínim per fer un refresc
        AUTOSAVE_REMOTE: 10 * 60 * 1000, // Temps per defecte, modificat al constructor si es passa el paràmetre
        MAX_LOCAL_STORAGE_USED: 2048, // En KBs, 2048KBs son 2 MBs

        constructor: function (args) {
            this.dispatcher = args.dispatcher;
            this.contentTool = args.contentTool;
            this.contentToolId = args.contentTool.id; // Sempre es desa sobre el document original, no sobre els revisions
            this.id = args.contentTool.id + "_draft";
            this.ns = args.contentTool.ns;
            this.lastRefresh = Date.now();
            this.lastRemoteRefresh = Date.now();
            this.timers = {};
            this.eventManager = this.dispatcher.getEventManager();
            if (this.contentTool.autosaveTimer) {
                // this.AUTOSAVE_REMOTE = 10000; //ALERTA[Xavi] per fer proves, canvia el save remot a 10s
                this.AUTOSAVE_REMOTE = this.contentTool.autosaveTimer;
            }
            this._init();
            // console.log("Desant remotament cada:", this.AUTOSAVE_REMOTE);
        },

        _init: function () {
            //console.log("Draft#_init");
            this._registerObserverToEvents();
            this._initTimers();
        },

        save: function () {
            //console.log("Draft#save");
            this._doSave();
        },

        _registerObserverToEvents: function () {
            //console.log("Draft#_registerObserverToEvents");


            this.contentTool.registerObserverToEvent(this, this.eventName.DOCUMENT_REFRESHED, this._doRefresh.bind(this));
            this.contentTool.registerObserverToEvent(this, this.eventName.CANCEL, this._cancel.bind(this));
            this.contentTool.registerObserverToEvent(this, this.eventName.DESTROY, this.destroy.bind(this));
            // this.contentTool.registerObserverToEvent(this, this.eventName.SAVE_PARTIAL, this._clearLocalStructured.bind(this));
            // this.contentTool.registerObserverToEvent(this, this.eventName.SAVE, this._clearLocalAll.bind(this));
            this.contentTool.registerObserverToEvent(this, this.eventName.SAVE_PARTIAL, this._onSavePartial.bind(this));
            this.contentTool.registerObserverToEvent(this, this.eventName.SAVE, this._onSave.bind(this));
        },

        _doSave: function () {
            // console.log('Draft#_doSave');
            var ret = 0;
            var now = Date.now(),
                elapsedTime = now - this.lastRemoteRefresh;


            var spaceUsed = this._checkLocalStorageSpace();

            // ALERTA[Xavi] Aqui comprovem si la mida ocupada es superior a 2MB ABANS de desar les dades, no tenim en
            // compte la mida de les dades que seran desades
            if (elapsedTime >= this.AUTOSAVE_REMOTE || spaceUsed > this.MAX_LOCAL_STORAGE_USED) {
                this._doSaveRemoteServer();
                ret = 1;
            } else {

                this._doSaveLocal();
            }
            return ret;

        },

        _doSaveLocal: function () {
            // console.log("Draft#_doSaveLocalStorage");
            this.lastRefresh = Date.now();

            // Alerta[Xavi] Compte! això permet que qualsevol persona miri el contingut del localStorage i pugui veure els esborranys deixat per altres usuaris
            var draft = this.contentTool._generateDraftInMemory(),
                page = this._doGetPage(),
                date = Date.now();


            // Si existeix la actualitzarem, i si no, la creem
            if (!page) {
                page = this._createNewPage();
            }


            if (!page.drafts[draft.type]) {
                page.drafts[draft.type] = {};
            }

            switch (draft.type) {
                case 'structured':
                    page = this._formatLocalStructuredPage(page, draft, date);
                    break;

                case 'full':
                    page = this._formatLocalFullPage(page, draft, date);
            }

            this._doSetPage(page);

        },

        _createNewPage: function () {
            return {
                ns: this.contentTool.ns,
                drafts: {}
            }
        },

        _formatLocalStructuredPage: function (page, draft, date) {
            // Reestructurem la informació
            // No cal afegir el tipus, perquè ja es troba a la estructura
            // S'han de recorre tots els elements de content (del draft) i copiar el contingut a content (de page.drafts) i afegir la data del element seleccionat, la

            for (var chunk in draft.content) {
                page.drafts[draft.type][chunk] = {
                    content: draft.content[chunk],
                    date: date
                }
            }

            // 2- Afegim el nou document, si ja existeix s'ha de sobrescriure amb la nova versió
            return page;
        },

        _formatLocalFullPage: function (page, draft, date) {
            draft.date = date;

            page.drafts[draft.type] = draft; //sobrescriu el valor anterior si existeix

            // 2- Afegim el nou document, si ja existeix s'ha de sobrescriure amb la nova versió
            return page;
        },

        _doSaveRemoteServer: function () {
            // console.log("Draft#_doSaveRemoteServer");
            this.lastRemoteRefresh = Date.now();
            this.lastRefresh = this.lastRemoteRefresh;

            var dataToSend = this._getQueryLock();


            this.eventManager.fireEvent(this.eventName.SAVE_DRAFT, {
                id: this.contentToolId,
                dataToSend: dataToSend
            });

            // S'elimina només el tipus corresponent al document
            // TODO[Xavi] això es podria lligar al sistema d'events: this.eventName.SAVE_DRAFT
            this._removeLocalDraft(this.contentTool.DRAFT_TYPE);
        },

        _onSavePartial: function (data) {
            // console.log("Draft#_onSavePartial", data);

            this.clearDraftChunks(data.dataToSend.section_id);

            // S'ha de cancelar el refresc de l'esborrany
            this.timers.refresh.cancel();

        },


        //ALERTA[Xavi] Nomes elimina els draft local
        clearDraft: function () {
            var pages = this._doGetPages();

            pages[this.contentTool.ns] = this._createNewPage();

            // if (pages[this.contentTool.ns] && pages[this.contentTool.ns].drafts) {
            //     if(pages[this.contentTool.ns].drafts['full']){
            //         delete(pages[this.contentTool.ns].drafts['full']);
            //     }
            //     if(pages[this.contentTool.ns].drafts['structured']){
            //         delete(pages[this.contentTool.ns].drafts['structured']);
            //     }
            // }

            this._doSetPages(pages);
        },

        clearDraftChunks: function (chunks) {
            for (var i = 0; i < chunks.length; i++) {
                this.clearDraftChunk(chunks[i]);
            }
        },

        clearDraftChunk: function (chunkId) {
            var pages = this._doGetPages();

            if (pages[this.contentTool.ns]
                && pages[this.contentTool.ns].drafts
                && pages[this.contentTool.ns].drafts['structured']) {
                delete(pages[this.contentTool.ns].drafts['structured'][chunkId]);

            }

            this._doSetPages(pages);


        },

        _onSave: function (data) {
            // console.log("Draft#_onSave");
            this.clearDraft();

            // S'ha de cancelar el refresc de l'esborrany
            this.timers.refresh.cancel();

        },


        // Només elimina el draft del tipus indicat
        _removeLocalDraft: function (type) {
            console.log("Draft#_removeLocalDraft", type);

            switch (type) {
                case 'structured':
                    this._removeLocalStructuredDraft();
                    break;

                case 'full':
                    this._removeLocalFullDraft();
                    break;

                default:
                    throw new DraftException("No s'ha indicat un tipus de draft vàlid: ", type);
            }

        },

        _removeLocalStructuredDraft: function () {
            console.log("Draft#_removeLocalStructureDraft");
            // En aquest cas només s'han d'esborrar el draft dels chunks actius al desar
            var pages = this._doGetPages(),
                draft = this._getLastGeneratedDraft();

            if (pages[this.contentTool.ns] && pages[this.contentTool.ns].drafts) {
                for (var chunk in draft.content) {
                    if (pages[this.contentTool.ns].drafts['structured']) {
                        delete(pages[this.contentTool.ns].drafts['structured'][chunk]);
                    }
                }
            }

            this._doSetPages(pages);
        },

        _removeLocalFullDraft: function () {
            // console.log("Draft#_removeLocalFullDraft", this.contentTool.ns);
            var pages = this._doGetPages();

            if (pages[this.contentTool.ns]) {
                pages[this.contentTool.ns].drafts = {};
            } else {
                pages[this.contentTool.ns] = {drafts:{}};
            }


            // ALERTA[Xavi] Al esborrar el complet s'ha d'esborrar també el parcial, així es com funcionen els drafts remots

//             if (pages[this.contentTool.ns] && pages[this.contentTool.ns].drafts) {
//                 delete(pages[this.contentTool.ns].drafts['full']);
//                 delete(pages[this.contentTool.ns].drafts['structured']);
            this._doSetPages(pages);
// //                console.log("S'ha esborrat?", pages);
//             } else {
//                 console.log("Fallat: ", this.contentTool.ns, pages);
//             }
        },


        _doGetPages: function () {
            //console.log('Draft#_doGetPages');
            var user = this._doGetUser();

            return user['pages'] ? user['pages'] : {};
        },

        _doGetUser: function () {
            //console.log('Draft#_doGetUser');
            var userId = 'user_' + this.dispatcher.getGlobalState().userId,
                user = JSON.parse(localStorage.getItem(userId));

            if (user && user.pages) {
                return user;
            } else {
                return {
                    pages: {}
                }
            }
        },

        _doSetPages: function (pages) {
            //console.log('Draft#_doSetPages', pages);
            var userId = 'user_' + this.dispatcher.getGlobalState().userId;
            localStorage.setItem(userId, JSON.stringify({pages: pages}));
        },

        // TODO[Xavi] aquí podem afegir la descompresió de dades
        _doGetPage: function () {
            //console.log('Draft#_doGetPage');
            var pages = this._doGetPages();

            return pages && pages[this.contentTool.ns] ? pages[this.contentTool.ns] : null;
        },

        // TODO[Xavi] aquí podem afegir la compresió de dades
        _doSetPage: function (page) {
            //console.log('Draft#_doSetPage');
            var userId = 'user_' + this.dispatcher.getGlobalState().userId,
                user = this._doGetUser(userId);

            user.pages[this.contentTool.ns] = page;

            localStorage.setItem(userId, JSON.stringify(user));


        },


        _getQueryLock: function () {
            //console.log('Draft#_getQueryDraft');
            this._setLastGeneratedDraft(this.contentTool._generateDraftInMemory());

            var dataToSend = {
                id: this.contentTool.ns,
                draft: JSON.stringify(this._getLastGeneratedDraft())
            };

            return dataToSend;
        },

        _setLastGeneratedDraft: function (draft) {
            this.lastGeneratedDraft = draft;
        },

        _getLastGeneratedDraft: function () {
            return this.lastGeneratedDraft;
        },

        _doRefresh: function (event) {
            // console.log('Draft#_doRefresh');
            var now = Date.now(),
                elapsedTime = now - this.lastRefresh;

            if (elapsedTime >= this.AUTOSAVE_LOCAL) {
                var saveMode = this._doSave();
                if (saveMode == 0) {
                    this.waitingRemoteRefresh = true;
                    this._setPendingRefresh(this.AUTOSAVE_REMOTE - elapsedTime + 1);
                }
            } else {
                this._setPendingRefresh(this.AUTOSAVE_LOCAL - elapsedTime + 1);
            }
        },

        _setPendingRefresh: function (timeout) {
            // console.log('Draft#_setPendingRefresh', timeout);

            if (this.waitingRemoteRefresh || this.timers.refresh.expired) {
                this.waitingRemoteRefresh = false;
                this.timers.refresh.start(timeout);
            }
        },

        _initTimers: function () {
            // console.log('Draft#_initTimers');
            this.timers = {
                refresh: new Timer({onExpire: this._doRefresh.bind(this)})
            };
            this.timers.refresh.expired = true;
        },

        _cancelTimers: function () {
            // console.log('Draft#_cancelTimers', this.timers);
            for (var timer in this.timers) {
                this.timers[timer].cancel();
            }
        },

        destroy: function () {
            this._onDestroy();
        },

        _onDestroy: function () {
            console.log("Draft#_onDestroy", this.contentTool.id, this.contentTool.ns);
            this._cancelTimers();
//            this.unregisterFromEvent(this.eventNameCompound.DOCUMENT_REFRESHED + this.contentTool.id);
//            this.unregisterFromEvent(this.eventNameCompound.CANCEL + this.contentTool.id);
            this.dispatchEvent(this.eventName.DESTROY, {id: this.contentToolId, ns: this.contentTool.ns});
            this.inherited(arguments);
        },

        recoverLocalDraft: function () {
            // console.log("Draft#recoverLocalDraft", this._doGetPage());

            var page = this._doGetPage();

            if (page && page.drafts) {
                return page.drafts;
            } else {
                return {};
            }
        },

        _checkLocalStorageSpace: function () {
            var spaceUsed = 0;

            for (var i = 0; i < localStorage.length; i++) {
                spaceUsed += (localStorage[localStorage.key(i)].length * 2) / 1024; // KB
            }

//            console.log("LocalStorage usage: ", spaceUsed.toFixed(2) + " KB");

            return spaceUsed;
        },


        _cancel: function(event) {
            // console.log('Draft#_cancel', event);

            var removeDraft = false;

            if (event.dataToSend && typeof event.dataToSend === "string") {
                var params = this._deparam(event.dataToSend);
                removeDraft = !params.keep_draft;
            } else if (event.dataToSend && event.dataToSend.keep_draft !== undefined ){
                removeDraft = event.dataToSend.keep_draft;
            }

            if (removeDraft) {
                this.clearDraft();
            }

            this.destroy();
        },


        _deparam: function(queryString) {
            var pairs = queryString.split('&');
            var dictionary = {};
            console.log("pairs:", pairs);
            for (var item in pairs) {
                var pair = pairs[item].split('=');
                console.log("Pair:", pair);
                var key = pair[0];
                var value = this._getParamValue(pair[1]);
                dictionary[key] = value;
            }

            return dictionary;
        },

        _getParamValue: function(value) {
            if (value === "true") {
                return true;
            } else if (value === "false") {
                return false;
            } else if (!isNaN(value)) {
                return Number(value);
            } else {
                return value;
            }
        }
    });

});
