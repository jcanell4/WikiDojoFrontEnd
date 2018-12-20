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
            // this.AUTOSAVE_REMOTE = 10000; //ALERTA[Xavi] per fer proves, canvia el save remot a 10s
            if (this.contentTool.autosaveTimer) {
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
            this.contentTool.registerObserverToEvent(this, this.eventName.DESTROY, this.destroy.bind(this));
            this.contentTool.registerObserverToEvent(this, this.eventName.SAVE_PARTIAL, this._onSavePartial.bind(this));
            this.contentTool.registerObserverToEvent(this, this.eventName.SAVE, this._onSave.bind(this));
            this.contentTool.registerObserverToEvent(this, this.eventName.SAVE_PROJECT, this._onSave.bind(this));
        },

        _doSave: function () {
            // console.log('Draft#_doSave');
            var ret = 0;
            var now = Date.now();
            var elapsedTime = now - this.lastRemoteRefresh;
            var spaceUsed = this._checkLocalStorageSpace();

            // ALERTA[Xavi] Aqui comprovem si la mida ocupada es superior a 2MB ABANS de desar les dades, no tenim en
            // compte la mida de les dades que seran desades
            this._doSaveLocal();

            if (elapsedTime >= this.AUTOSAVE_REMOTE || spaceUsed > this.MAX_LOCAL_STORAGE_USED) { // ALERTA[Xavi]! El local ja no s'esborra en fer save local
                this._doSaveRemoteServer();
                ret = 1;
            }
            return ret;
        },

        _doSaveLocal: function () {
            //console.log("Draft#_doSaveLocalStorage");
            this.lastRefresh = Date.now();

            // Alerta[Xavi] Compte! això permet que qualsevol persona miri el contingut del localStorage i pugui veure els esborranys deixat per altres usuaris
            var draft = this.contentTool._generateDraftInMemory(),
                page = this._doGetPage(),
                date = Date.now();

            this._setLastGeneratedDraft(draft);

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
                    break;
                case 'project':
                    page = this._formatProjectPage(page, draft, date);
                    break;
            }

            this._doSetPage(page);
        },

        _createNewPage: function () {
            return {
                ns: this.contentTool.ns,
                drafts: {}
            };
        },

        _formatLocalStructuredPage: function (page, draft, date) {
            // Reestructurem la informació
            page.drafts[draft.type].date = date; // data global del draft

            if (!page.drafts[draft.type].content) {
                page.drafts[draft.type].content = {};
            }

            // S'han de recorre tots els elements de content (del draft) i copiar el contingut a content (de page.drafts) i afegir la data del element seleccionat
            for (var chunk in draft.content) {
                page.drafts[draft.type].content[chunk] = draft.content[chunk];
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

        _formatProjectPage: function (page, draft, date) {
            draft.date = date;
            page.drafts[draft.type][draft.metaDataSubSet] = draft; 
            return page;
        },

        _doSaveRemoteServer: function () {
            this.lastRemoteRefresh = Date.now();
            var dataToSend = this._getQueryLock();
            //console.log("Draft#_doSaveRemoteServer", dataToSend);
            var data = {id: this.contentToolId,
                        dataToSend: dataToSend
                       };
            if (this.contentTool['projectType']) {
                if (this.contentTool['metaDataSubSet']) 
                    data['metaDataSubSet'] = this.contentTool['metaDataSubSet'];
                this.eventManager.fireEvent(this.eventName.SAVE_PROJECT_DRAFT, data);
            }else {
                this.eventManager.fireEvent(this.eventName.SAVE_DRAFT, data);
            }
        },

        _onSave: function (data) {
            // console.log("Draft#_onSave");
            this.clearDraft();
            // S'ha de cancelar el refresc de l'esborrany
            this.timers.refresh.cancel();
        },

        _onSavePartial: function (data) {
            // console.log("Draft#_onSavePartial", data);
            this.clearDraftChunk(data.dataToSend.section_id);
            // S'ha de cancelar el refresc de l'esborrany
            this.timers.refresh.cancel();
        },

        //Nomes elimina els draft local
        clearDraft: function () {
            var pages = this._doGetPages();
            pages[this.contentTool.ns] = this._createNewPage();
            this._doSetPages(pages);
        },

        clearDraftChunks: function (chunks) {
            //console.log("Draft#clearDraftChunks", chunks);
            for (var i = 0; i < chunks.length; i++) {
                this.clearDraftChunk(chunks[i]);
            }
        },

        clearDraftChunk: function (chunkId) {
            //console.log("Draft#clearDraftChunk", chunkId);
            var pages = this._doGetPages();

            if (pages[this.contentTool.ns]
                && pages[this.contentTool.ns].drafts
                && pages[this.contentTool.ns].drafts.structured) {
                delete(pages[this.contentTool.ns].drafts.structured.content[chunkId]);
            } else {
                //console.log("No s'ha eliminat el chunk", chunkId, pages[this.contentTool.ns]);
            }
            this._doSetPages(pages);
        },

        // Només elimina el draft del tipus indicat
        _removeLocalDraft: function (type) {
            // console.log("Draft#_removeLocalDraft", type);
            switch (type) {
                case 'structured':
                    this._removeLocalStructuredDraft();
                    break;
                case 'full':
                    this._removeLocalFullDraft();
                    break;
                case 'project':
                    this._removeLocalProjectDraft();
                    break;
                default:
                    throw new DraftException("No s'ha indicat un tipus de draft vàlid: ", type);
            }
        },

        _removeLocalStructuredDraft: function () {
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
                pages[this.contentTool.ns] = {drafts: {}};
            }
            this._doSetPages(pages);
        },

        _removeLocalProjectDraft: function () {
            this._removeLocalFullDraft();
        },

        _doGetPages: function () {
            var user = this._doGetUser();
            return user['pages'] ? user['pages'] : {};
        },

        _doGetUser: function () {
            var userId = 'user_' + this.dispatcher.getGlobalState().userId,
                user = JSON.parse(localStorage.getItem(userId));

            if (user && user.pages) {
                return user;
            } else {
                return {pages: {}};
            }
        },

        _doSetPages: function (pages) {
            //console.log('Draft#_doSetPages', pages);
            var userId = 'user_' + this.dispatcher.getGlobalState().userId;

            this._compactPages(pages);

            if (Object.keys(pages).length === 0) {
                localStorage.removeItem(userId);
            } else {
                localStorage.setItem(userId, JSON.stringify({pages: pages}));
            }
        },

        _compactPages: function (pages) {
            // console.log("Compactant pàgines:", pages);
            for (var ns in pages) {
                if (Object.keys(pages[ns].drafts).length === 0) {
                    // console.log("Esborrant pàgina", ns);
                    delete (pages[ns]);
                }
            }
        },

        // TODO[Xavi] aquí podem afegir la descompresió de dades
        _doGetPage: function () {
            var pages = this._doGetPages();
            return pages && pages[this.contentTool.ns] ? pages[this.contentTool.ns] : null;
        },

        // TODO[Xavi] aquí podem afegir la compresió de dades
        _doSetPage: function (page) {
            var userId = 'user_' + this.dispatcher.getGlobalState().userId,
                user = this._doGetUser();

            user.pages[this.contentTool.ns] = page;
            localStorage.setItem(userId, JSON.stringify(user));
        },


        _getQueryLock: function () {
            var draft = this._getLastGeneratedDraft();

            var dataToSend = {
                    id: this.contentTool.ns,
                    draft: JSON.stringify(draft),
                    date: this.lastRefresh
                };
            if (this.contentTool['projectType']) {
                if (this.contentTool['metaDataSubSet']) 
                    dataToSend['metaDataSubSet'] = this.contentTool['metaDataSubSet'];
                dataToSend['projectType'] = this.contentTool['projectType'];
            }

            return dataToSend;
        },

        _setLastGeneratedDraft: function (draft) {
            // console.log("Draft#_setLastGeneratedDraft", draft);
            if (draft.content !== {}) {
                this.lastGeneratedDraft = draft;
            }
        },

        _getLastGeneratedDraft: function () {
            // console.log("lastGeneratedDraft?", this.lastGeneratedDraft);
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
            // console.log("Draft#_onDestroy", this.contentTool.id, this.contentTool.ns);
            this._cancelTimers();
            this.dispatchEvent(this.eventName.DESTROY, {id: this.contentToolId, ns: this.contentTool.ns});
            this.inherited(arguments);
        },

        recoverLocalDraft: function () {
            var page = this._doGetPage();

            if (page && page.drafts) {
                return page.drafts;
            }else {
                return {};
            }
        },

        _checkLocalStorageSpace: function () {
            var spaceUsed = 0;

            for (var i = 0; i < localStorage.length; i++) {
                spaceUsed += (localStorage[localStorage.key(i)].length * 2) / 1024; // KB
            }
            //console.log("LocalStorage usage: ", spaceUsed.toFixed(2) + " KB");
            return spaceUsed;
        },


        _cancel: function (event) {
            // console.log('Draft#_cancel', event);
            var removeDraft = false;

            if (event.dataToSend && typeof event.dataToSend === "string") {
                var params = this._deparam(event.dataToSend);
                removeDraft = !params.keep_draft;
            } 
            else if (event.dataToSend && event.dataToSend.keep_draft !== undefined) {
                removeDraft = event.dataToSend.keep_draft;
            }

            if (removeDraft) {
                this.clearDraft();
            }

            this.destroy();
        },


        _deparam: function (queryString) {
            var pairs = queryString.split('&');
            var dictionary = {};

            for (var item in pairs) {
                var pair = pairs[item].split('=');
                var key = pair[0];
                dictionary[key] = this._getParamValue(pair[1]);
            }

            return dictionary;
        },

        _getParamValue: function (value) {
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
